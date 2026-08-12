import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';
import {
  Card,
  PageHeader,
  formatDateTime,
  money,
} from '../../components/writerReader/WorkspaceUi';

export default function ReaderAppreciationsPage() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/reader/credits')
      .then((res) => setTransactions(res?.data?.transactions || []))
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load appreciation history.'));
  }, []);

  const appreciations = useMemo(
    () => transactions.filter((item) => String(item.transaction_type) === 'appreciation'),
    [transactions]
  );

  return (
    <ReaderUnifiedShell
      title="Appreciation history"
      subtitle="Every Reader-to-Writer appreciation remains traceable in the credit ledger."
    >
      <div className="reader-unified-page-pad">
      <PageHeader eyebrow="Reader" title="Writer appreciation history" />
      {error ? <Card style={{ marginBottom: 16, color: '#b91c1c' }}>{error}</Card> : null}
      <Card>
        <div style={{ display: 'grid', gap: 10 }}>
          {appreciations.map((item) => (
            <div key={item.id} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              <strong>{item.credits_amount} credits</strong>
              <div style={{ color: '#64748b', fontSize: 13 }}>
                ${money(item.usd_value, 6)} | {formatDateTime(item.created_at)}
              </div>
              {item.description ? <div style={{ marginTop: 5 }}>{item.description}</div> : null}
            </div>
          ))}
          {!appreciations.length ? <div style={{ color: '#64748b' }}>No Writer appreciations yet.</div> : null}
        </div>
      </Card>
      </div>
    </ReaderUnifiedShell>
  );
}
