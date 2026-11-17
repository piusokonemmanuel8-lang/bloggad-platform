import { useEffect, useState } from 'react';
import api from '../../api/axios';

function number(value) {
  return new Intl.NumberFormat('en-US').format(
    Math.max(0, Math.round(Number(value) || 0))
  );
}

function watchTime(value) {
  const total = Math.max(0, Math.floor(Number(value) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours) return hours + 'h ' + minutes + 'm';
  if (minutes) return minutes + 'm ' + seconds + 's';
  return seconds + 's';
}

function percentage(value) {
  const n = Number(value);
  return (Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0)
    .toFixed(1) + '%';
}

export default function WriterVideoAnalyticsV174({ postId }) {
  const [state, setState] = useState({
    loading: true,
    error: '',
    data: null
  });

  useEffect(() => {
    const id = Number(postId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      setState({ loading: false, error: '', data: null });
      return undefined;
    }

    let active = true;

    setState({ loading: true, error: '', data: null });

    api
      .get('/api/public/video-watch/writer/posts/' + id)
      .then((response) => {
        if (!active) return;

        setState({
          loading: false,
          error: '',
          data: response?.data?.video_analytics || null
        });
      })
      .catch(() => {
        if (!active) return;

        setState({
          loading: false,
          error: 'Video analytics are currently unavailable.',
          data: null
        });
      });

    return () => {
      active = false;
    };
  }, [postId]);

  const data = state.data || {};
  const plays = Math.max(0, Number(data.playback_sessions) || 0);
  const completed = Math.min(
    plays,
    Math.max(0, Number(data.completed_plays) || 0)
  );
  const completionRate = plays ? (completed / plays) * 100 : 0;

  const metrics = [
    {
      label: 'Video plays',
      value: number(plays)
    },
    {
      label: 'Watch time',
      value: watchTime(data.watched_seconds)
    },
    {
      label: 'Completed plays',
      value: number(completed)
    },
    {
      label: 'Completion rate',
      value: percentage(completionRate)
    },
    {
      label: 'Average progress',
      value: percentage(data.average_progress_percent)
    }
  ];

  return (
    <section
      aria-label="Video analytics"
      style={{
        padding: '20px 0',
        borderBottom: '1px solid #e5e7eb'
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>
          Video analytics
        </h3>
        <p style={{
          margin: '6px 0 0',
          color: '#64748b',
          fontSize: 13
        }}>
          Actual playback activity recorded for this post
        </p>
      </div>

      {state.loading ? (
        <p role="status">Loading video analytics...</p>
      ) : state.error ? (
        <p role="status" style={{ color: '#b45309' }}>
          {state.error}
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
          gap: 12
        }}>
          {metrics.map((metric) => (
            <div
              key={metric.label}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: 14,
                background: '#f8fafc'
              }}
            >
              <div style={{
                color: '#64748b',
                fontSize: 12,
                marginBottom: 7
              }}>
                {metric.label}
              </div>
              <strong style={{
                fontSize: 20,
                color: '#0f172a'
              }}>
                {metric.value}
              </strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}