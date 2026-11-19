# County Health Need and Medicare Care Context

## Project snapshot

This project explores how county-level health need, measured with CDC PLACES, aligns with Medicare readmission and service-use measures. It is a **descriptive geospatial analysis**, not an outcome-prediction model, causal study, official shortage designation, or county performance ranking.

The primary comparison uses only two required fields: the PLACES-based `NeedScore` and the CMS acute readmission rate. ER visits, spending, service use, physician density, and HRSA Health Professional Shortage Area (HPSA) records are kept as separate context rather than combined into a score.

**Current results**

- **3,143** counties have a PLACES score; **3,142** match a CMS county row.
- **2,997** counties have both a score and a reported readmission value. A separate three-outcome sensitivity cohort has **2,996** counties because it also requires ER visits and spending.
- **287** counties are in the exploratory top-quartile group for both need and readmission rate. A median-split comparison flags 850 counties; neither cutoff is a clinical or policy standard.
- **63** of the 287 top-quartile counties also fall below the scored-county medians for both FQHC/RHC and outpatient visits per 1,000 beneficiaries. This is a follow-up list for review, not a finding of inadequate access.
- The list size is sensitive to the county NeedScore aggregation choice: on the same CMS/readmission cohort, adult-population weighting selects 287 counties and total-population weighting selects 289; **286 counties are common**.

## Analysis approach

1. **Build tract need scores.** In [`notebooks/01_explore_places.ipynb`](./notebooks/01_explore_places.ipynb), standardize 12 adverse health prevalence measures and use PCA component 1 as an exploratory index. PC1 explains **73.1%** of their standardized variance. Its sign is oriented so larger scores indicate higher prevalence on average; PCA signs are otherwise arbitrary.
2. **Aggregate to counties.** Weight tract scores by `TotalPop18plus`, because the prevalence measures describe adults. Retain a total-population-weighted score as a sensitivity measure. Across PLACES counties, the two county scores correlate at **0.99982**; small overall differences can still change membership near a cutoff.
3. **Prepare CMS county data.** [`notebooks/03_explore_cms.ipynb`](./notebooks/03_explore_cms.ipynb) filters the 2014–2024 Geographic Variation file to 2024 county-level, all-age rows.
4. **Compare need and readmissions.** [`notebooks/04_merge_analysis.ipynb`](./notebooks/04_merge_analysis.ipynb) reports the sample flow, uses the need-plus-readmission cohort for the main chart, and defines an exploratory top-quartile group using the 75th percentiles of both measures.
5. **Add context without collapsing it.** Separate figures show ER use, spending, service-use patterns, AHRF primary-care physician density, and current geographic primary-care HPSA records. The 63-county follow-up list and cutoff/denominator sensitivity results are available for review.

Median and percentile groups are relative to the counties in this analysis. They do not measure clinical importance or establish adequate care. The notebook displays the CMS readmission field multiplied by 100 for readability; verify the field's exact definition and units in the CMS documentation before interpreting it as a percentage.

## Findings and sensitivity checks

- The top-quartile group contains **287** counties. **10** of those are selected in all nine tested combinations of FQHC/RHC and outpatient-visit cutoffs (25th, 50th, and 75th percentiles). This is stability under one chosen grid, not a probability or ranking.
- The 63-county follow-up list has a median of **25.80** AHRF primary-care physicians per 100,000 residents, compared with **29.82** in the other top-quartile counties and **46.19** in other scored counties. The overall scored-county median is **44.48**.
- A current geographic primary-care HPSA record is linked to **27/63 (42.9%)** follow-up counties, **76/224 (33.9%)** other top-quartile counties, and **792/2,710 (29.2%)** other scored counties.
- Considering only counties with an AHRF density value, both below-median physician density and a current HPSA record occur in **24/63 (38.1%)** follow-up counties, **66/224 (29.5%)** other top-quartile counties, and **506/2,701 (18.7%)** other scored counties.
- The number of follow-up counties with both contextual signals is **21**, **24**, or **25** when the physician-density cutoff is set to the 25th percentile, median, or 75th percentile. These are exploratory thresholds, not supply standards.
- Using total rather than adult population weighting changes four top-quartile county memberships: it adds Nome Borough, Alaska; Pulaski County, Georgia; and Marion County, Ohio, while dropping East Feliciana Parish, Louisiana.

All findings are county-level descriptions. They do not show that physician supply, HPSA designation, service use, health need, and readmissions cause one another.

## Reproduce the notebooks

Raw and processed data are excluded from Git. A fresh checkout needs the PLACES and CMS input files in the paths below; the merge notebook downloads AHRF, HRSA HPSA, and Census boundary files when their cached files are absent.

```bash
cd projects/healthcare-access
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cd notebooks
python -m jupyter nbconvert --to notebook --execute 01_explore_places.ipynb --inplace
python -m jupyter nbconvert --to notebook --execute 03_explore_cms.ipynb --inplace
python -m jupyter nbconvert --to notebook --execute 04_merge_analysis.ipynb --inplace
```

