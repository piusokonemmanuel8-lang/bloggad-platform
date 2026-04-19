import { useEffect, useState } from 'react';
import api from '../../api/axios';
import validateSupgadUrl from '../../utils/validateSupgadUrl';

function createEmptyMenuItem(sortOrder = 1) {
  return {
    label: '',
    type: 'custom',
    linked_category_id: '',
    custom_url: '',
    sort_order: sortOrder,
  };
}

export default function AffiliateMenusPage() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [menuForm, setMenuForm] = useState({
    name: '',
    location: 'header',
  });
  const [menuItems, setMenuItems] = useState([createEmptyMenuItem(1)]);

  const [loading, setLoading] = useState(true);
  const [savingMenu, setSavingMenu] = useState(false);
  const [savingItems, setSavingItems] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [menusRes, categoriesRes] = await Promise.all([
          api.get('/api/affiliate/menus'),
          api.get('/api/public/categories'),
        ]);

        const fetchedMenus = menusRes?.data?.menus || [];
        const fetchedCategories = categoriesRes?.data?.categories || [];

        setMenus(fetchedMenus);
        setCategories(fetchedCategories);

        if (fetchedMenus.length) {
          const firstMenu = fetchedMenus[0];
          setSelectedMenuId(String(firstMenu.id));
          setMenuForm({
            name: firstMenu.name || '',
            location: firstMenu.location || 'header',
          });
          setMenuItems(
            firstMenu.items?.length
              ? firstMenu.items.map((item, idx) => ({
                  label: item.label || '',
                  type: item.type || 'custom',
                  linked_category_id: item.linked_category_id || '',
                  custom_url: item.custom_url || '',
                  sort_order: item.sort_order || idx + 1,
                }))
              : [createEmptyMenuItem(1)]
          );
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load menus');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMenuFormChange = (event) => {
    const { name, value } = event.target;
    setMenuForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectMenu = (menu) => {
    setSelectedMenuId(String(menu.id));
    setMenuForm({
      name: menu.name || '',
      location: menu.location || 'header',
    });
    setMenuItems(
      menu.items?.length
        ? menu.items.map((item, idx) => ({
            label: item.label || '',
            type: item.type || 'custom',
            linked_category_id: item.linked_category_id || '',
            custom_url: item.custom_url || '',
            sort_order: item.sort_order || idx + 1,
          }))
        : [createEmptyMenuItem(1)]
    );
    setError('');
    setSuccess('');
  };

  const handleMenuItemChange = (index, key, value) => {
    setMenuItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [key]: value,
      };

      if (key === 'type') {
        if (value === 'category') {
          next[index].custom_url = '';
        }
        if (value === 'custom') {
          next[index].linked_category_id = '';
        }
      }

      return next;
    });
  };

  const addMenuItem = () => {
    setMenuItems((prev) => [...prev, createEmptyMenuItem(prev.length + 1)]);
  };

  const removeMenuItem = (index) => {
    setMenuItems((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (!filtered.length) return [createEmptyMenuItem(1)];

      return filtered.map((item, idx) => ({
        ...item,
        sort_order: idx + 1,
      }));
    });
  };

  const refreshMenus = async (nextSelectedId = null) => {
    const { data } = await api.get('/api/affiliate/menus');
    const fetchedMenus = data?.menus || [];
    setMenus(fetchedMenus);

    const targetId = nextSelectedId || selectedMenuId;
    const matched = fetchedMenus.find((menu) => String(menu.id) === String(targetId));

    if (matched) {
      handleSelectMenu(matched);
    }
  };

  const handleCreateOrUpdateMenu = async (event) => {
    event.preventDefault();
    setSavingMenu(true);
    setError('');
    setSuccess('');

    try {
      if (!menuForm.name.trim()) {
        throw new Error('Menu name is required');
      }

      let response;

      if (selectedMenuId) {
        response = await api.put(`/api/affiliate/menus/${selectedMenuId}`, menuForm);
      } else {
        response = await api.post('/api/affiliate/menus', menuForm);
      }

      const savedMenu = response?.data?.menu;

      if (savedMenu?.id) {
        await refreshMenus(String(savedMenu.id));
        setSelectedMenuId(String(savedMenu.id));
      }

      setSuccess(response?.data?.message || 'Menu saved successfully');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save menu');
    } finally {
      setSavingMenu(false);
    }
  };

  const validateItems = () => {
    for (const item of menuItems) {
      if (!String(item.label || '').trim()) {
        throw new Error('Every menu item must have a label');
      }

      if (item.type === 'category' && !item.linked_category_id) {
        throw new Error(`Category is required for "${item.label}"`);
      }

      if (item.type === 'custom') {
        if (!String(item.custom_url || '').trim()) {
          throw new Error(`Custom URL is required for "${item.label}"`);
        }

        const validation = validateSupgadUrl(item.custom_url, {
          required: true,
          allowEmpty: false,
          fieldName: `Menu item URL (${item.label})`,
        });

        if (!validation.ok) {
          throw new Error(validation.message);
        }
      }
    }
  };

  const handleSaveItems = async () => {
    setSavingItems(true);
    setError('');
    setSuccess('');

    try {
      if (!selectedMenuId) {
        throw new Error('Create or select a menu first');
      }

      validateItems();

      const payload = {
        items: menuItems.map((item, idx) => ({
          label: item.label,
          type: item.type,
          linked_category_id: item.type === 'category' ? Number(item.linked_category_id) : null,
          custom_url: item.type === 'custom' ? item.custom_url : null,
          sort_order: idx + 1,
        })),
      };

      const { data } = await api.put(`/api/affiliate/menus/${selectedMenuId}/items`, payload);

      await refreshMenus(selectedMenuId);
      setSuccess(data?.message || 'Menu items saved successfully');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save menu items');
    } finally {
      setSavingItems(false);
    }
  };

  const handleCreateNewMenu = () => {
    setSelectedMenuId('');
    setMenuForm({
      name: '',
      location: 'header',
    });
    setMenuItems([createEmptyMenuItem(1)]);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading menus...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Menus</h1>
          <p className="page-subtitle">
            Build your storefront menus and control where each item links.
          </p>
        </div>

        <div className="grid-2">
          <div className="surface-card surface-card-padding">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <h2 className="section-title" style={{ margin: 0 }}>
                Menu List
              </h2>

              <button className="btn btn-primary" type="button" onClick={handleCreateNewMenu}>
                New Menu
              </button>
            </div>

            <div className="form-stack">
              {menus.length ? (
                menus.map((menu) => (
                  <button
                    key={menu.id}
                    type="button"
                    className="surface-card surface-card-padding"
                    onClick={() => handleSelectMenu(menu)}
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      border:
                        String(selectedMenuId) === String(menu.id)
                          ? '1px solid rgba(122, 92, 255, 0.9)'
                          : '1px solid rgba(255,255,255,0.08)',
                      background:
                        String(selectedMenuId) === String(menu.id)
                          ? 'rgba(122, 92, 255, 0.12)'
                          : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{menu.name}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Location: {menu.location}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Items: {menu.items?.length || 0}
                    </div>
                  </button>
                ))
              ) : (
                <div>No menus yet.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Menu Details</h2>

            <form className="form-stack" onSubmit={handleCreateOrUpdateMenu}>
              <input
                className="input-control"
                name="name"
                placeholder="Menu name"
                value={menuForm.name}
                onChange={handleMenuFormChange}
              />

              <select
                className="input-control"
                name="location"
                value={menuForm.location}
                onChange={handleMenuFormChange}
              >
                <option value="header">Header</option>
                <option value="footer">Footer</option>
                <option value="sidebar">Sidebar</option>
                <option value="mobile">Mobile</option>
              </select>

              <button className="btn btn-primary" type="submit" disabled={savingMenu}>
                {savingMenu ? 'Saving...' : selectedMenuId ? 'Update Menu' : 'Create Menu'}
              </button>
            </form>

            <div className="surface-card surface-card-padding" style={{ marginTop: 20 }}>
              <h2 className="section-title">Menu Items</h2>

              <div className="form-stack">
                {menuItems.map((item, index) => (
                  <div key={index} className="surface-card surface-card-padding">
                    <div className="form-stack">
                      <input
                        className="input-control"
                        placeholder="Label"
                        value={item.label}
                        onChange={(e) => handleMenuItemChange(index, 'label', e.target.value)}
                      />

                      <select
                        className="input-control"
                        value={item.type}
                        onChange={(e) => handleMenuItemChange(index, 'type', e.target.value)}
                      >
                        <option value="custom">Custom Link</option>
                        <option value="category">Category</option>
                        <option value="home">Home</option>
                        <option value="page">Page</option>
                      </select>

                      {item.type === 'category' ? (
                        <select
                          className="input-control"
                          value={item.linked_category_id}
                          onChange={(e) =>
                            handleMenuItemChange(index, 'linked_category_id', e.target.value)
                          }
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      ) : null}

                      {item.type === 'custom' ? (
                        <input
                          className="input-control"
                          placeholder="Custom URL (must be supgad.com)"
                          value={item.custom_url}
                          onChange={(e) =>
                            handleMenuItemChange(index, 'custom_url', e.target.value)
                          }
                        />
                      ) : null}

                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => removeMenuItem(index)}
                      >
                        Remove Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                <button className="btn btn-secondary" type="button" onClick={addMenuItem}>
                  Add Item
                </button>

                <button className="btn btn-primary" type="button" onClick={handleSaveItems} disabled={savingItems}>
                  {savingItems ? 'Saving...' : 'Save Menu Items'}
                </button>
              </div>
            </div>

            {error ? (
              <div
                style={{
                  marginTop: 16,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(255, 80, 80, 0.12)',
                  border: '1px solid rgba(255, 80, 80, 0.22)',
                }}
              >
                {error}
              </div>
            ) : null}

            {success ? (
              <div
                style={{
                  marginTop: 16,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(80, 200, 120, 0.12)',
                  border: '1px solid rgba(80, 200, 120, 0.22)',
                }}
              >
                {success}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}