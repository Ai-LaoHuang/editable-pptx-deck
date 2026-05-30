#!/usr/bin/env python3
import json
import re
import sys
import zipfile
from pathlib import Path


def inspect_pptx(path: Path):
    if not path.exists():
        raise FileNotFoundError(path)
    with zipfile.ZipFile(path) as z:
        bad = z.testzip()
        if bad:
            raise RuntimeError(f"Corrupt PPTX member: {bad}")
        slides = sorted(
            [n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)],
            key=lambda n: int(re.search(r"slide(\d+)\.xml", n).group(1)),
        )
        text_boxes = 0
        pictures = 0
        shapes = 0
        native_tables = 0
        charts = 0
        per_slide = []
        for name in slides:
            xml = z.read(name).decode("utf-8", "ignore")
            item = {
                "slide": name,
                "text_boxes": xml.count("<p:txBody>"),
                "pictures": xml.count("<p:pic>"),
                "shapes": xml.count("<p:sp>"),
                "tables": xml.count("<a:tbl>"),
                "charts": xml.count("<c:chart"),
            }
            text_boxes += item["text_boxes"]
            pictures += item["pictures"]
            shapes += item["shapes"]
            native_tables += item["tables"]
            charts += item["charts"]
            per_slide.append(item)
    return {
        "file": str(path),
        "slides": len(slides),
        "text_boxes": text_boxes,
        "pictures": pictures,
        "shapes": shapes,
        "tables": native_tables,
        "charts": charts,
        "editable_likely": len(slides) > 0 and text_boxes >= len(slides) * 2 and shapes >= len(slides),
        "per_slide": per_slide,
    }


def main():
    if len(sys.argv) != 2:
        print("Usage: qa_pptx.py /absolute/path/deck.pptx", file=sys.stderr)
        return 2
    result = inspect_pptx(Path(sys.argv[1]))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if not result["editable_likely"]:
        print("QA failed: deck does not appear to contain enough native editable objects.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