Place the CDC PLACES 2024 tract export at `data/raw/export.csv` and the CMS 2014–2024 Geographic Variation file at `data/raw/cms_geographic_variation_2014_2024.csv`. Run notebooks from `notebooks/`; notebooks 01 and 03 use paths relative to that directory. The merge notebook locates the project root and caches its supporting downloads under `data/raw/`.

The generated files are:

- `data/processed/county_need_2024.csv` — county NeedScore, adult population, and total-population-weighted sensitivity score.
- `data/processed/cms24_county_small.csv` — 2024 county-level CMS measures.
- `data/processed/county_need_readmission_quadrants_2024.csv` — 2,997 primary-cohort counties and separate care/context measures.
- `data/processed/followup_county_review.csv` — 63 exploratory follow-up counties with their distinct need, utilization, density, HPSA, and cutoff-sensitivity fields. It is not a combined access ranking.

After running the notebooks, regenerate the county data used by the interactive portfolio explorer from the repository root:

```bash
python3 projects/healthcare-access/scripts/export_dashboard_data.py
```

The script validates county identifiers and required values before writing `public/data/healthcare-counties.json`. That file contains county-level aggregates and the follow-up context needed by the site; it does not include tract-level records.

## Data provenance

| Source | Release / reference period | Use |
|---|---|---|
| [CDC PLACES 2024 release](https://data.cdc.gov/500-Cities-Places/PLACES-Local-Data-for-Better-Health-2024-release/k9zj-b28y) (`k9zj-b28y`) | 2024 release; model inputs and reference years predate 2024 | Tract prevalence and adult population |
| [CMS Medicare Geographic Variation](https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-geographic-variation/medicare-geographic-variation-by-national-state-county) | 2014–2024 source file; analysis uses 2024 county/all-age rows | Readmissions, ER visits, spending, beneficiary counts, service use |
| [HRSA AHRF](https://data.hrsa.gov/DataDownload/AHRF/AHRF_2024-2025_CSV.zip) | 2024–2025 county file; physician numerator is 2023, population denominator is 2024 | Non-federal primary-care physicians in patient care per 100,000 residents |
| [HRSA Primary Care HPSA data](https://data.hrsa.gov/DataDownload/DD_Files/BCD_HPSA_FCT_DET_PC.csv) | Current-designation snapshot retrieved November 17, 2026 | County-linked geographic primary-care HPSA context |
| [2024 Census TIGER/Line county boundaries](https://www2.census.gov/geo/tiger/GENZ2024/shp/cb_2024_us_county_500k.zip) | 2024 boundary vintage | County maps; territories excluded |

These sources do not share a common measurement year. In particular, a PLACES **release year** is not the year every underlying health estimate was measured; consult CDC metadata for the measure-specific reference periods. The HPSA snapshot is current-designation context and is not aligned to the 2024 CMS period.

### Checksums for the current local source files

These SHA-256 values identify the local inputs used for this run. Recalculate them after replacing a download; raw data files are not committed.

| Local file | SHA-256 |
|---|---|
| `data/raw/export.csv` | `d4817fcb897e265008535e40550bc6d00873594f3c026ba6d36a5b5fd750a036` |
| `data/raw/cms_geographic_variation_2014_2024.csv` | `10c8304012da34da3ecfe4caf4548927095f693383814d0e79ce6711b6806fad` |
| `data/raw/ahrf_2024_2025_county_csv.zip` | `6974adcd93ed8e0718d655e6912707bfc5ec37a9a2baf1fc27f59f12b5c441a0` |
| `data/raw/hrsa_primary_care_hpsa.csv` | `6b314f265bf4ad4ea4b535b9927e3ac3835242f6fc5ef54a723af50304026000` |
| `data/raw/cb_2024_us_county_500k.zip` | `da4051717caec55c75e3748c3608c2a3dbde8d1ff401bbaf4f952e3c3fb63ef1` |

## Interpretation limits

- **PCA is exploratory:** the 12 selected prevalence measures and the first component do not constitute a validated clinical or community-risk scale. They are model-based estimates and contain estimation uncertainty not represented in this score.
- **Ecological inference:** county patterns should not be applied to individuals or used to infer county-level causes.
- **CMS denominators:** the extract contains `BENES_TOTAL_CNT` and `BENES_OM_CNT`. The notebook compares both as county-size sensitivities; it does not assert either is the exact denominator for each outcome. Confirm measure-specific definitions and suppression rules in CMS documentation before using small-county rates.
- **Reported zero values:** six counties have a readmission value of zero in the extract. For example, King County, Texas has 41 total beneficiaries and 15 Original Medicare beneficiaries, and its ER measure is suppressed. Inspect reported zeros and small counts rather than assuming they are stable estimates.
- **Utilization is not quality or access:** ER visits, outpatient visits, FQHC/RHC visits, and spending can reflect health need, coverage, supply, access barriers, or other factors. Higher or lower values are not inherently better.
- **Provider-supply proxies:** AHRF density can obscure within-county distribution, appointment capacity, and other clinician types. HPSA records can cover only parts of counties; no matched designation does not establish adequate access.
