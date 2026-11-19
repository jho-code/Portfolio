# County Health Need and Medicare Care Context

## Project purpose

This project describes how a PLACES-based county health-need index aligns with Medicare readmission and service-use measures. The goal is to identify county patterns for further investigation—not to predict outcomes, assign an official shortage designation, or infer that one measure causes another.

The analysis began with tract-level CDC PLACES measures, used PCA to construct a `NeedScore`, and aggregated it to counties. It then joined the county scores to 2024 CMS Medicare Geographic Variation data.

## Workflow

1. Prepare the PLACES-based county score in [`notebooks/01_explore_places.ipynb`](./notebooks/01_explore_places.ipynb).
2. Explore and prepare CMS county data in [`notebooks/03_explore_cms.ipynb`](./notebooks/03_explore_cms.ipynb).
3. Run [`notebooks/04_merge_analysis.ipynb`](./notebooks/04_merge_analysis.ipynb) to compare the sources, map county patterns, add service-use and provider-supply context, and create the follow-up review table.

The merge notebook expects `data/processed/county_need_2024.csv` and `data/processed/cms24_county_small.csv`. It caches the HRSA Area Health Resources Files (AHRF), HRSA Primary Care HPSA, and 2024 Census county-boundary downloads under `data/raw/` when they are not already present.

The notebook assumes it is run from the `notebooks/` directory, because `PROJECT_ROOT` is set relative to the current working directory. Raw and processed data are excluded from Git by the project `.gitignore`; a fresh checkout therefore needs the prepared inputs before running the merge notebook.

## Main definitions

- **Readmission comparison:** the primary comparison uses CMS acute hospital readmission rates. For plots, the readmission-based effectiveness proxy is oriented so a higher value means a lower readmission rate. This is one imperfect quality-related indicator, not a complete measure of effectiveness.
- **Strict-priority counties:** counties at or above both the 75th percentile of `NeedScore` and the 75th percentile of the acute hospital readmission rate. This identifies 289 counties in the current complete-case analysis.
- **Exploratory follow-up shortlist:** strict-priority counties below the scored-county medians for both FQHC/RHC visits and outpatient visits per 1,000 Medicare beneficiaries. The current shortlist has 62 counties. Lower utilization is context, not proof of inadequate access or lower quality.
- **AHRF physician density:** 2023 non-federal primary-care physicians in patient care, excluding hospital residents and physicians age 75 or older, divided by the 2024 county population estimate and multiplied by 100,000. It is a provider-supply proxy, not a direct measure of availability.
- **HRSA HPSA flag:** at least one current, county-FIPS-linked, designated Primary Care Geographic HPSA or High Needs Geographic HPSA record. The snapshot used here was retrieved on November 17, 2026. A county record may cover only part of a county; no matched record does not establish that access is adequate.

## Descriptive findings

- Of the 2,996 counties in the complete-case analysis, 289 meet the strict-priority definition. The 62-county follow-up shortlist is a subset of those 289.
- All 62 shortlist counties have an AHRF physician-density value. Their median is **25.65 physicians per 100,000 residents**, compared with **29.94** in other strict-priority counties and **46.16** in other scored counties. The overall scored-county median is **44.49**.
- A current geographic primary-care HPSA record is linked to **26/62 (41.9%)** shortlist counties, compared with **76/227 (33.5%)** other strict-priority counties and **792/2,707 (29.3%)** other scored counties.
- At the scored-county median density cutoff, **23/62 (37.1%)** shortlist counties have both below-median physician density and a current HPSA record. The corresponding shares are **66/227 (29.1%)** among other strict-priority counties and **506/2,698 (18.8%)** among other scored counties.
- The shortlist overlap count is **20** using the 25th-percentile density cutoff, **23** at the median cutoff, and **24** at the 75th-percentile cutoff. These thresholds are sensitivity checks, not official supply standards.

These are descriptive county-level comparisons. They do not establish that provider supply or HPSA designation causes differences in utilization or readmissions.

## Outputs

Running the merge notebook writes:

- `data/processed/county_need_readmission_quadrants_2024.csv` — county-level merged score and quadrant data.
- `data/processed/followup_county_review.csv` — the 62-county review table with the separate need, utilization, density, and HPSA measures, plus density-cutoff sensitivity flags.

Both files are generated locally and are ignored by Git. The review table is sorted by `NeedScore` for convenience; it is **not** a combined access ranking.

## Interpretation limits

- This is a county-level ecological analysis; results should not be applied to individuals.
- The readmission proxy is not a complete quality or effectiveness measure. ER visits, spending, and service-use rates are context measures; lower values are not automatically better.
- Medicare rates describe Medicare beneficiaries, not the whole county population.
- The AHRF physician numerator is from 2023, while the denominator is a 2024 population estimate. County density can hide within-county distribution, appointment availability, and the role of other primary-care clinicians.
- HPSA data are a current snapshot, not aligned to the 2024 CMS period. HPSA status and physician density are imperfect, complementary signals; neither alone establishes local access.