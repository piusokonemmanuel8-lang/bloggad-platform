export function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

export function money(value, digits = 2) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number.toFixed(digits) : '0.00';
}

export function PageHeader({ eyebrow, title, description, actions = null }) {
  return (
    <section style={{
      display: 'flex',
      gap: 18,
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      marginBottom: 22,
    }}>
      <div>
        <div style={{
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#64748b',
          marginBottom: 8,
        }}>{eyebrow}</div>
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          letterSpacing: '-0.04em',
          color: '#0f172a',
        }}>{title}</h1>
        {description ? (
          <p style={{ margin: '10px 0 0', maxWidth: 760, lineHeight: 1.7, color: '#64748b' }}>
            {description}
          </p>
        ) : null}
      </div>
      {actions}
    </section>
  );
}

export function Card({ children, style = {} }) {
  return (
    <section style={{
      border: '1px solid #e2e8f0',
      borderRadius: 22,
      background: '#ffffff',
      padding: 20,
      boxShadow: '0 14px 35px rgba(15, 23, 42, 0.05)',
      ...style,
    }}>
      {children}
    </section>
  );
}

export function Grid({ children, min = 260 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
      gap: 16,
    }}>
      {children}
    </div>
  );
}

export function Stat({ label, value, helper = '' }) {
  return (
    <Card>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ marginTop: 8, fontSize: 30, fontWeight: 900, color: '#0f172a' }}>{value}</div>
      {helper ? <div style={{ marginTop: 6, fontSize: 13, color: '#64748b' }}>{helper}</div> : null}
    </Card>
  );
}

export const inputStyle = {
  width: '100%',
  minHeight: 44,
  borderRadius: 12,
  border: '1px solid #cbd5e1',
  padding: '0 12px',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: 14,
  outline: 'none',
};

export const textareaStyle = {
  ...inputStyle,
  minHeight: 100,
  paddingTop: 12,
  resize: 'vertical',
};

export const primaryButtonStyle = {
  minHeight: 42,
  border: 0,
  borderRadius: 12,
  padding: '0 16px',
  background: '#0f172a',
  color: '#ffffff',
  fontWeight: 800,
  cursor: 'pointer',
};

export const secondaryButtonStyle = {
  ...primaryButtonStyle,
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f172a',
};
