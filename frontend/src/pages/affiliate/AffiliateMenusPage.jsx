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

function formatType(type = '') {
  const value = String(type).toLowerCase();
  if (value === 'custom') return 'Custom Link';
  if (value === 'category') return 'Category';
  if (value === 'home') return 'Home';
  if (value === 'page') return 'Page';
  return value || 'Item';
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

  const isWriterRoute =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/writer/');

  const fetchData = async (isRefresh = false) => {
    try {
      setError('');

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

  const commandName = menuForm.name.trim() || (selectedMenuId ? 'Selected Menu' : 'New Menu');

  if (loading) {
    return (
      <div className="writer-menus-page">
        <style>{styles}</style>
        {isWriterRoute ? <div className="writer-menus-mobile-title">Menus</div> : null}
        <div className="writer-menus-loading">
          <div className="writer-menus-spinner" />
          <span>Loading menus...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="writer-menus-page">
      <style>{styles}</style>

      {isWriterRoute ? <div className="writer-menus-mobile-title">Menus</div> : null}

      <section className="writer-menus-command">
        <div className="writer-menus-command-copy">
          <strong>{commandName}</strong>
          <span>{menuForm.location || 'header'}</span>
        </div>

        <div className="writer-menus-command-actions">
          <button
            className="writer-menus-btn secondary"
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw size={15} className={refreshing ? 'writer-menus-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            className="writer-menus-btn primary"
            type="button"
            onClick={handleCreateNewMenu}
          >
            <Plus size={15} />
            New Menu
          </button>
        </div>
      </section>

      {error ? (
        <div className="writer-menus-alert error">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? (
        <div className="writer-menus-alert success">
          <CheckCircle2 size={17} />
          <span>{success}</span>
        </div>
      ) : null}

      <section className="writer-menus-stats">
        <div className="writer-menus-stat">
          <span>Total menus</span>
          <strong>{selectedMenuStats.totalMenus}</strong>
        </div>

        <div className="writer-menus-stat">
          <span>Items in editor</span>
          <strong>{selectedMenuStats.totalItems}</strong>
        </div>

        <div className="writer-menus-stat">
          <span>Current location</span>
          <strong className="location">{menuForm.location || '-'}</strong>
        </div>
      </section>

      <section className="writer-menus-workspace">
        <div className="writer-menus-list-panel">
          <div className="writer-menus-panel-head">
            <strong>Existing menus</strong>
            <span>{menus.length} total</span>
          </div>

          {menus.length ? (
            <div className="writer-menus-menu-list">
              {menus.map((menu) => {
                const active = String(selectedMenuId) === String(menu.id);
                const LocationIcon = getLocationIcon(menu.location);

                return (
                  <button
                    key={menu.id}
                    type="button"
                    className={`writer-menus-menu-card${active ? ' active' : ''}`}
                    onClick={() => handleSelectMenu(menu)}
                  >
                    <div className="writer-menus-menu-icon">
                      <LocationIcon size={16} />
                    </div>

                    <div className="writer-menus-menu-copy">
                      <strong>{menu.name}</strong>
                      <span>
                        {menu.location || 'header'} - {menu.items?.length || 0} items
                      </span>
                    </div>

                    {active ? <span className="writer-menus-selected">Selected</span> : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="writer-menus-empty">
              <MenuSquare size={22} />
              <strong>No menus yet.</strong>
              <span>Create your first menu to begin.</span>
            </div>
          )}

          {menus.length ? (
            <p className="writer-menus-list-note">Select a menu to edit its details and items.</p>
          ) : null}
        </div>

        <div className="writer-menus-editor">
          <section className="writer-menus-panel writer-menus-details">
            <div className="writer-menus-panel-head">
              <strong>Menu details</strong>
              <span>{selectedMenuId ? 'Editing' : 'New'}</span>
            </div>

            <form className="writer-menus-form" onSubmit={handleCreateOrUpdateMenu}>
              <div className="writer-menus-form-grid">
                <label className="writer-menus-field">
                  <span>Menu name</span>
                  <input
                    className="writer-menus-control"
                    name="name"
                    placeholder="Menu name"
                    value={menuForm.name}
                    onChange={handleMenuFormChange}
                  />
                </label>

                <label className="writer-menus-field">
                  <span>Location</span>
                  <select
                    className="writer-menus-control"
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

              <div className="writer-menus-form-actions">
                <button
                  className="writer-menus-btn primary"
                  type="submit"
                  disabled={savingMenu}
                >
                  <Save size={15} />
                  {savingMenu ? 'Saving...' : selectedMenuId ? 'Update Menu' : 'Create Menu'}
                </button>
              </div>
            </form>
          </section>

          <section className="writer-menus-panel writer-menus-items-panel">
            <div className="writer-menus-panel-head">
              <strong>Build items</strong>
              <span>{menuItems.length} items</span>
            </div>

            <div className="writer-menus-items-list">
              {menuItems.map((item, index) => {
                const ItemIcon = getTypeIcon(item.type);

                return (
                  <div key={index} className="writer-menus-item-card">
                    <div className="writer-menus-item-head">
                      <span className="writer-menus-item-badge">
                        <ItemIcon size={13} />
                        Item {index + 1}
                      </span>

                      <button
                        className="writer-menus-btn secondary compact"
                        type="button"
                        onClick={() => removeMenuItem(index)}
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>

                    <div className="writer-menus-form-grid item-grid">
                      <label className="writer-menus-field">
                        <span>Label</span>
                        <input
                          className="writer-menus-control"
                          placeholder="Label"
                          value={item.label}
                          onChange={(event) =>
                            handleMenuItemChange(index, 'label', event.target.value)
                          }
                        />
                      </label>

                      <label className="writer-menus-field">
                        <span>Type</span>
                        <select
                          className="writer-menus-control"
                          value={item.type}
                          onChange={(event) =>
                            handleMenuItemChange(index, 'type', event.target.value)
                          }
                        >
                          <option value="custom">Custom Link</option>
                          <option value="category">Category</option>
                          <option value="home">Home</option>
                          <option value="page">Page</option>
                        </select>
                      </label>

                      {item.type === 'category' ? (
                        <label className="writer-menus-field full">
                          <span>Category</span>
                          <select
                            className="writer-menus-control"
                            value={item.linked_category_id}
                            onChange={(event) =>
                              handleMenuItemChange(
                                index,
                                'linked_category_id',
                                event.target.value
                              )
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
                        <label className="writer-menus-field full">
                          <span>Custom URL</span>
                          <input
                            className="writer-menus-control"
                            placeholder="https://example.com/page"
                            value={item.custom_url}
                            onChange={(event) =>
                              handleMenuItemChange(index, 'custom_url', event.target.value)
                            }
                          />
                          <small>
                            External links are allowed and checked by Bloggad on save.
                          </small>
                        </label>
                      ) : null}

                      {item.type === 'home' || item.type === 'page' ? (
                        <div className="writer-menus-type-note full">
                          <span>{formatType(item.type)}</span>
                          <small>No additional destination field is required for this item type.</small>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="writer-menus-item-actions">
              <button
                className="writer-menus-btn secondary"
                type="button"
                onClick={addMenuItem}
              >
                <Plus size={15} />
                Add Item
              </button>

              <button
                className="writer-menus-btn primary save-items"
                type="button"
                onClick={handleSaveItems}
                disabled={savingItems}
              >
                <Save size={15} />
                {savingItems ? 'Saving...' : 'Save Menu Items'}
              </button>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .writer-menus-page {
    width: 100%;
    color: #111827;
    font-family: inherit;
    padding: 18px 30px 34px;
  }

  .writer-menus-mobile-title {
    display: none;
  }

  .writer-menus-command,
  .writer-menus-stat,
  .writer-menus-list-panel,
  .writer-menus-panel,
  .writer-menus-alert {
    background: #ffffff;
    border: 1px solid #dde3ea;
  }

  .writer-menus-command {
    min-height: 58px;
    border-radius: 14px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .writer-menus-command-copy {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .writer-menus-command-copy strong {
    font-size: 13px;
    line-height: 1.3;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .writer-menus-command-copy span,
  .writer-menus-panel-head span,
  .writer-menus-selected,
  .writer-menus-item-badge {
    min-height: 24px;
    border: 1px solid #e2e7ec;
    background: #f7f8fa;
    border-radius: 999px;
    padding: 0 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #667085;
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
    text-transform: capitalize;
    flex-shrink: 0;
  }

  .writer-menus-command-actions,
  .writer-menus-form-actions,
  .writer-menus-item-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-menus-btn {
    min-height: 38px;
    border-radius: 9px;
    padding: 0 14px;
    border: 1px solid #d5dce4;
    background: #ffffff;
    color: #161b22;
    font: inherit;
    font-size: 12px;
    font-weight: 650;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    cursor: pointer;
    white-space: nowrap;
  }

  .writer-menus-btn.primary {
    background: #1f2328;
    border-color: #1f2328;
    color: #ffffff;
  }

  .writer-menus-btn.compact {
    min-height: 34px;
    padding: 0 12px;
    font-size: 11px;
  }

  .writer-menus-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .writer-menus-alert {
    margin-top: 10px;
    min-height: 44px;
    border-radius: 11px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 12px;
    font-weight: 600;
  }

  .writer-menus-alert.error {
    border-color: #f2c5b7;
    background: #fff8f5;
    color: #8f2d18;
  }

  .writer-menus-alert.success {
    border-color: #b8e3c8;
    background: #f5fbf7;
    color: #17663a;
  }

  .writer-menus-stats {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-menus-stat {
    min-height: 82px;
    border-radius: 14px;
    padding: 15px 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
  }

  .writer-menus-stat span {
    color: #667085;
    font-size: 11px;
    font-weight: 500;
  }

  .writer-menus-stat strong {
    font-size: 23px;
    line-height: 1.1;
    font-weight: 750;
  }

  .writer-menus-stat strong.location {
    font-size: 18px;
    text-transform: capitalize;
  }

  .writer-menus-workspace {
    margin-top: 12px;
    display: grid;
    grid-template-columns: 330px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
  }

  .writer-menus-list-panel,
  .writer-menus-panel {
    border-radius: 14px;
    padding: 14px;
    min-width: 0;
  }

  .writer-menus-editor {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .writer-menus-panel-head {
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
  }

  .writer-menus-panel-head strong {
    font-size: 13px;
    font-weight: 700;
  }

  .writer-menus-menu-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .writer-menus-menu-card {
    width: 100%;
    min-height: 62px;
    padding: 9px 10px;
    border-radius: 11px;
    border: 1px solid #e1e6ec;
    background: #f7f8fa;
    color: #111827;
    font: inherit;
    cursor: pointer;
    text-align: left;
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) auto;
    gap: 9px;
    align-items: center;
  }

  .writer-menus-menu-card.active {
    border-color: #1f2328;
    background: #ffffff;
    box-shadow: inset 0 0 0 1px #1f2328;
  }

  .writer-menus-menu-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    border: 1px solid #e2e7ec;
    background: #ffffff;
    display: grid;
    place-items: center;
  }

  .writer-menus-menu-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .writer-menus-menu-copy strong {
    font-size: 12px;
    font-weight: 700;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .writer-menus-menu-copy span,
  .writer-menus-list-note,
  .writer-menus-field small,
  .writer-menus-type-note small {
    color: #7b8491;
    font-size: 10px;
    line-height: 1.45;
  }

  .writer-menus-list-note {
    margin: 12px 0 0;
  }

  .writer-menus-empty {
    min-height: 150px;
    border: 1px dashed #d5dce4;
    background: #f8f9fb;
    border-radius: 11px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-align: center;
    padding: 18px;
  }

  .writer-menus-empty strong {
    font-size: 12px;
  }

  .writer-menus-empty span {
    color: #7b8491;
    font-size: 10px;
  }

  .writer-menus-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .writer-menus-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .writer-menus-field {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .writer-menus-field.full,
  .writer-menus-type-note.full {
    grid-column: 1 / -1;
  }

  .writer-menus-field > span,
  .writer-menus-type-note > span {
    color: #667085;
    font-size: 9px;
    line-height: 1.2;
    font-weight: 700;
    text-transform: uppercase;
  }

  .writer-menus-control {
    width: 100%;
    min-width: 0;
    height: 42px;
    border-radius: 9px;
    border: 1px solid #ccd5df;
    background: #ffffff;
    color: #111827;
    padding: 0 11px;
    outline: none;
    font: inherit;
    font-size: 12px;
  }

  .writer-menus-control:focus {
    border-color: #667085;
    box-shadow: 0 0 0 2px rgba(31, 35, 40, 0.08);
  }

  .writer-menus-items-panel {
    padding-bottom: 16px;
  }

  .writer-menus-items-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .writer-menus-item-card {
    border: 1px solid #e1e6ec;
    background: #f7f8fa;
    border-radius: 11px;
    padding: 10px;
  }

  .writer-menus-item-head {
    min-height: 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
  }

  .writer-menus-item-badge {
    gap: 5px;
  }

  .writer-menus-type-note {
    min-height: 42px;
    border: 1px dashed #d7dee6;
    border-radius: 9px;
    background: #ffffff;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
  }

  .writer-menus-item-actions {
    margin-top: 10px;
    justify-content: space-between;
  }

  .writer-menus-btn.save-items {
    min-width: 160px;
  }

  .writer-menus-loading {
    min-height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #667085;
    font-size: 12px;
  }

  .writer-menus-spinner {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid #dde3ea;
    border-top-color: #1f2328;
    animation: writerMenusSpin 0.8s linear infinite;
  }

  .writer-menus-spin {
    animation: writerMenusSpin 0.8s linear infinite;
  }

  @keyframes writerMenusSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1100px) {
    .writer-menus-page {
      padding-left: 18px;
      padding-right: 18px;
    }

    .writer-menus-workspace {
      grid-template-columns: 280px minmax(0, 1fr);
    }
  }

  @media (max-width: 900px) {
    .writer-menus-workspace {
      grid-template-columns: 1fr;
    }

    .writer-menus-menu-list {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 767px) {
    .writer-menus-page {
      width: 100%;
      max-width: none;
      min-width: 0;
      padding: 0 0 24px;
      margin: 0;
    }

    .writer-menus-command,
    .writer-menus-stats,
    .writer-menus-workspace,
    .writer-menus-list-panel,
    .writer-menus-editor,
    .writer-menus-panel,
    .writer-menus-items-panel,
    .writer-menus-items-list,
    .writer-menus-item-card {
      width: 100%;
      max-width: none;
      min-width: 0;
    }

    .writer-menus-mobile-title {
      min-height: 50px;
      margin-bottom: 10px;
      border: 1px solid #dde3ea;
      border-radius: 10px;
      background: #ffffff;
      padding: 0 12px;
      display: flex;
      align-items: center;
      font-size: 15px;
      font-weight: 700;
    }

    .writer-menus-command {
      min-height: auto;
      padding: 8px;
      align-items: stretch;
      flex-direction: column;
      gap: 8px;
    }

    .writer-menus-command-copy {
      min-height: 30px;
      justify-content: space-between;
    }

    .writer-menus-command-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .writer-menus-btn {
      min-height: 38px;
      padding: 0 10px;
      font-size: 11px;
    }

    .writer-menus-stats {
      gap: 7px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .writer-menus-stat {
      min-height: 72px;
      padding: 10px;
    }

    .writer-menus-stat span {
      font-size: 9px;
    }

    .writer-menus-stat strong {
      font-size: 20px;
    }

    .writer-menus-stat strong.location {
      font-size: 16px;
    }

    .writer-menus-workspace {
      gap: 10px;
    }

    .writer-menus-list-panel,
    .writer-menus-panel {
      padding: 10px;
      border-radius: 11px;
    }

    .writer-menus-menu-list {
      display: flex;
    }

    .writer-menus-menu-card {
      min-height: 56px;
      grid-template-columns: minmax(0, 1fr) auto;
      padding: 8px;
    }

    .writer-menus-menu-icon {
      display: none;
    }

    .writer-menus-menu-copy strong {
      font-size: 11px;
    }

    .writer-menus-menu-copy span {
      font-size: 9px;
    }

    .writer-menus-list-note {
      display: none;
    }

    .writer-menus-form-grid,
    .writer-menus-form-grid.item-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .writer-menus-field.full,
    .writer-menus-type-note.full {
      grid-column: auto;
    }

    .writer-menus-control {
      height: 40px;
      font-size: 11px;
    }

    .writer-menus-form-actions .writer-menus-btn {
      width: 100%;
    }

    .writer-menus-item-card {
      padding: 8px;
    }

    .writer-menus-item-head {
      margin-bottom: 6px;
    }

    .writer-menus-item-actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 7px;
    }

    .writer-menus-btn.save-items {
      width: 100%;
      min-width: 0;
    }
  }

  @media (max-width: 390px) {
    .writer-menus-command-copy strong {
      max-width: 210px;
    }

    .writer-menus-stat {
      padding: 9px 8px;
    }

    .writer-menus-stat strong.location {
      font-size: 15px;
    }
  }
`;