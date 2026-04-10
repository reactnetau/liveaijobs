export function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL
  if (raw) {
    // Ensure the URL has a protocol prefix
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    return `https://${raw}`
  }
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  return 'http://localhost:3000'
}
