# Evaluation methodology

## Objective and unit of analysis

Assess the suitability of model-generated Hindi subtitles for English-language educational video. Use the same source cue set, evaluation rubric and gate settings for every candidate. The unit of analysis is an aligned cue; the evaluation batch is the complete source set.

The shipped dataset is fictional and intended only to demonstrate the calculation and interface. Do not infer relative provider performance or actual costs from it.

## Reproducible evaluation protocol

1. Define the target learner group, language policy, content domains, accessibility expectations and acceptance thresholds before evaluation.
2. Build a representative source corpus with stable cue identifiers and timestamps. Use approved, shareable materials and record the corpus version separately.
3. Record model identifier, version, prompt version, decoding settings, execution date and run identifier in the evaluation record. Apply the same task and formatting constraints. Run repeated trials where variance is relevant.
4. Review each output against its source independently. Blind reviewers to vendor names where practicable; use a shared rubric, calibrate reviewers and adjudicate disagreements. Record the agreed cue ratings and a critical-error flag.
5. Import the reviewed data. Check integrity, pacing, review coverage and quality gates. Investigate individual failures before interpreting aggregates.
6. Populate actual token use, applicable contracted rates and measured review time. Compare qualified candidates on operating cost and other non-dashboard dimensions such as latency, reliability and data-handling requirements.
7. Validate the shortlist in a pilot with the target learners and measure review effort, comprehension and failure rates. Preserve evaluation evidence in an approved access-controlled location.

## Rubric

All dimensions use a 0–5 scale: 0 = unusable; 1 = major errors; 2 = substantial revision; 3 = acceptable with revision; 4 = minor correction; 5 = fully meets the criterion.

| Dimension | Weight | What to evaluate |
| --- | ---: | --- |
| Meaning | 40% | Factual accuracy, instructional intent, omissions and additions |
| Grammar | 20% | Natural syntax, agreement, spelling and punctuation |
| Academic register | 20% | Age-appropriate, consistent and contextually suitable vocabulary |
| Pedagogy | 20% | Clarity, terminology scaffolding and preservation of learning intent |

Critical errors are separately marked when a mistranslation changes instructional meaning, introduces a material factual error or makes the instruction unsafe. A critical flag blocks qualification irrespective of the weighted score.

The score for each dimension is the arithmetic mean of that dimension's complete cue ratings divided by five, multiplied by 100. Overall quality is the weighted sum of these dimensions. Partial review scores are visible for diagnosis but cannot qualify. All cues have equal weight; no confidence interval is implied.

## Structural and pacing metrics

- Coverage: nonempty outputs matching source IDs divided by source cue count.
- Extra cues: candidate IDs absent from the source. Duplicates are invalid input.
- Timing errors: present matched cues whose start or end differs from the source, with zero tolerance.
- CPS: visible Unicode grapheme clusters divided by actual candidate duration in seconds. Spaces and punctuation count; consecutive whitespace becomes one space; common bare i, b, u and s tags are excluded. This counts user-perceived units rather than UTF-16 code units or bytes.
- Pacing compliance: present matched cues at or below the configured CPS threshold, divided by present matched cues. Coverage is an independent gate.
- Mean CPS: arithmetic mean across present matched cues. P95 uses nearest-rank percentile. Neither is a substitute for individual cue review.

Default thresholds (15 graphemes/second, 90% pacing compliance, 80% quality) are illustrative, not a universal Hindi subtitle standard. Calibrate for learner age, script, display size, narration and reading conditions. The parser supports conventional SRT index and timing blocks, BOM, CRLF, multiline text and comma/dot milliseconds. It deliberately rejects malformed timestamps, duplicate identifiers, and unsupported timing-line metadata. It does not validate line length, cue overlap, visual layout or reading comprehension.

## Qualification

Every gate must pass: 100% nonempty source coverage; zero extra cues; exact timing; 100% human review (all four ratings and critical flag present); zero critical flags; minimum quality; minimum pacing compliance. Missing values never pass a gate. Shortlist order is descending quality, descending pacing compliance, then stable candidate ID. Nonqualified candidates are displayed without a rank.

## Cost model

API cost = (input tokens × input rate per million + output tokens × output rate per million) / 1,000,000.

Review cost = reviewer minutes × hourly rate / 60.

Batch total = API cost + review cost. Projected total = batch total × equivalent batch volume.

Use one currency for all inputs; the tool does not convert exchange rates or fetch prices. Missing economics are displayed as unavailable. The model excludes taxes, transcription, retries, infrastructure, integration, latency and other overhead. Batch scaling assumes constant workload and rates; treat it as a scenario, not a forecast.

## Dataset contract (version 1)

```json
{
  "schemaVersion": 1,
  "title": "Example benchmark",
  "currency": "USD",
  "source": [
    {"id": "1", "startMs": 0, "endMs": 4000, "text": "Observe the water."}
  ],
  "models": [
    {
      "id": "candidate-a",
      "label": "Candidate A",
      "version": "example-version",
      "outputs": [
        {
          "id": "1",
          "startMs": 0,
          "endMs": 4000,
          "text": "पानी को देखें।",
          "ratings": {"meaning": 5, "grammar": 5, "register": 4, "pedagogy": 4},
          "critical": false
        }
      ],
      "economics": {
        "inputTokens": 100,
        "outputTokens": 120,
        "inputPerMillion": 1,
        "outputPerMillion": 3,
        "reviewMinutes": 2
      }
    }
  ]
}
```

Cue IDs are strings unique within each list. Timings are nonnegative integer milliseconds with end greater than start. Source text cannot be blank. Ratings and critical status may be null or omitted for unreviewed outputs; economics may be null or omitted. Token counts are nonnegative integers, prices and review minutes nonnegative numbers. The schema accepts up to 20 candidates and 2,000 cues per list; file imports are limited to 5 MB each. Unknown fields are ignored. Use only authorised data and store actual run metadata outside the public repository.

## Export and data handling

The browser processes imported files in memory. No data is sent to model APIs or stored in browser storage by the application. CSV includes aggregates and candidate labels, not cue text; it guards against common spreadsheet formula prefixes. Downloaded files are controlled by the user. Reloading discards imports. Do not place sensitive source materials in repository fixtures or public issue reports.
