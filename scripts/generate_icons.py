import zlib
import struct
from pathlib import Path

def create_png(width, height, r=16, g=185, b=129):
    """生成带有翡翠绿背景色与居中标记的纯净有效 PNG 文件 (纯标准库，无需第三方依赖)"""
    # 构造像素阵列 (RGB)
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            # 边框略暗
            if x == 0 or x == width - 1 or y == 0 or y == height - 1:
                raw_data.extend([max(0, r - 30), max(0, g - 30), max(0, b - 30)])
            # 居中画一个白色方块或几何特征
            elif (width // 3 <= x <= 2 * width // 3) and (height // 3 <= y <= 2 * height // 3):
                raw_data.extend([255, 255, 255])
            else:
                raw_data.extend([r, g, b])

    compressed = zlib.compress(bytes(raw_data), 9)

    png = bytearray(b'\x89PNG\r\n\x1a\n')

    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png.extend(struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc))

    # IDAT chunk
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png.extend(struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc))

    # IEND chunk
    iend_crc = zlib.crc32(b'IEND')
    png.extend(struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc))

    return bytes(png)

icons_dir = Path("icons")
icons_dir.mkdir(exist_ok=True)

for size in [16, 48, 128]:
    data = create_png(size, size)
    with open(icons_dir / f"icon{size}.png", "wb") as f:
        f.write(data)

print("成功生成 icons: icon16.png, icon48.png, icon128.png")
