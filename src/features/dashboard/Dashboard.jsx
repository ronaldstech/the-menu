import { useState } from 'react'
import heroImg from '../../assets/hero.png'
import RestaurantManager from './RestaurantManager'
import CategoryManager from './CategoryManager'
import PhoneVerification from './PhoneVerification'

const savedPlaces = [
  { name: 'Marta', detail: 'Italian · Brooklyn', color: '#f0c9a8' },
  { name: 'Lilia', detail: 'Pasta · Williamsburg', color: '#c8d9b4' },
  { name: 'Sushi Nakazawa', detail: 'Japanese · West Village', color: '#d8c7db' },
]

function Icon({ name }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /><path d="M9 21v-7h6v7" /></>,
    bookmark: <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4Z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    logout: <><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5" /><path d="m15 16 4-4-4-4M19 12H9" /></>,
    restaurant: <><path d="M4 21h16M6 21V10h12v11M4 10l2-6h12l2 6M4 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 4 0" /><path d="M9 21v-6h6v6" /></>,
    staff: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 6" /></>,
    category: <><path d="M4 5h16v4H4zM4 15h16v4H4z" /><path d="M8 9v6M16 9v6" /></>,
    menuList: <><path d="M5 6h14M5 12h14M5 18h14" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
    qr: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM18 18h2v2h-2z" /></>,
    monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>,
    reports: <><path d="M4 19V5M4 19h17" /><path d="m7 15 3-4 3 2 5-6" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  }

  return <svg className="dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" aria-hidden="true">{paths[name]}</svg>
}

function BrandMark() {
  return <span className="dashboard-brand-mark" aria-hidden="true"><i /><b /></span>
}

function DashboardHome({ firstName }) {
  return (
    <>
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Tuesday, September 24</p>
          <h1>Good evening, {firstName || 'John'}.</h1>
          <p className="dashboard-subtitle">Here is a little inspiration for your next table.</p>
        </div>
        <button className="header-avatar" type="button" aria-label="Open profile">{(firstName || 'J').charAt(0).toUpperCase()}</button>
      </header>

      <section className="dashboard-feature">
        <div className="feature-copy">
          <p className="dashboard-eyebrow">Your next bookmark</p>
          <h2>A table worth<br /><em>leaving home for.</em></h2>
          <p>Find somewhere new, or revisit the places that made an impression.</p>
          <button className="dark-action" type="button">Explore places <Icon name="arrow" /></button>
        </div>
        <div className="feature-art"><img src={heroImg} alt="" /><span>curated<br />for you</span></div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><p className="dashboard-eyebrow">Your collection</p><h2>Saved places</h2></div><button className="text-action" type="button">View all <Icon name="arrow" /></button></div>
        <div className="place-grid">{savedPlaces.map((place) => <article className="place-card" key={place.name}><div className="place-image" style={{ background: place.color }}><span>{place.name.charAt(0)}</span></div><h3>{place.name}</h3><p>{place.detail}</p></article>)}</div>
      </section>
    </>
  )
}

function SavedView() {
  return <section className="simple-view"><p className="dashboard-eyebrow">Your collection</p><h1>Saved places.</h1><p className="dashboard-subtitle">The places you want to remember, all in one spot.</p><div className="place-grid">{savedPlaces.map((place) => <article className="place-card" key={place.name}><div className="place-image" style={{ background: place.color }}><span>{place.name.charAt(0)}</span></div><h3>{place.name}</h3><p>{place.detail}</p></article>)}</div></section>
}

function OwnerSection({ title, description, icon }) {
  return <section className="owner-section"><div className="owner-section__icon"><Icon name={icon} /></div><p className="dashboard-eyebrow">Restaurant management</p><h1>{title}.</h1><p className="dashboard-subtitle">{description}</p><div className="owner-empty-state"><h2>{title} workspace</h2><p>This is where you will manage your restaurant {title.toLowerCase()}.</p><button className="dark-action" type="button">Get started <Icon name="arrow" /></button></div></section>
}

