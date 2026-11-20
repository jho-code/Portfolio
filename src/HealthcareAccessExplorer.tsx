import { useEffect, useMemo, useState } from 'react'
import './HealthcareAccessExplorer.css'

const QUADRANTS = [
  'High need / higher readmissions',
  'High need / lower readmissions',
  'Lower need / higher readmissions',
  'Lower need / lower readmissions',
] as const

type Quadrant = (typeof QUADRANTS)[number]

interface CountyRecord {
  fips: string
  state: string
  county: string
  needScore: number
  readmissionDisplay: number
  quadrant: Quadrant
  medianPriority: boolean
  strictPriority: boolean
  followUpCandidate: boolean
  totalBeneficiaries: number | null
  originalMedicareBeneficiaries: number | null
  fqhcVisitsPer1000: number | null
  outpatientVisitsPer1000: number | null
  erVisitsPer1000: number | null
  medicareAdvantageParticipation: number | null
  dualEligibility: number | null
  primaryCarePhysiciansPer100k: number | null
  hasGeographicPrimaryCareHpsa: boolean | null
  providerSignalPattern: string | null
  selectedUnderAllNineCutoffs: boolean | null
}

interface CountyDataset {
  counties: CountyRecord[]
  followUpCount: number
  followUpHpsaCount: number
  followUpBothSignalsCount: number
  readmissionDisplayNote: string
}

type SortMode = 'need' | 'readmissions'
type LoadState = 'loading' | 'ready' | 'error'

const PAGE_SIZE = 12
const EMPTY_COUNTIES: CountyRecord[] = []
const INTEGER_FORMAT = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})
const QUADRANT_COLORS: Record<Quadrant, string> = {
  'High need / higher readmissions': '#8B3154',
  'High need / lower readmissions': '#956F17',
  'Lower need / higher readmissions': '#337D98',
  'Lower need / lower readmissions': '#6D7A84',
}

const REQUIRED_MESSAGE =
  'The interactive county data could not be loaded. Rerun the data export script and refresh this page.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isQuadrant(value: string): value is Quadrant {
  return QUADRANTS.some((quadrant) => quadrant === value)
}

function requiredString(
  value: unknown,
  field: string,
  rowIndex?: number,
): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(
      `${field} is missing or invalid${rowIndex === undefined ? '' : ` on row ${rowIndex + 1}`}.`,
    )
  }
  return value
}

function requiredNumber(
  value: unknown,
  field: string,
  rowIndex?: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(
      `${field} is missing or invalid${rowIndex === undefined ? '' : ` on row ${rowIndex + 1}`}.`,
    )
  }
  return value
}

function nullableNumber(
  value: unknown,
  field: string,
  rowIndex: number,
): number | null {
  if (value === null) return null
  return requiredNumber(value, field, rowIndex)
}

function requiredBoolean(
  value: unknown,
  field: string,
  rowIndex: number,
): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`${field} is invalid on row ${rowIndex + 1}.`)
  }
  return value
}

function nullableBoolean(
  value: unknown,
  field: string,
  rowIndex: number,
): boolean | null {
  if (value === null) return null
  return requiredBoolean(value, field, rowIndex)
}

