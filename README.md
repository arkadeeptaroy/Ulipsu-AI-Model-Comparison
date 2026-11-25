# Subtitle Benchmark

A browser-based decision-support tool for evaluating English-to-Hindi educational subtitle localisation. It compares linguistic quality, cue integrity, reading pace and estimated operating cost using a common dataset and explicit release gates.

**The included benchmark is synthetic.** Candidate labels, ratings, translations and cost assumptions are fictional examples, not measured vendor performance, provider pricing or a production recommendation.

## Run locally

Requires a modern browser with Unicode grapheme segmentation support. For local development, use Node.js 20+ for tests and Python 3 for the static server.

```sh
python3 -m http.server 8000
```

Open http://localhost:8000 in a browser. The application is also compatible with root-level GitHub Pages hosting. It does not require a build step, package installation, backend or API credentials.

```sh
npm test
```

## Evaluation workflow

1. Explore the synthetic benchmark or import a reviewed JSON dataset. Download the example from the dashboard for the supported schema.
2. Alternatively, import a source SRT and one candidate SRT for structural and pacing analysis. Raw SRT pairs do not have linguistic ratings and cannot qualify.
3. Set the pacing limit and minimum quality and pacing compliance. Inspect missing cues, timing changes, critical errors and individual human ratings.
4. Model API and reviewer costs with explicit inputs. Export aggregate metrics as CSV.

## Decision model

| Measure | Definition |
| --- | --- |
| Linguistic quality | Human ratings normalised to 100; meaning 40%, grammar 20%, register 20%, pedagogy 20% |
| Coverage | Nonempty matched candidate cues / source cues |
| Cue integrity | Exact timestamp alignment and no unexpected cue IDs |
| Reading pace | Visible Unicode grapheme clusters / actual candidate cue duration |
| Review coverage | Matched cues with complete ratings and critical-error flag / source cues |
| Cost | Input and output token charges plus reviewer time |

Qualification requires full coverage, no unexpected cues, exact timings, full human review, zero critical errors and configurable quality and pacing thresholds. Qualified candidates are ordered by quality, pacing compliance and candidate ID. Cost is shown separately to avoid hiding quality failures behind a lower price.

## Architecture

```text
index.html             Accessible dashboard shell
styles.css             Responsive layout and design tokens
src/core.mjs           Validation, SRT parsing, scoring, decision gates, CSV
src/demo.mjs           Synthetic example dataset
src/app.mjs            Browser state, rendering, imports and exports
tests/core.test.mjs    Dependency-free regression suite
docs/methodology.md    Evaluation protocol, schema and assumptions
docs/product-spec.md   Requirements, acceptance criteria and roadmap
CHANGELOG.md           Versioned implementation history
```

The calculation module is independent of the DOM. The dashboard uses native browser APIs and has no external scripts, fonts, trackers or remote data requests. Imports are processed in memory and discarded on reload. CSV export contains candidate-level aggregates, not subtitle text. Imported data is not persisted by this application. Hosting infrastructure may maintain normal access logs.

## Documentation

- [Evaluation protocol and JSON schema](docs/methodology.md)
- [Product specification and acceptance criteria](docs/product-spec.md)
- [Change history](CHANGELOG.md)

## Scope

This is a decision-support prototype, not an automated translation service. Actual selection requires a representative reviewed corpus, documented model versions and prompts, reproducible runs, independently verified pricing, operational testing and learner validation.

## License

All rights reserved. This repository is not open source. See [LICENSE](LICENSE) for applicable restrictions.
