#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function loadPackage(name, installHint) {
  try {
    return require(name);
  } catch (err) {
    console.error(`Missing Node package: ${name}`);
    console.error(installHint);
    process.exit(2);
  }
}

const pptxgen = loadPackage(
  "pptxgenjs",
  "Run with NODE_PATH pointing at the Codex bundled node_modules, or install pptxgenjs."
);

let sharp = null;
try {
  sharp = require("sharp");
} catch {
  sharp = null;
}

const SKILL_DIR = path.resolve(__dirname, "..");
const W = 13.333333;
const H = 7.5;

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--spec") out.spec = argv[++i];
    else if (arg === "--out") out.out = argv[++i];
    else if (arg === "--theme") out.theme = argv[++i];
    else if (arg === "--help" || arg === "-h") out.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

function usage() {
  console.log(`Usage:
  node scripts/build_editable_deck.js --spec /abs/deck.json --out /abs/deck.pptx

Optional:
  --theme /abs/theme.json   Override theme path. Defaults to assets/themes/grove.json.

The deck JSON must contain { title, slides: [...] }.
`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function resolveMaybe(file, baseDir) {
  if (!file) return file;
  return path.isAbsolute(file) ? file : path.resolve(baseDir, file);
}

async function cropImageIfNeeded(imagePath, outDir, index, crop) {
  if (!imagePath || !crop || !sharp) return imagePath;
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `image-${index}.jpg`);
  await sharp(imagePath)
    .resize(crop.w || 1200, crop.h || 1200, {
      fit: "cover",
      position: crop.position || "center"
    })
    .jpeg({ quality: crop.quality || 88 })
    .toFile(out);
  return out;
}

function makeDeck(spec, theme) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = spec.author || "Codex";
  pptx.company = spec.company || "";
  pptx.subject = spec.subject || spec.title || "Editable PPTX deck";
  pptx.title = spec.title || "Editable PPTX deck";
  pptx.lang = spec.lang || "zh-CN";
  pptx.theme = {
    headFontFace: theme.fonts.serif,
    bodyFontFace: theme.fonts.sans,
    lang: spec.lang || "zh-CN"
  };
  return pptx;
}