function ProfileView({ user }) {
  const firstName = user?.first_name || 'John'
  const details = [
    ['User ID', user?.id ?? 'Not available'],
    ['First name', user?.first_name || 'Not available'],
    ['Last name', user?.last_name || 'Not available'],
    ['Email address', user?.email || 'Not available'],
    ['Phone number', user?.phone || 'Not available'],
    ['Account status', user?.status || 'Not available'],
    ['Roles', user?.roles?.length ? user.roles.join(', ') : 'Not available'],
    ['Phone verified', user?.phone_verified ? 'Yes' : 'No'],
  ]
  return <section className="simple-view"><p className="dashboard-eyebrow">Your account</p><h1>Your profile.</h1><div className="profile-card"><div className="profile-avatar">{firstName.charAt(0).toUpperCase()}</div><div><h2>{firstName} {user?.last_name || 'Doe'}</h2><p>{user?.email || 'Not available'}</p></div><button className="text-action" type="button">Edit profile</button></div><div className="profile-details"><div className="profile-details__heading"><h2>Account details</h2><span className="profile-status">{user?.status || 'Unknown'}</span></div><dl>{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div></section>
}

function Dashboard({ user, token, onLogout, onPhoneVerified, createRestaurant, listRestaurants, getRestaurant, updateRestaurant, deleteRestaurant, listCategories, getCategory, createCategory, updateCategory, deleteCategory, sendPhoneOtp, verifyPhoneOtp }) {
  const [phoneVerified, setPhoneVerified] = useState(user?.phone_verified === true || user?.phone_verified === 1)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const firstName = user?.first_name || user?.email?.split('@')[0] || 'John'
  const isCustomer = user?.roles?.includes('customer')
  const isOwner = user?.roles?.includes('owner') || phoneVerified
  const [activeView, setActiveView] = useState(() => isCustomer && !isOwner ? 'verify' : 'dashboard')
  const ownerFeatures = [
    ['restaurants', 'Restaurants', 'restaurant'],
    ['staff', 'Staff', 'staff'],
    ['category', 'Category', 'category'],
    ['menu', 'Menu', 'menuList'],
    ['table-qr', 'Table & QR', 'qr'],
    ['attendants', 'Monitor Attendants', 'monitor'],
    ['reports', 'Reports', 'reports'],
  ]
  const markPhoneVerified = () => {
    setPhoneVerified(true)
    onPhoneVerified?.()
  }
  if (isCustomer && !isOwner) {
    return <main className="owner-onboarding-page"><PhoneVerification phone={user?.phone} token={token} sendPhoneOtp={sendPhoneOtp} verifyPhoneOtp={verifyPhoneOtp} onVerified={markPhoneVerified} /></main>
  }
  const views = { dashboard: <DashboardHome firstName={firstName} />, saved: <SavedView />, restaurant: <RestaurantManager token={token} listRestaurants={listRestaurants} getRestaurant={getRestaurant} createRestaurant={createRestaurant} updateRestaurant={updateRestaurant} deleteRestaurant={deleteRestaurant} />, category: <CategoryManager token={token} listRestaurants={listRestaurants} listCategories={listCategories} getCategory={getCategory} createCategory={createCategory} updateCategory={updateCategory} deleteCategory={deleteCategory} />, profile: <ProfileView user={user} />, verify: <PhoneVerification phone={user?.phone} token={token} sendPhoneOtp={sendPhoneOtp} verifyPhoneOtp={verifyPhoneOtp} onVerified={() => { markPhoneVerified(); setActiveView('restaurant') }} /> }
  ownerFeatures.forEach(([key, label, icon]) => {
    views[key] = key === 'restaurants' ? views.restaurant : key === 'category' ? views.category : <OwnerSection title={label} icon={icon} description={`Keep your ${label.toLowerCase()} organized and ready for service.`} />
  })
  const selectView = (view) => { setActiveView(view); setIsMenuOpen(false) }

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <a className="dashboard-brand" href="/" aria-label="The Menu home"><BrandMark /><span>the menu</span></a>
        <nav className="dashboard-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          <button className={activeView === 'dashboard' ? 'is-active' : ''} type="button" onClick={() => selectView('dashboard')}><Icon name="home" />Dashboard</button>
          {isOwner ? ownerFeatures.map(([key, label, icon]) => <button className={activeView === key ? 'is-active' : ''} key={key} type="button" onClick={() => selectView(key)}><Icon name={icon} />{label}</button>) : <><button className={activeView === 'saved' ? 'is-active' : ''} type="button" onClick={() => selectView('saved')}><Icon name="bookmark" />Saved places</button>{isCustomer && <button className={activeView === 'restaurant' || activeView === 'verify' ? 'is-active' : ''} type="button" onClick={() => selectView(phoneVerified ? 'restaurant' : 'verify')}><Icon name="restaurant" />Add restaurant</button>}</>}
          <p className="nav-label nav-label--account">Account</p>
          <button className={activeView === 'profile' ? 'is-active' : ''} type="button" onClick={() => selectView('profile')}><Icon name="user" />Profile</button>
        </nav>
        <button className="logout-button" type="button" onClick={onLogout}><Icon name="logout" />Log out</button>
      </aside>
      <div className="dashboard-main">
        <div className="mobile-dashboard-bar"><button className="mobile-menu-button" type="button" onClick={() => setIsMenuOpen(true)} aria-label="Open menu"><Icon name="menu" /></button><a className="dashboard-brand" href="/" aria-label="The Menu home"><BrandMark /><span>the menu</span></a><button className="header-avatar" type="button" onClick={() => selectView('profile')} aria-label="Open profile">{firstName.charAt(0).toUpperCase()}</button></div>
        <div className="dashboard-content">{views[activeView]}</div>
        {isMenuOpen && <button className="mobile-menu-backdrop" type="button" onClick={() => setIsMenuOpen(false)} aria-label="Close menu" />}
        <aside className={`mobile-dashboard-drawer ${isMenuOpen ? 'is-open' : ''}`} aria-label="Mobile menu"><div className="mobile-drawer-header"><a className="dashboard-brand" href="/" aria-label="The Menu home"><BrandMark /><span>the menu</span></a><button className="mobile-menu-button" type="button" onClick={() => setIsMenuOpen(false)} aria-label="Close menu"><Icon name="close" /></button></div><nav className="dashboard-nav"><p className="nav-label">Workspace</p><button className={activeView === 'dashboard' ? 'is-active' : ''} type="button" onClick={() => selectView('dashboard')}><Icon name="home" />Dashboard</button>{isOwner ? ownerFeatures.map(([key, label, icon]) => <button className={activeView === key ? 'is-active' : ''} key={key} type="button" onClick={() => selectView(key)}><Icon name={icon} />{label}</button>) : <><button className={activeView === 'saved' ? 'is-active' : ''} type="button" onClick={() => selectView('saved')}><Icon name="bookmark" />Saved places</button>{isCustomer && <button className={activeView === 'restaurant' || activeView === 'verify' ? 'is-active' : ''} type="button" onClick={() => selectView(phoneVerified ? 'restaurant' : 'verify')}><Icon name="restaurant" />Add restaurant</button>}</>}<p className="nav-label nav-label--account">Account</p><button className={activeView === 'profile' ? 'is-active' : ''} type="button" onClick={() => selectView('profile')}><Icon name="user" />Profile</button></nav><button className="logout-button" type="button" onClick={onLogout}><Icon name="logout" />Log out</button></aside>
      </div>
    </main>
  )
}

export default Dashboard
