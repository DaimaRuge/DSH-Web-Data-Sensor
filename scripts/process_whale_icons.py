from PIL import Image, ImageDraw
from pathlib import Path
import shutil

# Use local icon source
src_path = Path("icons/icon128.png")

img = Image.open(src_path).convert("RGBA")
w, h = img.size

# 创建一个高质量平滑的圆形遮罩，使图标在 Chrome 任何深浅色背景下都完美呈现
mask = Image.new("L", (w, h), 0)
draw = ImageDraw.Draw(mask)
# 留出 10px 边距，画一个正圆
draw.ellipse((16, 16, w - 16, h - 16), fill=255)

# 应用遮罩
circular_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
circular_img.paste(img, (0, 0), mask=mask)

icons_dir = Path("icons")
icons_dir.mkdir(exist_ok=True)
dist_icons_dir = Path("dist/icons")
dist_icons_dir.mkdir(exist_ok=True, parents=True)

for size in [16, 48, 128]:
    resized = circular_img.resize((size, size), Image.Resampling.LANCZOS)
    target_path = icons_dir / f"icon{size}.png"
    dist_target_path = dist_icons_dir / f"icon{size}.png"
    resized.save(target_path, "PNG")
    resized.save(dist_target_path, "PNG")
    print(f"Generated {target_path} ({size}x{size})")

print("All whale icons generated successfully!")
