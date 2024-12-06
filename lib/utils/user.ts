export function generateTempPassword() {
  return Math.random().toString(36).slice(-8)
}

export function generateFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim()
}
