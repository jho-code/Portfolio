import HealthcareAccessExplorer from './HealthcareAccessExplorer'
import './App.css'

const navigation = [
  { label: 'Start here', href: '#overview' },
  { label: 'Explore counties', href: '#explore' },
  { label: 'What I found', href: '#findings' },
  { label: 'How I built this', href: '#methods' },
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
                  Where do <span className="hero-highlight">health needs</span>{' '}
                  and <em>Medicare readmissions</em> show up together?
                </h1>
                <p className="hero-intro">
                  I built this to compare a county health-need score with
                  Medicare hospital readmissions and see where both show up
                  together.
                </p>
                <div className="hero-actions">
                  <a className="button button-primary" href="#explore">
                    Explore the data
                    <span aria-hidden="true">↓</span>
                  </a>
                </div>
              </div>

              <aside
                className="decision-card"
                aria-label="Project 101: Why readmissions matter"
              >
                <div className="decision-card-topline">
                  <p className="decision-label">Project 101</p>
                </div>
                <h2>Why look at readmissions?</h2>
                <p>
                  A readmission is a return to the hospital after an earlier
                  stay. This CMS measure lets me compare counties. Higher
                  values can be a clue to look at follow-up and access after
                  discharge—but they don’t tell us why someone returned or
                  judge the care on their own.
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
                  <span className="diagram-highlight">Worth a closer look</span>
                </div>
                <p className="decision-footnote">
                  I also compare provider and visit data to add context.
                </p>
              </aside>
            </div>
            <div className="source-strip" aria-label="Data sources">
              <span>CDC PLACES · 2024 release</span>
              <span>CMS Medicare · 2024 county data</span>
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
                <p className="eyebrow">01 / Let’s explore</p>
                <h2 id="explore-title">Let’s look county by county</h2>
              </div>
              <p>
                Each dot is a county. Search or filter to compare places, then
                choose a dot or row to see the measures. The dashed lines show
                medians across the full dataset.
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
                <p className="eyebrow">02 / What I found</p>
                <h2 id="findings-title">A few patterns caught my eye.</h2>
              </div>
              <p>
                The overlap helps narrow where to look. It doesn’t tell us
                what’s driving readmissions or whether care is adequate.
              </p>
            </div>

            <div className="finding-grid">
              <article className="finding-card">
                <span className="finding-number">01</span>
                <h3>287 counties are high on both measures.</h3>
                <p>
                  Of 2,997 counties with both measures, 287 are in the top
                  quartile for both. Using the broader median split flags 850
                  counties.
                </p>
              </article>
              <article className="finding-card finding-card-emphasis">
                <span className="finding-number">02</span>
                <h3>Provider data add context, not an answer.</h3>
                <p>
                  Of the 63 counties on the follow-up list, 27 have a current
                  geographic primary-care HPSA record; 24 also fall below the
                  county median for AHRF physician density. That gives us more
                  to check, but it doesn’t explain the pattern.
                </p>
              </article>
              <article className="finding-card">
                <span className="finding-number">03</span>
                <h3>A few choices change the shortlist.</h3>
                <p>
                  Four counties change status when I use total population
                  instead of adult population to aggregate NeedScore.
                  Beneficiary counts are context; I haven’t confirmed the exact
                  denominator for each CMS measure.
                </p>
              </article>
            </div>

            <div className="action-panel">
              <div>
                <p className="eyebrow">Before using this list</p>
                <h3>Take a closer look before acting.</h3>
              </div>
              <ol>
                <li>Check whether the data are complete and how many people they cover.</li>
                <li>Look at access within each county, including appointment availability.</li>
                <li>Talk with local providers and community partners.</li>
              </ol>
              <p className="action-disclaimer">
                I wouldn’t use this shortlist by itself to decide where resources go.
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
                <p className="eyebrow">03 / How I built this</p>
                <h2 id="methods-title">What went into the comparison</h2>
              </div>
              <p>
                I kept health need, readmissions, and provider context separate
                so it’s clear what each measure can—and can’t—tell us.
              </p>
            </div>

            <div className="method-grid">
              <article className="method-card">
                <span className="method-step">01</span>
                <h3>Health need (NeedScore)</h3>
                <p>
                  I combined 12 standardized PLACES prevalence measures using
                  PCA. The first component explains 73.1% of their standardized
                  variance; higher scores reflect higher average prevalence
                  across these measures.
                </p>
                <p className="method-meta">
                  County scores are weighted by tract adult population.
                </p>
              </article>
              <article className="method-card">
                <span className="method-step">02</span>
                <h3>Readmissions</h3>
                <p>
                  I use the CMS acute hospital readmission field and multiply
                  the source value by 100 for display. I haven’t confirmed the
                  field’s definition and unit, so check CMS documentation
                  before reading it as a percentage.
                </p>
                <p className="method-meta">
                  One outcome, not a complete picture of quality.
                </p>
              </article>
              <article className="method-card">
                <span className="method-step">03</span>
                <h3>The follow-up list</h3>
                <p>
                  I flagged counties at or above the 75th percentile on both
                  NeedScore and readmissions. For a closer look, I also
                  included counties below the county median on FQHC/RHC and
                  outpatient visits per 1,000 beneficiaries.
                </p>
                <p className="method-meta">
                  These cutoffs help compare counties; they aren’t official
                  policy or clinical standards.
                </p>
              </article>
            </div>

            <div className="reading-notes">
              <details>
                <summary>Why don’t the data years match?</summary>
                <p>
                  “PLACES 2024 release” is the release name; it doesn’t mean
                  every estimate is from 2024. CMS uses 2024 county data.
                  AHRF physician counts are from 2023, with a 2024 population
                  denominator. The HRSA HPSA file is a current-designation
                  snapshot retrieved November 17, 2026.
                </p>
              </details>
              <details>
                <summary>Are missing and zero values the same?</summary>
                <p>
                  No. Missing and suppressed values aren’t zero. Six counties
                  have a zero readmission value in the source extract, so check
                  those values and small beneficiary counts before using them.
                  I haven’t independently confirmed each CMS outcome’s
                  denominator.
                </p>
              </details>
              <details>
                <summary>How should I use the shortlist?</summary>
                <p>
                  Use it to decide where to look more closely—not where to send
                  money. Check access within each county, provider capacity,
                  local needs, measure reliability, and current program rules
                  with people who know the area.
                </p>
              </details>
            </div>

            <div className="source-list">
              <h3>Data behind this</h3>
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
          <p>Built by Jennifer Ho · Health data & policy</p>
          <a href="#overview">Back to top ↑</a>
        </div>
      </footer>
    </div>
  )
}

export default App
