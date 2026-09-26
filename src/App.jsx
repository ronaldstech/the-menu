import { useState } from 'react'
import AuthShell from './features/auth/AuthShell'
import { LoginForm, SignupForm } from './features/auth/AuthForms'
import PhoneVerification from './features/auth/PhoneVerification'
import { clearStoredAuth, createCategory, createMenu, createRestaurant, deleteCategory, deleteMenu, deleteRestaurant, getCategory, getCurrentUser, getMenu, getRestaurant, getStoredAuth, listCategories, listMenus, listRestaurants, loginUser, registerUser, storeAuth, updateCategory, updateMenu, updateRestaurant, verifyRegistrationCode, listStaff, getStaff, createStaff, updateStaff, deleteStaff, listMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem, listTables, getTable, createTable, updateTable, deleteTable } from './features/auth/authApi'
import Dashboard from './features/dashboard/Dashboard'
import PublicMenuPage from './features/public-menu/PublicMenuPage'
import { getPublicMenuByTableToken } from './features/auth/authApi'
import './features/auth/auth.css'
import './features/dashboard/dashboard.css'
import { useEffect } from 'react'

function App() {
  const query = new URLSearchParams(window.location.search)
  const tableToken = query.get('token') || query.get('table_token') || null
  const [mode, setMode] = useState('login')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [auth, setAuth] = useState(getStoredAuth)
  const [isRestoring, setIsRestoring] = useState(() => Boolean(getStoredAuth()?.token) && !tableToken)
  const [pendingVerification, setPendingVerification] = useState(null)

  const accountIsInactive = (value) => {
    const user = value?.user || value?.account || value?.data?.user || value?.data?.account
    const status = String(user?.status || user?.account_status || value?.status || value?.account_status || '').toLowerCase()
    if (/inactive|pending|unverified|verification|not[_\s-]?active|not[_\s-]?activated/.test(status)) return true
    if (user?.is_active === false || user?.is_active === 0 || user?.is_active === '0') return true
    const message = `${value?.code || ''} ${value?.message || ''}`.toLowerCase()
    return /account.{0,30}(inactive|not active|not activated|pending|unverified|verif(?:y|ied|ication))|verif(?:y|ied|ication).{0,30}account|(?:inactive|not active|pending verification|unverified account)/.test(message)
  }

  useEffect(() => {
    if (tableToken) return
    const storedAuth = getStoredAuth()
    if (!storedAuth?.token) {
      return
    }

    getCurrentUser(storedAuth.token)
      .then((currentUser) => {
        const nextAuth = { ...storedAuth, user: currentUser }
        storeAuth(nextAuth)
        setAuth(nextAuth)
      })
      .catch(() => {
        clearStoredAuth()
        setAuth(null)
      })
      .finally(() => setIsRestoring(false))
  }, [tableToken])

  const handleSubmit = async (event, form) => {
    event.preventDefault()
    setNotice('')
    setIsSubmitting(true)
    try {
      if (mode === 'login') {
        const result = await loginUser(form)
        if (accountIsInactive(result)) {
          setPendingVerification({ email: form.email, backMode: 'login' })
          return
        }
        const nextAuth = { token: result.token, user: result.user }
        storeAuth(nextAuth)
        setAuth(nextAuth)
      } else {
        await registerUser(form)
        setPendingVerification({ email: form.email, phone: form.phone, backMode: 'signup' })
      }
    } catch (error) {
      if (mode === 'login' && accountIsInactive(error.data || error)) {
        setPendingVerification({ email: form.email, backMode: 'login' })
        setNotice('')
        return
      }
      setNotice(error.message || `We could not ${mode === 'login' ? 'log you in' : 'create your account'}. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (tableToken) return <PublicMenuPage tableToken={tableToken} loadPublicMenu={getPublicMenuByTableToken} />

  if (auth?.user) {
    return <Dashboard user={auth.user} token={auth.token} createRestaurant={createRestaurant} listRestaurants={listRestaurants} getRestaurant={getRestaurant} updateRestaurant={updateRestaurant} deleteRestaurant={deleteRestaurant} listCategories={listCategories} getCategory={getCategory} createCategory={createCategory} updateCategory={updateCategory} deleteCategory={deleteCategory} listMenus={listMenus} getMenu={getMenu} createMenu={createMenu} updateMenu={updateMenu} deleteMenu={deleteMenu} listMenuItems={listMenuItems} getMenuItem={getMenuItem} createMenuItem={createMenuItem} updateMenuItem={updateMenuItem} deleteMenuItem={deleteMenuItem} listTables={listTables} getTable={getTable} createTable={createTable} updateTable={updateTable} deleteTable={deleteTable} listStaff={listStaff} getStaff={getStaff} createStaff={createStaff} updateStaff={updateStaff} deleteStaff={deleteStaff} onLogout={() => { clearStoredAuth(); setAuth(null) }} />
  }

  if (isRestoring) return <div className="auth-loading" role="status">Loading your table...</div>

  if (pendingVerification) {
    return <PhoneVerification email={pendingVerification.email} phone={pendingVerification.phone} verifyRegistrationCode={verifyRegistrationCode} backLabel={pendingVerification.backMode === 'login' ? 'Back to login' : 'Back to sign up'} onVerified={(result) => {
      const nextAuth = { token: result.token, user: result.user }
      storeAuth(nextAuth)
      setAuth(nextAuth)
      setPendingVerification(null)
    }} onBack={() => { setMode(pendingVerification.backMode || 'signup'); setPendingVerification(null) }} />
  }

  return (
    <AuthShell mode={mode} onModeChange={(nextMode) => { setMode(nextMode); setNotice('') }}>
      {notice && <p className="auth-notice" role="status">{notice}</p>}
      {mode === 'login' ? <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} /> : <SignupForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
    </AuthShell>
  )
}

export default App

