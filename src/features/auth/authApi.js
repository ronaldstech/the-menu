import { apiUrl } from '../../config/api'

const REGISTER_URL = apiUrl('/api/auth/register.php')
const LOGIN_URL = apiUrl('/api/auth/login.php')
const ME_URL = apiUrl('/api/auth/me.php')
const CREATE_RESTAURANT_URL = apiUrl('/api/restaurants/create.php')
const LIST_RESTAURANTS_URL = apiUrl('/api/restaurants/list.php')
const GET_RESTAURANT_URL = apiUrl('/api/restaurants/get.php')
const UPDATE_RESTAURANT_URL = apiUrl('/api/restaurants/update.php')
const DELETE_RESTAURANT_URL = apiUrl('/api/restaurants/delete.php')
const CREATE_CATEGORY_URL = apiUrl('/api/categories/create.php')
const LIST_CATEGORY_URL = apiUrl('/api/categories/list.php')
const GET_CATEGORY_URL = apiUrl('/api/categories/get.php')
const UPDATE_CATEGORY_URL = apiUrl('/api/categories/update.php')
const DELETE_CATEGORY_URL = apiUrl('/api/categories/delete.php')
const LIST_MENUS_URL = apiUrl('/api/menus/list.php')
const GET_MENU_URL = apiUrl('/api/menus/get.php')
const CREATE_MENU_URL = apiUrl('/api/menus/create.php')
const UPDATE_MENU_URL = apiUrl('/api/menus/update.php')
const DELETE_MENU_URL = apiUrl('/api/menus/delete.php')
const LIST_MENU_ITEMS_URL = apiUrl('/api/menu_items/list.php')
const GET_MENU_ITEM_URL = apiUrl('/api/menu_items/get.php')
const CREATE_MENU_ITEM_URL = apiUrl('/api/menu_items/create.php')
const UPDATE_MENU_ITEM_URL = apiUrl('/api/menu_items/update.php')
const DELETE_MENU_ITEM_URL = apiUrl('/api/menu_items/delete.php')
const LIST_TABLES_URL = apiUrl('/api/tables/list.php')
const GET_TABLE_URL = apiUrl('/api/tables/get.php')
const CREATE_TABLE_URL = apiUrl('/api/tables/create.php')
const UPDATE_TABLE_URL = apiUrl('/api/tables/update.php')
const DELETE_TABLE_URL = apiUrl('/api/tables/delete.php')
const PUBLIC_MENU_URL = import.meta.env.VITE_PUBLIC_MENU_API_URL || apiUrl('/api/public/menu.php')
const LIST_STAFF_URL = apiUrl('/api/staff/list.php')
const GET_STAFF_URL = apiUrl('/api/staff/get.php')
const CREATE_STAFF_URL = apiUrl('/api/staff/create.php')
const UPDATE_STAFF_URL = apiUrl('/api/staff/update.php')
const DELETE_STAFF_URL = apiUrl('/api/staff/delete.php')
const VERIFY_REGISTRATION_URL = apiUrl('/api/auth/verify.php')

async function postAuthRequest(url, payload, action) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  let result = null
  try {
    result = await response.json()
  } catch {
    // Keep the HTTP error useful when the API does not return JSON.
  }

  if (!response.ok) {
    const error = new Error(result?.message || `${action} failed (${response.status}).`)
    error.status = response.status
    error.code = result?.code
    error.data = result
    throw error
  }

  if (result?.success === false) {
    const error = new Error(result.message || `${action} failed.`)
    error.status = response.status
    error.code = result?.code
    error.data = result
    throw error
  }

  return result
}

export function registerUser(user) {
  return postAuthRequest(REGISTER_URL, user, 'Registration')
}

export function loginUser(credentials) {
  return postAuthRequest(LOGIN_URL, credentials, 'Login')
}

export function verifyRegistrationCode(email, code) {
  return postAuthRequest(VERIFY_REGISTRATION_URL, { email, code }, 'Account verification')
}

export async function getCurrentUser(token) {
  const response = await fetch(ME_URL, {
    headers: { Authorization: `Bearer ${token}` },
  })

  let result = null
  try {
    result = await response.json()
  } catch {
    // Keep the HTTP error useful when the API does not return JSON.
  }

  if (!response.ok || result?.success === false || !result?.user) {
    throw new Error(result?.message || `Could not load the current user (${response.status}).`)
  }

  return result.user
}

export function createRestaurant(restaurant, token) {
  return postAuthRequestWithToken(CREATE_RESTAURANT_URL, restaurant, token, 'Restaurant submission')
}

export function listRestaurants(token) {
  return getAuthRequest(LIST_RESTAURANTS_URL, token, 'Loading restaurants')
}

export function getRestaurant(id, token) {
  return getAuthRequest(`${GET_RESTAURANT_URL}?id=${encodeURIComponent(id)}`, token, 'Loading restaurant')
}

export function updateRestaurant(restaurant, token) {
  return postAuthRequestWithToken(UPDATE_RESTAURANT_URL, restaurant, token, 'Restaurant update', 'PUT')
}

export function deleteRestaurant(id, token) {
  return getAuthRequest(`${DELETE_RESTAURANT_URL}?id=${encodeURIComponent(id)}`, token, 'Restaurant deletion', 'DELETE')
}

export function createCategory(category, token) {
  return postAuthRequestWithToken(CREATE_CATEGORY_URL, category, token, 'Category creation')
}

export function listCategories(restaurantId, token) {
  return getAuthRequest(`${LIST_CATEGORY_URL}?restaurant_id=${encodeURIComponent(restaurantId)}`, token, 'Loading categories')
}

