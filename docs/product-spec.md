# Product specification

## Problem

Subtitle model selection can over-index on fluency or headline pricing while overlooking meaning errors, timestamp integrity, reviewer workload and actual reading pace. A decision owner needs a repeatable, evidence-led comparison before approving a pilot.

## Users and jobs

- Product owner: decide which candidates merit controlled validation; compare cost scenarios without trading away mandatory quality.
- Linguistic reviewer: inspect source and target cues, identify violations and reconcile ratings.
- Engineering / operations: validate input format, reproduce metrics and estimate translation and review effort.

## Product scope

| Requirement | Acceptance criteria |
| --- | --- |
| Local input | Reviewed JSON and an SRT pair can be imported; invalid data produces a readable error without replacing the active valid dataset. |
| Reproducible scoring | Identical dataset and settings produce identical scores and decisions; missing reviews never qualify. |
| Structural checks | Duplicate IDs and invalid durations are rejected; missing, blank, extra and time-shifted cues are surfaced. |
| Linguistic review | Four weighted dimensions, review coverage and critical flags are visible; no automated quality rating is inferred. |
| Pacing | Graphemes per second are calculated from each candidate cue's duration; mean and P95 are available in aggregate export. |
| Decision gates | Qualification requires all mandatory conditions; failed gates are visible and failed candidates are unranked. |
| Evidence explorer | Candidate and issue filters reveal source/target text, timestamps, pacing and reviewer ratings. |
| Economics | Token charges plus human review are calculated separately; scenario volume scales a batch; absent rates are not zero. |
| Export | Aggregate CSV can be downloaded without including source or target cue text. |
| Deployment | Static hosting, no API keys, no build step, no third-party runtime scripts, no telemetry. |
| Accessibility | Semantic tables, form labels, focus indicators, keyboard-operable controls, status announcements and responsive layout. |

## Decision and success measures

| Metric | Pilot target |
| --- | --- |
| Critical meaning errors | Zero in accepted batch |
| Source cue coverage / timing alignment | 100% |
| Review completeness | 100% |
| Linguistic score and pacing compliance | Meet calibrated thresholds |
| Reviewer effort | Measure minutes per batch and compare against baseline |
| Learner comprehension | Establish age-group baseline and validate non-inferiority before rollout |

Targets beyond fixed gates are proposed starting points, not observed performance. Define sampling, confidence intervals and operational service levels before a production decision.

## Non-goals

No provider integration, automatic translation, automatic linguistic grading, live pricing, confidential corpus storage, production approval or claims of statistical significance.

## Prioritised next steps

| Priority | Item | Validation |
| --- | --- | --- |
| P0 | Representative independently reviewed corpus and calibration | Agreement and error adjudication documented |
| P0 | Validate pacing and reading comprehension with target learners | Defined pilot and acceptance criteria |
| P1 | Repeated-run variance, model run metadata and latency | Reproducible comparison over multiple runs |
| P1 | Subtitle overlap, display-line and reading-layout diagnostics | Format-level regression tests |
| P2 | Multi-reviewer workflow and restricted dataset storage | Access control, auditability and retention requirements |

## Release boundary

Version 2.0 is a local-first evaluation prototype. It supports structured decision-making; it is not a production deployment decision or a validated vendor benchmark.
