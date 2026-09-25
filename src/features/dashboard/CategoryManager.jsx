import { useCallback, useEffect, useState } from 'react'

const emptyCategory = { restaurant_id: '', name: '', description: '', display_order: 1, is_active: true }

function getItems(result) {
  if (Array.isArray(result)) return result
  if (!result || typeof result !== 'object') return []
  for (const key of ['categories', 'restaurants', 'data', 'items', 'results']) {
    if (Array.isArray(result[key])) return result[key]
    if (result[key] && typeof result[key] === 'object') {
      const nested = getItems(result[key])
      if (nested.length) return nested
    }
  }
  return []
}

function CategoryManager({ token, listRestaurants, listCategories, getCategory, createCategory, updateCategory, deleteCategory }) {
  const [restaurants, setRestaurants] = useState([])
  const [categories, setCategories] = useState([])
  const [restaurantId, setRestaurantId] = useState('')
  const [form, setForm] = useState(emptyCategory)
  const [selectedId, setSelectedId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const loadCategories = useCallback(async (id) => {
    if (!id) {
      setCategories([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const result = await listCategories(id, token)
      setCategories(getItems(result))
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not load categories.' })
    } finally {
      setIsLoading(false)
    }
  }, [listCategories, token])

  useEffect(() => {
    void Promise.resolve().then(async () => {
      try {
        const result = await listRestaurants(token)
        const items = getItems(result)
        setRestaurants(items)
        const firstRestaurantId = items[0]?.id ? String(items[0].id) : ''
        setRestaurantId(firstRestaurantId)
        await loadCategories(firstRestaurantId)
      } catch (error) {
        setStatus({ type: 'error', message: error.message || 'Could not load restaurants.' })
        setIsLoading(false)
      }
    })
  }, [listRestaurants, loadCategories, token])

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const selectRestaurant = (event) => {
    const nextRestaurantId = event.target.value
    setRestaurantId(nextRestaurantId)
    void loadCategories(nextRestaurantId)
  }
  const openNew = () => { setSelectedId(null); setForm({ ...emptyCategory, restaurant_id: restaurantId }); setStatus({ type: '', message: '' }); setIsFormOpen(true) }

  const openEdit = async (category) => {
    setSelectedId(category.id)
    setIsFormOpen(true)
    try {
      const result = await getCategory(category.id, token)
      setForm({ ...emptyCategory, ...(result?.category || result?.data || result) })
    } catch (error) {
      setForm({ ...emptyCategory, ...category })
      setStatus({ type: 'error', message: error.message || 'Could not load category details.' })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })
    try {
      const payload = { ...form, restaurant_id: Number(form.restaurant_id), display_order: Number(form.display_order), is_active: Boolean(form.is_active) }
      const result = selectedId ? await updateCategory({ ...payload, id: selectedId }, token) : await createCategory(payload, token)
      setStatus({ type: 'success', message: result?.message || (selectedId ? 'Category updated.' : 'Category created.') })
      setIsFormOpen(false)
      await loadCategories(restaurantId)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not save category.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete ${category.name}?`)) return
    try {
      const result = await deleteCategory(category.id, token)
      setStatus({ type: 'success', message: result?.message || 'Category deleted.' })
      await loadCategories(restaurantId)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not delete category.' })
    }
  }

  return <section className="category-manager"><header className="manager-heading"><div><p className="dashboard-eyebrow">Restaurant management</p><h1>Categories.</h1><p className="dashboard-subtitle">Organize your menu into clear sections.</p></div><button className="dark-action" type="button" onClick={openNew} disabled={!restaurantId}>Add category <span aria-hidden="true">+</span></button></header>{status.message && <p className={`restaurant-status restaurant-status--${status.type}`} role="status">{status.message}</p>}<label className="restaurant-selector"><span>Restaurant</span><select value={restaurantId} onChange={selectRestaurant} disabled={isLoading}><option value="">Select a restaurant</option>{restaurants.map((restaurant) => <option value={restaurant.id} key={restaurant.id}>{restaurant.name}</option>)}</select></label>{isFormOpen && <form className="restaurant-form manager-form" onSubmit={handleSubmit}><div className="manager-form__heading"><h2>{selectedId ? 'Edit category' : 'New category'}</h2><button className="text-action" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button></div><label className="dashboard-field"><span>Name</span><input name="name" value={form.name} onChange={updateField} placeholder="Breakfast" required /></label><label className="dashboard-field"><span>Description</span><textarea name="description" value={form.description} onChange={updateField} placeholder="Morning menu items" rows="3" required /></label><div className="field-row"><label className="dashboard-field"><span>Display order</span><input name="display_order" type="number" min="0" value={form.display_order} onChange={updateField} required /></label><label className="dashboard-field category-toggle"><span>Active</span><input name="is_active" type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /></label></div><button className="dark-action restaurant-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : selectedId ? 'Update category' : 'Create category'} <span aria-hidden="true">↗</span></button></form>}{isLoading ? <p className="dashboard-subtitle">Loading categories...</p> : !restaurantId ? <div className="owner-empty-state"><h2>Create a restaurant first</h2><p>Categories belong to a restaurant. Add a restaurant before organizing its menu.</p></div> : categories.length === 0 ? <div className="owner-empty-state"><h2>No categories yet</h2><p>Create your first category for this restaurant.</p><button className="dark-action" type="button" onClick={openNew}>Create category <span aria-hidden="true">+</span></button></div> : <div className="category-table-wrap"><table className="category-table"><thead><tr><th>Name</th><th>Description</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id}><td>{category.name}</td><td>{category.description || '-'}</td><td>{category.display_order}</td><td><span className="profile-status">{category.is_active ? 'Active' : 'Inactive'}</span></td><td><div className="restaurant-list-actions"><button className="text-action" type="button" onClick={() => openEdit(category)}>Edit</button><button className="danger-action" type="button" onClick={() => handleDelete(category)}>Delete</button></div></td></tr>)}</tbody></table></div>}</section>
}

export default CategoryManager
