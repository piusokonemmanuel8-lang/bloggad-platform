import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

function flattenTree(nodes = [], depth = 0) {
  return nodes.flatMap((node) => [
    { ...node, depth },
    ...flattenTree(node.children || [], depth + 1),
  ]);
}

export default function WriterTopicSelector({
  value = [],
  onChange,
  primaryCategoryId = '',
  postId = null,
  disabled = false,
}) {
  const [tree, setTree] = useState([]);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setError('');

        const requests = [api.get('/api/public/reading/topics')];

        if (postId) {
          requests.push(api.get(`/api/writer/reading/posts/${postId}/topics`));
        }

        const responses = await Promise.all(requests);

        if (!active) return;

        setTree(responses[0]?.data?.tree || []);

        if (postId && responses[1]?.data?.topic_ids) {
          onChange?.(responses[1].data.topic_ids.map(Number));
        }
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || 'Failed to load topics.');
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [postId]);

  const flat = useMemo(() => flattenTree(tree), [tree]);
  const selected = useMemo(
    () => new Set((Array.isArray(value) ? value : []).map(Number)),
    [value]
  );
  const primaryId = Number(primaryCategoryId || 0);

  const selectedCount = useMemo(() => {
    const ids = new Set(selected);
    if (primaryId) ids.add(primaryId);
    return ids.size;
  }, [selected, primaryId]);

  const filteredFlat = useMemo(() => {
    const query = String(searchQuery || '').trim().toLowerCase();
    if (!query) return flat;

    return flat.filter((item) =>
      String(item?.name || '').toLowerCase().includes(query)
    );
  }, [flat, searchQuery]);

  function toggle(categoryId) {
    const id = Number(categoryId);
    const next = new Set(selected);

    if (next.has(id)) {
      if (id === primaryId) return;
      next.delete(id);
    } else {
      if (next.size >= 5) {
        setError('Choose no more than 5 topics for one post.');
        return;
      }
      next.add(id);
    }

    if (primaryId) next.add(primaryId);

    setError('');
    onChange?.([...next]);
  }

  useEffect(() => {
    if (!primaryId || selected.has(primaryId)) return;

    const withoutPrimary = [...selected].filter((id) => id !== primaryId);
    const next = [primaryId, ...withoutPrimary].slice(0, 5);
    onChange?.(next);
  }, [primaryId]);

  return (
    <div
      style={{
        gridColumn: '1 / -1',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        background: '#fff',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          border: 0,
          background: '#fff',
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Topics</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>
            Choose up to 5 relevant topics. Your primary category is included automatically.
          </div>
        </div>

        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#475569',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <span>{selectedCount}/5 selected</span>
          <span aria-hidden="true">{isOpen ? '^' : 'v'}</span>
        </div>
      </button>

      {isOpen ? (
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            padding: 14,
          }}
        >
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search topics"
              aria-label="Search topics"
              disabled={disabled}
              style={{
                width: '100%',
                minHeight: 42,
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '9px 12px',
                fontSize: 14,
                outline: 'none',
                background: disabled ? '#f8fafc' : '#fff',
              }}
            />
          </div>

          {error ? (
            <div style={{ color: '#b91c1c', fontSize: 13, marginBottom: 10 }}>{error}</div>
          ) : null}

          <div
            style={{
              maxHeight: 270,
              overflowY: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: 10,
              display: 'grid',
              gap: 8,
              overscrollBehavior: 'contain',
            }}
          >
            {filteredFlat.map((item) => {
              const checked = selected.has(Number(item.id)) || Number(item.id) === primaryId;

              return (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    minHeight: 28,
                    paddingLeft: item.depth * 18,
                    cursor: disabled ? 'default' : 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled || Number(item.id) === primaryId}
                    onChange={() => toggle(item.id)}
                  />
                  <span>{item.name}</span>
                  {Number(item.id) === primaryId ? (
                    <span style={{ color: '#64748b', fontSize: 12 }}>(primary)</span>
                  ) : null}
                </label>
              );
            })}

            {!flat.length ? (
              <div style={{ color: '#64748b', fontSize: 13 }}>No active topics yet.</div>
            ) : null}

            {flat.length && !filteredFlat.length ? (
              <div style={{ color: '#64748b', fontSize: 13 }}>
                No topics match your search.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
