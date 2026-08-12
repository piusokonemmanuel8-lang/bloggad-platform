import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

const blank = {
  name: '',
  slug: '',
  logo_url: '',
  banner_url: '',
  bio: '',
  about_text: '',
  status: 'active',
  is_primary: false,
};

function formatUpdated(value) {
  if (!value) return 'Updated recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Updated recently';

  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return 'Updated yesterday';
  if (diffDays < 7) return `Updated ${diffDays} days ago`;
  if (diffDays < 14) return 'Updated 1 week ago';

  return `Updated ${date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })}`;
}

function pageInitial(name) {
  const value = String(name || '').trim();
  return value ? value.charAt(0).toUpperCase() : 'P';
}

export default function WriterPagesPage() {
  const [pages, setPages] = useState([]);
  const [entitlement, setEntitlement] = useState(null);
  const [storefront, setStorefront] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuId, setMenuId] = useState(null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState('');
  const [uploadingField, setUploadingField] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await api.get('/api/writer/pages');
    setPages(Array.isArray(data?.pages) ? data.pages : []);
    setEntitlement(data?.entitlement || null);
    setStorefront(data?.storefront || null);
  }

  useEffect(() => {
    let active = true;

    setLoading(true);
    load()
      .catch((err) => {
        if (active) {
          setError(err?.response?.data?.message || err.message || 'Failed to load Writer Pages.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selected = useMemo(
    () => pages.find((page) => Number(page.id) === Number(selectedId)) || null,
    [pages, selectedId]
  );

  const filteredPages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return pages.filter((page) => {
      const matchesSearch =
        !query ||
        `${page.name || ''} ${page.slug || ''}`.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' || String(page.status || 'active') === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [pages, search, statusFilter]);

  const activeCount = useMemo(
    () => pages.filter((page) => String(page.status || 'active') === 'active').length,
    [pages]
  );

  const inactiveCount = pages.length - activeCount;
  const canCreate =
    entitlement?.page_limit === null ||
    pages.length < Number(entitlement?.page_limit || 0);

  const paidWriter = !!entitlement?.paid_writer;

  function resetMessages() {
    setError('');
    setNotice('');
  }

  function openCreate() {
    if (!canCreate) return;

    resetMessages();
    setSelectedId(null);
    setMenuId(null);
    setForm({
      ...blank,
      is_primary: pages.length === 0,
    });
    setDrawerOpen(true);
  }

  function openEdit(page) {
    resetMessages();
    setSelectedId(page.id);
    setMenuId(null);
    setForm({
      name: page.name || '',
      slug: page.slug || '',
      logo_url: page.logo_url || '',
      banner_url: page.banner_url || '',
      bio: page.bio || '',
      about_text: page.about_text || '',
      status: page.status || 'active',
      is_primary: !!page.is_primary,
    });
    setDrawerOpen(true);
  }

  function closeDrawer() {
    if (busy) return;
    setDrawerOpen(false);
    setSelectedId(null);
    setForm(blank);
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function uploadPageImage(field, file) {
    if (!file) return;

    if (!String(file.type || '').toLowerCase().startsWith('image/')) {
      setError('Choose an image file.');
      return;
    }

    try {
      setUploadingField(field);
      resetMessages();

      const uploadForm = new FormData();
      uploadForm.append('image', file);

      const { data } = await api.post('/api/uploads/template-image', uploadForm, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl =
        data?.url ||
        data?.file_url ||
        data?.path ||
        data?.file?.url ||
        data?.file?.file_url ||
        '';

      if (!uploadedUrl) {
        throw new Error('Upload completed but no image URL was returned.');
      }

      updateForm(field, uploadedUrl);
      setNotice(
        field === 'logo_url'
          ? 'Logo image uploaded.'
          : 'Banner image uploaded.'
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Unable to upload this image.'
      );
    } finally {
      setUploadingField('');
    }
  }

  function preview(page) {
    if (!page?.slug) return;
    window.open(
      `/page/${encodeURIComponent(page.slug)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  async function save(event) {
    event.preventDefault();

    try {
      setBusy('save');
      resetMessages();

      const payload = {
        ...form,
        name: form.name.trim(),
        slug: form.slug.trim(),
        logo_url: form.logo_url.trim(),
        banner_url: form.banner_url.trim(),
        bio: form.bio.trim(),
        about_text: form.about_text.trim(),
      };

      const { data } = selectedId
        ? await api.put(`/api/writer/pages/${selectedId}`, payload)
        : await api.post('/api/writer/pages', payload);

      setNotice(data?.message || 'Writer Page saved.');
      await load();
      setDrawerOpen(false);
      setSelectedId(null);
      setForm(blank);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to save this Page.');
    } finally {
      setBusy('');
    }
  }

  async function makePrimary(page) {
    if (!page || page.is_primary || page.status !== 'active') return;

    try {
      setBusy(`primary-${page.id}`);
      resetMessages();
      setMenuId(null);

      const { data } = await api.put(`/api/writer/pages/${page.id}/primary`);
      setNotice(data?.message || 'Primary Writer Page updated.');
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Unable to make this Page primary.'
      );
    } finally {
      setBusy('');
    }
  }

  async function remove(page) {
    if (!page) return;

    const confirmed = window.confirm(
      'Delete this Writer Page? Posts must be moved off it first.'
    );

    if (!confirmed) return;

    try {
      setBusy(`delete-${page.id}`);
      resetMessages();
      setMenuId(null);

      const { data } = await api.delete(`/api/writer/pages/${page.id}`);
      setNotice(data?.message || 'Writer Page deleted.');
      await load();

      if (Number(selectedId) === Number(page.id)) {
        setSelectedId(null);
        setDrawerOpen(false);
        setForm(blank);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Unable to delete this Page.'
      );
    } finally {
      setBusy('');
    }
  }

  if (loading) {
    return (
      <div className="writer-pages-screen writer-pages-loading">
        <style>{writerPagesCss}</style>
        <div className="writer-pages-loading-card">
          <span className="writer-pages-spinner" />
          <strong>Loading Pages...</strong>
        </div>
      </div>
    );
  }

  return (
    <div
      className="writer-pages-screen"
      onClick={() => {
        if (menuId) setMenuId(null);
      }}
    >
      <style>{writerPagesCss}</style>

      <main className="writer-pages-main">
        <section className="writer-pages-heading">
          <div>
            <h2>Manage your pages</h2>
            <p>Create and manage the public pages where your writing is published.</p>
          </div>

          <button
            type="button"
            className="writer-pages-primary-button"
            onClick={openCreate}
            disabled={!canCreate}
            title={
              canCreate
                ? 'Create a new Page'
                : 'Your current Writer plan has reached its Page limit.'
            }
          >
            Create page
          </button>
        </section>

        <section className="writer-pages-plan-card" aria-label="Writer Page plan">
          <div>
            <strong>{pages.length} {pages.length === 1 ? 'page' : 'pages'}</strong>
            <span>
              {activeCount} active
              {inactiveCount > 0 ? `, ${inactiveCount} inactive` : ''}
            </span>
          </div>

          <div className="writer-pages-plan-copy">
            <span className={`writer-pages-plan-badge ${paidWriter ? 'paid' : 'free'}`}>
              {paidWriter ? 'Pro plan' : 'Free plan'}
            </span>
            <span>
              {entitlement?.page_limit === null
                ? 'Unlimited pages'
                : `${pages.length} of ${Number(entitlement?.page_limit || 1)} page used`}
            </span>
          </div>
        </section>

        {storefront ? (
          <div className="writer-pages-storefront-note">
            Storefront: <strong>{storefront.website_name}</strong>
          </div>
        ) : null}

        {error ? (
          <div className="writer-pages-alert error" role="alert">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="writer-pages-alert success" role="status">
            {notice}
          </div>
        ) : null}

        <section className="writer-pages-tools">
          <label className="writer-pages-search">
            <span className="writer-pages-search-dot" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search pages"
              aria-label="Search Pages"
            />
          </label>

          <select
            className="writer-pages-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter Pages by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <span className="writer-pages-result-count">
            {filteredPages.length} {filteredPages.length === 1 ? 'page' : 'pages'}
          </span>
        </section>

        <section className="writer-pages-table-card">
          <div className="writer-pages-table-head" aria-hidden="true">
            <span>Page</span>
            <span>Status</span>
            <span>Updated</span>
            <span>Actions</span>
          </div>

          {filteredPages.length ? (
            <div className="writer-pages-list">
              {filteredPages.map((page) => {
                const isPrimary = !!page.is_primary;
                const isActive = String(page.status || 'active') === 'active';
                const rowBusy =
                  busy === `primary-${page.id}` || busy === `delete-${page.id}`;

                return (
                  <article className="writer-pages-row" key={page.id}>
                    <div className="writer-pages-identity">
                      <div className="writer-pages-avatar" aria-hidden="true">
                        <span>{pageInitial(page.name)}</span>
                        {page.logo_url ? (
                          <img
                            src={page.logo_url}
                            alt=""
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                      </div>

                      <div className="writer-pages-identity-copy">
                        <strong>{page.name}</strong>
                        <span>/page/{page.slug}</span>

                        <div className="writer-pages-identity-actions">
                          {isPrimary ? (
                            <span className="writer-pages-primary-chip">Primary</span>
                          ) : isActive ? (
                            <button
                              type="button"
                              className="writer-pages-inline-action"
                              disabled={rowBusy}
                              onClick={(event) => {
                                event.stopPropagation();
                                makePrimary(page);
                              }}
                            >
                              Make primary
                            </button>
                          ) : (
                            <span className="writer-pages-inline-muted">
                              Activate to make primary
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="writer-pages-status-cell">
                      <span
                        className={`writer-pages-status ${
                          isActive ? 'active' : 'inactive'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="writer-pages-updated">
                      {formatUpdated(page.updated_at || page.created_at)}
                    </div>

                    <div className="writer-pages-actions">
                      <button
                        type="button"
                        className="writer-pages-action secondary"
                        onClick={() => preview(page)}
                      >
                        Preview
                      </button>

                      <button
                        type="button"
                        className="writer-pages-action primary"
                        onClick={() => openEdit(page)}
                      >
                        Edit
                      </button>

                      <div
                        className="writer-pages-more-wrap"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="writer-pages-action icon"
                          aria-label={`More actions for ${page.name}`}
                          aria-expanded={Number(menuId) === Number(page.id)}
                          onClick={() =>
                            setMenuId((current) =>
                              Number(current) === Number(page.id) ? null : page.id
                            )
                          }
                        >
                          ...
                        </button>

                        {Number(menuId) === Number(page.id) ? (
                          <div className="writer-pages-menu">
                            {!isPrimary ? (
                              <button
                                type="button"
                                disabled={!isActive || rowBusy}
                                onClick={() => makePrimary(page)}
                              >
                                Make primary
                              </button>
                            ) : null}

                            <button
                              type="button"
                              disabled={pages.length <= 1 || rowBusy}
                              className="danger"
                              onClick={() => remove(page)}
                            >
                              Delete page
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="writer-pages-empty">
              <strong>No Pages found</strong>
              <p>
                {search || statusFilter !== 'all'
                  ? 'Try changing your search or status filter.'
                  : 'Create your first Writer Page to begin publishing.'}
              </p>
            </div>
          )}
        </section>

        <section className="writer-pages-policy">
          <div>
            <strong>Primary page</strong>
            <span>
              One Page must always remain primary. Only active Pages can be made primary.
            </span>
          </div>

          <p>
            Deletion is blocked until posts assigned to that Page are moved elsewhere.
          </p>
        </section>
      </main>

      {drawerOpen ? (
        <div
          className="writer-pages-drawer-layer"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDrawer();
          }}
        >
          <form className="writer-pages-drawer" onSubmit={save}>
            <header className="writer-pages-drawer-head">
              <div>
                <span className="writer-pages-mobile-back">Page settings</span>
                <h2>{selected ? 'Edit page' : 'Create page'}</h2>
                <p>{selected ? selected.name : 'New Writer Page'}</p>
              </div>

              <div className="writer-pages-drawer-head-actions">
                {selected ? (
                  <button
                    type="button"
                    className="writer-pages-action secondary"
                    onClick={() => preview(selected)}
                  >
                    Preview
                  </button>
                ) : null}

                <button
                  type="button"
                  className="writer-pages-action icon close"
                  aria-label="Close Page editor"
                  onClick={closeDrawer}
                  disabled={!!busy}
                >
                  X
                </button>
              </div>
            </header>

            <div className="writer-pages-drawer-scroll">
              <section className="writer-pages-form-intro">
                <h3>Page details</h3>
                <p>
                  {selected
                    ? 'Update the page identity, public URL, appearance, and publishing status.'
                    : 'Set up the identity and public URL for this Page.'}
                </p>
              </section>

              <label className="writer-pages-field">
                <span>Page name</span>
                <input
                  value={form.name}
                  onChange={(event) => updateForm('name', event.target.value)}
                  placeholder="Page name"
                  required
                  maxLength={180}
                  autoFocus
                />
              </label>

              <label className="writer-pages-field">
                <span>Page URL</span>
                <input
                  value={form.slug}
                  onChange={(event) => updateForm('slug', event.target.value)}
                  placeholder="page-url"
                  maxLength={180}
                />
                <small>
                  Public path: /page/{form.slug.trim() || 'your-page-url'}
                </small>
              </label>

              <div className="writer-pages-field">
                <span>Logo image</span>
                <div className="writer-pages-image-control">
                  <input
                    type="text"
                    inputMode="url"
                    value={form.logo_url}
                    onChange={(event) => updateForm('logo_url', event.target.value)}
                    placeholder="Paste image URL or upload from device"
                  />
                  <label className={`writer-pages-upload-button${uploadingField === 'logo_url' ? ' busy' : ''}`}>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={!!uploadingField}
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        uploadPageImage('logo_url', file);
                        event.target.value = '';
                      }}
                    />
                    {uploadingField === 'logo_url' ? 'Uploading...' : 'Upload'}
                  </label>
                </div>
                {form.logo_url ? (
                  <div className="writer-pages-image-preview logo">
                    <img src={form.logo_url} alt="Page logo preview" />
                    <span>Logo preview</span>
                  </div>
                ) : null}
              </div>

              <div className="writer-pages-field">
                <span>Banner image</span>
                <div className="writer-pages-image-control">
                  <input
                    type="text"
                    inputMode="url"
                    value={form.banner_url}
                    onChange={(event) => updateForm('banner_url', event.target.value)}
                    placeholder="Paste image URL or upload from device"
                  />
                  <label className={`writer-pages-upload-button${uploadingField === 'banner_url' ? ' busy' : ''}`}>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={!!uploadingField}
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        uploadPageImage('banner_url', file);
                        event.target.value = '';
                      }}
                    />
                    {uploadingField === 'banner_url' ? 'Uploading...' : 'Upload'}
                  </label>
                </div>
                {form.banner_url ? (
                  <div className="writer-pages-image-preview banner">
                    <img src={form.banner_url} alt="Page banner preview" />
                    <span>Banner preview</span>
                  </div>
                ) : null}
              </div>

              <label className="writer-pages-field">
                <span>Short bio</span>
                <textarea
                  value={form.bio}
                  onChange={(event) => updateForm('bio', event.target.value)}
                  placeholder="A short description of this Page."
                  maxLength={500}
                  rows={3}
                />
              </label>

              <label className="writer-pages-field">
                <span>About</span>
                <textarea
                  value={form.about_text}
                  onChange={(event) => updateForm('about_text', event.target.value)}
                  placeholder="A longer description shown on the public Page."
                  rows={4}
                />
              </label>

              {selected ? (
                <label className="writer-pages-toggle-card">
                  <div>
                    <strong>Active page</strong>
                    <span>Active Pages can be viewed publicly.</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={form.status === 'active'}
                    disabled={!!selected.is_primary}
                    onChange={(event) =>
                      updateForm('status', event.target.checked ? 'active' : 'inactive')
                    }
                  />
                </label>
              ) : null}

              <label
                className={`writer-pages-toggle-card ${
                  selected?.is_primary ? 'locked' : ''
                }`}
              >
                <div>
                  <strong>Primary page</strong>
                  <span>This is the default publishing destination.</span>
                </div>

                {selected?.is_primary ? (
                  <span className="writer-pages-primary-chip">Primary</span>
                ) : (
                  <input
                    type="checkbox"
                    checked={!!form.is_primary}
                    disabled={form.status !== 'active'}
                    onChange={(event) =>
                      updateForm('is_primary', event.target.checked)
                    }
                  />
                )}
              </label>

              <div className="writer-pages-form-rule">
                A Writer must always keep one primary Page.
              </div>

              {selected && pages.length > 1 ? (
                <button
                  type="button"
                  className="writer-pages-delete-mobile"
                  disabled={busy === `delete-${selected.id}`}
                  onClick={() => remove(selected)}
                >
                  Delete page
                </button>
              ) : null}
            </div>

            <footer className="writer-pages-drawer-footer">
              {selected && pages.length > 1 ? (
                <button
                  type="button"
                  className="writer-pages-delete-desktop"
                  disabled={busy === `delete-${selected.id}`}
                  onClick={() => remove(selected)}
                >
                  Delete page
                </button>
              ) : (
                <span />
              )}

              <div className="writer-pages-footer-actions">
                <button
                  type="button"
                  className="writer-pages-action secondary"
                  onClick={closeDrawer}
                  disabled={!!busy}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="writer-pages-action primary save"
                  disabled={!!busy || !form.name.trim()}
                >
                  {busy === 'save'
                    ? 'Saving...'
                    : selected
                      ? 'Save changes'
                      : 'Create page'}
                </button>
              </div>
            </footer>
          </form>
        </div>
      ) : null}
    </div>
  );
}

const writerPagesCss = `
  .writer-pages-screen {
    min-height: 100%;
    background: #f5f6f8;
    color: #1f2329;
    font-family: Inter, Arial, sans-serif;
  }

  .writer-pages-screen *,
  .writer-pages-screen *::before,
  .writer-pages-screen *::after {
    box-sizing: border-box;
  }

  .writer-pages-main {
    width: 100%;
    max-width: 1480px;
    margin: 0;
    padding: 30px 30px 64px;
  }

  .writer-pages-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 20px;
  }

  .writer-pages-heading h2 {
    margin: 0;
    font-size: 30px;
    line-height: 1.15;
    letter-spacing: -0.7px;
    font-weight: 750;
  }

  .writer-pages-heading p {
    margin: 7px 0 0;
    color: #6f7888;
    font-size: 14px;
    line-height: 1.45;
  }

  .writer-pages-primary-button,
  .writer-pages-action {
    appearance: none;
    border: 1px solid #d8dde5;
    border-radius: 9px;
    background: #fff;
    color: #20242a;
    min-height: 38px;
    padding: 0 17px;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 120ms ease, border-color 120ms ease, opacity 120ms ease;
  }

  .writer-pages-primary-button,
  .writer-pages-action.primary {
    border-color: #1f2329;
    background: #1f2329;
    color: #fff;
  }

  .writer-pages-primary-button {
    min-width: 160px;
    min-height: 42px;
  }

  .writer-pages-primary-button:hover:not(:disabled),
  .writer-pages-action.primary:hover:not(:disabled) {
    background: #111419;
  }

  .writer-pages-action.secondary:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #c7ced8;
  }

  .writer-pages-primary-button:disabled,
  .writer-pages-action:disabled,
  .writer-pages-inline-action:disabled,
  .writer-pages-menu button:disabled,
  .writer-pages-delete-mobile:disabled,
  .writer-pages-delete-desktop:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .writer-pages-plan-card {
    min-height: 66px;
    padding: 14px 17px;
    border: 1px solid #dce1e8;
    border-radius: 12px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 20px;
  }

  .writer-pages-plan-card > div:first-child {
    display: grid;
    gap: 4px;
  }

  .writer-pages-plan-card strong {
    font-size: 15px;
  }

  .writer-pages-plan-card span {
    color: #6f7888;
    font-size: 12px;
  }

  .writer-pages-plan-copy {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .writer-pages-plan-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 27px;
    padding: 0 15px;
    border-radius: 999px;
    font-weight: 700;
  }

  .writer-pages-plan-badge.paid {
    background: #e8f7ef;
    color: #19754d;
  }

  .writer-pages-plan-badge.free {
    background: #f2f4f7;
    color: #596273;
  }

  .writer-pages-storefront-note,
  .writer-pages-alert {
    border-radius: 10px;
    padding: 11px 13px;
    font-size: 13px;
    margin-bottom: 14px;
  }

  .writer-pages-storefront-note {
    border: 1px solid #dce1e8;
    background: #fff;
    color: #687181;
  }

  .writer-pages-alert.error {
    border: 1px solid #f0caca;
    background: #fff5f5;
    color: #a82121;
  }

  .writer-pages-alert.success {
    border: 1px solid #cbe8d8;
    background: #f2fbf6;
    color: #176b46;
  }

  .writer-pages-tools {
    display: grid;
    grid-template-columns: minmax(280px, 420px) 120px 1fr;
    gap: 18px;
    align-items: center;
    margin-bottom: 22px;
  }

  .writer-pages-search {
    height: 42px;
    border: 1px solid #d8dde5;
    border-radius: 9px;
    background: #fff;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 0 13px;
  }

  .writer-pages-search-dot {
    width: 12px;
    height: 12px;
    border: 1.5px solid #6f7888;
    border-radius: 50%;
    flex: 0 0 12px;
  }

  .writer-pages-search input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    font: inherit;
    font-size: 13px;
    color: #1f2329;
  }

  .writer-pages-search input::placeholder {
    color: #9aa4b5;
  }

  .writer-pages-status-filter {
    width: 120px;
    height: 42px;
    border: 1px solid #d8dde5;
    border-radius: 9px;
    background: #fff;
    padding: 0 12px;
    color: #252a31;
    font: inherit;
    font-size: 13px;
    font-weight: 650;
    outline: none;
  }

  .writer-pages-result-count {
    justify-self: end;
    color: #70798a;
    font-size: 12px;
  }

  .writer-pages-table-card {
    border: 1px solid #dce1e8;
    border-radius: 13px;
    background: #fff;
    overflow: visible;
  }

  .writer-pages-table-head {
    display: grid;
    grid-template-columns: minmax(330px, 1.5fr) 135px 140px 300px;
    align-items: center;
    min-height: 52px;
    padding: 0 15px;
    border-bottom: 1px solid #edf0f4;
    background: #fafbfc;
    border-radius: 13px 13px 0 0;
  }

  .writer-pages-table-head span {
    color: #929bad;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.7px;
    text-transform: uppercase;
  }

  .writer-pages-list {
    padding: 0 15px;
  }

  .writer-pages-row {
    display: grid;
    grid-template-columns: minmax(330px, 1.5fr) 135px 140px 300px;
    align-items: center;
    min-height: 92px;
    border-bottom: 1px solid #dde2e9;
  }

  .writer-pages-row:last-child {
    border-bottom: 0;
  }

  .writer-pages-identity {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
    padding: 12px 0;
  }

  .writer-pages-avatar {
    width: 46px;
    height: 46px;
    flex: 0 0 46px;
    border-radius: 50%;
    background: #1f2329;
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 750;
    position: relative;
    overflow: hidden;
  }

  .writer-pages-avatar > span {
    grid-area: 1 / 1;
  }

  .writer-pages-avatar > img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    border-radius: inherit;
    background: #eef1f4;
  }

  .writer-pages-identity-copy {
    min-width: 0;
  }

  .writer-pages-identity-copy > strong {
    display: block;
    font-size: 14px;
    line-height: 1.35;
  }

  .writer-pages-identity-copy > span {
    display: block;
    margin-top: 3px;
    color: #70798a;
    font-size: 12px;
    overflow-wrap: anywhere;
  }

  .writer-pages-identity-actions {
    min-height: 23px;
    display: flex;
    align-items: center;
    margin-top: 5px;
  }

  .writer-pages-primary-chip {
    display: inline-flex;
    align-items: center;
    min-height: 25px;
    padding: 0 11px;
    border-radius: 999px;
    background: #eaf2ff;
    color: #1e62c6;
    font-size: 11px;
    font-weight: 750;
  }

  .writer-pages-inline-action {
    border: 0;
    padding: 0;
    background: transparent;
    color: #252a31;
    font: inherit;
    font-size: 12px;
    font-weight: 750;
    cursor: pointer;
    text-decoration: underline;
    text-decoration-color: #ccd2da;
    text-underline-offset: 3px;
  }

  .writer-pages-inline-muted {
    color: #99a3b3 !important;
    font-size: 11px !important;
  }

  .writer-pages-status {
    display: inline-flex;
    min-height: 26px;
    align-items: center;
    justify-content: center;
    padding: 0 13px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 750;
  }

  .writer-pages-status.active {
    background: #e8f7ef;
    color: #19754d;
  }

  .writer-pages-status.inactive {
    border: 1px solid #d8dde5;
    background: #fff;
    color: #6f7888;
  }

  .writer-pages-updated {
    color: #6f7888;
    font-size: 12px;
  }

  .writer-pages-actions {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
  }

  .writer-pages-action {
    min-width: 86px;
  }

  .writer-pages-action.icon {
    width: 44px;
    min-width: 44px;
    padding: 0;
    letter-spacing: 1px;
  }

  .writer-pages-more-wrap {
    position: relative;
  }

  .writer-pages-menu {
    position: absolute;
    z-index: 20;
    top: calc(100% + 7px);
    right: 0;
    width: 156px;
    padding: 6px;
    border: 1px solid #d8dde5;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 14px 35px rgba(15, 23, 42, 0.12);
  }

  .writer-pages-menu button {
    width: 100%;
    min-height: 36px;
    border: 0;
    border-radius: 7px;
    padding: 0 10px;
    background: transparent;
    color: #252a31;
    text-align: left;
    font: inherit;
    font-size: 12px;
    font-weight: 650;
    cursor: pointer;
  }

  .writer-pages-menu button:hover:not(:disabled) {
    background: #f4f6f8;
  }

  .writer-pages-menu button.danger {
    color: #bd1f1f;
  }

  .writer-pages-empty {
    min-height: 220px;
    padding: 54px 24px;
    display: grid;
    place-items: center;
    align-content: center;
    text-align: center;
  }

  .writer-pages-empty strong {
    font-size: 15px;
  }

  .writer-pages-empty p {
    margin: 7px 0 0;
    color: #70798a;
    font-size: 13px;
  }

  .writer-pages-policy {
    margin-top: 20px;
    min-height: 72px;
    border: 1px solid #dce1e8;
    border-radius: 12px;
    background: #fff;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
  }

  .writer-pages-policy > div {
    display: grid;
    gap: 5px;
  }

  .writer-pages-policy strong {
    font-size: 13px;
  }

  .writer-pages-policy span,
  .writer-pages-policy p {
    color: #6f7888;
    font-size: 12px;
    line-height: 1.45;
  }

  .writer-pages-policy p {
    margin: 0;
    max-width: 470px;
    text-align: right;
  }

  .writer-pages-drawer-layer {
    position: fixed;
    z-index: 1000;
    inset: 0;
    background: rgba(25, 30, 37, 0.2);
    display: flex;
    justify-content: flex-end;
  }

  .writer-pages-drawer {
    width: min(478px, 100%);
    height: 100%;
    background: #fff;
    border-left: 1px solid #dce1e8;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    box-shadow: -12px 0 40px rgba(15, 23, 42, 0.08);
  }

  .writer-pages-drawer-head {
    min-height: 82px;
    border-bottom: 1px solid #e2e6ec;
    padding: 15px 22px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .writer-pages-drawer-head h2 {
    margin: 0;
    font-size: 20px;
    line-height: 1.25;
  }

  .writer-pages-drawer-head p {
    margin: 3px 0 0;
    color: #70798a;
    font-size: 11px;
  }

  .writer-pages-mobile-back {
    display: none;
  }

  .writer-pages-drawer-head-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .writer-pages-drawer-head-actions .writer-pages-action {
    min-width: 88px;
  }

  .writer-pages-drawer-head-actions .writer-pages-action.close {
    min-width: 40px;
    width: 40px;
  }

  .writer-pages-drawer-scroll {
    min-height: 0;
    overflow-y: auto;
    padding: 22px;
  }

  .writer-pages-form-intro {
    margin-bottom: 24px;
  }

  .writer-pages-form-intro h3 {
    margin: 0;
    font-size: 15px;
  }

  .writer-pages-form-intro p {
    margin: 5px 0 0;
    color: #70798a;
    font-size: 11px;
    line-height: 1.45;
  }

  .writer-pages-field {
    display: grid;
    gap: 7px;
    margin-bottom: 13px;
  }

  .writer-pages-field > span {
    font-size: 12px;
    font-weight: 700;
  }

  .writer-pages-field input,
  .writer-pages-field textarea {
    width: 100%;
    border: 1px solid #d5dbe4;
    border-radius: 9px;
    background: #fff;
    color: #252a31;
    padding: 10px 11px;
    outline: none;
    font: inherit;
    font-size: 13px;
    line-height: 1.45;
    resize: vertical;
  }

  .writer-pages-field input {
    min-height: 42px;
  }

  .writer-pages-field input:focus,
  .writer-pages-field textarea:focus,
  .writer-pages-status-filter:focus,
  .writer-pages-search:focus-within {
    border-color: #9aa4b2;
    box-shadow: 0 0 0 3px rgba(31, 35, 41, 0.05);
  }

  .writer-pages-field small {
    color: #7c8595;
    font-size: 10px;
  }

  .writer-pages-image-control {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 92px;
    gap: 9px;
    align-items: stretch;
  }

  .writer-pages-image-control > input {
    min-width: 0;
  }

  .writer-pages-upload-button {
    min-height: 42px;
    border: 1px solid #1f2329;
    border-radius: 9px;
    background: #1f2329;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    font-size: 12px;
    font-weight: 750;
    cursor: pointer;
    user-select: none;
  }

  .writer-pages-upload-button:hover {
    background: #111419;
  }

  .writer-pages-upload-button.busy {
    opacity: 0.65;
    cursor: wait;
  }

  .writer-pages-upload-button input[type='file'] {
    display: none;
  }

  .writer-pages-image-preview {
    margin-top: 2px;
    min-height: 64px;
    border: 1px solid #dce1e8;
    border-radius: 9px;
    background: #fafbfc;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px;
  }

  .writer-pages-image-preview img {
    display: block;
    object-fit: cover;
    border-radius: 6px;
    background: #eef1f4;
  }

  .writer-pages-image-preview.logo img {
    width: 48px;
    height: 48px;
  }

  .writer-pages-image-preview.banner img {
    width: 112px;
    height: 52px;
  }

  .writer-pages-image-preview span {
    color: #70798a;
    font-size: 10px;
    font-weight: 650;
  }

  .writer-pages-toggle-card {
    min-height: 66px;
    padding: 12px;
    border: 1px solid #d8dde5;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 12px;
  }

  .writer-pages-toggle-card > div {
    display: grid;
    gap: 4px;
  }

  .writer-pages-toggle-card strong {
    font-size: 12px;
  }

  .writer-pages-toggle-card span {
    color: #70798a;
    font-size: 10px;
  }

  .writer-pages-toggle-card input[type='checkbox'] {
    appearance: none;
    width: 46px;
    height: 26px;
    flex: 0 0 46px;
    border-radius: 999px;
    background: #d7dce3;
    position: relative;
    cursor: pointer;
    transition: background 120ms ease;
  }

  .writer-pages-toggle-card input[type='checkbox']::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    top: 3px;
    left: 3px;
    background: #fff;
    transition: transform 120ms ease;
  }

  .writer-pages-toggle-card input[type='checkbox']:checked {
    background: #1f2329;
  }

  .writer-pages-toggle-card input[type='checkbox']:checked::after {
    transform: translateX(20px);
  }

  .writer-pages-toggle-card input[type='checkbox']:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .writer-pages-form-rule {
    margin-top: 16px;
    padding: 13px;
    border: 1px solid #dfe3e9;
    border-radius: 9px;
    background: #fafbfc;
    color: #687181;
    font-size: 11px;
  }

  .writer-pages-drawer-footer {
    min-height: 90px;
    padding: 14px 22px;
    border-top: 1px solid #dfe3e9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    background: #fff;
  }

  .writer-pages-footer-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .writer-pages-action.save {
    min-width: 118px;
  }

  .writer-pages-delete-desktop,
  .writer-pages-delete-mobile {
    min-height: 40px;
    border: 1px solid #d8dde5;
    border-radius: 9px;
    background: #fff;
    color: #c41f1f;
    padding: 0 14px;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .writer-pages-delete-mobile {
    display: none;
  }

  .writer-pages-loading {
    min-height: 440px;
    display: grid;
    place-items: center;
  }

  .writer-pages-loading-card {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #596273;
    font-size: 13px;
  }

  .writer-pages-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #dce1e8;
    border-top-color: #1f2329;
    border-radius: 50%;
    animation: writer-pages-spin 0.8s linear infinite;
  }

  @keyframes writer-pages-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1100px) {
    .writer-pages-main {
      width: 100%;
      padding-left: 22px;
      padding-right: 22px;
    }

    .writer-pages-table-head,
    .writer-pages-row {
      grid-template-columns: minmax(260px, 1.3fr) 110px 125px 270px;
    }
  }

  @media (max-width: 991px) {
    .writer-pages-screen {
      width: 100%;
      max-width: none;
      overflow-x: hidden;
    }

    .writer-pages-main {
      position: relative;
      left: 50%;
      width: 100vw;
      max-width: none;
      margin-left: -50vw;
      margin-right: -50vw;
      padding: 16px 8px 48px;
    }

    .writer-pages-heading,
    .writer-pages-plan-card,
    .writer-pages-storefront-note,
    .writer-pages-alert,
    .writer-pages-tools,
    .writer-pages-table-card,
    .writer-pages-list {
      width: 100%;
      max-width: none;
    }

    .writer-pages-heading {
      align-items: center;
      margin-bottom: 16px;
    }

    .writer-pages-heading > div {
      padding-left: 8px;
    }

    .writer-pages-heading h2 {
      font-size: 24px;
      letter-spacing: -0.4px;
    }

    .writer-pages-heading p {
      font-size: 13px;
      max-width: 235px;
    }

    .writer-pages-primary-button {
      min-width: 120px;
      min-height: 40px;
    }

    .writer-pages-plan-card {
      min-height: 56px;
      padding: 10px 13px;
      margin-bottom: 16px;
    }

    .writer-pages-plan-copy {
      align-items: flex-end;
      gap: 4px;
      flex-direction: column;
    }

    .writer-pages-tools {
      grid-template-columns: 1fr;
      gap: 10px;
      margin-bottom: 16px;
    }

    .writer-pages-status-filter,
    .writer-pages-result-count {
      display: none;
    }

    .writer-pages-table-card {
      border: 0;
      background: transparent;
    }

    .writer-pages-table-head {
      display: none;
    }

    .writer-pages-list {
      padding: 0;
      display: grid;
      gap: 12px;
    }

    .writer-pages-row {
      display: grid;
      grid-template-columns: 1fr;
      min-height: 0;
      padding: 15px 13px 12px;
      border: 1px solid #d8dde5;
      border-radius: 12px;
      background: #fff;
    }

    .writer-pages-identity {
      padding: 0;
      gap: 12px;
    }

    .writer-pages-avatar {
      width: 40px;
      height: 40px;
      flex-basis: 40px;
    }

    .writer-pages-identity-actions {
      margin-top: 6px;
    }

    .writer-pages-status-cell {
      margin: -27px 0 0 52px;
      min-height: 27px;
    }

    .writer-pages-identity-actions .writer-pages-primary-chip {
      margin-right: 8px;
    }

    .writer-pages-updated {
      margin-top: 11px;
      padding-bottom: 9px;
      border-bottom: 1px solid #dde2e9;
      color: #9aa4b5;
      font-size: 11px;
    }

    .writer-pages-actions {
      display: grid;
      grid-template-columns: 1fr 1fr 72px;
      gap: 8px;
      padding-top: 9px;
    }

    .writer-pages-action {
      min-width: 0;
      width: 100%;
      min-height: 34px;
    }

    .writer-pages-action.icon {
      width: 100%;
      min-width: 0;
    }

    .writer-pages-more-wrap {
      width: 100%;
    }

    .writer-pages-menu {
      right: 0;
      bottom: calc(100% + 6px);
      top: auto;
    }

    .writer-pages-policy {
      display: none;
    }

    .writer-pages-drawer-layer {
      background: #fff;
    }

    .writer-pages-drawer {
      width: 100%;
      border-left: 0;
      box-shadow: none;
    }

    .writer-pages-drawer-head {
      min-height: 64px;
      padding: 13px 17px;
      align-items: center;
    }

    .writer-pages-drawer-head h2 {
      font-size: 17px;
    }

    .writer-pages-drawer-head p {
      display: none;
    }

    .writer-pages-mobile-back {
      display: none;
    }

    .writer-pages-drawer-head-actions .writer-pages-action.secondary {
      min-width: 84px;
    }

    .writer-pages-drawer-scroll {
      padding: 18px 17px 120px;
      background: #f7f8fa;
    }

    .writer-pages-form-intro {
      margin-bottom: 20px;
    }

    .writer-pages-form-intro h3 {
      font-size: 22px;
    }

    .writer-pages-field input,
    .writer-pages-field textarea,
    .writer-pages-toggle-card,
    .writer-pages-form-rule {
      background: #fff;
    }

    .writer-pages-image-control {
      grid-template-columns: minmax(0, 1fr) 90px;
    }

    .writer-pages-image-preview.banner img {
      width: 96px;
      height: 48px;
    }

    .writer-pages-drawer-footer {
      min-height: 74px;
      position: fixed;
      z-index: 3;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 11px 17px 16px;
    }

    .writer-pages-delete-desktop {
      display: none;
    }

    .writer-pages-delete-mobile {
      display: block;
      width: 100%;
      margin-top: 14px;
    }

    .writer-pages-footer-actions {
      width: 100%;
      display: grid;
      grid-template-columns: 92px 1fr;
    }

    .writer-pages-action.save {
      min-width: 0;
    }
  }

  @media (max-width: 480px) {
    .writer-pages-heading h2 {
      font-size: 23px;
    }

    .writer-pages-heading p {
      max-width: 218px;
    }

    .writer-pages-primary-button {
      min-width: 118px;
      padding: 0 14px;
      font-size: 12px;
    }

    .writer-pages-plan-copy > span:last-child {
      font-size: 10px;
    }
  }
`;
