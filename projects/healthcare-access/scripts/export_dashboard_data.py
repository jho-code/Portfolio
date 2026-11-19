import csv
import json
import math
from pathlib import Path


PROJECT_DIR = Path(__file__).resolve().parents[1]
REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
COUNTY_SOURCE = (
    PROJECT_DIR
    / "data/processed/county_need_readmission_quadrants_2024.csv"
)
FOLLOWUP_SOURCE = PROJECT_DIR / "data/processed/followup_county_review.csv"
OUTPUT_PATH = REPOSITORY_ROOT / "public/data/healthcare-counties.json"


def read_float(row: dict[str, str], column: str, *, required: bool = False) -> float | None:
    value = row.get(column, "").strip()
    if not value:
        if required:
            raise ValueError(f"Required value is missing from {column}.")
        return None

    number = float(value)
    if not math.isfinite(number):
        raise ValueError(f"Non-finite value found in {column}: {value!r}.")
    return number


def read_bool(row: dict[str, str], column: str, *, required: bool = False) -> bool | None:
    value = row.get(column, "").strip().lower()
    if value in {"true", "1"}:
        return True
    if value in {"false", "0"}:
        return False
    if not value and not required:
        return None
    raise ValueError(f"Invalid boolean value in {column}: {value!r}.")


def normalize_fips(value: str) -> str:
    normalized = value.strip().removesuffix(".0").zfill(5)
    if len(normalized) != 5 or not normalized.isdigit():
        raise ValueError(f"Invalid county FIPS code: {value!r}.")
    return normalized


def load_followup_context() -> dict[str, dict[str, object]]:
    with FOLLOWUP_SOURCE.open(encoding="utf-8-sig", newline="") as source:
        rows = csv.DictReader(source)
        context = {
            normalize_fips(row["CountyFIPS"]): {
                "primaryCarePhysiciansPer100k": read_float(
                    row, "PrimaryCarePhysiciansPer100k"
                ),
                "hasGeographicPrimaryCareHpsa": read_bool(
                    row, "HasActivePrimaryCareGeographicHPSA", required=True
                ),
                "providerSignalPattern": row["ProviderSignalPattern"].strip(),
                "selectedUnderAllNineCutoffs": read_bool(
                    row, "SelectedUnderAllNineServiceCutoffs", required=True
                ),
            }
            for row in rows
        }
    if not context:
        raise ValueError(f"No follow-up rows found in {FOLLOWUP_SOURCE}.")
    return context


def build_dashboard_data() -> dict[str, object]:
    followup_context = load_followup_context()
    counties: list[dict[str, object]] = []

    with COUNTY_SOURCE.open(encoding="utf-8-sig", newline="") as source:
        for row in csv.DictReader(source):
            fips = normalize_fips(row["CountyFIPS"])
            context = followup_context.get(fips)
            counties.append(
                {
                    "fips": fips,
                    "state": row["StateAbbr"].strip(),
                    "county": row["CountyName"].strip(),
                    "needScore": read_float(row, "NeedScore", required=True),
                    "readmissionDisplay": read_float(
                        row, "AcuteReadmissionRateDisplay", required=True
                    ),
                    "quadrant": row["Quadrant"].strip(),
                    "medianPriority": read_bool(row, "Priority", required=True),
                    "strictPriority": read_bool(
                        row, "StrictPriority", required=True
                    ),
                    "followUpCandidate": context is not None,
                    "totalBeneficiaries": read_float(row, "BENES_TOTAL_CNT"),
                    "originalMedicareBeneficiaries": read_float(
                        row, "BENES_OM_CNT"
                    ),
                    "fqhcVisitsPer1000": read_float(
                        row, "FQHC_RHC_VISITS_PER_1000_BENES"
                    ),
                    "outpatientVisitsPer1000": read_float(
                        row, "OP_VISITS_PER_1000_BENES"
                    ),
                    "erVisitsPer1000": read_float(
                        row, "ER_VISITS_PER_1000_BENES"
                    ),
                    "medicareAdvantageParticipation": read_float(
                        row, "MA_PRTCPTN_RATE"
                    ),
                    "dualEligibility": read_float(row, "BENE_DUAL_PCT"),
                    "primaryCarePhysiciansPer100k": (
                        context["primaryCarePhysiciansPer100k"]
                        if context is not None
                        else None
                    ),
                    "hasGeographicPrimaryCareHpsa": (
                        context["hasGeographicPrimaryCareHpsa"]
                        if context is not None
                        else None
                    ),
                    "providerSignalPattern": (
                        context["providerSignalPattern"]
                        if context is not None
                        else None
                    ),
                    "selectedUnderAllNineCutoffs": (
                        context["selectedUnderAllNineCutoffs"]
                        if context is not None
                        else None
                    ),
                }
            )

    counties.sort(key=lambda county: str(county["fips"]))
    fips_codes = [str(county["fips"]) for county in counties]
    if not counties:
        raise ValueError(f"No county rows found in {COUNTY_SOURCE}.")
    if len(fips_codes) != len(set(fips_codes)):
        raise ValueError("The dashboard source contains duplicate county FIPS codes.")
    if not set(followup_context).issubset(fips_codes):
        raise ValueError("Some follow-up counties are absent from the primary cohort.")

    followup_rows = [county for county in counties if county["followUpCandidate"]]
    return {
        "schemaVersion": 1,
        "readmissionDisplayNote": (
            "The CMS source field is multiplied by 100 for display; "
            "verify its exact definition and unit in CMS documentation."
        ),
        "countyCount": len(counties),
        "followUpCount": len(followup_rows),
        "followUpHpsaCount": sum(
            county["hasGeographicPrimaryCareHpsa"] is True
            for county in followup_rows
        ),
        "followUpBothSignalsCount": sum(
            county["providerSignalPattern"]
            == "Below-median density + HPSA record"
            for county in followup_rows
        ),
        "counties": counties,
    }


def main() -> None:
    payload = build_dashboard_data()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(
            payload,
            ensure_ascii=False,
            allow_nan=False,
            separators=(",", ":"),
        )
        + "\n",
        encoding="utf-8",
    )
    print(
        f"Wrote {payload['countyCount']:,} county rows and "
        f"{payload['followUpCount']:,} follow-up rows to {OUTPUT_PATH}."
    )


if __name__ == "__main__":
    main()
