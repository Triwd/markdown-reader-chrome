#!/bin/bash

# 生成不同尺寸的 PNG 图标
# 需要先安装 ImageMagick: brew install imagemagick

ICON_DIR="$(dirname "$0")"
SVG_FILE="$ICON_DIR/icon.svg"

# 检查 ImageMagick 是否安装
if ! command -v convert &> /dev/null; then
    echo "错误：未找到 ImageMagick。请先安装："
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu: sudo apt-get install imagemagick"
    exit 1
fi

# 生成不同尺寸的图标
echo "正在生成图标..."

convert -background none -density 300 "$SVG_FILE" -resize 16x16 "$ICON_DIR/icon16.png"
convert -background none -density 300 "$SVG_FILE" -resize 48x48 "$ICON_DIR/icon48.png"
convert -background none -density 300 "$SVG_FILE" -resize 128x128 "$ICON_DIR/icon128.png"

echo "图标生成完成！"
echo "  - icon16.png"
echo "  - icon48.png"
echo "  - icon128.png"