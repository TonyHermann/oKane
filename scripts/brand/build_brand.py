#!/usr/bin/env python3
import argparse
import base64
import io
import json
import os
import re
import shutil
import sys
from pathlib import Path

import cairosvg
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageOps
from psd_tools import PSDImage

ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = ROOT / "scripts/brand/brand.config.json"

STAR_PATH = (
    "M16.00 3.00 L19.17 11.63 L28.36 11.98 L21.14 17.67 L23.64 26.52 "
    "L16.00 21.40 L8.36 26.52 L10.86 17.67 L3.64 11.98 L12.83 11.63 Z"
)
STAR_INK = (2.9375, 2.25, 29.0625, 27.25)

STAR_DEFS = """<defs>
    <linearGradient id="okane-metal" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.38" stop-color="#ededed"/>
      <stop offset="0.5" stop-color="#c9c9c9"/>
      <stop offset="0.52" stop-color="#adadad"/>
      <stop offset="1" stop-color="#909090"/>
    </linearGradient>
  </defs>"""


def load_config():
    with CONFIG_PATH.open() as handle:
        return json.load(handle)


def resolve_psd(value):
    if value.startswith("env:"):
        key = value[4:]
        path = os.environ.get(key)
        if not path:
            raise SystemExit(f"missing environment variable {key}")
        return Path(path).expanduser()
    return Path(value).expanduser()


def find_layer(psd, name):
    for layer in psd.descendants():
        if layer.name == name:
            return layer
    available = ", ".join(sorted(layer.name for layer in psd.descendants()))
    raise SystemExit(f"layer '{name}' not found. available: {available}")


def layer_image(layer):
    image = layer.composite()
    if image is None:
        raise SystemExit(f"layer '{layer.name}' cannot be composited")
    return image.convert("RGBA")


def glyph_bounds(glyphset, name):
    pen = BoundsPen(glyphset)
    glyphset[name].draw(pen)
    if pen.bounds is None:
        raise SystemExit(f"glyph '{name}' has no bounds")
    return pen.bounds


def star_group(bbox, color=None):
    x, y, right, bottom = bbox
    width = right - x
    height = bottom - y
    sx = width / (STAR_INK[2] - STAR_INK[0])
    sy = height / (STAR_INK[3] - STAR_INK[1])
    tx = x - STAR_INK[0] * sx
    ty = y - STAR_INK[1] * sy
    transform = f"translate({tx:.4f} {ty:.4f}) scale({sx:.6f} {sy:.6f})"
    if color:
        return (
            f'<g transform="{transform}">'
            f'<path d="{STAR_PATH}" fill="{color}" stroke="none"/></g>'
        )
    return (
        f'<g transform="{transform}">'
        f'<path d="{STAR_PATH}" fill="url(#okane-metal)" stroke="#5c5c5c" stroke-width="1.4" stroke-linejoin="round"/>'
        f'<path d="{STAR_PATH}" fill="none" stroke="#ffffff" stroke-opacity="0.6" stroke-width="0.9" stroke-linejoin="round" transform="translate(16 16) scale(0.86) translate(-16 -16)"/>'
        "</g>"
    )


def japanese_markup(layer, font_path, font_index):
    text = layer.text.strip()
    engine = layer.engine_dict
    style = engine["StyleRun"]["RunArray"][0]["StyleSheet"]["StyleSheetData"]
    font_size = style.get("FontSize", 45.83334)
    writing = engine.get("Rendered", {}).get("Shapes", {}).get("WritingDirection", 0)

    font = TTFont(str(font_path), fontNumber=font_index)
    cmap = font.getBestCmap()
    glyphset = font.getGlyphSet()
    upm = font["head"].unitsPerEm
    scale = font_size / upm
    names = [cmap[ord(char)] for char in text]
    x, y, right, bottom = layer.bbox
    width = right - x
    height = bottom - y

    if writing == 2:
        slot = height / len(names)
        parts = []
        for index, name in enumerate(names):
            x_min, y_min, x_max, y_max = glyph_bounds(glyphset, name)
            tx = x + width / 2 - (x_min + x_max) / 2 * scale
            ty = y + (index + 0.5) * slot + (y_min + y_max) / 2 * scale
            pen = SVGPathPen(glyphset)
            glyphset[name].draw(pen)
            parts.append(
                f'<g transform="translate({tx:.4f} {ty:.4f}) scale({scale:.8f} {-scale:.8f})">'
                f'<path d="{pen.getCommands()}"/></g>'
            )
        return "".join(parts)

    offsets = []
    current = 0
    for name in names:
        offsets.append(current)
        current += font["hmtx"][name][0]

    boxes = [glyph_bounds(glyphset, name) for name in names]
    line_x_min = min(box[0] + offset for box, offset in zip(boxes, offsets))
    line_x_max = max(box[2] + offset for box, offset in zip(boxes, offsets))
    line_y_min = min(box[1] for box in boxes)
    line_y_max = max(box[3] for box in boxes)
    start_x = x + width / 2 - (line_x_min + line_x_max) / 2 * scale
    baseline = y + height / 2 + (line_y_max + line_y_min) / 2 * scale

    parts = []
    for name, offset in zip(names, offsets):
        pen = SVGPathPen(glyphset)
        glyphset[name].draw(pen)
        tx = start_x + offset * scale
        parts.append(
            f'<g transform="translate({tx:.4f} {baseline:.4f}) scale({scale:.8f} {-scale:.8f})">'
            f'<path d="{pen.getCommands()}"/></g>'
        )
    return "".join(parts)


