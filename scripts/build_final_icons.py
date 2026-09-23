import subprocess
import shutil
from pathlib import Path
from PIL import Image

# 1. Load official DeepSeek whale SVG
with open('scripts/deepseek_official.svg', 'r', encoding='utf-8') as f:
    text = f.read()

import xml.etree.ElementTree as ET
tree = ET.fromstring(text)
whale_d = tree.findall('.//{http://www.w3.org/2000/svg}path')[0].attrib['d']
subpaths = ['M' + s for s in whale_d.split('M')[1:]]

# 2. Design SVG for 128x128 and 48x48 (with gorgeous DeepSeek gradient, pure transparent background, crisp white belly & eye, and subtle soft shadow for depth)
svg_large = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512">
  <defs>
    <linearGradient id="whaleBodyGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1E40AF"/>
      <stop offset="35%" stop-color="#2563EB"/>
      <stop offset="70%" stop-color="#4D6BFD"/>
      <stop offset="100%" stop-color="#00D2FF"/>
    </linearGradient>
    <linearGradient id="whaleBellyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#EBF8FF"/>
    </linearGradient>
    <filter id="whaleDropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2.5" stdDeviation="2.2" flood-color="#1E3A8A" flood-opacity="0.28"/>
    </filter>
  </defs>
  <g transform="translate(4, 11)" filter="url(#whaleDropShadow)">
    <!-- Whale Body -->
    <path fill="url(#whaleBodyGrad)" d="{whale_d}"/>
    <!-- Crisp White Underbelly -->
    <path fill="url(#whaleBellyGrad)" d="{subpaths[1]}"/>
    <!-- Eye Details -->
    <path fill="#FFFFFF" d="{subpaths[3]}"/>
    <path fill="#FFFFFF" d="{subpaths[2]}"/>
  </g>
</svg>'''

# 3. Design SVG for 16x16 (pixel-crisp, high-contrast, no shadow blur so it remains razor-sharp in small toolbar slots)
svg_small = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="256" height="256">
  <defs>
    <linearGradient id="whaleBodyGradSmall" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1D4ED8"/>
      <stop offset="50%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#00D2FF"/>
    </linearGradient>
  </defs>
  <g transform="translate(3, 10) scale(1.04)">
    <path fill="url(#whaleBodyGradSmall)" d="{whale_d}"/>
    <path fill="#FFFFFF" d="{subpaths[1]}"/>
    <path fill="#FFFFFF" d="{subpaths[3]}"/>
    <path fill="#FFFFFF" d="{subpaths[2]}"/>
  </g>
</svg>'''

temp_dir = Path('scripts/temp_icons')
temp_dir.mkdir(exist_ok=True, parents=True)

large_svg_file = temp_dir / 'whale_large.svg'
small_svg_file = temp_dir / 'whale_small.svg'

large_svg_file.write_text(svg_large, encoding='utf-8')
small_svg_file.write_text(svg_small, encoding='utf-8')

# Render with Chrome Headless
chrome_exe = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

large_png = temp_dir / 'whale_large.png'
small_png = temp_dir / 'whale_small.png'

subprocess.run([
    chrome_exe,
    '--headless=new',
    '--default-background-color=00000000',
    f'--screenshot={large_png.resolve()}',
    '--window-size=512,512',
    str(large_svg_file.resolve())
], capture_output=True, check=True)

subprocess.run([
    chrome_exe,
    '--headless=new',
    '--default-background-color=00000000',
    f'--screenshot={small_png.resolve()}',
    '--window-size=256,256',
    str(small_svg_file.resolve())
], capture_output=True, check=True)

print("Rendered base high-res PNGs successfully!")

# Resample to target icon sizes
img_large = Image.open(large_png)
img_small = Image.open(small_png)

icon128 = img_large.resize((128, 128), Image.Resampling.LANCZOS)
icon48 = img_large.resize((48, 48), Image.Resampling.LANCZOS)
icon16 = img_small.resize((16, 16), Image.Resampling.LANCZOS)

icons_dir = Path("icons")
dist_icons_dir = Path("dist/icons")
icons_dir.mkdir(exist_ok=True, parents=True)
dist_icons_dir.mkdir(exist_ok=True, parents=True)

for size, icon_img in [(128, icon128), (48, icon48), (16, icon16)]:
    p1 = icons_dir / f"icon{size}.png"
    p2 = dist_icons_dir / f"icon{size}.png"
    icon_img.save(p1, "PNG")
    icon_img.save(p2, "PNG")
    print(f"Generated {p1} and {p2} ({size}x{size})")

print("All Chrome extension icons built successfully with official DeepSeek whale!")
