import urllib.request
from pathlib import Path

# Figma MCP download_assets / get_design_context — SVG exports (transparent vectors)
ASSETS = {
    "logo.svg": "https://www.figma.com/api/mcp/asset/44479e2c-be4a-4345-bce7-21adab061ff3",
    "hero-character.svg": "https://www.figma.com/api/mcp/asset/24c9ca78-b1b9-4b1b-8226-cd2cea5ff753",
    "loading-character.svg": "https://www.figma.com/api/mcp/asset/34aeb2b4-7766-427d-a25c-3ef4414d07f1",
    "result-character.svg": "https://www.figma.com/api/mcp/asset/4470c4e7-f23c-4354-927b-aab13a4f4ad2",
    "laymong-character.svg": "https://www.figma.com/api/mcp/asset/e85961e4-8a74-4278-985a-ff15d30fcb60",
    "hub-layz-illust.svg": "https://www.figma.com/api/mcp/asset/ca67c649-5ada-4529-8881-96b4ff5aac21",
    "hub-laymong-illust.svg": "https://www.figma.com/api/mcp/asset/56aa14eb-ea6f-49bd-b7fd-56ee285beae5",
}

out = Path(__file__).resolve().parent.parent / "assets"
out.mkdir(exist_ok=True)

for name, url in ASSETS.items():
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
    (out / name).write_bytes(data)
    print(f"{name}: {len(data)} bytes")

# Figma exports often include gray artboard placeholder rects
import subprocess
import sys

subprocess.run([sys.executable, str(Path(__file__).parent / "clean-svg-bg.py")], check=True)

# remove stale PNG duplicates
for stale in [
    "hero-character.png",
    "loading-character.png",
    "result-character.png",
    "laymong-character.png",
    "hub-layz-illust.png",
    "hub-laymong-illust.png",
    "logo.png",
]:
    p = out / stale
    if p.exists():
        p.unlink()
        print(f"removed stale {stale}")
