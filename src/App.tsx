import HealthcareAccessExplorer from './HealthcareAccessExplorer'
import './App.css'

const navigation = [
  { label: 'Overview', href: '#overview' },
  { label: 'Explore counties', href: '#explore' },
  { label: 'Findings', href: '#findings' },
  { label: 'Methods & sources', href: '#methods' },
]

function App() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="site-header">
        <a className="wordmark" href="#overview" aria-label="Jennifer Ho, home">
          <span className="wordmark-mark" aria-hidden="true">
            JH
          </span>
          <span>Jennifer Ho</span>
          <span className="wordmark-divider" aria-hidden="true">
            /
          </span>
          <span className="wordmark-discipline">Health data & policy</span>
        </a>

        <nav aria-label="Project navigation">
          <ul className="nav-list">
            {navigation.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main-content">
        <section
          className="hero-section"
          id="overview"
          aria-labelledby="hero-title"
        >
          <div className="page-container">
            <p className="eyebrow hero-eyebrow">
              <span className="eyebrow-spark" aria-hidden="true">
                ✳
              </span>
              Health policy · Geospatial analysis
            </p>
            <div className="hero-grid">
              <div className="hero-copy">
                <h1 id="hero-title">
                  Where does <span className="hero-highlight">health need</span>{' '}
                  overlap with <em>Medicare readmissions?</em>
                </h1>
                <p className="hero-intro">
                  A county-level screening tool to help policy and health
                  leaders decide where local investigation may be useful.
                </p>
                <p className="hero-caveat">
                  It is a starting point for inquiry—not a quality score,
                  shortage designation, or funding formula.
                </p>
                <div className="hero-actions">
                  <a className="button button-primary" href="#explore">
                    Explore county patterns
                    <span aria-hidden="true">↓</span>
                  </a>
                  <a className="hero-secondary-link" href="#findings">
                    Read the key findings
                  </a>
                </div>
              </div>

              <aside className="decision-card" aria-label="How to use this analysis">
                <div className="decision-card-topline">
                  <p className="decision-label">Decision lens</p>
                  <span className="decision-stamp" aria-hidden="true">
                    FIELD NOTE <strong>01</strong>
                  </span>
                </div>
                <h2>Find overlap. Then ask why.</h2>
                <p>
                  Compare community health need with one Medicare outcome, then
                  bring service use and provider context into local review.
                </p>
                <div className="decision-diagram" aria-hidden="true">
                  <svg className="diagram-path" viewBox="0 0 200 120">
                    <path d="M8 98 C 40 92, 40 57, 72 69 S 112 39, 142 47 S 166 15, 192 20" />
                    <circle cx="72" cy="69" r="5" />
                    <circle cx="142" cy="47" r="5" />
                    <circle cx="192" cy="20" r="5" />
                  </svg>
                  <span className="diagram-y">Higher readmissions</span>
                  <span className="diagram-x">Higher need</span>
                  <span className="diagram-highlight">Investigate together</span>
                </div>
                <p className="decision-footnote">
                  County patterns do not explain individual experiences or
                  causes.
                </p>
              </aside>
            </div>
            <div className="source-strip" aria-label="Data vintages">
              <span>CDC PLACES 2024 release</span>
              <span>CMS 2024 county data</span>
              <span>Source vintages vary</span>
            </div>
          </div>
        </section>

        <section
          className="content-section explorer-section"
          id="explore"
          aria-labelledby="explore-title"
        >
          <div className="page-container">
            <div className="section-intro">
              <div>
                <p className="eyebrow">01 / Explore</p>
                <h2 id="explore-title">See the county-level pattern</h2>
              </div>
              <p>
                Use the chart to see where need and reported readmissions rise
                together. Filter by state or county, then inspect the measures
                before drawing a conclusion.
              </p>
            </div>
            <HealthcareAccessExplorer />
          </div>
        </section>

        <section
          className="content-section findings-section"
          id="findings"
          aria-labelledby="findings-title"
        >
          <div className="page-container">
            <div className="section-intro">
              <div>
                <p className="eyebrow">02 / What stands out</p>
                <h2 id="findings-title">
                  A useful screen is not a verdict.
                </h2>
              </div>
              <p>
                These findings help frame follow-up questions. They do not
                establish cause, inadequate care, or a place’s eligibility for
                resources.
              </p>
            </div>

            <div className="finding-grid">
              <article className="finding-card">
                <span className="finding-number">01</span>
                <h3>Two signals identify a manageable review group.</h3>
                <p>
                  Of 2,997 counties with both NeedScore and readmission data,
                  287 fall in the top quartile on both measures. The median
                  split is broader, flagging 850 counties.
                </p>
              </article>
              <article className="finding-card finding-card-emphasis">
                <span className="finding-number">02</span>
                <h3>Local context adds useful—not definitive—evidence.</h3>
                <p>
                  In the 63-county follow-up list, 27 have a current geographic
                  primary-care HPSA record; 24 also fall below the county
                  median for AHRF physician density.
                </p>
              </article>
              <article className="finding-card">
                <span className="finding-number">03</span>
                <h3>Cutoffs and denominators can change interpretation.</h3>
                <p>
                  Four top-quartile counties change when total population
                  replaces adult population in NeedScore aggregation.
                  Beneficiary counts are shown as context, not assumed
                  measure-specific denominators.
                </p>
              </article>
            </div>

            <div className="action-panel">
              <div>
                <p className="eyebrow">A practical next step</p>
                <h3>Validate locally before acting.</h3>
              </div>
              <ol>
                <li>Review data completeness and beneficiary counts.</li>
                <li>Check subcounty access, appointment capacity, and local need.</li>
                <li>Discuss findings with community and clinical partners.</li>
              </ol>
              <p className="action-disclaimer">
                Do not allocate resources from this shortlist alone.
              </p>
            </div>
          </div>
        </section>

        <section
          className="content-section methods-section"
          id="methods"
          aria-labelledby="methods-title"
        >
          <div className="page-container">
            <div className="section-intro">
              <div>
                <p className="eyebrow">03 / How to read it</p>
                <h2 id="methods-title">Methods, definitions & sources</h2>
              </div>
              <p>
                The measures are intentionally kept separate so readers can see
                what each one says—and what it cannot say.
              </p>
            </div>

            <div className="method-grid">
              <article className="method-card">
                <span className="method-step">01</span>
                <h3>Health need</h3>
                <p>
                  NeedScore is the first principal component of 12
                  standardized, adverse PLACES prevalence measures. It explains
                  73.1% of their standardized variance; higher values indicate
                  higher prevalence on average.
                </p>
                <p className="method-meta">
                  County scores are weighted by tract adult population.
                </p>
              </article>
              <article className="method-card">
                <span className="method-step">02</span>
                <h3>Readmission measure</h3>
                <p>
                  The chart uses the CMS acute hospital readmission field,
                  displayed as the source value multiplied by 100. Confirm the
                  field definition and unit in CMS documentation before
                  interpreting it as a percentage.
                </p>
                <p className="method-meta">
                  This is one outcome, not a complete quality measure.
                </p>
              </article>
              <article className="method-card">
                <span className="method-step">03</span>
                <h3>Exploratory groups</h3>
                <p>
                  Top-quartile candidates meet or exceed the 75th percentile on
                  both NeedScore and readmissions. The follow-up list also falls
                  below the scored-county medians on FQHC/RHC and outpatient
                  visits per 1,000 beneficiaries.
                </p>
                <p className="method-meta">
                  These relative thresholds are not policy or clinical standards.
                </p>
              </article>
            </div>

            <div className="reading-notes">
              <details>
                <summary>Why are the data years not all the same?</summary>
                <p>
                  “PLACES 2024 release” describes the release vintage, not the
                  year every underlying health estimate was measured. CMS uses
                  2024 county data; the AHRF physician numerator is from 2023
                  and its population denominator is 2024. The HRSA HPSA file is
                  a current-designation snapshot retrieved November 17, 2026.
                </p>
              </details>
              <details>
                <summary>What does a missing or zero value mean?</summary>
                <p>
                  Missing and suppressed values are not zero. Six counties
                  report a zero readmission value in the source extract; inspect
                  those values and small beneficiary counts before using them.
                  The exact outcome-specific CMS denominators have not been
                  independently confirmed in this project.
                </p>
              </details>
              <details>
                <summary>What is an appropriate use of this shortlist?</summary>
                <p>
                  Use it to prioritize data review and conversations with
                  local partners. Validate access within counties, provider
                  capacity, population needs, measure reliability, and current
                  program definitions before making policy or investment
                  decisions.
                </p>
              </details>
            </div>

            <div className="source-list">
              <h3>Data sources</h3>
              <ul>
                <li>
                  <a
                    href="https://data.cdc.gov/500-Cities-Places/PLACES-Local-Data-for-Better-Health-2024-release/k9zj-b28y"
                    target="_blank"
                    rel="noreferrer"
                  >
                    CDC PLACES 2024 release
                  </a>
                  <span> — tract prevalence estimates and adult population.</span>
                </li>
                <li>
                  <a
                    href="https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-geographic-variation/medicare-geographic-variation-by-national-state-county"
                    target="_blank"
                    rel="noreferrer"
                  >
                    CMS Medicare Geographic Variation
                  </a>
                  <span> — 2024 county-level, all-age measures.</span>
                </li>
                <li>
                  <a
                    href="https://data.hrsa.gov/DataDownload/AHRF/AHRF_2024-2025_CSV.zip"
                    target="_blank"
                    rel="noreferrer"
                  >
                    HRSA Area Health Resources Files
                  </a>
                  <span> — 2023 physician counts and 2024 population estimates.</span>
                </li>
                <li>
                  <a
                    href="https://data.hrsa.gov/DataDownload/DD_Files/BCD_HPSA_FCT_DET_PC.csv"
                    target="_blank"
                    rel="noreferrer"
                  >
                    HRSA Primary Care HPSA data
                  </a>
                  <span> — current geographic designation snapshot.</span>
                </li>
                <li>
                  <a
                    href="https://www2.census.gov/geo/tiger/GENZ2024/shp/cb_2024_us_county_500k.zip"
                    target="_blank"
                    rel="noreferrer"
                  >
                    2024 Census TIGER/Line county boundaries
                  </a>
                  <span> — county mapping reference.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-container footer-inner">
          <p>Jennifer Ho · Health data & policy</p>
          <a href="#overview">Back to top ↑</a>
        </div>
      </footer>
    </div>
  )
}

export default App