def image_bytes(image):
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("ascii")


def silhouette(image, color):
    alpha = image.getchannel("A")
    result = Image.new("RGBA", image.size, color)
    result.putalpha(alpha)
    return result


def image_markup(encoded, bbox):
    x, y, width, height = bbox
    return (
        f'<image x="{x}" y="{y}" width="{width}" height="{height}" '
        f'preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,{encoded}"/>'
    )


def frame_markup(target, width, height, color):
    frame = target.get("frame")
    if not frame:
        return ""
    inset = frame["inset"]
    return (
        f'<rect x="{inset}" y="{inset}" width="{width - inset * 2}" '
        f'height="{height - inset * 2}" rx="{frame["radius"]}" fill="none" '
        f'stroke="{color}" stroke-width="{frame["stroke"]}"/>'
    )


def svg_document(target, width, height, wordmark, japanese, star_bbox, star_color, japanese_fill, frame_color):
    title = f"oKane — {target['key']} lockup"
    star = star_group(star_bbox, star_color)
    defs = "" if star_color else STAR_DEFS
    frame = frame_markup(target, width, height, frame_color)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {width} {height}" role="img" aria-label="{title}">
  <title>{title}</title>
  {defs}
  {frame}
  <g id="japanese" fill="{japanese_fill}">{japanese}</g>
  {star}
  {image_markup(wordmark, (target['wordmark_bbox'][0], target['wordmark_bbox'][1], target['wordmark_bbox'][2] - target['wordmark_bbox'][0], target['wordmark_bbox'][3] - target['wordmark_bbox'][1]))}
