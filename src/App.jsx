import { useState } from 'react'
import AuthShell from './features/auth/AuthShell'
import { LoginForm, SignupForm } from './features/auth/AuthForms'
import EmailVerification from './features/auth/EmailVerification'
import { clearStoredAuth, createCategory, createRestaurant, deleteCategory, deleteRestaurant, getCategory, getCurrentUser, getRestaurant, getStoredAuth, listCategories, listRestaurants, loginUser, registerUser, sendPhoneOtp, storeAuth, updateCategory, updateRestaurant, verifyEmailCode, verifyPhoneOtp, listStaff, getStaff, createStaff, updateStaff, deleteStaff } from './features/auth/authApi'
import Dashboard from './features/dashboard/Dashboard'
import './features/auth/auth.css'
import './features/dashboard/dashboard.css'
import { useEffect } from 'react'

function App() {
  const [mode, setMode] = useState('login')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [auth, setAuth] = useState(getStoredAuth)
  const [isRestoring, setIsRestoring] = useState(() => Boolean(getStoredAuth()?.token))
  const [pendingVerification, setPendingVerification] = useState(null)

  useEffect(() => {
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
  }, [])

  const handleSubmit = async (event, form) => {
    event.preventDefault()
    setNotice('')
    setIsSubmitting(true)
    try {
      if (mode === 'login') {
        const result = await loginUser(form)
        const nextAuth = { token: result.token, user: result.user }
        storeAuth(nextAuth)
        setAuth(nextAuth)
      } else {
        await registerUser(form)
        setPendingVerification({ email: form.email })
      }
    } catch (error) {
      setNotice(error.message || `We could not ${mode === 'login' ? 'log you in' : 'create your account'}. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhoneVerified = () => {
    if (!auth?.user) return
    const nextUser = {
      ...auth.user,
      phone_verified: true,
      roles: Array.from(new Set([...(auth.user.roles || []), 'owner'])),
    }
    const nextAuth = { ...auth, user: nextUser }
    storeAuth(nextAuth)
    setAuth(nextAuth)
  }

  if (auth?.user) {
    return <Dashboard user={auth.user} token={auth.token} createRestaurant={createRestaurant} listRestaurants={listRestaurants} getRestaurant={getRestaurant} updateRestaurant={updateRestaurant} deleteRestaurant={deleteRestaurant} listCategories={listCategories} getCategory={getCategory} createCategory={createCategory} updateCategory={updateCategory} deleteCategory={deleteCategory} listStaff={listStaff} getStaff={getStaff} createStaff={createStaff} updateStaff={updateStaff} deleteStaff={deleteStaff} sendPhoneOtp={sendPhoneOtp} verifyPhoneOtp={verifyPhoneOtp} onPhoneVerified={handlePhoneVerified} onLogout={() => { clearStoredAuth(); setAuth(null) }} />
  }

  if (isRestoring) return <div className="auth-loading" role="status">Loading your table...</div>

  if (pendingVerification) {
    return <EmailVerification email={pendingVerification.email} verifyEmailCode={verifyEmailCode} onVerified={(result) => {
      const nextAuth = { token: result.token, user: result.user }
      storeAuth(nextAuth)
      setAuth(nextAuth)
      setPendingVerification(null)
    }} onBack={() => setPendingVerification(null)} />
  }

  return (
    <AuthShell mode={mode} onModeChange={(nextMode) => { setMode(nextMode); setNotice('') }}>
      {notice && <p className="auth-notice" role="status">{notice}</p>}
      {mode === 'login' ? <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} /> : <SignupForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
    </AuthShell>
  )
}

export default App
