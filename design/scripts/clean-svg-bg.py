import re
from pathlib import Path

assets = Path(__file__).resolve().parent.parent / "assets"
skip = {"laymong-bg-pattern.svg", "chevron.svg", "logo.svg"}

for svg in sorted(assets.glob("*.svg")):
    if svg.name in skip:
        continue
    text = svg.read_text(encoding="utf-8")
    orig = text
    text = re.sub(
        r'<rect width="[^"]+" height="[^"]+" fill="#333333"/>\s*',
        "",
        text,
    )
    text = re.sub(
        r'<rect width="1920" height="[^"]+" transform="[^"]+" fill="(?:#[Dd]{6}|#[Ff]2[Ff]2[Ff]2|white)"/>\s*',
        "",
        text,
        flags=re.I,
    )
    if text != orig:
        svg.write_text(text, encoding="utf-8")
        print(f"cleaned: {svg.name}")
    else:
        print(f"unchanged: {svg.name}")
