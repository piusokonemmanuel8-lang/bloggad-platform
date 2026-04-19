import { useEffect, useMemo, useState } from 'react';
import {
  MenuSquare,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  FolderKanban,
  Home,
  LayoutPanelTop,
  Smartphone,
  Rows3,
  Trash2,
  Save,
} from 'lucide-react';
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

function getLocationIcon(location = '') {
  const value = String(location).toLowerCase();
  if (value === 'header') return LayoutPanelTop;
  if (value === 'mobile') return Smartphone;
  if (value === 'sidebar') return Rows3;
  return MenuSquare;
}

function getTypeIcon(type = '') {
  const value = String(type).toLowerCase();
  if (value === 'category') return FolderKanban;
  if (value === 'home') return Home;
  return LinkIcon;
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
  const [refreshing, setRefreshing] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);
  const [savingItems, setSavingItems] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [menusRes, categoriesRes] = await Promise.all([
        api.get('/api/affiliate/menus'),
        api.get('/api/public/categories'),
      ]);

      const fetchedMenus = menusRes?.data?.menus || [];
      const fetchedCategories = categoriesRes?.data?.categories || [];

      setMenus(fetchedMenus);
      setCategories(fetchedCategories);

      if (!selectedMenuId && fetchedMenus.length) {
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
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
        if (value === 'home' || value === 'page') {
          next[index].linked_category_id = '';
          next[index].custom_url = '';
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
    } else if (!fetchedMenus.length) {
      handleCreateNewMenu();
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

  const selectedMenuStats = useMemo(() => {
    return {
      totalMenus: menus.length,
      totalItems: menuItems.length,
    };
  }, [menus.length, menuItems.length]);

  if (loading) {
    return (
      <div className="affiliate-menus-page">
        <style>{styles}</style>

        <div className="affiliate-menus-loading-wrap">
          <div className="affiliate-menus-loading-card">
            <div className="affiliate-menus-spinner" />
            <p>Loading menus...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-menus-page">
      <style>{styles}</style>

      <section className="affiliate-menus-hero">
        <div className="affiliate-menus-hero-copy">
          <div className="affiliate-menus-badge">Navigation builder</div>
          <h1 className="affiliate-menus-title">Menus</h1>
          <p className="affiliate-menus-subtitle">
            Build your storefront menus and control where each item links across header, footer,
            sidebar, and mobile areas.
          </p>
        </div>

        <div className="affiliate-menus-hero-actions">
          <button
            className="affiliate-menus-btn secondary"
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button className="affiliate-menus-btn primary" type="button" onClick={handleCreateNewMenu}>
            <Plus size={16} />
            New Menu
          </button>
        </div>
      </section>

      <section className="affiliate-menus-stats">
        <div className="affiliate-menus-stat-card">
          <span>Total Menus</span>
          <strong>{selectedMenuStats.totalMenus}</strong>
        </div>

        <div className="affiliate-menus-stat-card">
          <span>Items In Editor</span>
          <strong>{selectedMenuStats.totalItems}</strong>
        </div>

        <div className="affiliate-menus-stat-card">
          <span>Current Location</span>
          <strong>{menuForm.location || '-'}</strong>
        </div>
      </section>

      <section className="affiliate-menus-grid">
        <div className="affiliate-menus-panel">
          <div className="affiliate-menus-panel-head">
            <div>
              <p className="affiliate-menus-panel-kicker">Menu list</p>
              <h2 className="affiliate-menus-panel-title">Existing Menus</h2>
            </div>
          </div>

          {menus.length ? (
            <div className="affiliate-menus-list">
              {menus.map((menu) => {
                const active = String(selectedMenuId) === String(menu.id);
                const LocationIcon = getLocationIcon(menu.location);

                return (
                  <button
                    key={menu.id}
                    type="button"
                    className={`affiliate-menus-list-card${active ? ' active' : ''}`}
                    onClick={() => handleSelectMenu(menu)}
                  >
                    <div className="affiliate-menus-list-icon">
                      <LocationIcon size={18} />
                    </div>

                    <div className="affiliate-menus-list-main">
                      <h3>{menu.name}</h3>
                      <p>
                        {menu.location} • {menu.items?.length || 0} item(s)
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="affiliate-menus-empty-small">
              <MenuSquare size={24} />
              <p>No menus yet.</p>
            </div>
          )}
        </div>

        <div className="affiliate-menus-side-stack">
          <div className="affiliate-menus-panel">
            <div className="affiliate-menus-panel-head">
              <div>
                <p className="affiliate-menus-panel-kicker">Menu details</p>
                <h2 className="affiliate-menus-panel-title">
                  {selectedMenuId ? 'Edit Menu' : 'Create Menu'}
                </h2>
              </div>
            </div>

            <form className="affiliate-menus-form" onSubmit={handleCreateOrUpdateMenu}>
              <div className="affiliate-menus-form-grid">
                <label className="affiliate-menus-field">
                  <span className="affiliate-menus-label">Menu name</span>
                  <input
                    className="affiliate-menus-input"
                    name="name"
                    placeholder="Menu name"
                    value={menuForm.name}
                    onChange={handleMenuFormChange}
                  />
                </label>

                <label className="affiliate-menus-field">
                  <span className="affiliate-menus-label">Location</span>
                  <select
                    className="affiliate-menus-input"
                    name="location"
                    value={menuForm.location}
                    onChange={handleMenuFormChange}
                  >
                    <option value="header">Header</option>
                    <option value="footer">Footer</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </label>
              </div>

              <div className="affiliate-menus-actions">
                <button className="affiliate-menus-btn primary" type="submit" disabled={savingMenu}>
                  <Save size={16} />
                  {savingMenu ? 'Saving...' : selectedMenuId ? 'Update Menu' : 'Create Menu'}
                </button>
              </div>
            </form>
          </div>

          <div className="affiliate-menus-panel">
            <div className="affiliate-menus-panel-head">
              <div>
                <p className="affiliate-menus-panel-kicker">Menu items</p>
                <h2 className="affiliate-menus-panel-title">Build Items</h2>
              </div>
            </div>

            <div className="affiliate-menus-items-list">
              {menuItems.map((item, index) => {
                const ItemIcon = getTypeIcon(item.type);

                return (
                  <div key={index} className="affiliate-menus-item-card">
                    <div className="affiliate-menus-item-top">
                      <div className="affiliate-menus-item-badge">
                        <ItemIcon size={15} />
                        Item {index + 1}
                      </div>

                      <button
                        className="affiliate-menus-icon-btn"
                        type="button"
                        onClick={() => removeMenuItem(index)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="affiliate-menus-form-grid single-gap">
                      <label className="affiliate-menus-field">
                        <span className="affiliate-menus-label">Label</span>
                        <input
                          className="affiliate-menus-input"
                          placeholder="Label"
                          value={item.label}
                          onChange={(e) => handleMenuItemChange(index, 'label', e.target.value)}
                        />
                      </label>

                      <label className="affiliate-menus-field">
                        <span className="affiliate-menus-label">Type</span>
                        <select
                          className="affiliate-menus-input"
                          value={item.type}
                          onChange={(e) => handleMenuItemChange(index, 'type', e.target.value)}
                        >
                          <option value="custom">Custom Link</option>
                          <option value="category">Category</option>
                          <option value="home">Home</option>
                          <option value="page">Page</option>
                        </select>
                      </label>

                      {item.type === 'category' ? (
                        <label className="affiliate-menus-field full-width">
                          <span className="affiliate-menus-label">Category</span>
                          <select
                            className="affiliate-menus-input"
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
                        </label>
                      ) : null}

                      {item.type === 'custom' ? (
                        <label className="affiliate-menus-field full-width">
                          <span className="affiliate-menus-label">Custom URL</span>
                          <input
                            className="affiliate-menus-input"
                            placeholder="Custom URL (must be supgad.com)"
                            value={item.custom_url}
                            onChange={(e) => handleMenuItemChange(index, 'custom_url', e.target.value)}
                          />
                          <small className="affiliate-menus-help">
                            Only supgad.com links are allowed.
                          </small>
                        </label>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="affiliate-menus-actions">
              <button className="affiliate-menus-btn secondary" type="button" onClick={addMenuItem}>
                <Plus size={16} />
                Add Item
              </button>

              <button
                className="affiliate-menus-btn primary"
                type="button"
                onClick={handleSaveItems}
                disabled={savingItems}
              >
                <Save size={16} />
                {savingItems ? 'Saving...' : 'Save Menu Items'}
              </button>
            </div>

            {error ? (
              <div className="affiliate-menus-alert error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div className="affiliate-menus-alert success">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .affiliate-menus-page {
    width: 100%;
  }

  .affiliate-menus-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-menus-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-menus-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateMenusSpin 0.8s linear infinite;
  }

  @keyframes affiliateMenusSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliateMenusSpin 0.8s linear infinite;
  }

  .affiliate-menus-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
    margin-bottom: 20px;
  }

  .affiliate-menus-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .affiliate-menus-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-menus-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-menus-hero-actions,
  .affiliate-menus-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-menus-btn {
    height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 14px;
    font-weight: 800;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .affiliate-menus-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-menus-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-menus-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .affiliate-menus-stat-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-menus-stat-card span {
    color: #6b7280;
    font-size: 13px;
    font-weight: 700;
  }

  .affiliate-menus-stat-card strong {
    color: #111827;
    font-size: 26px;
    font-weight: 900;
    text-transform: capitalize;
  }

  .affiliate-menus-grid {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.25fr);
    gap: 20px;
  }

  .affiliate-menus-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-menus-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-menus-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-menus-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-menus-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-menus-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-menus-list-card {
    width: 100%;
    padding: 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    cursor: pointer;
    text-align: left;
    transition: 0.2s ease;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .affiliate-menus-list-card.active {
    border-color: #111827;
    background: #ffffff;
    box-shadow: inset 0 0 0 1px #111827;
  }

  .affiliate-menus-list-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    display: grid;
    place-items: center;
    color: #111827;
    flex-shrink: 0;
  }

  .affiliate-menus-list-main h3 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-menus-list-main p {
    margin: 0;
    color: #6b7280;
    font-size: 13px;
    text-transform: capitalize;
  }

  .affiliate-menus-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-menus-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .affiliate-menus-form-grid.single-gap {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .affiliate-menus-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-menus-field.full-width {
    grid-column: span 2;
  }

  .affiliate-menus-label {
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-menus-input {
    width: 100%;
    min-height: 50px;
    border-radius: 16px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    padding: 0 14px;
    font-size: 14px;
    color: #111827;
    outline: none;
    transition: 0.2s ease;
  }

  .affiliate-menus-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .affiliate-menus-help {
    color: #6b7280;
    font-size: 12px;
    line-height: 1.5;
  }

  .affiliate-menus-items-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 16px;
  }

  .affiliate-menus-item-card {
    padding: 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
  }

  .affiliate-menus-item-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .affiliate-menus-item-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    color: #111827;
    font-size: 12px;
    font-weight: 800;
  }

  .affiliate-menus-icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #111827;
    display: grid;
    place-items: center;
    cursor: pointer;
  }

  .affiliate-menus-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    margin-top: 16px;
  }

  .affiliate-menus-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-menus-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-menus-empty-small {
    min-height: 180px;
    border: 1px dashed #dbe2ea;
    background: #f8fafc;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    padding: 22px;
  }

  .affiliate-menus-empty-small p {
    margin: 0;
    color: #111827;
    font-weight: 800;
  }

  @media (max-width: 1100px) {
    .affiliate-menus-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-menus-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-menus-title {
      font-size: 26px;
    }

    .affiliate-menus-stats {
      grid-template-columns: 1fr;
    }

    .affiliate-menus-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-menus-title {
      font-size: 22px;
    }

    .affiliate-menus-subtitle {
      font-size: 14px;
    }

    .affiliate-menus-hero-actions,
    .affiliate-menus-actions,
    .affiliate-menus-form-grid,
    .affiliate-menus-form-grid.single-gap {
      flex-direction: column;
      grid-template-columns: 1fr;
      align-items: stretch;
    }

    .affiliate-menus-field.full-width {
      grid-column: span 1;
    }

    .affiliate-menus-btn {
      width: 100%;
    }

    .affiliate-menus-list-card,
    .affiliate-menus-item-top {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;