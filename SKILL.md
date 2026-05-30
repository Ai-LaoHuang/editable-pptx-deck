---
name: editable-pptx-deck
description: Create editable PowerPoint PPTX decks with native slide objects instead of screenshot slides. Use when the user wants PPT text, shapes, lines, images, tables, metrics, and simple diagrams to be directly editable in PowerPoint, including when converting a high-fidelity HTML deck into an editable PPTX approximation.
---

# Editable PPTX Deck

Build PowerPoint decks as native editable objects. This skill is for the moment when fidelity is not enough: the user needs to click and edit titles, body copy, numbers, lines, image objects, and layout pieces inside PowerPoint.

## Core Rule

Do not export whole-slide screenshots as the final deliverable when the user asks for an editable PPTX.

Use native PPT objects:

- Text: `slide.addText`
- Lines, dividers, rules, panels: `slide.addShape`
- Photos and assets: `slide.addImage`
- Tables and matrices: text + line/shape grids, or native tables when density requires it
- Charts: native charts only when source data exists; otherwise use editable labels and shapes

Screenshot PPTX is allowed only as a separate high-fidelity reference deliverable.

## Quick Workflow

1. Clarify or infer whether the output must be editable.
2. Build or extract a simple content spine: slide title, claim, proof object, and visual role.
3. Choose a theme, usually `assets/themes/grove.json` for quiet literary decks.
4. Prepare images locally. Download or copy remote images into the project before generating PPTX.
5. Create a JSON deck spec if useful, then run:

   ```bash
   NODE_PATH=/Users/xiaowo1800gmail.com/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
   node /Users/xiaowo1800gmail.com/.agents/skills/editable-pptx-deck/scripts/build_editable_deck.js \
     --spec /absolute/path/spec.json \
     --out /absolute/path/deck-editable.pptx
   ```

6. Validate the resulting PPTX:

   ```bash
   python3 /Users/xiaowo1800gmail.com/.agents/skills/editable-pptx-deck/scripts/qa_pptx.py \
     /absolute/path/deck-editable.pptx
   ```

7. Open the PPTX and, when possible, render or inspect a preview before final response.

## Spec Format

The bundled builder accepts a JSON object:

```json
{
  "title": "Deck title",
  "subject": "Deck subject",
  "theme": "grove",
  "slides": [
    {
      "type": "cover",
      "kicker": "SPRING TEA LAUNCH · 2026",
      "title": "春季茶饮\\n新品营销",
      "accentTitle": "策划案",
      "body": "Short supporting copy.",
      "image": "/absolute/path/photo.jpg",
      "imageCredit": "Photo: Unsplash / Name",
      "footLeft": "MINIMAL LITERARY EDITION"
    },
    {
      "type": "statement",
      "label": "背景判断",
      "title": "One focused idea.",
      "body": "One paragraph of support.",
      "themeMode": "light"
    }
  ]
}
```

Supported slide types in the script:

- `cover`
- `statement`
- `splitBullets`
- `stats`
- `positioning`
- `productMatrix`
- `timeline`
- `channelRows`
- `budget`
- `closing`

If the deck needs a layout not covered by the script, extend the script with the same theme tokens and keep every object editable.

## Current Pattern

For a deck first created in HTML:

1. Keep the HTML/high-fidelity PPTX as visual reference.
2. Rebuild the PPTX natively, using the same content and theme.
3. Accept that some CSS details will be simplified.
4. Preserve the important editable hierarchy: title, body, metrics, dividers, photos, captions, footer.

## Validation Gate

A deliverable counts as editable only if `qa_pptx.py` reports native text boxes and shapes. A deck with 12 slides and only 12 pictures is a screenshot deck, not an editable deck.

Read `references/pptxgen-patterns.md` when modifying the builder or when the output needs image cropping, theme extension, or dense grids.
