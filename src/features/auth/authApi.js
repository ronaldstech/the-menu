const REGISTER_URL = 'http://192.168.1.168/the_menu/api/auth/register.php'
const LOGIN_URL = 'http://192.168.1.168/the_menu/api/auth/login.php'
const ME_URL = 'http://192.168.1.168/the_menu/api/auth/me.php'
const CREATE_RESTAURANT_URL = 'http://192.168.1.168/the_menu/api/restaurants/create.php'
const LIST_RESTAURANTS_URL = 'http://192.168.1.168/the_menu/api/restaurants/list.php'
const GET_RESTAURANT_URL = 'http://192.168.1.168/the_menu/api/restaurants/get.php'
const UPDATE_RESTAURANT_URL = 'http://192.168.1.168/the_menu/api/restaurants/update.php'
const DELETE_RESTAURANT_URL = 'http://192.168.1.168/the_menu/api/restaurants/delete.php'
const CREATE_CATEGORY_URL = 'http://192.168.1.168/the_menu/api/categories/create.php'
const LIST_CATEGORY_URL = 'http://192.168.1.168/the_menu/api/categories/list.php'
const GET_CATEGORY_URL = 'http://192.168.1.168/the_menu/api/categories/get.php'
const UPDATE_CATEGORY_URL = 'http://192.168.1.168/the_menu/api/categories/update.php'
const DELETE_CATEGORY_URL = 'http://192.168.1.168/the_menu/api/categories/delete.php'
const LIST_STAFF_URL = 'http://192.168.1.168/the_menu/api/staff/list.php'
const GET_STAFF_URL = 'http://192.168.1.168/the_menu/api/staff/get.php'
const CREATE_STAFF_URL = 'http://192.168.1.168/the_menu/api/staff/create.php'
const UPDATE_STAFF_URL = 'http://192.168.1.168/the_menu/api/staff/update.php'
const DELETE_STAFF_URL = 'http://192.168.1.168/the_menu/api/staff/delete.php'
const SEND_PHONE_OTP_URL = 'http://192.168.1.168/the_menu/api/auth/send-otp.php'
const VERIFY_PHONE_OTP_URL = 'http://192.168.1.168/the_menu/api/auth/verify-otp.php'
const VERIFY_EMAIL_URL = 'http://192.168.1.168/the_menu/api/auth/verify.php'

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
    throw new Error(result?.message || `${action} failed (${response.status}).`)
  }

  if (result?.success === false) {
    throw new Error(result.message || `${action} failed.`)
  }

  return result
}

export function registerUser(user) {
  return postAuthRequest(REGISTER_URL, user, 'Registration')
}

export function loginUser(credentials) {
  return postAuthRequest(LOGIN_URL, credentials, 'Login')
}

export function verifyEmailCode(email, code) {
  return postAuthRequest(VERIFY_EMAIL_URL, { email, code }, 'Account verification')
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

export function sendPhoneOtp(phone, token) {
  return postAuthRequestWithToken(SEND_PHONE_OTP_URL, { phone }, token, 'Sending verification code')
}

export function verifyPhoneOtp(phone, otp, token) {
  return postAuthRequestWithToken(VERIFY_PHONE_OTP_URL, { phone, otp }, token, 'Phone verification')
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