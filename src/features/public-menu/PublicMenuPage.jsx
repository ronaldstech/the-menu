import { useEffect, useState } from 'react'
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
  const category = typeof item.category === 'string' ? item.category : item.category?.name || item.category_name
  return <article className="public-food-item">
    {photo && <img className="public-food-item__image" src={photo} alt="" loading="lazy" />}
    <div className="public-food-item__body">
      <div className="public-food-item__heading"><h3>{item.name}</h3>{item.price !== undefined && <span>{formatPrice(item.price, currencyCode)}</span>}</div>
      {category && <p className="public-food-item__category">{category}</p>}
      {item.description && <p className="public-food-item__description">{item.description}</p>}
    </div>
  </article>
}

function PublicMenuPage({ tableToken, loadPublicMenu }) {
  const [menuData, setMenuData] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCurrent = true
    loadPublicMenu(tableToken).then((result) => {
      if (isCurrent) setMenuData(normalizeMenuResponse(result))
    }).catch((requestError) => {
      if (isCurrent) setError(requestError.message || 'Could not load this restaurant menu.')
    }).finally(() => {
      if (isCurrent) setIsLoading(false)
    })
    return () => { isCurrent = false }
  }, [loadPublicMenu, tableToken])

  if (isLoading) return <main className="public-menu-page"><p className="public-menu-state">Loading menu…</p></main>
  if (error) return <main className="public-menu-page"><section className="public-menu-error"><span className="public-menu-mark" aria-hidden="true">tm</span><h1>Menu unavailable</h1><p>{error}</p></section></main>

  const { restaurant, table, menus } = menuData || {}
  if (!restaurant) return <main className="public-menu-page"><section className="public-menu-error"><span className="public-menu-mark" aria-hidden="true">tm</span><h1>Menu unavailable</h1><p>This table link did not return a restaurant menu.</p></section></main>
  const currencyCode = restaurant.currency_code || restaurant.currency
  const address = [restaurant.address_line_1, restaurant.city, restaurant.country].filter(Boolean).join(', ')

  return <main className="public-menu-page">
    <header className="public-menu-header">
      <span className="public-menu-mark" aria-hidden="true">tm</span>
      <p className="public-menu-eyebrow">{table?.name || (table?.table_number ? `Table ${table.table_number}` : 'Restaurant menu')}</p>
      <h1>{restaurant.name}</h1>
      {restaurant.description && <p className="public-menu-description">{restaurant.description}</p>}
      {address && <p className="public-menu-address">{address}</p>}
    </header>
    <div className="public-menu-content">
      {menus.length === 0 ? <p className="public-menu-state">This restaurant has no published food yet.</p> : menus.map((menu) => {
        const items = menu.items.filter(isAvailable)
        return <section className="public-menu-section" key={menu.id || menu.name}>
          <h2>{menu.name || 'Menu'}</h2>
          {items.length ? <div className="public-food-list">{items.map((item) => <FoodItem key={item.id || `${menu.id}-${item.name}`} item={item} currencyCode={currencyCode} />)}</div> : <p className="public-menu-state">No food items are available in this menu.</p>}
        </section>
      })}
    </div>
    <footer className="public-menu-footer">Powered by The Menu</footer>
  </main>
}

export default PublicMenuPage