</svg>'''


def exact_composite(psd, names):
    canvas = Image.new("RGBA", psd.size, (0, 0, 0, 0))
    for name in names:
        layer = find_layer(psd, name)
        if not layer.visible:
            continue
        image = layer_image(layer)
        canvas.alpha_composite(image, (layer.bbox[0], layer.bbox[1]))
    return canvas


def build_target(target, config):
    psd = PSDImage.open(resolve_psd(target["psd"]))
    width, height = psd.size
    expected = tuple(target["canvas"])
    if (width, height) != expected:
        print(f"warning: {target['key']} PSD is {width}x{height}, config says {expected[0]}x{expected[1]}")

    wordmark_layer = find_layer(psd, target["layers"]["wordmark"])
    star_layer = find_layer(psd, target["layers"]["star"])
    japanese_layer = find_layer(psd, target["layers"]["japanese"])

    wordmark_image = layer_image(wordmark_layer)
    wordmark_exact = image_bytes(wordmark_image)
    wordmark_white = image_bytes(silhouette(wordmark_image, (255, 255, 255, 255)))
    wordmark_black = image_bytes(silhouette(wordmark_image, (0, 0, 0, 255)))

    font_path = os.environ.get("BRAND_JP_FONT", config["japanese"]["fallbackFont"])
    japanese = japanese_markup(japanese_layer, font_path, config["japanese"]["fontIndex"])
    star_bbox = star_layer.bbox
    target = {**target, "wordmark_bbox": wordmark_layer.bbox}

    output = ROOT / config["outputDir"]
    output.mkdir(parents=True, exist_ok=True)
    base = target["output"]

    variants = {
        "": svg_document(target, width, height, wordmark_exact, japanese, star_bbox, None, "#000000", "#000000"),
        "-inverse": svg_document(target, width, height, wordmark_white, japanese, star_bbox, None, "#f5f5f5", "#f5f5f5"),
        "-monochrome": svg_document(target, width, height, wordmark_black, japanese, star_bbox, "#000000", "#000000", "#000000"),
        "-monochrome-white": svg_document(target, width, height, wordmark_white, japanese, star_bbox, "#ffffff", "#ffffff", "#ffffff"),
    }

    for suffix, content in variants.items():
        (output / f"{base}{suffix}.svg").write_text(content)
        if suffix:
            cairosvg.svg2png(
                bytestring=content.encode(),
                write_to=str(output / f"{base}{suffix}.png"),
                output_width=width,
                output_height=height,
            )
        print(f"built {base}{suffix}.svg")

    exact = exact_composite(psd, target["compositeLayers"])
    exact.save(output / f"{base}.png")
    print(f"built {base}.png")


def build_icons(config):
    output = ROOT / config["outputDir"]
    output.mkdir(parents=True, exist_ok=True)
    raster = config["raster"]

    templates = {
        "full": "logo-mark.svg",
        "black": "logo-mark-monochrome.svg",
        "white": "logo-mark-monochrome-white.svg",
    }
    for key, name in templates.items():
        shutil.copyfile(ROOT / config["markTemplates"][key], output / name)

    for size in raster["markSizes"]:
        cairosvg.svg2png(
            url=str(output / "logo-mark.svg"),
            write_to=str(output / f"logo-mark-{size}.png"),
            output_width=size,
            output_height=size,
        )
        print(f"built logo-mark-{size}.png")

    favicon_base = Image.open(output / "logo-mark-48.png").convert("RGBA")
    favicon_base.save(
        output / "favicon.ico",
        format="ICO",
        sizes=[(size, size) for size in raster["faviconSizes"]],
    )
    print("built favicon.ico")

    touch_size = raster["appleTouchSize"]
    touch = Image.new("RGB", (touch_size, touch_size), raster["background"])
    mark = Image.open(output / "logo-mark-512.png").convert("RGBA")
    mark = ImageOps.contain(mark, (raster["appleTouchMarkSize"], raster["appleTouchMarkSize"]), Image.Resampling.LANCZOS)
    touch.paste(mark, ((touch_size - mark.width) // 2, (touch_size - mark.height) // 2), mark)
    touch.save(output / "apple-touch-icon.png")
    print("built apple-touch-icon.png")

    og_width, og_height = raster["ogSize"]
    og = Image.new("RGB", (og_width, og_height), raster["background"])
    lockup = Image.open(output / "logo-lockup.png").convert("RGBA")
    lockup = ImageOps.contain(lockup, tuple(raster["ogLockupSize"]), Image.Resampling.LANCZOS)
    og.paste(lockup, ((og_width - lockup.width) // 2, (og_height - lockup.height) // 2), lockup)
    og.save(output / "og-image.png")
    print("built og-image.png")


def check(config):
    output = ROOT / config["outputDir"]
    errors = []
    raster = config["raster"]

    for target in config["targets"]:
        base = target["output"]
        expected = [
            f"{base}.svg",
            f"{base}.png",
            f"{base}-inverse.svg",
            f"{base}-inverse.png",
            f"{base}-monochrome.svg",
            f"{base}-monochrome-white.svg",
            f"{base}-monochrome.png",
            f"{base}-monochrome-white.png",
        ]
        for name in expected:
            if not (output / name).exists():
                errors.append(f"missing {name}")
        for name in [f"{base}.svg", f"{base}-inverse.svg", f"{base}-monochrome.svg", f"{base}-monochrome-white.svg"]:
            path = output / name
            if not path.exists():
                continue
            text = path.read_text()
            if "<image" not in text:
                errors.append(f"{name} has no embedded wordmark")
            if "<text" in text or "font-family" in text:
                errors.append(f"{name} contains live text")
            if "viewBox=" not in text:
                errors.append(f"{name} has no viewBox")
        for name in [f"{base}.png", f"{base}-inverse.png", f"{base}-monochrome.png", f"{base}-monochrome-white.png"]:
            path = output / name
            if path.exists():
                with Image.open(path) as image:
                    if image.size != tuple(target["canvas"]):
                        errors.append(f"{name} is {image.size}, expected {tuple(target['canvas'])}")

    for name in ["logo-mark.svg", "logo-mark-monochrome.svg", "logo-mark-monochrome-white.svg"]:
        if not (output / name).exists():
            errors.append(f"missing {name}")
    for size in raster["markSizes"]:
        if not (output / f"logo-mark-{size}.png").exists():
            errors.append(f"missing logo-mark-{size}.png")
    for name in ["favicon.ico", "apple-touch-icon.png", "og-image.png"]:
        if not (output / name).exists():
            errors.append(f"missing {name}")

    preview = ROOT / config["previewFile"]
    if preview.exists():
        html = preview.read_text()
        for ref in re.findall(r'(?:src|href)="([^"]+)"', html):
            if ref.startswith(("http", "#", "mailto:")):
                continue
            if not (preview.parent / ref).exists():
                errors.append(f"preview reference missing: {ref}")
    else:
        errors.append(f"missing preview {config['previewFile']}")

    if errors:
        for error in errors:
            print(f"error: {error}")
        return 1
    print("brand:check OK")
    return 0


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--target", action="append")
    args = parser.parse_args()

    config = load_config()
    if args.check:
        return check(config)

    targets = config["targets"]
    if args.target:
        targets = [target for target in targets if target["key"] in args.target]
    if not targets:
        raise SystemExit("no matching targets")

    for target in targets:
        build_target(target, config)
    build_icons(config)
    return 0


if __name__ == "__main__":
    sys.exit(main())