function parseCounty(value: unknown, rowIndex: number): CountyRecord {
  if (!isRecord(value)) {
    throw new Error(`County data is invalid on row ${rowIndex + 1}.`)
  }

  const quadrant = requiredString(value.quadrant, 'quadrant', rowIndex)
  if (!isQuadrant(quadrant)) {
    throw new Error(`Unknown quadrant on row ${rowIndex + 1}.`)
  }

  const fips = requiredString(value.fips, 'fips', rowIndex)
  if (!/^\d{5}$/.test(fips)) {
    throw new Error(`County FIPS is invalid on row ${rowIndex + 1}.`)
  }

  const providerSignalPattern =
    value.providerSignalPattern === null
      ? null
      : requiredString(
          value.providerSignalPattern,
          'providerSignalPattern',
          rowIndex,
        )

  return {
    fips,
    state: requiredString(value.state, 'state', rowIndex),
    county: requiredString(value.county, 'county', rowIndex),
    needScore: requiredNumber(value.needScore, 'needScore', rowIndex),
    readmissionDisplay: requiredNumber(
      value.readmissionDisplay,
      'readmissionDisplay',
      rowIndex,
    ),
    quadrant,
    medianPriority: requiredBoolean(value.medianPriority, 'medianPriority', rowIndex),
    strictPriority: requiredBoolean(value.strictPriority, 'strictPriority', rowIndex),
    followUpCandidate: requiredBoolean(
      value.followUpCandidate,
      'followUpCandidate',
      rowIndex,
    ),
    totalBeneficiaries: nullableNumber(
      value.totalBeneficiaries,
      'totalBeneficiaries',
      rowIndex,
    ),
    originalMedicareBeneficiaries: nullableNumber(
      value.originalMedicareBeneficiaries,
      'originalMedicareBeneficiaries',
      rowIndex,
    ),
    fqhcVisitsPer1000: nullableNumber(
      value.fqhcVisitsPer1000,
      'fqhcVisitsPer1000',
      rowIndex,
    ),
    outpatientVisitsPer1000: nullableNumber(
      value.outpatientVisitsPer1000,
      'outpatientVisitsPer1000',
      rowIndex,
    ),
    erVisitsPer1000: nullableNumber(
      value.erVisitsPer1000,
      'erVisitsPer1000',
      rowIndex,
    ),
    medicareAdvantageParticipation: nullableNumber(
      value.medicareAdvantageParticipation,
      'medicareAdvantageParticipation',
      rowIndex,
    ),
    dualEligibility: nullableNumber(value.dualEligibility, 'dualEligibility', rowIndex),
    primaryCarePhysiciansPer100k: nullableNumber(
      value.primaryCarePhysiciansPer100k,
      'primaryCarePhysiciansPer100k',
      rowIndex,
    ),
    hasGeographicPrimaryCareHpsa: nullableBoolean(
      value.hasGeographicPrimaryCareHpsa,
      'hasGeographicPrimaryCareHpsa',
      rowIndex,
    ),
    providerSignalPattern,
    selectedUnderAllNineCutoffs: nullableBoolean(
      value.selectedUnderAllNineCutoffs,
      'selectedUnderAllNineCutoffs',
      rowIndex,
    ),
  }
}

function parseCountyDataset(value: unknown): CountyDataset {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.counties)) {
    throw new Error('The county data file has an unsupported format.')
  }

  const counties = value.counties.map(parseCounty)
  const fipsCodes = new Set(counties.map((county) => county.fips))
  if (counties.length === 0 || fipsCodes.size !== counties.length) {
    throw new Error('The county data file is empty or contains duplicate counties.')
  }

  const followUpRows = counties.filter((county) => county.followUpCandidate)
  const followUpCount = requiredNumber(value.followUpCount, 'followUpCount')
  const followUpHpsaCount = requiredNumber(
    value.followUpHpsaCount,
    'followUpHpsaCount',
  )
  const followUpBothSignalsCount = requiredNumber(
    value.followUpBothSignalsCount,
    'followUpBothSignalsCount',
  )
  if (
    followUpRows.length !== followUpCount ||
    followUpRows.filter(
      (county) => county.hasGeographicPrimaryCareHpsa === true,
    ).length !== followUpHpsaCount ||
    followUpRows.filter(
      (county) =>
        county.providerSignalPattern ===
        'Below-median density + HPSA record',
    ).length !== followUpBothSignalsCount
  ) {
    throw new Error('The county summary does not match the county records.')
  }

  return {
    counties,
    followUpCount,
    followUpHpsaCount,
    followUpBothSignalsCount,
    readmissionDisplayNote: requiredString(
      value.readmissionDisplayNote,
      'readmissionDisplayNote',
    ),
  }
}

function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

function formatOptional(value: number | null, digits = 1): string {
  return value === null ? 'Not available' : formatNumber(value, digits)
}

function median(values: number[]): number {
  if (values.length === 0) {
    throw new Error('Cannot calculate a median from an empty county list.')
  }
  const sorted = [...values].sort((a, b) => a - b)
  const midpoint = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[midpoint - 1] + sorted[midpoint]) / 2
    : sorted[midpoint]
}

