const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.152/the_menu'

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '')

export function apiUrl(path) {
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`
}
