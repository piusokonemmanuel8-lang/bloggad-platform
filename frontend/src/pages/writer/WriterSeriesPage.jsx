import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatDateTime } from '../../components/writerReader/WorkspaceUi';

const emptySeriesForm = {
  title: '',
  slug: '',
  description: '',
  cover_image: '',
  series_type: 'series',
  status: 'draft',
};

const emptyItemForm = {
  post_id: '',
  season_number: '',
  episode_number: '',
  sort_order: 0,
};

function seriesPayload(form) {
  return {
    title: form.title,
    slug: form.slug,
    description: form.description,
    cover_image: form.cover_image,
    series_type: form.series_type,
    status: form.status,
  };
}

function releaseText(item) {
  if (item?.scheduled_at) return `Scheduled ${formatDateTime(item.scheduled_at)}`;
  if (item?.published_at) return `Published ${formatDateTime(item.published_at)}`;
  return 'Not scheduled';
}

function typeLabel(value) {
  const raw = String(value || 'series').toLowerCase();
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function statusLabel(value) {
  const raw = String(value || 'draft').toLowerCase();
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function getUploadUrl(payload) {
  return (
    payload?.file?.url ||
    payload?.data?.image_url ||
    payload?.data?.url ||
    payload?.image_url ||
    payload?.url ||
    ''
  );
}

export default function WriterSeriesPage() {
  const [rows, setRows] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [createForm, setCreateForm] = useState(emptySeriesForm);
  const [editForm, setEditForm] = useState(emptySeriesForm);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [editingPostId, setEditingPostId] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [panel, setPanel] = useState('');
  const [uploadingCover, setUploadingCover] = useState('');

  async function loadSeriesList(preferredId = '') {
    const { data } = await api.get('/api/affiliate/series');
    const next = Array.isArray(data?.series)
      ? data.series
      : Array.isArray(data?.items)
        ? data.items
        : [];

    setRows(next);

    const preferred = String(preferredId || '');
    if (preferred && next.some((item) => String(item.id) === preferred)) {
      setSelectedId(preferred);
      return;
    }

    if (!selectedId && next[0]) {
      setSelectedId(String(next[0].id));
    } else if (selectedId && !next.some((item) => String(item.id) === String(selectedId))) {
      setSelectedId(next[0] ? String(next[0].id) : '');
    }
  }

  async function loadPosts() {
    try {
      const { data } = await api.get('/api/affiliate/posts');
      const next =
        (Array.isArray(data?.posts) && data.posts) ||
        (Array.isArray(data?.items) && data.items) ||
        (Array.isArray(data?.data) && data.data) ||
        [];
      setPosts(next);
    } catch (err) {
      setPosts([]);
    }
  }

  async function loadSeriesDetail(id) {
    if (!id) {
      setSelectedSeries(null);
      setEditForm(emptySeriesForm);
      setItemForm(emptyItemForm);
      setEditingPostId('');
      return;
    }

    try {
      setError('');
      const { data } = await api.get(`/api/affiliate/series/${id}`);
      const next = data?.series || null;
      setSelectedSeries(next);

      if (next) {
        setEditForm({
          title: next.title || '',
          slug: next.slug || '',
          description: next.description || '',
          cover_image: next.cover_image || '',
          series_type: next.series_type || 'series',
          status: next.status || 'draft',
        });
      }
    } catch (err) {
      setSelectedSeries(null);
      setError(err?.response?.data?.message || 'Failed to load Writer series details.');
    }
  }

  async function refresh(preferredId = '') {
    try {
      setError('');
      await loadSeriesList(preferredId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load Writer series.');
    }
  }

  useEffect(() => {
    refresh();
    loadPosts();
  }, []);

  useEffect(() => {
    loadSeriesDetail(selectedId);
  }, [selectedId]);

  function closePanel() {
    setPanel('');
    if (editingPostId) {
      setEditingPostId('');
      setItemForm(emptyItemForm);
    }
  }

  function openCreate() {
    setCreateForm(emptySeriesForm);
    setPanel('create');
  }

  function openEditSeries() {
    if (!selectedSeries) return;
    setEditForm({
      title: selectedSeries.title || '',
      slug: selectedSeries.slug || '',
      description: selectedSeries.description || '',
      cover_image: selectedSeries.cover_image || '',
      series_type: selectedSeries.series_type || 'series',
      status: selectedSeries.status || 'draft',
    });
    setPanel('edit-series');
  }

  function openAddPlacement() {
    if (!selectedSeries) return;
    setEditingPostId('');
    setItemForm(emptyItemForm);
    setPanel('placement');
  }

  async function uploadCoverImage(file, target) {
    if (!file) return;

    if (!String(file.type || '').startsWith('image/')) {
      setError('Choose a valid image file.');
      return;
    }

    try {
      setUploadingCover(target);
      setError('');
      setNotice('');

      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/api/uploads/template-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = getUploadUrl(response?.data);

      if (!uploadedUrl) {
        throw new Error('Upload worked but no image URL was returned.');
      }

      if (target === 'create') {
        setCreateForm((prev) => ({ ...prev, cover_image: uploadedUrl }));
      } else {
        setEditForm((prev) => ({ ...prev, cover_image: uploadedUrl }));
      }

      setNotice('Cover image uploaded successfully.');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to upload cover image.'
      );
    } finally {
      setUploadingCover('');
    }
  }

  async function createSeries(event) {
    event.preventDefault();

    try {
      setBusy('create');
      setError('');
      setNotice('');
      const { data } = await api.post('/api/affiliate/series', seriesPayload(createForm));
      setCreateForm(emptySeriesForm);
      setNotice(data?.message || 'Writer series created successfully.');
      await refresh(data?.series?.id || data?.id || '');
      setPanel('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create Writer series.');
    } finally {
      setBusy('');
    }
  }

  async function updateSeries(event) {
    event.preventDefault();
    if (!selectedId) return;

    try {
      setBusy('update-series');
      setError('');
      setNotice('');
      const { data } = await api.put(
        `/api/affiliate/series/${selectedId}`,
        seriesPayload(editForm)
      );
      setNotice(data?.message || 'Writer series updated successfully.');
      await refresh(selectedId);
      await loadSeriesDetail(selectedId);
      setPanel('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update Writer series.');
    } finally {
      setBusy('');
    }
  }

  async function deleteSeries(id) {
    if (!id || !window.confirm('Delete this Writer series and its series placements?')) return;

    try {
      setBusy('delete-series');
      setError('');
      setNotice('');
      const { data } = await api.delete(`/api/affiliate/series/${id}`);
      setNotice(data?.message || 'Writer series deleted successfully.');
      if (String(selectedId) === String(id)) {
        setSelectedId('');
        setSelectedSeries(null);
      }
      setPanel('');
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete Writer series.');
    } finally {
      setBusy('');
    }
  }

  function editPlacement(item) {
    setEditingPostId(String(item.post_id));
    setItemForm({
      post_id: String(item.post_id),
      season_number: item.season_number ?? '',
      episode_number: item.episode_number ?? '',
      sort_order: Number(item.sort_order || 0),
    });
    setPanel('placement');
  }

  function clearPlacementForm() {
    setEditingPostId('');
    setItemForm(emptyItemForm);
  }

  async function savePlacement(event) {
    event.preventDefault();
    if (!selectedId) return;

    const postId = Number(itemForm.post_id);
    if (!Number.isInteger(postId) || postId <= 0) {
      setError('Choose a valid Writer post before saving its series placement.');
      return;
    }

    try {
      setBusy('save-placement');
      setError('');
      setNotice('');

      const payload = {
        post_id: postId,
        season_number:
          itemForm.season_number === '' ? null : Math.max(1, Number(itemForm.season_number) || 1),
        episode_number:
          itemForm.episode_number === '' ? null : Math.max(1, Number(itemForm.episode_number) || 1),
        sort_order: Math.max(0, Number(itemForm.sort_order) || 0),
      };

      const { data } = await api.post(
        `/api/affiliate/series/${selectedId}/items`,
        payload
      );

      setNotice(data?.message || 'Series placement saved.');
      clearPlacementForm();
      await loadSeriesDetail(selectedId);
      await refresh(selectedId);
      setPanel('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save series placement.');
    } finally {
      setBusy('');
    }
  }

  async function removePlacement(postId) {
    if (!selectedId || !postId || !window.confirm('Remove this post from the selected series?')) return;

    try {
      setBusy(`remove-${postId}`);
      setError('');
      setNotice('');
      const { data } = await api.delete(
        `/api/affiliate/series/${selectedId}/items/${postId}`
      );
      setNotice(data?.message || 'Post removed from Writer series.');
      if (String(editingPostId) === String(postId)) clearPlacementForm();
      await loadSeriesDetail(selectedId);
      await refresh(selectedId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove series placement.');
    } finally {
      setBusy('');
    }
  }

  const selectedItems = Array.isArray(selectedSeries?.items) ? selectedSeries.items : [];

  return (
    <div className="writer-series-page">
      <style>{`
        .writer-series-page,
        .writer-series-page * {
          box-sizing: border-box;
        }

        .writer-series-page {
          width: 100%;
          max-width: 1180px;
          color: #17191f;
        }

        .wsp-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 14px;
        }

        .wsp-count {
          min-height: 30px;
          display: inline-flex;
          align-items: center;
          border: 1px solid #dfe3e6;
          border-radius: 999px;
          background: #ffffff;
          color: #2f343c;
          font-size: 11px;
          font-weight: 800;
          padding: 0 12px;
        }

        .wsp-btn {
          min-height: 38px;
          border: 1px solid #d9dde2;
          border-radius: 9px;
          background: #ffffff;
          color: #25282e;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 750;
          padding: 0 15px;
        }

        .wsp-btn:hover:not(:disabled) {
          border-color: #afb5bd;
          background: #f8f9fa;
        }

        .wsp-btn.primary {
          border-color: #1c1f24;
          background: #1c1f24;
          color: #ffffff;
        }

        .wsp-btn.primary:hover:not(:disabled) {
          background: #111318;
        }

        .wsp-btn.danger {
          border-color: #efcaca;
          background: #fffafa;
          color: #a33232;
        }

        .wsp-btn:disabled {
          cursor: default;
          opacity: 0.55;
        }

        .wsp-alert {
          margin-bottom: 12px;
          border: 1px solid #dfe3e6;
          border-radius: 10px;
          background: #ffffff;
          font-size: 12px;
          line-height: 1.45;
          padding: 11px 13px;
        }

        .wsp-alert.error {
          border-color: #ebcaca;
          background: #fffafa;
          color: #8e2d2d;
        }

        .wsp-alert.success {
          border-color: #d4e6da;
          background: #fbfefc;
          color: #2f6940;
        }

        .wsp-panel {
          border: 1px solid #dfe3e6;
          border-radius: 14px;
          background: #ffffff;
        }

        .wsp-series-table {
          overflow: hidden;
          margin-bottom: 14px;
        }

        .wsp-table-head,
        .wsp-table-row {
          display: grid;
          grid-template-columns: minmax(220px, 1.8fr) 110px 110px 90px 120px 90px;
          align-items: center;
          column-gap: 14px;
        }

        .wsp-table-head {
          min-height: 42px;
          background: #f7f8f9;
          color: #737b86;
          font-size: 10px;
          font-weight: 800;
          padding: 0 16px;
        }

        .wsp-table-row {
          min-height: 66px;
          border-top: 1px solid #e7e9ec;
          padding: 10px 16px;
        }

        .wsp-table-row:first-of-type {
          border-top: 0;
        }

        .wsp-table-row.is-selected {
          background: #fafbfb;
        }

        .wsp-series-name {
          min-width: 0;
          color: #25282e;
          font-size: 12px;
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .wsp-cell {
          color: #6f7782;
          font-size: 11px;
          line-height: 1.35;
        }

        .wsp-cell.strong {
          color: #25282e;
          font-weight: 750;
        }

        .wsp-series-action {
          display: flex;
          justify-content: flex-end;
        }

        .wsp-series-action .wsp-btn {
          min-width: 72px;
          min-height: 32px;
          padding: 0 10px;
          font-size: 10px;
        }

        .wsp-mobile-series {
          display: none;
        }

        .wsp-selected {
          min-height: 74px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 14px;
          padding: 14px 16px;
        }

        .wsp-selected-copy {
          min-width: 0;
        }

        .wsp-selected-title {
          margin: 0;
          color: #25282e;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.35;
        }

        .wsp-selected-meta {
          margin: 4px 0 0;
          color: #737b86;
          font-size: 11px;
          line-height: 1.4;
        }

        .wsp-selected-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .wsp-items {
          padding: 14px 16px 4px;
        }

        .wsp-items-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        .wsp-items-head h2 {
          margin: 0;
          color: #25282e;
          font-size: 13px;
          font-weight: 800;
        }

        .wsp-items-count {
          min-height: 28px;
          display: inline-flex;
          align-items: center;
          border: 1px solid #dfe3e6;
          border-radius: 999px;
          color: #525a64;
          font-size: 10px;
          font-weight: 800;
          padding: 0 10px;
        }

        .wsp-item-row {
          min-height: 84px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          border-top: 1px solid #e7e9ec;
          padding: 12px 0;
        }

        .wsp-item-row:first-of-type {
          border-top: 0;
        }

        .wsp-item-copy {
          min-width: 0;
        }

        .wsp-item-title {
          margin: 0;
          color: #25282e;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.35;
        }

        .wsp-item-meta,
        .wsp-item-time {
          margin: 3px 0 0;
          color: #737b86;
          font-size: 10px;
          line-height: 1.4;
        }

        .wsp-item-actions {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
        }

        .wsp-item-actions .wsp-btn {
          min-height: 32px;
          padding: 0 12px;
          font-size: 10px;
        }

        .wsp-empty {
          min-height: 170px;
          display: grid;
          place-items: center;
          color: #737b86;
          font-size: 12px;
          text-align: center;
          padding: 24px;
        }

        .wsp-drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 80;
          border: 0;
          background: rgba(23, 25, 31, 0.12);
        }

        .wsp-drawer {
          position: fixed;
          top: 0;
          right: 0;
          z-index: 90;
          width: min(390px, 92vw);
          height: 100vh;
          display: flex;
          flex-direction: column;
          border-left: 1px solid #dfe3e6;
          background: #ffffff;
          box-shadow: -16px 0 48px rgba(23, 25, 31, 0.08);
        }

        .wsp-drawer-head {
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          border-bottom: 1px solid #e7e9ec;
          padding: 0 16px;
        }

        .wsp-drawer-head h2 {
          margin: 0;
          color: #25282e;
          font-size: 14px;
          font-weight: 800;
        }

        .wsp-close {
          width: 36px;
          height: 36px;
          display: inline-grid;
          place-items: center;
          border: 1px solid #dfe3e6;
          border-radius: 8px;
          background: #ffffff;
          color: #25282e;
          cursor: pointer;
          font: inherit;
          font-weight: 800;
        }

        .wsp-drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .wsp-form {
          display: grid;
          gap: 14px;
        }

        .wsp-field {
          display: grid;
          gap: 6px;
        }

        .wsp-field label {
          color: #606873;
          font-size: 10px;
          font-weight: 750;
        }

        .wsp-input,
        .wsp-select,
        .wsp-textarea {
          width: 100%;
          border: 1px solid #d9dde2;
          border-radius: 8px;
          background: #ffffff;
          color: #25282e;
          font: inherit;
          font-size: 12px;
          outline: none;
          padding: 0 11px;
        }

        .wsp-input,
        .wsp-select {
          min-height: 40px;
        }

        .wsp-textarea {
          min-height: 82px;
          resize: vertical;
          padding-top: 10px;
          padding-bottom: 10px;
        }

        .wsp-input:focus,
        .wsp-select:focus,
        .wsp-textarea:focus {
          border-color: #757c85;
        }

        .wsp-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .wsp-cover-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 8px;
          align-items: center;
        }

        .wsp-upload-btn {
          min-width: 84px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          user-select: none;
        }

        .wsp-upload-btn.disabled {
          pointer-events: none;
          opacity: 0.55;
        }

        .wsp-file-input {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          clip-path: inset(50%);
          white-space: nowrap;
        }

        .wsp-form-help {
          color: #7a828d;
          font-size: 10px;
          line-height: 1.45;
        }

        .wsp-selected-mini {
          border-radius: 9px;
          background: #f5f6f7;
          padding: 11px 12px;
        }

        .wsp-selected-mini strong {
          display: block;
          color: #25282e;
          font-size: 11px;
          line-height: 1.35;
        }

        .wsp-selected-mini span {
          display: block;
          margin-top: 3px;
          color: #737b86;
          font-size: 10px;
          line-height: 1.4;
        }

        .wsp-drawer-foot {
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          border-top: 1px solid #e7e9ec;
          padding: 12px 16px;
        }

        .wsp-drawer-foot.split {
          justify-content: space-between;
        }

        .wsp-drawer-foot-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 991px) {
          .writer-series-page {
            max-width: none;
          }

          .wsp-series-table {
            display: none;
          }

          .wsp-mobile-series {
            display: grid;
            gap: 8px;
            margin-bottom: 14px;
          }

          .wsp-series-card {
            border: 1px solid #dfe3e6;
            border-radius: 12px;
            background: #ffffff;
            padding: 13px;
          }

          .wsp-series-card.is-selected {
            border-color: #25282e;
            box-shadow: inset 0 0 0 1px #25282e;
          }

          .wsp-series-card-title {
            margin: 0;
            color: #25282e;
            font-size: 12px;
            font-weight: 800;
          }

          .wsp-series-card-meta {
            margin: 4px 0 0;
            color: #737b86;
            font-size: 10px;
            line-height: 1.4;
          }

          .wsp-series-card-actions {
            display: flex;
            gap: 7px;
            margin-top: 10px;
          }

          .wsp-series-card:not(.is-selected) .wsp-series-card-actions {
            display: none;
          }

          .wsp-selected {
            display: none;
          }

          .wsp-items {
            border: 0;
            background: transparent;
            padding: 0;
          }

          .wsp-items-head {
            margin: 16px 0 8px;
          }

          .wsp-item-row {
            display: block;
            min-height: 0;
            margin-bottom: 8px;
            border: 1px solid #dfe3e6;
            border-radius: 12px;
            background: #ffffff;
            padding: 13px;
          }

          .wsp-item-actions {
            margin-top: 10px;
          }

          .wsp-drawer {
            width: 100vw;
            max-width: none;
            border-left: 0;
            box-shadow: none;
          }

          .wsp-drawer-backdrop {
            display: none;
          }

          .wsp-drawer-head {
            min-height: 60px;
          }

          .wsp-drawer-foot {
            min-height: 68px;
          }
        }

        @media (max-width: 520px) {
          .wsp-toolbar {
            margin-bottom: 12px;
          }

          .wsp-btn {
            min-height: 36px;
          }

          .wsp-form-grid {
            grid-template-columns: 1fr 1fr;
          }

          .wsp-drawer-body {
            padding: 16px 20px;
          }

          .wsp-drawer-foot {
            padding-left: 20px;
            padding-right: 20px;
          }
        }

        @media (max-width: 360px) {
          .wsp-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .wsp-toolbar .wsp-btn.primary {
            width: 100%;
          }

          .wsp-form-grid {
            grid-template-columns: 1fr;
          }

          .wsp-drawer-foot,
          .wsp-drawer-foot.split {
            align-items: stretch;
            flex-direction: column;
          }

          .wsp-drawer-foot-right {
            width: 100%;
          }

          .wsp-drawer-foot .wsp-btn,
          .wsp-drawer-foot-right .wsp-btn {
            flex: 1;
          }
        }
      `}</style>

      <div className="wsp-toolbar">
        <span className="wsp-count">{rows.length} {rows.length === 1 ? 'series' : 'series'}</span>
        <button type="button" className="wsp-btn primary" onClick={openCreate}>
          New series
        </button>
      </div>

      {error ? <div className="wsp-alert error" role="alert">{error}</div> : null}
      {notice ? <div className="wsp-alert success" role="status">{notice}</div> : null}

      <section className="wsp-panel wsp-series-table" aria-label="Writer series">
        <div className="wsp-table-head">
          <span>Series</span>
          <span>Type</span>
          <span>Status</span>
          <span>Items</span>
          <span>Updated</span>
          <span />
        </div>

        {rows.length ? rows.map((row) => {
          const active = String(selectedId) === String(row.id);

          return (
            <div
              key={row.id}
              className={`wsp-table-row${active ? ' is-selected' : ''}`}
            >
              <span className="wsp-series-name">{row.title || 'Untitled series'}</span>
              <span className="wsp-cell">{typeLabel(row.series_type)}</span>
              <span className="wsp-cell strong">{statusLabel(row.status)}</span>
              <span className="wsp-cell strong">{Number(row.total_items || 0)}</span>
              <span className="wsp-cell">{formatDateTime(row.updated_at)}</span>
              <span className="wsp-series-action">
                <button
                  type="button"
                  className="wsp-btn"
                  onClick={() => setSelectedId(String(row.id))}
                >
                  {active ? 'Selected' : 'Open'}
                </button>
              </span>
            </div>
          );
        }) : (
          <div className="wsp-empty">No series yet.</div>
        )}
      </section>

      <section className="wsp-mobile-series" aria-label="Writer series">
        {rows.length ? rows.map((row) => {
          const active = String(selectedId) === String(row.id);

          return (
            <div
              key={row.id}
              className={`wsp-series-card${active ? ' is-selected' : ''}`}
              onClick={() => setSelectedId(String(row.id))}
            >
              <p className="wsp-series-card-title">{row.title || 'Untitled series'}</p>
              <p className="wsp-series-card-meta">
                {typeLabel(row.series_type)} | {statusLabel(row.status)} | {Number(row.total_items || 0)} items
              </p>

              {active ? (
                <div className="wsp-series-card-actions">
                  <button
                    type="button"
                    className="wsp-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditSeries();
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="wsp-btn primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      openAddPlacement();
                    }}
                  >
                    Add post
                  </button>
                </div>
              ) : null}
            </div>
          );
        }) : (
          <div className="wsp-empty wsp-panel">No series yet.</div>
        )}
      </section>

      {selectedSeries ? (
        <>
          <section className="wsp-panel wsp-selected">
            <div className="wsp-selected-copy">
              <p className="wsp-selected-title">{selectedSeries.title || 'Untitled series'}</p>
              <p className="wsp-selected-meta">
                {typeLabel(selectedSeries.series_type)} | {statusLabel(selectedSeries.status)} | {selectedItems.length} items
              </p>
            </div>

            <div className="wsp-selected-actions">
              <button type="button" className="wsp-btn" onClick={openEditSeries}>
                Edit series
              </button>
              <button type="button" className="wsp-btn primary" onClick={openAddPlacement}>
                Add post
              </button>
            </div>
          </section>

          <section className="wsp-panel wsp-items">
            <div className="wsp-items-head">
              <h2>Series items</h2>
              <span className="wsp-items-count">{selectedItems.length} posts</span>
            </div>

            {selectedItems.length ? selectedItems.map((item) => (
              <div className="wsp-item-row" key={item.id || item.post_id}>
                <div className="wsp-item-copy">
                  <p className="wsp-item-title">{item.title || `Post #${item.post_id}`}</p>
                  <p className="wsp-item-meta">
                    {statusLabel(item.status)} | S{item.season_number ?? '-'} E{item.episode_number ?? '-'} | Order {Number(item.sort_order || 0)}
                  </p>
                  <p className="wsp-item-time">{releaseText(item)}</p>
                </div>

                <div className="wsp-item-actions">
                  <button
                    type="button"
                    className="wsp-btn"
                    onClick={() => editPlacement(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="wsp-btn"
                    disabled={busy === `remove-${item.post_id}`}
                    onClick={() => removePlacement(item.post_id)}
                  >
                    {busy === `remove-${item.post_id}` ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            )) : (
              <div className="wsp-empty">No posts are assigned to this series yet.</div>
            )}
          </section>
        </>
      ) : rows.length ? (
        <div className="wsp-empty wsp-panel">Select a series to manage it.</div>
      ) : null}

      {panel ? (
        <>
          <button
            type="button"
            className="wsp-drawer-backdrop"
            onClick={closePanel}
            aria-label="Close panel"
          />

          <aside className="wsp-drawer" aria-label={
            panel === 'create'
              ? 'New series'
              : panel === 'edit-series'
                ? 'Edit series'
                : editingPostId
                  ? 'Edit post placement'
                  : 'Add post to series'
          }>
            <div className="wsp-drawer-head">
              <h2>
                {panel === 'create'
                  ? 'New series'
                  : panel === 'edit-series'
                    ? 'Edit series'
                    : editingPostId
                      ? 'Edit post placement'
                      : 'Add post to series'}
              </h2>
              <button type="button" className="wsp-close" onClick={closePanel} aria-label="Close">
                X
              </button>
            </div>

            {panel === 'create' ? (
              <form className="wsp-form" onSubmit={createSeries}>
                <div className="wsp-drawer-body">
                  <div className="wsp-form">
                    <div className="wsp-field">
                      <label htmlFor="wsp-create-title">Title</label>
                      <input
                        id="wsp-create-title"
                        className="wsp-input"
                        value={createForm.title}
                        onChange={(event) =>
                          setCreateForm((prev) => ({ ...prev, title: event.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="wsp-field">
                      <label htmlFor="wsp-create-slug">Slug</label>
                      <input
                        id="wsp-create-slug"
                        className="wsp-input"
                        value={createForm.slug}
                        onChange={(event) =>
                          setCreateForm((prev) => ({ ...prev, slug: event.target.value }))
                        }
                      />
                    </div>

                    <div className="wsp-form-grid">
                      <div className="wsp-field">
                        <label htmlFor="wsp-create-type">Type</label>
                        <select
                          id="wsp-create-type"
                          className="wsp-select"
                          value={createForm.series_type}
                          onChange={(event) =>
                            setCreateForm((prev) => ({ ...prev, series_type: event.target.value }))
                          }
                        >
                          <option value="series">Series</option>
                          <option value="book">Book</option>
                          <option value="novel">Novel</option>
                          <option value="course">Course</option>
                          <option value="collection">Collection</option>
                        </select>
                      </div>

                      <div className="wsp-field">
                        <label htmlFor="wsp-create-status">Status</label>
                        <select
                          id="wsp-create-status"
                          className="wsp-select"
                          value={createForm.status}
                          onChange={(event) =>
                            setCreateForm((prev) => ({ ...prev, status: event.target.value }))
                          }
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="wsp-field">
                      <label htmlFor="wsp-create-description">Description</label>
                      <textarea
                        id="wsp-create-description"
                        className="wsp-textarea"
                        value={createForm.description}
                        onChange={(event) =>
                          setCreateForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                      />
                    </div>

                    <div className="wsp-field">
                      <label htmlFor="wsp-create-cover">Cover image URL</label>
                      <div className="wsp-cover-row">
                        <input
                          id="wsp-create-cover"
                          className="wsp-input"
                          value={createForm.cover_image}
                          onChange={(event) =>
                            setCreateForm((prev) => ({ ...prev, cover_image: event.target.value }))
                          }
                        />
                        <label
                          className={`wsp-btn wsp-upload-btn${uploadingCover === 'create' ? ' disabled' : ''}`}
                          htmlFor="wsp-create-cover-file"
                        >
                          {uploadingCover === 'create' ? 'Uploading...' : 'Upload'}
                        </label>
                        <input
                          id="wsp-create-cover-file"
                          className="wsp-file-input"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          disabled={uploadingCover === 'create'}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) uploadCoverImage(file, 'create');
                            event.target.value = '';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="wsp-drawer-foot">
                  <button type="button" className="wsp-btn" onClick={closePanel}>
                    Cancel
                  </button>
                  <button type="submit" className="wsp-btn primary" disabled={busy === 'create'}>
                    {busy === 'create' ? 'Creating...' : 'Create series'}
                  </button>
                </div>
              </form>
            ) : null}

            {panel === 'edit-series' ? (
              <form className="wsp-form" onSubmit={updateSeries}>
                <div className="wsp-drawer-body">
                  <div className="wsp-form">
                    <div className="wsp-field">
                      <label htmlFor="wsp-edit-title">Title</label>
                      <input
                        id="wsp-edit-title"
                        className="wsp-input"
                        value={editForm.title}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, title: event.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="wsp-field">
                      <label htmlFor="wsp-edit-slug">Slug</label>
                      <input
                        id="wsp-edit-slug"
                        className="wsp-input"
                        value={editForm.slug}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, slug: event.target.value }))
                        }
                      />
                    </div>

                    <div className="wsp-form-grid">
                      <div className="wsp-field">
                        <label htmlFor="wsp-edit-type">Type</label>
                        <select
                          id="wsp-edit-type"
                          className="wsp-select"
                          value={editForm.series_type}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, series_type: event.target.value }))
                          }
                        >
                          <option value="series">Series</option>
                          <option value="book">Book</option>
                          <option value="novel">Novel</option>
                          <option value="course">Course</option>
                          <option value="collection">Collection</option>
                        </select>
                      </div>

                      <div className="wsp-field">
                        <label htmlFor="wsp-edit-status">Status</label>
                        <select
                          id="wsp-edit-status"
                          className="wsp-select"
                          value={editForm.status}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, status: event.target.value }))
                          }
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="wsp-field">
                      <label htmlFor="wsp-edit-description">Description</label>
                      <textarea
                        id="wsp-edit-description"
                        className="wsp-textarea"
                        value={editForm.description}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                      />
                    </div>

                    <div className="wsp-field">
                      <label htmlFor="wsp-edit-cover">Cover image URL</label>
                      <div className="wsp-cover-row">
                        <input
                          id="wsp-edit-cover"
                          className="wsp-input"
                          value={editForm.cover_image}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, cover_image: event.target.value }))
                          }
                        />
                        <label
                          className={`wsp-btn wsp-upload-btn${uploadingCover === 'edit' ? ' disabled' : ''}`}
                          htmlFor="wsp-edit-cover-file"
                        >
                          {uploadingCover === 'edit' ? 'Uploading...' : 'Upload'}
                        </label>
                        <input
                          id="wsp-edit-cover-file"
                          className="wsp-file-input"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          disabled={uploadingCover === 'edit'}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) uploadCoverImage(file, 'edit');
                            event.target.value = '';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="wsp-drawer-foot split">
                  <button
                    type="button"
                    className="wsp-btn danger"
                    disabled={busy === 'delete-series'}
                    onClick={() => deleteSeries(selectedId)}
                  >
                    {busy === 'delete-series' ? 'Deleting...' : 'Delete'}
                  </button>

                  <div className="wsp-drawer-foot-right">
                    <button type="button" className="wsp-btn" onClick={closePanel}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="wsp-btn primary"
                      disabled={busy === 'update-series'}
                    >
                      {busy === 'update-series' ? 'Updating...' : 'Update series'}
                    </button>
                  </div>
                </div>
              </form>
            ) : null}

            {panel === 'placement' ? (
              <form className="wsp-form" onSubmit={savePlacement}>
                <div className="wsp-drawer-body">
                  <div className="wsp-form">
                    <div className="wsp-selected-mini">
                      <strong>{selectedSeries?.title || 'Selected series'}</strong>
                      <span>
                        {typeLabel(selectedSeries?.series_type)} | {statusLabel(selectedSeries?.status)}
                      </span>
                    </div>

                    <div className="wsp-field">
                      <label htmlFor="wsp-post-id">Writer post</label>
                      <input
                        id="wsp-post-id"
                        type="number"
                        min="1"
                        list="writer-series-post-options"
                        className="wsp-input"
                        value={itemForm.post_id}
                        disabled={!!editingPostId}
                        onChange={(event) =>
                          setItemForm((prev) => ({ ...prev, post_id: event.target.value }))
                        }
                        required
                      />
                      <datalist id="writer-series-post-options">
                        {posts.map((post) => (
                          <option key={post.id} value={post.id}>
                            {post.title || `Post #${post.id}`}
                          </option>
                        ))}
                      </datalist>
                      <span className="wsp-form-help">
                        {posts.length
                          ? 'Choose a post from the suggestions or enter its post ID.'
                          : 'Enter the Writer post ID. Post suggestions are unavailable right now.'}
                      </span>
                    </div>

                    <div className="wsp-form-grid">
                      <div className="wsp-field">
                        <label htmlFor="wsp-season">Season</label>
                        <input
                          id="wsp-season"
                          type="number"
                          min="1"
                          className="wsp-input"
                          value={itemForm.season_number}
                          onChange={(event) =>
                            setItemForm((prev) => ({ ...prev, season_number: event.target.value }))
                          }
                        />
                      </div>

                      <div className="wsp-field">
                        <label htmlFor="wsp-episode">Episode</label>
                        <input
                          id="wsp-episode"
                          type="number"
                          min="1"
                          className="wsp-input"
                          value={itemForm.episode_number}
                          onChange={(event) =>
                            setItemForm((prev) => ({ ...prev, episode_number: event.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="wsp-field">
                      <label htmlFor="wsp-order">Order</label>
                      <input
                        id="wsp-order"
                        type="number"
                        min="0"
                        className="wsp-input"
                        value={itemForm.sort_order}
                        onChange={(event) =>
                          setItemForm((prev) => ({ ...prev, sort_order: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="wsp-drawer-foot">
                  <button type="button" className="wsp-btn" onClick={closePanel}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="wsp-btn primary"
                    disabled={busy === 'save-placement'}
                  >
                    {busy === 'save-placement'
                      ? 'Saving...'
                      : editingPostId
                        ? 'Update placement'
                        : 'Add to series'}
                  </button>
                </div>
              </form>
            ) : null}
          </aside>
        </>
      ) : null}
    </div>
  );
}
