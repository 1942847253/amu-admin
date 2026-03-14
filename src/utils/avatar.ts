const hashText = (value: string) => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

const createHue = (seed: string) => {
  return hashText(seed) % 360
}

export const createAvatarDataUri = (seed: string, label: string) => {
  const hue = createHue(seed)
  const accent = (hue + 42) % 360
  const safeLabel = label.slice(0, 2).toUpperCase()
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${safeLabel}">
      <defs>
        <linearGradient id="avatar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${hue} 76% 52%)" />
          <stop offset="100%" stop-color="hsl(${accent} 76% 38%)" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="28" fill="url(#avatar-gradient)" />
      <circle cx="72" cy="22" r="10" fill="rgba(255,255,255,0.22)" />
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="34" font-family="Segoe UI, Arial, sans-serif" font-weight="700">${safeLabel}</text>
    </svg>
  `.trim()

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
