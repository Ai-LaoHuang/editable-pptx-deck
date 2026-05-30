# PPTXGenJS Patterns

## Editable Versus Screenshot

Editable PPTX decks should have many `<p:txBody>` text bodies and `<p:sp>` shapes in the slide XML. A high-fidelity screenshot deck often has one `<p:pic>` per slide and very few text bodies.

Use `qa_pptx.py` to confirm the difference.

## Theme Tokens

Keep theme colors in one JSON file. Use hex without `#` in `pptxgenjs` options.

Typical Grove tokens:

- `bg`: deep forest green
- `paper`: warm cream
- `accent`: muted terracotta
- `cream`: warm light text
- `green2`: muted green-gray body text

## Layout Strategy

Use a 16:9 wide deck (`LAYOUT_WIDE`). Work in inches:

- Width: `13.333333`
- Height: `7.5`
- Outer margins: `0.74` to `1.0`
- Footer y: around `6.85`
- Chrome top line y: around `0.7`

Use sparse, large objects. PowerPoint line-height and font metrics differ from CSS, so leave more vertical room than in HTML.

## Image Handling

For reliable image crops, prepare derivatives before inserting:

```js
await sharp(input).resize(1200, 1200, { fit: "cover" }).jpeg({ quality: 88 }).toFile(output);
slide.addImage({ path: output, x, y, w, h });
```

This keeps the image editable as an image object while avoiding unpredictable PowerPoint crop behavior.

## Useful Object Rules

- Use `addText` for every title and paragraph.
- Use `addShape(pptx.ShapeType.line)` for dividers and hairlines.
- Use transparent rectangles for editable image frames and panels.
- Use monospace text for small labels and page markers.
- Avoid tiny text below 6 pt unless it is decorative metadata.

## Common Failure Modes

- Text clipped because HTML line-height was copied too tightly.
- CJK text reflows differently in PowerPoint. Make text boxes taller.
- Images inserted as full-slide screenshots by accident.
- Downloaded images left remote-only, causing offline failures.
- Mixed worktrees staged wholesale when publishing a skill repo.
