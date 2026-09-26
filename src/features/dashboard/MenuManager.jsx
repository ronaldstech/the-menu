import { useCallback, useEffect, useState } from 'react'

const emptyMenu = { restaurant_id: '', category_id: '', name: '', description: '', is_active: true }
const isActive = (value) => value === true || value === 1 || value === '1' || value === 'true'

function getItems(result) {
  if (Array.isArray(result)) return result
  if (!result || typeof result !== 'object') return []
  for (const key of ['menus', 'categories', 'restaurants', 'items', 'data', 'results']) {
    if (Array.isArray(result[key])) return result[key]
    if (result[key] && typeof result[key] === 'object') {
      const nested = getItems(result[key])
      if (nested.length) return nested
    }
  }
  return []
}

function MenuManager({ token, listRestaurants, listCategories, listMenus, getMenu, createMenu, updateMenu, deleteMenu }) {
  const [restaurants, setRestaurants] = useState([])
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [restaurantId, setRestaurantId] = useState('')
  const [form, setForm] = useState(emptyMenu)
  const [selectedId, setSelectedId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const loadData = useCallback(async (id) => {
    if (!id) { setItems([]); setIsLoading(false); return }
    setIsLoading(true)
    try {
      const itemResult = await listMenus(id, token)
      setItems(getItems(itemResult))
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not load the menu.' })
    } finally { setIsLoading(false) }
  }, [listMenus, token])

  const loadCategories = useCallback(async (id) => {
    if (!id) { setCategories([]); return }
    try {
      const result = await listCategories(id, token)
      setCategories(getItems(result))
    } catch (error) {
      setCategories([])
      setStatus({ type: 'error', message: error.message || 'Could not load categories.' })
    }
  }, [listCategories, token])

  useEffect(() => {
    void Promise.resolve().then(async () => {
      try {
        const result = await listRestaurants(token)
        const availableRestaurants = getItems(result)
        setRestaurants(availableRestaurants)
        const firstId = availableRestaurants[0]?.id ? String(availableRestaurants[0].id) : ''
        setRestaurantId(firstId)
        await Promise.all([loadData(firstId), loadCategories(firstId)])
      } catch (error) {
        setStatus({ type: 'error', message: error.message || 'Could not load restaurants.' })
        setIsLoading(false)
      }
    })
  }, [listRestaurants, loadCategories, loadData, token])

  const openNew = () => {
    setSelectedId(null)
    setForm({ ...emptyMenu, restaurant_id: restaurantId, category_id: categories[0]?.id ? String(categories[0].id) : '' })
    setStatus({ type: '', message: '' })
    setIsFormOpen(true)
  }

  const openEdit = async (item) => {
    setSelectedId(item.id)
    setForm({ ...emptyMenu, ...item, is_active: isActive(item.is_active) })
    setIsFormOpen(true)
    setStatus({ type: '', message: '' })
    try {
      const result = await getMenu(item.id, token)
      const loadedItem = result?.menu || result?.item || result?.data || result
      setForm({ ...emptyMenu, ...loadedItem, is_active: isActive(loadedItem.is_active) })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not load menu details.' })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })
    try {
      const payload = { ...form, restaurant_id: Number(restaurantId), category_id: Number(form.category_id), is_active: isActive(form.is_active) }
      const result = selectedId
        ? await updateMenu({ ...payload, id: selectedId }, token)
        : await createMenu(payload, token)
      setStatus({ type: 'success', message: result?.message || (selectedId ? 'Menu updated.' : 'Menu created.') })
      setIsFormOpen(false)
      await loadData(restaurantId)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not save menu.' })
    } finally { setIsSubmitting(false) }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return
    try {
      const result = await deleteMenu(item.id, token)
      setStatus({ type: 'success', message: result?.message || 'Menu deleted.' })
      await loadData(restaurantId)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not delete menu item.' })
    }
  }

  return <section className="category-manager">
    <header className="manager-heading"><div><p className="dashboard-eyebrow">Restaurant management</p><h1>Menu items.</h1><p className="dashboard-subtitle">Build this restaurant’s menu by adding items to categories.</p></div><button className="dark-action" type="button" onClick={openNew} disabled={!restaurantId || categories.length === 0}>Add menu item <span aria-hidden="true">+</span></button></header>
    {status.message && <p className={`restaurant-status restaurant-status--${status.type}`} role="status">{status.message}</p>}
    <label className="restaurant-selector"><span>Restaurant</span><select value={restaurantId} onChange={(event) => { const id = event.target.value; setRestaurantId(id); setIsFormOpen(false); void Promise.all([loadData(id), loadCategories(id)]) }} disabled={isLoading}><option value="">Select a restaurant</option>{restaurants.map((restaurant) => <option value={restaurant.id} key={restaurant.id}>{restaurant.name}</option>)}</select></label>
    {!isLoading && restaurantId && categories.length === 0 && <div className="owner-empty-state"><h2>Create a category first</h2><p>Menu items must belong to a category. Add a category for this restaurant before creating menu items.</p></div>}
    {isFormOpen && <form className="restaurant-form manager-form" onSubmit={handleSubmit}>
      <div className="manager-form__heading"><h2>{selectedId ? 'Edit menu item' : 'New menu item'}</h2><button className="text-action" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button></div>
      <label className="dashboard-field"><span>Category</span><select name="category_id" value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })} required><option value="">Select a category</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
      <label className="dashboard-field"><span>Menu name</span><input name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Dinner menu" required /></label>
      <label className="dashboard-field"><span>Description</span><textarea name="description" value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="A short description of this menu" rows="3" /></label>
      <label className="dashboard-field category-toggle"><span>Active</span><input name="is_active" type="checkbox" checked={isActive(form.is_active)} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /></label>
      <button className="dark-action restaurant-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : selectedId ? 'Update menu' : 'Create menu'} <span aria-hidden="true">↗</span></button>
    </form>}
    {isLoading ? <p className="dashboard-subtitle">Loading menu items...</p> : !restaurantId ? <div className="owner-empty-state"><h2>Create a restaurant first</h2><p>Menu items belong to a restaurant. Add a restaurant before creating them.</p></div> : categories.length > 0 && (items.length === 0 ? <div className="owner-empty-state"><h2>No menu items yet</h2><p>Add the first item to a category for this restaurant.</p><button className="dark-action" type="button" onClick={openNew}>Create menu item <span aria-hidden="true">+</span></button></div> : <div className="category-table-wrap"><table className="category-table"><thead><tr><th>Name</th><th>Category</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.name}</td><td>{categories.find((category) => String(category.id) === String(item.category_id))?.name || '-'}</td><td>{item.description || '-'}</td><td><span className="profile-status">{isActive(item.is_active) ? 'Active' : 'Inactive'}</span></td><td><div className="restaurant-list-actions"><button className="text-action" type="button" onClick={() => openEdit(item)}>Edit</button><button className="danger-action" type="button" onClick={() => handleDelete(item)}>Delete</button></div></td></tr>)}</tbody></table></div>)}
  </section>
}

export default MenuManager

