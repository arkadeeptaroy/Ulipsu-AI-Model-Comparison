# AI Model Evaluation: SRT Translation

A static comparison dashboard for evaluating English-to-Hindi subtitle translation across AI model variants for educational content.

## Dashboard

- Model ranking and recorded suitability scores
- Capability comparison across five evaluation dimensions
- Reported character counts for a comparison cue
- Original SRT excerpts and qualitative translation evidence
- Model selection and estimated translation costs

The ranking, dimension scores, character counts and cost figures are from the recorded evaluation, not live provider metrics. Character count is not a characters-per-second measurement without a corresponding cue duration. Pacing scores are recorded assessment scores, not measured CPS.

## Implementation

`index.html` contains the dashboard and evaluation excerpts. `styles.css` extends the original visual theme. `app.js` handles navigation, keyboard-accessible tabs and charts. Numeric tables provide a fallback if Chart.js is unavailable.

The dashboard uses Tailwind CSS and Chart.js and requires no backend or build step. Serve from a static host, including GitHub Pages.

```sh
python3 -m http.server 8000
```

## Licence

All rights reserved. See [LICENSE](LICENSE).
