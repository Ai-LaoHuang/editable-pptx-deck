# Ai-LaoHuang PPT Studio

> AI-powered Chinese commercial PPT production workflow for generating editable PowerPoint decks from topics, documents, SVG pages, native slide objects, templates, and image assets.

<p align="center">
  <img alt="Ai-LaoHuang Studio" src="https://img.shields.io/badge/Ai--LaoHuang-PPT%20Studio-111111">
  <img alt="Editable PPTX" src="https://img.shields.io/badge/Output-Editable%20PPTX-E10600">
  <img alt="SVG Pipeline" src="https://img.shields.io/badge/Pipeline-SVG%20to%20PowerPoint-0B63F6">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-34A853">
</p>

Ai-LaoHuang PPT Studio is a **Chinese-first commercial deck production system** built for real client-facing decks: marketing plans, product launches,招商/路演, course decks, consulting reports, brand proposals, and internal business reviews.

It is not a screenshot deck generator. The core workflow creates **structured SVG pages**, then exports them into PowerPoint as **editable text, shapes, lines, images, diagrams, and native slide objects** whenever possible.

## Showcase

**Spring Tea Launch Editorial Proposal**

An example deck in an editorial magazine direction: architecture photography, calm typographic grid, low saturation palette, generous negative space, and commercial proposal structure.

![Spring Tea Launch Editorial Preview](examples/spring-tea-launch-editorial/preview/contact-sheet.jpg)

| Asset | Path |
|---|---|
| Final PPTX | [`examples/spring-tea-launch-editorial/exports/spring-tea-launch-editorial-fixed-tripod-final.pptx`](examples/spring-tea-launch-editorial/exports/spring-tea-launch-editorial-fixed-tripod-final.pptx) |
| Preview contact sheet | [`examples/spring-tea-launch-editorial/preview/contact-sheet.jpg`](examples/spring-tea-launch-editorial/preview/contact-sheet.jpg) |
| Source SVG pages | [`examples/spring-tea-launch-editorial/svg_output/`](examples/spring-tea-launch-editorial/svg_output/) |
| Image assets | [`examples/spring-tea-launch-editorial/images/`](examples/spring-tea-launch-editorial/images/) |
| Design spec | [`examples/spring-tea-launch-editorial/design_spec.md`](examples/spring-tea-launch-editorial/design_spec.md) |

## What It Does

| Capability | Description |
|---|---|
| Topic-to-deck | Turn a brief such as “春季茶饮新品营销策划案” into a structured commercial presentation. |
| Document-to-deck | Convert PDF, DOCX, PPTX, Excel, Markdown, HTML, and web sources into presentation material. |
| Editable PPTX output | Export text, rules, shapes, diagrams, images, and many layout objects as editable PowerPoint content. |
| SVG-first design | Author each slide as a high-fidelity SVG page, then convert it into PPTX. |
| LaoHuang visual route | Guide the deck with named visual routes such as magazine grid, modular redline, pop geometry, executive logic, launch proposal, and more. |
| Image asset workflow | Use generated or local images as deck assets without turning the whole page into a flat screenshot. |
| Template system | Includes layout templates, chart templates, brand presets, icon libraries, and reference design specs. |
| QA workflow | Finalize SVG, export PPTX, inspect slide count/media/text/shape counts, and render previews for visual review. |

## Design Asset System

For external introduction, the project does **not** describe itself as a pile of generic "styles". It uses three Ai-LaoHuang naming layers:

| Layer | Count | What It Means |
|---|---:|---|
| **Visual Routes** | Flexible | Prompt-level creative directions for a new deck, not fixed templates. |
| **Scenario Kits** | 7 | Structure-first PPT skeletons for recurring presentation scenarios. |
| **Brand Deck Kits** | 8 | Complete brand/template replicas with identity, page rhythm, and SVG page types. |

### Visual Routes

Visual Routes are free-form creative directions. Current public examples:

- `Magazine Grid` - photography-led editorial rhythm, calm typography, generous negative space
- `Modular Redline` - strict grid, restrained type, black-white-gray system with a red signal
- `Pop Geometry` - bold primaries, geometric patterns, playful presentation energy
- `Executive Logic` - consulting-style argument, dense logic, sober charts, decision clarity
- `Launch Proposal` - product imagery, structured value argument, polished commercial close

### Scenario Kits

The repository currently includes **7** structure-first scenario kits:

| Kit ID | External Name | Best For |
|---|---|---|
| `academic_defense` | Academic Defense Kit | Thesis defense, research progress, grant application |
| `ai_ops` | AI Operations Kit | AI operations architecture, digital transformation, smart infrastructure |
| `government_blue` | Government Blue Kit | Policy interpretation, investment promotion, public-sector work summary |
| `government_red` | Government Red Kit | Government briefings, project introduction, formal public-sector reporting |
| `medical_university` | Medical Academic Kit | Medical research, hospital reports, case discussion, medical education |
| `pixel_retro` | Pixel Tech Kit | Programming tutorials, tech talks, game/geek showcases |
| `psychology_attachment` | Psychology Course Kit | Psychotherapy training, counseling cases, attachment theory lectures |