function escapeCsv(value: string | number | boolean | null): string {
  const text = value === null ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

function downloadCsv(counties: CountyRecord[]): void {
  const columns: Array<[string, (county: CountyRecord) => string | number | boolean | null]> = [
    ['county_fips', (county) => county.fips],
    ['county', (county) => county.county],
    ['state', (county) => county.state],
    ['need_score', (county) => county.needScore],
    ['readmission_source_value_times_100', (county) => county.readmissionDisplay],
    ['quadrant', (county) => county.quadrant],
    ['top_quartile_candidate', (county) => county.strictPriority],
    ['follow_up_candidate', (county) => county.followUpCandidate],
    ['total_medicare_beneficiaries', (county) => county.totalBeneficiaries],
    ['original_medicare_beneficiaries', (county) => county.originalMedicareBeneficiaries],
    ['fqhc_rhc_visits_per_1000', (county) => county.fqhcVisitsPer1000],
    ['outpatient_visits_per_1000', (county) => county.outpatientVisitsPer1000],
  ]
  const lines = [
    columns.map(([label]) => escapeCsv(label)).join(','),
    ...counties.map((county) =>
      columns.map(([, getValue]) => escapeCsv(getValue(county))).join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = 'healthcare-county-explorer.csv'
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

interface ScatterPlotProps {
  counties: CountyRecord[]
  allCounties: CountyRecord[]
  selectedFips: string | null
  readmissionDisplayNote: string
  onSelectCounty: (fips: string) => void
}

function CountyScatterPlot({
  counties,
  allCounties,
  selectedFips,
  readmissionDisplayNote,
  onSelectCounty,
}: ScatterPlotProps) {
  const width = 900
  const height = 450
  const plot = { left: 76, right: 870, top: 28, bottom: 365 }
  const plotWidth = plot.right - plot.left
  const plotHeight = plot.bottom - plot.top
  const needValues = allCounties.map((county) => county.needScore)
  const readmissionValues = allCounties.map(
    (county) => county.readmissionDisplay,
  )
  let needMin = Math.floor(Math.min(...needValues) / 2) * 2
  let needMax = Math.ceil(Math.max(...needValues) / 2) * 2
  if (needMin === needMax) {
    needMin -= 1
    needMax += 1
  }
  const rateMax = Math.max(
    5,
    Math.ceil(Math.max(...readmissionValues) / 5) * 5,
  )
  const needMedian = median(needValues)
  const readmissionMedian = median(readmissionValues)
  const x = (value: number) =>
    plot.left + ((value - needMin) / (needMax - needMin)) * plotWidth
  const y = (value: number) =>
    plot.top + ((rateMax - value) / rateMax) * plotHeight
  const xTicks = Array.from({ length: 6 }, (_, index) =>
    needMin + ((needMax - needMin) * index) / 5,
  )
  const yTicks = Array.from({ length: 5 }, (_, index) =>
    (rateMax * index) / 4,
  )
  const medianX = x(needMedian)
  const medianY = y(readmissionMedian)

  return (
    <div className="scatter-wrap">
      <svg
        className="county-scatter"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Scatter plot of ${INTEGER_FORMAT.format(counties.length)} filtered counties. The horizontal and vertical dashed lines are fixed full-cohort medians.`}
      >
        <rect
          x={plot.left}
          y={plot.top}
          width={medianX - plot.left}
          height={medianY - plot.top}
          fill="#E8F4F7"
        />
        <rect
          x={medianX}
          y={plot.top}
          width={plot.right - medianX}
          height={medianY - plot.top}
          fill="#F4E2E9"
        />
        <rect
          x={plot.left}
          y={medianY}
          width={medianX - plot.left}
          height={plot.bottom - medianY}
          fill="#EDF1F5"
        />
        <rect
          x={medianX}
          y={medianY}
          width={plot.right - medianX}
          height={plot.bottom - medianY}
          fill="#FCF3CE"
        />

        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line
              x1={plot.left}
              x2={plot.right}
              y1={y(tick)}
              y2={y(tick)}
              className="chart-grid"
            />
            <text x={plot.left - 12} y={y(tick) + 4} textAnchor="end">
              {formatNumber(tick, 0)}
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <g key={`x-${tick}`}>
            <line
              x1={x(tick)}
              x2={x(tick)}
              y1={plot.top}
              y2={plot.bottom}
              className="chart-grid"
            />
            <text x={x(tick)} y={plot.bottom + 24} textAnchor="middle">
              {formatNumber(tick, 0)}
            </text>
          </g>
        ))}

        <line
          x1={medianX}
          x2={medianX}
          y1={plot.top}
          y2={plot.bottom}
          className="chart-median"
        />
        <line
          x1={plot.left}
          x2={plot.right}
          y1={medianY}
          y2={medianY}
          className="chart-median"
        />
        <line
          x1={plot.left}
          x2={plot.right}
          y1={plot.bottom}
          y2={plot.bottom}
          className="chart-axis"
        />
        <line
          x1={plot.left}
          x2={plot.left}
          y1={plot.top}
          y2={plot.bottom}
          className="chart-axis"
        />

        {counties.map((county) => (
          <circle
            key={county.fips}
            cx={x(county.needScore)}
            cy={y(county.readmissionDisplay)}
            r={selectedFips === county.fips ? 5.5 : county.strictPriority ? 4 : 2.8}
            fill={QUADRANT_COLORS[county.quadrant]}
            fillOpacity={county.strictPriority ? 0.9 : 0.62}
            stroke={
              selectedFips === county.fips
                ? '#4B172F'
                : county.strictPriority
                  ? '#573A4C'
                  : 'white'
            }
            strokeWidth={
              selectedFips === county.fips
                ? 2
                : county.strictPriority
                  ? 1.2
                  : 0.35
            }
            onClick={() => onSelectCounty(county.fips)}
            className="chart-point"
          >
            <title>
              {county.county}, {county.state} ({county.fips}). Need
              score {formatNumber(county.needScore, 2)}. Readmission source
              value × 100: {formatNumber(county.readmissionDisplay, 2)}.
              {county.strictPriority ? ' Top-quartile candidate.' : ''}
              {' '}Click for county details.
            </title>
          </circle>
        ))}

        <text
          x={(plot.left + plot.right) / 2}
          y={height - 12}
          textAnchor="middle"
          className="chart-axis-label"
        >
          PLACES-based NeedScore · higher = greater estimated health burden
        </text>
        <text
          x={20}
          y={(plot.top + plot.bottom) / 2}
          transform={`rotate(-90 20 ${(plot.top + plot.bottom) / 2})`}
          textAnchor="middle"
          className="chart-axis-label"
        >
          CMS readmission field · source value × 100
        </text>
      </svg>
      <p className="chart-caption">
        Dashed lines are the full-cohort medians: NeedScore{' '}
        <strong>{formatNumber(needMedian, 2)}</strong> and readmission display
        value <strong>{formatNumber(readmissionMedian, 2)}</strong>. Outlined
        points mark the top-quartile group on both measures. Select a dot or use
        the county table below. {readmissionDisplayNote}
      </p>
    </div>
  )
}

function CountyDetails({ county }: { county: CountyRecord | null }) {
  if (!county) {
    return (
      <div className="county-details county-details-empty" aria-live="polite">
        <p className="detail-eyebrow">County detail</p>
        <h3>Select a county</h3>
        <p>
          Choose a point or county in the table to inspect its separate
          measures.
        </p>
      </div>
    )
  }

  return (
    <div className="county-details" aria-live="polite">
      <p className="detail-eyebrow">
        {county.followUpCandidate
          ? 'Exploratory follow-up county'
          : county.strictPriority
            ? 'Top-quartile candidate'
            : 'County detail'}
      </p>
      <h3>
        {county.county}, {county.state}
      </h3>
      <p className="county-fips">County FIPS {county.fips}</p>
      <dl className="detail-metrics">
        <div>
          <dt>NeedScore</dt>
          <dd>{formatNumber(county.needScore, 2)}</dd>
        </div>
        <div>
          <dt>Readmission field × 100</dt>
          <dd>{formatNumber(county.readmissionDisplay, 2)}</dd>
        </div>
        <div>
          <dt>Total beneficiaries</dt>
          <dd>
            {county.totalBeneficiaries === null
              ? 'Not reported'
              : INTEGER_FORMAT.format(county.totalBeneficiaries)}
          </dd>
        </div>
        <div>
          <dt>Original Medicare beneficiaries</dt>
          <dd>
            {county.originalMedicareBeneficiaries === null
              ? 'Not reported'
              : INTEGER_FORMAT.format(county.originalMedicareBeneficiaries)}
          </dd>
        </div>
        <div>
          <dt>FQHC/RHC visits per 1,000</dt>
          <dd>{formatOptional(county.fqhcVisitsPer1000)}</dd>
        </div>
        <div>
          <dt>Outpatient visits per 1,000</dt>
          <dd>{formatOptional(county.outpatientVisitsPer1000)}</dd>
        </div>
      </dl>
      {county.followUpCandidate && (
        <div className="local-context">
          <p>
            <strong>Physician density:</strong>{' '}
            {county.primaryCarePhysiciansPer100k === null
              ? 'not available'
              : `${formatNumber(county.primaryCarePhysiciansPer100k, 1)} per 100,000`}
          </p>
          <p>
            <strong>Current geographic primary-care HPSA record:</strong>{' '}
            {county.hasGeographicPrimaryCareHpsa === true
              ? 'matched'
              : 'no county-linked record matched'}
          </p>
          <p>
            <strong>Visit-cutoff stability:</strong>{' '}
            {county.selectedUnderAllNineCutoffs === true
              ? 'selected in all 9 tested cutoff combinations'
              : 'not selected in all 9 tested cutoff combinations'}
          </p>
        </div>
      )}
      <p className="detail-note">
        Beneficiary counts are context, not confirmed measure-specific
        denominators. Missing values are not interpreted as zero.
      </p>
    </div>
  )
}

function CountyTable({
  counties,
  selectedFips,
  onSelectCounty,
}: {
  counties: CountyRecord[]
  selectedFips: string | null
  onSelectCounty: (fips: string) => void
}) {
  return (
    <div className="table-scroll">
      <table className="county-table">
        <caption className="visually-hidden">
          Filtered counties ordered by the selected measure. Select a county to
          view details.
        </caption>
        <thead>
          <tr>
            <th scope="col">County</th>
            <th scope="col">NeedScore</th>
            <th scope="col">Readmission × 100</th>
            <th scope="col">Beneficiary count</th>
            <th scope="col">Group</th>
          </tr>
        </thead>
        <tbody>
          {counties.map((county) => (
            <tr
              key={county.fips}
              className={selectedFips === county.fips ? 'is-selected' : undefined}
            >
              <th scope="row">
                <button
                  type="button"
                  className="county-select"
                  onClick={() => onSelectCounty(county.fips)}
                  aria-label={`View ${county.county}, ${county.state}, FIPS ${county.fips}`}
                >
                  {county.county}, {county.state}
                  <span>{county.fips}</span>
                </button>
              </th>
              <td>{formatNumber(county.needScore, 2)}</td>
              <td>{formatNumber(county.readmissionDisplay, 2)}</td>
              <td>
                {county.totalBeneficiaries === null
                  ? 'Not reported'
                  : INTEGER_FORMAT.format(county.totalBeneficiaries)}
              </td>
              <td>
                {county.followUpCandidate
                  ? 'Follow-up'
                  : county.strictPriority
                    ? 'Top quartile'
                    : 'Other'}
              </td>
            </tr>
          ))}
          {counties.length === 0 && (
            <tr>
              <td colSpan={5} className="table-empty">
                No counties match these filters. Clear a filter or try a
                broader search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function HealthcareAccessExplorer() {
  const [countyDataset, setCountyDataset] = useState<CountyDataset | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [query, setQuery] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [topQuartileOnly, setTopQuartileOnly] = useState(false)
  const [followUpOnly, setFollowUpOnly] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('need')
  const [page, setPage] = useState(1)
  const [selectedFips, setSelectedFips] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function loadCountyData() {
      setLoadState('loading')
      setLoadError('')
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}data/healthcare-counties.json`,
          { signal: controller.signal },
        )
        if (!response.ok) {
          throw new Error(
            `County data request failed with status ${response.status}.`,
          )
        }
        const dataset = parseCountyDataset(await response.json())
        if (!controller.signal.aborted) {
          setCountyDataset(dataset)
          setLoadState('ready')
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        if (!controller.signal.aborted) {
          setLoadError(
            error instanceof Error ? error.message : 'Unexpected data error.',
          )
          setLoadState('error')
        }
      }
    }

    void loadCountyData()
    return () => controller.abort()
  }, [reloadKey])

  const counties = countyDataset?.counties ?? EMPTY_COUNTIES
  const stateOptions = useMemo(
    () => [...new Set(counties.map((county) => county.state))].sort(),
    [counties],
  )
  const filteredCounties = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return counties.filter((county) => {
      const matchesState = !stateFilter || county.state === stateFilter
      const matchesSearch =
        !normalizedQuery ||
        `${county.county} ${county.state} ${county.fips}`
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      const matchesTopQuartile = !topQuartileOnly || county.strictPriority
      const matchesFollowUp = !followUpOnly || county.followUpCandidate
      return (
        matchesState &&
        matchesSearch &&
        matchesTopQuartile &&
        matchesFollowUp
      )
    })
  }, [counties, followUpOnly, query, stateFilter, topQuartileOnly])
  const sortedCounties = useMemo(
    () =>
      [...filteredCounties].sort((a, b) => {
        const difference =
          sortMode === 'need'
            ? b.needScore - a.needScore
            : b.readmissionDisplay - a.readmissionDisplay
        return difference || a.fips.localeCompare(b.fips)
      }),
    [filteredCounties, sortMode],
  )
  const pageCount = Math.max(1, Math.ceil(sortedCounties.length / PAGE_SIZE))
  const pageCounties = sortedCounties.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  )
  const selectedCounty =
    counties.find((county) => county.fips === selectedFips) ?? null
  const strictCount = counties.filter((county) => county.strictPriority).length
  const medianPriorityCount = counties.filter(
    (county) => county.medianPriority,
  ).length

  function resetFilters() {
    setQuery('')
    setStateFilter('')
    setTopQuartileOnly(false)
    setFollowUpOnly(false)
    setSortMode('need')
    setPage(1)
  }

  return (
    <div className="explorer">
      {loadState === 'loading' && (
        <div className="explorer-state" role="status">
          <span className="loading-mark" aria-hidden="true" />
          <p>Loading county data…</p>
        </div>
      )}

      {loadState === 'error' && (
        <div className="explorer-state explorer-error" role="alert">
          <h3>County explorer unavailable</h3>
          <p>{REQUIRED_MESSAGE}</p>
          <p className="error-detail">{loadError}</p>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Retry loading
          </button>
        </div>
      )}

      {loadState === 'ready' && countyDataset && (
        <>
          <div className="metric-grid" aria-label="Analysis snapshot">
            <article className="metric-card">
              <p className="metric-label">Counties in the main comparison</p>
              <p className="metric-value">
                {INTEGER_FORMAT.format(counties.length)}
              </p>
              <p className="metric-note">NeedScore + readmission available</p>
            </article>
            <article className="metric-card metric-card-accent">
              <p className="metric-label">Top-quartile candidates</p>
              <p className="metric-value">{INTEGER_FORMAT.format(strictCount)}</p>
              <p className="metric-note">
                High need and higher readmission measure
              </p>
            </article>
            <article className="metric-card">
              <p className="metric-label">Exploratory follow-up list</p>
              <p className="metric-value">
                {INTEGER_FORMAT.format(countyDataset.followUpCount)}
              </p>
              <p className="metric-note">
                Also below median on both visit measures
              </p>
            </article>
            <article className="metric-card metric-card-context">
              <p className="metric-label">Follow-up counties with both context signals</p>
              <p className="metric-value">
                {countyDataset.followUpBothSignalsCount}
                <span> / {countyDataset.followUpCount}</span>
              </p>
              <p className="metric-note">
                Low physician density + current HPSA record
              </p>
            </article>
          </div>

          <div className="cohort-note">
            <span className="cohort-note-mark" aria-hidden="true">
              i
            </span>
            <p>
              The median-split comparison includes {INTEGER_FORMAT.format(medianPriorityCount)}{' '}
              counties. The top-quartile group and 63-county follow-up list are
              exploratory screens—not official designations or funding
              recommendations.
            </p>
          </div>

          <div className="explorer-layout">
            <div className="explorer-main">
              <section className="chart-panel" aria-labelledby="county-chart-title">
                <div className="panel-heading">
                  <div>
                    <p className="panel-kicker">Explore the pattern</p>
                    <h3 id="county-chart-title">
                      Need and reported readmissions, county by county
                    </h3>
                  </div>
                  <span className="chart-size">
                    {INTEGER_FORMAT.format(filteredCounties.length)} in view
                  </span>
                </div>

                <CountyScatterPlot
                  counties={filteredCounties}
                  allCounties={counties}
                  selectedFips={selectedFips}
                  readmissionDisplayNote={countyDataset.readmissionDisplayNote}
                  onSelectCounty={setSelectedFips}
                />

                <ul className="chart-legend" aria-label="Chart groups">
                  {QUADRANTS.map((quadrant) => (
                    <li key={quadrant}>
                      <span
                        className="legend-dot"
                        style={{ backgroundColor: QUADRANT_COLORS[quadrant] }}
                        aria-hidden="true"
                      />
                      {quadrant}
                    </li>
                  ))}
                  <li>
                    <span className="legend-ring" aria-hidden="true" />
                    Top-quartile candidate
                  </li>
                </ul>
              </section>

              <section className="table-panel" aria-labelledby="county-table-title">
                <div className="panel-heading table-heading">
                  <div>
                    <p className="panel-kicker">Find a county</p>
                    <h3 id="county-table-title">County details</h3>
                  </div>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => downloadCsv(sortedCounties)}
                    disabled={sortedCounties.length === 0}
                  >
                    Download filtered CSV
                  </button>
                </div>
                <p className="table-helper">
                  Search county, state abbreviation, or FIPS. Select a row to
                  compare its measures and beneficiary counts.
                </p>

                <div className="filter-grid">
                  <label className="filter-field">
                    <span>Search counties</span>
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value)
                        setPage(1)
                      }}
                      placeholder="e.g., Atkinson or 13003"
                    />
                  </label>
                  <label className="filter-field">
                    <span>State</span>
                    <select
                      value={stateFilter}
                      onChange={(event) => {
                        setStateFilter(event.target.value)
                        setPage(1)
                      }}
                    >
                      <option value="">All states</option>
                      {stateOptions.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="filter-field">
                    <span>Order results by</span>
                    <select
                      value={sortMode}
                      onChange={(event) => {
                        const nextSortMode = event.target.value
                        if (
                          nextSortMode === 'need' ||
                          nextSortMode === 'readmissions'
                        ) {
                          setSortMode(nextSortMode)
                          setPage(1)
                        }
                      }}
                    >
                      <option value="need">Higher need first</option>
                      <option value="readmissions">
                        Higher readmission measure first
                      </option>
                    </select>
                  </label>
                </div>

                <div className="toggle-row">
                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={topQuartileOnly}
                      onChange={(event) => {
                        setTopQuartileOnly(event.target.checked)
                        setPage(1)
                      }}
                    />
                    <span>Top-quartile candidates only</span>
                  </label>
                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={followUpOnly}
                      onChange={(event) => {
                        setFollowUpOnly(event.target.checked)
                        setPage(1)
                      }}
                    />
                    <span>Follow-up list only</span>
                  </label>
                  <button
                    type="button"
                    className="text-button clear-button"
                    onClick={resetFilters}
                  >
                    Clear filters
                  </button>
                </div>

                <p className="result-count" role="status" aria-live="polite">
                  {sortedCounties.length === 0
                    ? 'No matching counties'
                    : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, sortedCounties.length)} of ${INTEGER_FORMAT.format(sortedCounties.length)} counties`}
                </p>
                <CountyTable
                  counties={pageCounties}
                  selectedFips={selectedFips}
                  onSelectCounty={setSelectedFips}
                />
                <div className="pagination">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {pageCount}
                  </span>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() =>
                      setPage((current) => Math.min(pageCount, current + 1))
                    }
                    disabled={page >= pageCount}
                  >
                    Next
                  </button>
                </div>
              </section>
            </div>

            <aside className="detail-rail" aria-label="Selected county">
              <CountyDetails county={selectedCounty} />
              <div className="denominator-callout">
                <p className="detail-eyebrow">Interpret with care</p>
                <h3>Counts are context, not the rate denominator.</h3>
                <p>
                  CMS reports both total and Original Medicare beneficiary
                  counts. The exact denominator for each outcome still needs
                  confirmation in the measure documentation.
                </p>
                <details>
                  <summary>Why does this matter?</summary>
                  <p>
                    A rate from a small population can be unstable. Suppressed
                    or missing values are not zero, and a beneficiary count
                    should not be substituted for an outcome-specific
                    denominator without documentation.
                  </p>
                </details>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

export default HealthcareAccessExplorer
