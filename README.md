# Jennifer Ho | Health data & policy

An interactive portfolio case study exploring where county-level community
health need overlaps with Medicare readmissions. The explorer is designed as a
screening aid for policy and health leaders—not a quality score, causal model,
shortage designation, or funding formula.

## Run locally

```bash
npm ci
npm run dev
```

Check the production build and source lint with:

```bash
npm run lint
npm run build
```

The analysis, definitions, data provenance, caveats, and instructions for
regenerating the county data are documented in
[`projects/healthcare-access/README.md`](./projects/healthcare-access/README.md).

## GitHub Pages deployment

Pushing to `main` runs the Pages workflow. It installs the locked dependencies,
runs lint and the production build, then deploys `dist/`. The build reads the
base path supplied by GitHub Pages so assets and county data also work when the
site is served from a repository subpath.

For the first deployment, enable GitHub Pages in the repository settings and
select **GitHub Actions** as the build and deployment source.