### Brand Deck Kits

The repository currently includes **8** complete brand deck kits:

| Kit | Best For |
|---|---|
| 中国电信 | Telecom, digital transformation, internal reporting |
| 中国电建_常规 | Engineering project reports, technical proposals, annual summaries |
| 中国电建_现代 | Major engineering reports, international promotion, high-end negotiations |
| 中汽研_商务 | Product certification, technology promotion, high-end business reporting |
| 中汽研_常规 | Evaluation presentations, business visits, certification display |
| 中汽研_现代 | Strategic releases, forward-looking technology showcases |
| 招商银行 | Transaction banking, sales collection plans, client case training |
| 重庆大学 | Academic defense, research reports, teaching presentations |

## Workflow

```text
Brief / Source Document
        ↓
Content Extraction
        ↓
Deck Strategy + Style Direction
        ↓
SVG Page Authoring
        ↓
Image / Icon / Chart Asset Processing
        ↓
SVG Finalization
        ↓
Editable PPTX Export
        ↓
Preview + QA
```

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

On Windows, use `python` if `python3` is not available.

### 2. Create a project

```bash
python scripts/project_manager.py init spring-tea-launch --format ppt169
```

### 3. Import source material

For source files:

```bash
python scripts/project_manager.py import-sources outputs/spring-tea-launch <your-source-file> --move
```

For a topic-only deck, write the brief into the project and continue with the strategy/SVG workflow described in [`SKILL.md`](SKILL.md).

### 4. Finalize SVG pages

```bash
python scripts/finalize_svg.py outputs/spring-tea-launch
```

### 5. Export editable PPTX

```bash
python scripts/svg_to_pptx.py outputs/spring-tea-launch
```

The exported deck will be written to:

```text
outputs/<project-name>/exports/
```

## Source Conversion

| Source | Script |
|---|---|
| PDF | `scripts/source_to_md/pdf_to_md.py` |
| DOCX / Word / HTML / EPUB | `scripts/source_to_md/doc_to_md.py` |
| XLSX / XLSM | `scripts/source_to_md/excel_to_md.py` |
| PPTX | `scripts/source_to_md/ppt_to_md.py` |
| Web page | `scripts/source_to_md/web_to_md.py` |

## Repository Structure

```text
.
├── SKILL.md                         # Codex skill entry and full workflow protocol
├── scripts/                         # Source conversion, SVG finalization, PPTX export, QA helpers
├── templates/
│   ├── brands/                      # Brand presets
│   ├── charts/                      # Chart and infographic SVG templates
│   ├── icons/                       # Icon libraries
│   └── layouts/                     # Deck layout templates
├── references/                      # Strategy, execution, image, and visual review references
├── workflows/                       # Optional workflows: topic research, live preview, chart verification
└── examples/
    └── spring-tea-launch-editorial/ # Public showcase deck
```

## Route Prompts

The studio can also follow a user-defined route prompt. These names are intentionally Ai-LaoHuang-facing product language rather than upstream template names:

- `Magazine Grid` - architecture photography, calm typographic rhythm
- `Modular Redline` - strict modular grid, restrained type, red accent
- `Pop Geometry` - bold primaries, geometric patterns, playful energy
- `Executive Logic` - dense logic, sober charts, executive clarity
- `Launch Proposal` - product imagery, structured value argument, polished close

## Example Prompts

```text
用 Ai-LaoHuang PPT Studio 做一份春季茶饮新品营销策划案，
12 页，走 Magazine Grid 路线，建筑摄影感，冷静排版，
要有图片，但文字和图形尽量可编辑。
```

```text
把这个 PDF 整理成一份 10 页汇报 PPT，
走 Modular Redline 路线，黑白灰为主，红色强调，输出可编辑 PPTX。
```

```text
做一份 Claude Code 老黄版产品介绍，
走 Pop Geometry 路线，大胆原色，几何图案，活泼节奏。
```

## Quality Standard

A deck is considered successful only when:

- slide count matches the planned outline
- major text remains editable in PowerPoint
- diagrams and layout primitives are not flattened unnecessarily
- image assets are embedded intentionally and not repeated accidentally
- preview images show no obvious overlap, missing glyphs, broken crops, or unreadable text
- exported PPTX can be opened and inspected

## Relationship To PPT Master

Ai-LaoHuang PPT Studio is a branded derivative workflow based on `hugohe3/ppt-master` under the MIT License. This repository keeps upstream license notices in [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).

The public-facing naming is intentionally productized as Ai-LaoHuang language: Visual Routes, Scenario Kits, and Brand Deck Kits. This keeps attribution clear while giving the workflow its own presentation identity.

The Ai-LaoHuang layer focuses on:

- Chinese commercial PPT scenarios
- client-facing deck polish
- Ai-LaoHuang visual route language and page rhythm
- editable PPTX delivery
- showcase-ready examples

## Roadmap

- More public showcase decks across business styles
- Lightweight install package without the full reference image set
- More reusable Chinese commercial page templates
- Built-in preview gallery for generated decks
- Stronger PPTX QA reports and visual diff checks

## License

MIT. See [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).