export function getCategory(id, token) {
  return getAuthRequest(`${GET_CATEGORY_URL}?id=${encodeURIComponent(id)}`, token, 'Loading category')
}

export function updateCategory(category, token) {
  return postAuthRequestWithToken(UPDATE_CATEGORY_URL, category, token, 'Category update', 'PUT')
}

export function deleteCategory(id, token) {
  return getAuthRequest(`${DELETE_CATEGORY_URL}?id=${encodeURIComponent(id)}`, token, 'Category deletion', 'DELETE')
}

export function listMenus(restaurantId, token) {
  return getAuthRequest(`${LIST_MENUS_URL}?restaurant_id=${encodeURIComponent(restaurantId)}`, token, 'Loading menus')
}

export function getMenu(id, token) {
  return getAuthRequest(`${GET_MENU_URL}?id=${encodeURIComponent(id)}`, token, 'Loading menu')
}

export function createMenu(menu, token) {
  return postAuthRequestWithToken(CREATE_MENU_URL, menu, token, 'Menu creation')
}

export function updateMenu(menu, token) {
  return postAuthRequestWithToken(UPDATE_MENU_URL, menu, token, 'Menu update', 'PUT')
}

export function deleteMenu(id, token) {
  return getAuthRequest(`${DELETE_MENU_URL}?id=${encodeURIComponent(id)}`, token, 'Menu deletion', 'DELETE')
}

export function listMenuItems(menuId, token) {
  return getAuthRequest(`${LIST_MENU_ITEMS_URL}?menu_id=${encodeURIComponent(menuId)}`, token, 'Loading food items')
}

export function getMenuItem(id, token) {
  return getAuthRequest(`${GET_MENU_ITEM_URL}?id=${encodeURIComponent(id)}`, token, 'Loading food item')
}

export function createMenuItem(item, token) {
  return item instanceof FormData
    ? postAuthFormDataWithToken(CREATE_MENU_ITEM_URL, item, token, 'Food item creation')
    : postAuthRequestWithToken(CREATE_MENU_ITEM_URL, item, token, 'Food item creation')
}

export function updateMenuItem(item, token, id) {
  return item instanceof FormData
    ? postAuthFormDataWithToken(`${UPDATE_MENU_ITEM_URL}?id=${encodeURIComponent(id)}`, item, token, 'Food item update')
    : postAuthRequestWithToken(`${UPDATE_MENU_ITEM_URL}?id=${encodeURIComponent(id || item.id)}`, item, token, 'Food item update', 'PUT')
}

export function deleteMenuItem(id, token) {
  return getAuthRequest(`${DELETE_MENU_ITEM_URL}?id=${encodeURIComponent(id)}`, token, 'Food item deletion', 'DELETE')
}

export function listTables(restaurantId, token) {
  return getAuthRequest(`${LIST_TABLES_URL}?restaurant_id=${encodeURIComponent(restaurantId)}`, token, 'Loading tables')
}

export function getTable(id, token) {
  return getAuthRequest(`${GET_TABLE_URL}?id=${encodeURIComponent(id)}`, token, 'Loading table')
}

export function createTable(table, token) {
  return postAuthRequestWithToken(CREATE_TABLE_URL, table, token, 'Table creation')
}

export function updateTable(table, token) {
  return postAuthRequestWithToken(UPDATE_TABLE_URL, table, token, 'Table update', 'PUT')
}

export function deleteTable(id, token) {
  return getAuthRequest(`${DELETE_TABLE_URL}?id=${encodeURIComponent(id)}`, token, 'Table deletion', 'DELETE')
}

export async function getPublicMenuByTableToken(tableToken) {
  const response = await fetch(`${PUBLIC_MENU_URL}?token=${encodeURIComponent(tableToken)}`)
  return parseAuthResponse(response, 'Loading restaurant menu')
}

export function listStaff(restaurantId, token) {
  return getAuthRequest(`${LIST_STAFF_URL}?restaurant_id=${encodeURIComponent(restaurantId)}`, token, 'Loading staff')
}

export function getStaff(id, token) {
  return getAuthRequest(`${GET_STAFF_URL}?id=${encodeURIComponent(id)}`, token, 'Loading staff member')
}

export function createStaff(staff, token) {
  return postAuthRequestWithToken(CREATE_STAFF_URL, staff, token, 'Staff creation')
}

export function updateStaff(staff, token) {
  return postAuthRequestWithToken(UPDATE_STAFF_URL, staff, token, 'Staff update', 'PUT')
}

export function deleteStaff(id, token) {
  return getAuthRequest(`${DELETE_STAFF_URL}?id=${encodeURIComponent(id)}`, token, 'Staff deletion', 'DELETE')
}

async function getAuthRequest(url, token, action, method = 'GET') {
  const response = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` } })
  return parseAuthResponse(response, action)
}

async function postAuthRequestWithToken(url, payload, token, action, method = 'POST') {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseAuthResponse(response, action)
}

async function postAuthFormDataWithToken(url, payload, token, action) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: payload,
  })

  return parseAuthResponse(response, action)
}

async function parseAuthResponse(response, action) {
  let result = null
  try {
    result = await response.json()
  } catch {
    // Keep the HTTP error useful when the API does not return JSON.
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || `${action} failed (${response.status}).`)
  }

  return result
}

const AUTH_STORAGE_KEY = 'the-menu-auth'

export function getStoredAuth() {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    return storedAuth ? JSON.parse(storedAuth) : null
  } catch {
    return null
  }
}

export function storeAuth(auth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