function helpers(pptx, theme) {
  const S = pptx.ShapeType;
  const C = theme.colors;
  const F = theme.fonts;

  function addBg(slide, mode) {
    const light = mode === "light";
    slide.background = { color: light ? C.paper : C.bg };
  }

  function addText(slide, value, x, y, w, h, opts = {}) {
    slide.addText(value || "", {
      x, y, w, h,
      margin: opts.margin ?? 0,
      fit: opts.fit || "shrink",
      fontFace: opts.fontFace || F.sans,
      fontSize: opts.fontSize || 14,
      bold: !!opts.bold,
      italic: !!opts.italic,
      color: opts.color || C.dark,
      valign: opts.valign || "top",
      align: opts.align || "left",
      breakLine: false,
      lineSpacingMultiple: opts.lineSpacingMultiple || 1.1,
      paraSpaceAfterPt: opts.paraSpaceAfterPt || 0,
      rotate: opts.rotate || 0,
      isTextBox: true
    });
  }

  function line(slide, x, y, w, h, color, width = 0.45) {
    slide.addShape(S.line, { x, y, w, h, line: { color, width } });
  }

  function rect(slide, x, y, w, h, opts = {}) {
    slide.addShape(S.rect, {
      x, y, w, h,
      fill: opts.fill ? { color: opts.fill, transparency: opts.transparency ?? 0 } : { color: C.paper, transparency: 100 },
      line: opts.line === false ? { color: opts.fill || C.paper, transparency: 100 } : {
        color: opts.lineColor || C.borderLight,
        width: opts.width || 0.45,
        transparency: opts.lineTransparency || 0
      }
    });
  }

  function ellipse(slide, x, y, w, h, opts = {}) {
    slide.addShape(S.ellipse, {
      x, y, w, h,
      fill: opts.fill ? { color: opts.fill, transparency: opts.transparency ?? 0 } : { color: C.paper, transparency: 100 },
      line: {
        color: opts.lineColor || C.border,
        width: opts.width || 0.4,
        transparency: opts.lineTransparency || 0
      }
    });
  }

  function chrome(slide, n, label, mode) {
    const light = mode === "light";
    const color = light ? C.green2 : C.cream2;
    const border = light ? C.borderLight : C.border;
    addText(slide, label || "", 0.74, 0.43, 4.8, 0.18, { fontFace: F.mono, fontSize: 6.4, color });
    addText(slide, `${String(n).padStart(2, "0")} / ${String(slide._total || 12).padStart(2, "0")}`, 11.75, 0.43, 0.9, 0.18, { fontFace: F.mono, fontSize: 6.4, color, align: "right" });
    line(slide, 0.74, 0.7, 11.9, 0, border, 0.35);
    line(slide, 0.74, 6.72, 11.9, 0, border, 0.35);
  }

  function foot(slide, left, right, mode) {
    const light = mode === "light";
    const color = light ? C.green2 : C.cream2;
    addText(slide, left || "", 0.74, 6.88, 4.4, 0.18, { fontFace: F.mono, fontSize: 6.2, color });
    addText(slide, right || "", 8.2, 6.88, 4.4, 0.18, { fontFace: F.mono, fontSize: 6.2, color, align: "right" });
  }

  function kicker(slide, value, x, y) {
    addText(slide, value || "", x, y, 3.2, 0.22, { fontFace: F.mono, fontSize: 7, color: C.accent });
  }

  function title(slide, value, x, y, w, h, mode, size = 34) {
    addText(slide, value || "", x, y, w, h, {
      fontFace: F.serif,
      fontSize: size,
      color: mode === "light" ? C.dark : C.cream,
      lineSpacingMultiple: 0.86
    });
  }

  function body(slide, value, x, y, w, h, mode, size = 13.5) {
    addText(slide, value || "", x, y, w, h, {
      fontFace: F.sans,
      fontSize: size,
      color: mode === "light" ? C.green2 : C.cream2,
      lineSpacingMultiple: 1.18,
      margin: 0.02
    });
  }

  function bullet(slide, item, x, y, w, mode) {
    addText(slide, item.num || item.label || "•", x, y + 0.03, 0.35, 0.2, { fontFace: F.mono, fontSize: 8, color: C.accent });
    body(slide, item.text || "", x + 0.46, y, w - 0.46, 0.55, mode, 13);
    line(slide, x, y + 0.62, w, 0, mode === "light" ? C.borderLight : C.border, 0.35);
  }

  function watermark(slide, value, mode) {
    if (!value) return;
    addText(slide, value, 10.0, 5.42, 2.7, 1.25, {
      fontFace: F.serif,
      fontSize: 110,
      color: mode === "light" ? "D8D2C2" : "253D27",
      align: "right"
    });
  }

  return { C, F, S, addBg, addText, line, rect, ellipse, chrome, foot, kicker, title, body, bullet, watermark };
}

function addImage(slide, img, x, y, w, h) {
  if (img && fs.existsSync(img)) slide.addImage({ path: img, x, y, w, h });
}

