export function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace(/^#/, '')
  if (hex.length === 3) {
    hex = hex.split('').map((x) => x + x).join('')
  }
  const num = parseInt(hex, 16)
  return [num >> 16, (num >> 8) & 255, num & 255]
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = Math.round(x).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

export function mixColor(color1: string, color2: string, weight: number): string {
  const p = weight
  const w = p * 2 - 1
  const w1 = (w / 1 + 1) / 2
  const w2 = 1 - w1
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  const result = [
    Math.round(rgb1[0] * w1 + rgb2[0] * w2),
    Math.round(rgb1[1] * w1 + rgb2[1] * w2),
    Math.round(rgb1[2] * w1 + rgb2[2] * w2)
  ]
  return rgbToHex(result[0], result[1], result[2])
}

export function lighten(color: string, percent: number): string {
  return mixColor('#ffffff', color, percent)
}

export function darken(color: string, percent: number): string {
  return mixColor('#000000', color, percent)
}
