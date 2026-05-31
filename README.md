# Ai-LaoHuang PPT Studio

Ai-LaoHuang PPT Studio is a Chinese-first commercial PPT production skill for
creating editable PowerPoint decks from topics, documents, SVG pages, native
objects, templates, and optional AI-generated images.

The skill is designed for marketing plans, product introductions, roadshows,
course decks, consulting reports, campaign proposals, and other client-facing
business decks.

## Showcase

The current showcase template is:

- `examples/spring-tea-launch-editorial/`
- Final PPTX: `examples/spring-tea-launch-editorial/exports/spring-tea-launch-editorial-fixed-tripod-final.pptx`
- Preview: `examples/spring-tea-launch-editorial/preview/contact-sheet.jpg`

This example demonstrates an editorial magazine direction for a spring tea
launch proposal: architecture photography, a calm typographic grid, low
saturation color, generous negative space, and editable PPT objects.

## Workflow

1. Prepare a topic, document, URL, or brief.
2. Create or reuse a project folder.
3. Generate SVG pages and image assets.
4. Run `scripts/finalize_svg.py`.
5. Run `scripts/svg_to_pptx.py`.
6. QA the exported PPTX and preview images.

See `SKILL.md` for the full skill protocol and `scripts/README.md` for command
details.