function renderSlide(pptx, spec, item, index, images) {
  const h = helpers(pptx, spec.themeObj);
  const mode = item.themeMode || (item.type === "cover" || item.type === "closing" ? "dark" : "light");
  const slide = pptx.addSlide();
  slide._total = spec.slides.length;
  h.addBg(slide, mode);
  const n = index + 1;

  if (item.type !== "cover" && item.type !== "closing") h.chrome(slide, n, item.label || "", mode);

  switch (item.type) {
    case "cover": {
      h.kicker(slide, item.kicker || "", 0.78, 0.48);
      h.title(slide, item.title || spec.title, 0.78, 1.15, 4.85, 1.9, "dark", 45);
      h.addText(slide, item.accentTitle || "", 0.78, 3.58, 3.1, 0.78, { fontFace: h.F.serif, fontSize: 45, color: h.C.accent, lineSpacingMultiple: 0.86 });
      h.body(slide, item.body || "", 0.78, 4.75, 4.9, 0.8, "dark", 13.5);
      h.line(slide, 0.78, 5.88, 5.0, 0, h.C.border, 0.35);
      h.rect(slide, 8.0, 0.68, 3.0, 3.0, { lineColor: h.C.border, fill: h.C.bg2 });
      addImage(slide, images[n - 1], 8.0, 0.68, 3.0, 3.0);
      h.ellipse(slide, 8.42, 0.92, 1.2, 1.2, { lineColor: h.C.cream2, lineTransparency: 72 });
      h.ellipse(slide, 8.68, 1.18, 0.68, 0.68, { lineColor: h.C.cream2, lineTransparency: 80 });
      h.line(slide, 8.28, 3.5, 0.4, 0, h.C.accent, 1);
      h.addText(slide, item.meta || "BRAND PROPOSAL\\nNEW MENU · CAMPAIGN · RETAIL MOMENT", 7.7, 5.55, 3.5, 0.45, { fontFace: h.F.mono, fontSize: 6.2, color: h.C.cream2, lineSpacingMultiple: 1.1 });
      h.foot(slide, item.footLeft || "", `01 / ${String(spec.slides.length).padStart(2, "0")}`, "dark");
      if (item.imageCredit) h.addText(slide, item.imageCredit, 8.0, 3.82, 2.5, 0.16, { fontFace: h.F.mono, fontSize: 5.2, color: h.C.cream2 });
      break;
    }
    case "statement": {
      h.title(slide, item.title || "", 1.0, 1.95, 7.2, 1.95, mode, item.titleSize || 31);
      h.line(slide, 8.6, 2.1, 0, 1.9, mode === "light" ? h.C.borderLight : h.C.border, 0.4);
      h.body(slide, item.body || "", 9.0, 2.1, 2.85, 1.55, mode, 14.2);
      h.foot(slide, item.footLeft || "", item.footRight || "", mode);
      break;
    }
    case "splitBullets": {
      h.kicker(slide, item.kicker || "", 0.98, 1.55);
      h.line(slide, 0.98, 1.96, 0.36, 0, h.C.accent, 0.7);
      h.title(slide, item.title || "", 0.98, 2.28, 4.9, 1.55, mode, 34);
      (item.bullets || []).slice(0, 4).forEach((b, i) => h.bullet(slide, b, 6.35, 1.68 + i * 0.95, 5.2, mode));
      h.foot(slide, item.footLeft || "", item.footRight || "", mode);
      h.watermark(slide, item.watermark, mode);
      break;
    }
    case "stats": {
      (item.stats || []).slice(0, 3).forEach((stat, i) => {
        const x = 0.88 + i * 4.0;
        h.addText(slide, stat.value || "", x, 2.35, 1.2, 0.65, { fontFace: h.F.serif, fontSize: 44, color: h.C.accent });
        h.addText(slide, stat.label || "", x, 3.28, 2.4, 0.18, { fontFace: h.F.mono, fontSize: 7, color: mode === "light" ? h.C.green2 : h.C.cream2 });
        h.body(slide, stat.body || "", x, 3.78, 2.8, 0.8, mode, 13.4);
        h.line(slide, x, 5.02, 2.9, 0, mode === "light" ? h.C.borderLight : h.C.border, 0.4);
      });
      h.foot(slide, item.footLeft || "", item.footRight || "", mode);
      break;
    }
    case "positioning": {
      h.kicker(slide, item.kicker || "", 1.0, 1.65);
      h.title(slide, item.title || "", 1.0, 2.05, 4.6, 2.1, mode, 37);
      h.line(slide, 6.65, 1.9, 0, 2.0, mode === "light" ? h.C.borderLight : h.C.border, 0.4);
      h.body(slide, item.body || "", 7.12, 1.95, 3.8, 1.45, mode, 15);
      if (images[n - 1]) {
        h.rect(slide, 7.12, 4.15, 2.2, 1.25, { lineColor: h.C.border, fill: h.C.bg2 });
        addImage(slide, images[n - 1], 7.12, 4.15, 2.2, 1.25);
      }
      h.foot(slide, item.footLeft || "", item.footRight || "", mode);
      h.watermark(slide, item.watermark, mode);
      break;
    }
    case "productMatrix": {
      if (images[n - 1]) {
        h.rect(slide, 0.95, 0.92, 3.15, 4.85, { lineColor: h.C.borderLight, fill: h.C.paper2 });
        addImage(slide, images[n - 1], 0.95, 0.92, 3.15, 4.85);
        h.addText(slide, item.imageCaption || "SPRING INGREDIENTS", 1.1, 5.53, 1.7, 0.16, { fontFace: h.F.mono, fontSize: 5.8, color: h.C.green2 });
      }
      (item.products || []).slice(0, 4).forEach((p, i) => {
        const x = 4.65 + i * 2.0;
        h.line(slide, x - 0.18, 0.92, 0, 4.85, h.C.borderLight, 0.35);
        h.addText(slide, p.num || String(i + 1).padStart(2, "0"), x, 1.2, 0.8, 0.42, { fontFace: h.F.serif, fontSize: 27, color: h.C.accent });
        h.addText(slide, p.name || "", x, 4.55, 1.3, 0.34, { fontFace: h.F.serif, fontSize: 17, color: h.C.dark });
        h.body(slide, p.body || "", x, 5.05, 1.35, 0.52, "light", 9.6);
      });
      h.foot(slide, item.footLeft || "", item.footRight || "", mode);
      break;
    }
    case "timeline": {
      h.kicker(slide, item.kicker || "", 0.95, 1.18);
      h.title(slide, item.title || "", 0.95, 1.55, 6.3, 0.65, mode, 31);
      h.line(slide, 0.95, 3.08, 11.1, 0, h.C.border, 0.4);
      (item.moments || []).slice(0, 4).forEach((m, i) => {
        const x = 0.95 + i * 2.75;
        if (i > 0) h.line(slide, x - 0.28, 3.08, 0, 2.35, h.C.border, 0.35);
        h.addText(slide, m.label || "", x, 3.35, 1.0, 0.18, { fontFace: h.F.mono, fontSize: 7, color: h.C.accent });
        h.addText(slide, m.title || "", x, 4.02, 1.0, 0.35, { fontFace: h.F.serif, fontSize: 21, color: h.C.cream });
        h.body(slide, m.body || "", x, 4.55, 2.15, 0.8, mode, 11.4);
      });
      h.foot(slide, item.footLeft || "", item.footRight || "", mode);
      break;
    }
    case "channelRows":
    case "budget": {
      h.kicker(slide, item.kicker || "", 0.95, 1.45);
      h.title(slide, item.title || "", 0.95, 1.85, 4.8, 1.1, mode, 32);
      if (item.body) h.body(slide, item.body, 0.95, 3.28, 4.0, 1.1, mode, 13.5);
      h.line(slide, 6.05, 1.4, 5.55, 0, mode === "light" ? h.C.borderLight : h.C.border, 0.35);
      (item.rows || []).slice(0, 5).forEach((row, i) => {
        const y = 1.6 + i * 0.9;
        h.addText(slide, row.left || "", 6.05, y, 1.1, 0.3, { fontFace: row.big ? h.F.serif : h.F.serif, fontSize: row.big ? 25 : 18, color: row.big ? h.C.accent : (mode === "light" ? h.C.dark : h.C.cream) });
        h.body(slide, row.mid || "", 7.35, y + 0.04, 2.95, 0.42, mode, 10.8);
        h.addText(slide, row.right || "", 10.6, y + 0.08, 0.85, 0.16, { fontFace: h.F.mono, fontSize: 6.6, color: mode === "light" ? h.C.green2 : h.C.accent });
        h.line(slide, 6.05, y + 0.62, 5.55, 0, mode === "light" ? h.C.borderLight : h.C.border, 0.35);
      });
      h.foot(slide, item.footLeft || "", item.footRight || "", mode);
      h.watermark(slide, item.watermark, mode);
      break;
    }
    case "closing": {
      h.kicker(slide, item.kicker || "FINAL NOTE", 0.92, 0.88);
      h.title(slide, item.title || "", 0.92, 1.55, 7.8, 1.8, "dark", 39);
      h.body(slide, item.body || "", 0.92, 3.7, 5.8, 0.62, "dark", 13.8);
      h.line(slide, 0.92, 4.58, 10.6, 0, h.C.border, 0.35);
      h.watermark(slide, item.watermark || "春", "dark");
      h.foot(slide, item.footLeft || "", `${String(n).padStart(2, "0")} / ${String(spec.slides.length).padStart(2, "0")}`, "dark");
      break;
    }
    default:
      throw new Error(`Unsupported slide type: ${item.type}`);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.spec || !args.out) {
    usage();
    process.exit(args.help ? 0 : 1);
  }

  const specPath = path.resolve(args.spec);
  const specDir = path.dirname(specPath);
  const rawSpec = readJson(specPath);
  const themePath = args.theme
    ? path.resolve(args.theme)
    : path.join(SKILL_DIR, "assets/themes/grove.json");
  const theme = readJson(themePath);

  const spec = { ...rawSpec, themeObj: theme };
  if (!Array.isArray(spec.slides) || spec.slides.length === 0) {
    throw new Error("Spec must contain a non-empty slides array.");
  }

  const outPath = path.resolve(args.out);
  const workImages = path.join(path.dirname(outPath), ".editable-pptx-assets");
  const pptx = makeDeck(spec, theme);
  const preparedImages = [];
  for (let i = 0; i < spec.slides.length; i += 1) {
    const slide = spec.slides[i];
    const img = resolveMaybe(slide.image, specDir);
    preparedImages[i] = img ? await cropImageIfNeeded(img, workImages, i + 1, slide.imageCrop) : null;
  }

  spec.slides.forEach((slide, index) => renderSlide(pptx, spec, slide, index, preparedImages));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await pptx.writeFile({ fileName: outPath });
  console.log(outPath);
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
