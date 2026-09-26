import { useEffect, useState, useRef } from 'react'
import { API_BASE_URL } from '../../config/api'
import './public-menu.css'

const isAvailable = (value) => value === undefined || value === null || ![false, 0, '0', 'false'].includes(typeof value === 'string' ? value.toLowerCase() : value)

function imageUrl(path) {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/i.test(path)) return path
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`
}

function getItems(data) {
  if (Array.isArray(data?.menu_items)) return data.menu_items
  if (Array.isArray(data?.available_items)) return data.available_items
  if (Array.isArray(data?.food_items)) return data.food_items
  if (Array.isArray(data?.items)) return data.items
  return []
}

function normalizeMenuResponse(result) {
  const data = result?.data || result
  const restaurant = data?.restaurant || data?.restaurant_info || null
  const table = data?.table || data?.dining_table || null
  const rawMenus = Array.isArray(data?.published_menus) ? data.published_menus : Array.isArray(data?.menus) ? data.menus : data?.menu ? [data.menu] : []
  let menus = rawMenus.map((menu) => ({ ...menu, items: getItems(menu) }))
  const topItems = getItems(data)
  if (topItems.length) {
    menus = [{ id: data?.menu?.id || 'food', name: data?.menu?.name || data?.menu_name || 'Menu', items: topItems }]
  }
  return { restaurant, table, menus }
}

function formatPrice(value, currencyCode) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return value ?? ''
  if (/^[A-Z]{3}$/.test(currencyCode || '')) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(amount)
  }
  return amount.toFixed(2)
}

function FoodItem({ item, currencyCode }) {
  if (!isAvailable(item.is_available)) return null
  const photo = imageUrl(item.image_url)
  
  return (
    <article className="public-food-item">
      {photo && <img className="public-food-item__image" src={photo} alt="" loading="lazy" />}
      <div className="public-food-item__body">
        <div className="public-food-item__heading">
          <h3>{item.name}</h3>
          {item.price !== undefined && <span>{formatPrice(item.price, currencyCode)}</span>}
        </div>
        {item.description && <p className="public-food-item__description">{item.description}</p>}
      </div>
    </article>
  )
}

function PublicMenuPage({ tableToken: propTableToken, loadPublicMenu }) {
  const [menuData, setMenuData] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const headerRef = useRef(null)

  useEffect(() => {
    let isCurrent = true

    // Fallback: If tableToken is not passed via props, try to extract it from URL path or query parameters
    let token = propTableToken
    if (!token) {
      const pathSegments = window.location.pathname.split('/').filter(Boolean)
      // Example: if URL is /menu/xyz-token or /table/xyz-token
      token = pathSegments[pathSegments.length - 1]
      
      // Alternatively check query string (?token=xyz or ?table=xyz)
      if (!token || token === 'menu') {
        const params = new URLSearchParams(window.location.search)
        token = params.get('token') || params.get('table') || params.get('t')
      }
    }

    if (!token || token === '[object Object]') {
      if (isCurrent) {
        setError('A valid table token or link is required to view this menu.')
        setIsLoading(false)
      }
      return
    }

    loadPublicMenu(token).then((result) => {
      if (isCurrent) setMenuData(normalizeMenuResponse(result))
    }).catch((requestError) => {
      if (isCurrent) setError(requestError.message || 'Could not load this restaurant menu.')
    }).finally(() => {
      if (isCurrent) setIsLoading(false)
    })

    const handleScroll = () => {
      if (!headerRef.current) return
      if (window.scrollY > 40) {
        headerRef.current.classList.add('is-scrolled')
      } else {
        headerRef.current.classList.remove('is-scrolled')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => { 
      isCurrent = false 
      window.removeEventListener('scroll', handleScroll)
    }
  }, [loadPublicMenu, propTableToken])

  if (isLoading) return <main className="public-menu-page"><p className="public-menu-state">Loading menu…</p></main>
  if (error) return <main className="public-menu-page"><section className="public-menu-error"><h1>Menu unavailable</h1><p>{error}</p></section></main>

  const { restaurant, menus } = menuData || {}
  if (!restaurant) return <main className="public-menu-page"><section className="public-menu-error"><h1>Menu unavailable</h1><p>This table link did not return a restaurant menu.</p></section></main>

  const currencyCode = restaurant.currency_code || restaurant.currency
  const address = [restaurant.address_line_1, restaurant.city, restaurant.country].filter(Boolean).join(', ')
  const logoPhoto = imageUrl(restaurant.logo_url)

  return (
    <main className="public-menu-page">
      <header className="public-menu-header" ref={headerRef}>
        <div className="public-menu-header-container">
          
          <div className="public-menu-logo-wrap">
            {logoPhoto ? (
              <img src={logoPhoto} alt={restaurant.name} className="public-menu-logo" />
            ) : (
              <span className="public-menu-mark" aria-hidden="true">
                {restaurant.name?.charAt(0) || 'R'}
              </span>
            )}
          </div>

          <div className="public-menu-details-wrapper">
            <h1>{restaurant.name}</h1>
            <div className="public-menu-meta-row">
              {restaurant.description && <p className="public-menu-description">{restaurant.description}</p>}
              {address && <p className="public-menu-address">{address}</p>}
            </div>
          </div>

        </div>
      </header>

      <div className="public-menu-content">
        {menus.length === 0 ? (
          <p className="public-menu-state">This restaurant has no published food yet.</p>
        ) : (
          menus.map((menu) => {
            const items = menu.items.filter(isAvailable)
            return (
              <section className="public-menu-section" key={menu.id || menu.name}>
                <h2>{menu.name || 'Menu'}</h2>
                {items.length ? (
                  <div className="public-food-list">
                    {items.map((item) => (
                      <FoodItem key={item.id || `${menu.id}-${item.name}`} item={item} currencyCode={currencyCode} />
                    ))}
                  </div>
                ) : (
                  <p className="public-menu-state">No food items are available in this menu.</p>
                )}
              </section>
            )
          })
        )}
      </div>

      <footer className="public-menu-footer">Powered by The Menu</footer>
    </main>
  )
}

export default PublicMenuPage