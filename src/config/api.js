const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://apexspacemw.com/rt/the_menu_backend'

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '')

export function apiUrl(path) {
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`
}
