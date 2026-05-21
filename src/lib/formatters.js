export function usernameFor(users, id) {
  if (!id) return ''
  return users.find((user) => String(user.id) === String(id))?.username || `#${id}`
}

export function projectNameFor(projects, id) {
  return projects.find((project) => String(project.id) === String(id))?.name || `Project #${id}`
}

export function initialsFor(value) {
  return String(value || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function formatDate(value) {
  if (!value) return 'None'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function toInstant(value) {
  if (!value) return null
  return new Date(value).toISOString()
}

export function toDateTimeLocal(value) {
  if (!value) return ''
  const date = new Date(value)
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function compact(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== null && entry !== undefined && entry !== ''))
}

export function downloadText(text, filename, type) {
  const blob = new Blob([text], { type })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.click()
  URL.revokeObjectURL(href)
}

export function csvValue(value) {
  const text = String(value ?? '')
  if (!/[",\n]/.test(text)) return text
  return `"${text.replaceAll('"', '""')}"`
}
