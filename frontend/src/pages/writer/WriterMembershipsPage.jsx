import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import {
  formatDateTime,
  money,
} from '../../components/writerReader/WorkspaceUi';

function getStatusClass(status) {
  const value = String(status || '').trim().toLowerCase();

  if (value === 'active') return 'active';
  if (value === 'inactive') return 'inactive';
  return 'neutral';
}

export default function WriterMembershipsPage() {
  const [eligibility, setEligibility] = useState(null);
  const [offer, setOffer] = useState(null);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ monthly_price_usd: '', status: 'inactive' });
  const [error, setError] = useState('');

  const activeMembers = useMemo(
    () => members.filter((item) => String(item?.status || '').toLowerCase() === 'active').length,
    [members]
  );

  async function load() {
    try {
      setError('');

      const [offerRes, membersRes] = await Promise.all([
        api.get('/api/writer/access/membership-offer'),
        api.get('/api/writer/access/members'),
      ]);

      setEligibility(offerRes?.data?.eligibility || null);
      setOffer(offerRes?.data?.offer || null);
      setMembers(membersRes?.data?.members || membersRes?.data?.memberships || []);
      setForm({
        monthly_price_usd: offerRes?.data?.offer?.monthly_price_usd || '',
        status: offerRes?.data?.offer?.status || 'inactive',
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load Writer memberships.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(event) {
    event.preventDefault();

    try {
      setError('');

      await api.put('/api/writer/access/membership-offer', {
        monthly_price_usd: Number(form.monthly_price_usd),
        status: form.status,
      });

      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save membership offer.');
    }
  }

  const isEligible = !!eligibility?.eligible;
  const eligibilityLabel = isEligible ? 'Eligible' : 'Not eligible yet';
  const offerAmount = offer ? `$${money(offer.monthly_price_usd)} / month` : 'Not set';
  const mobileOfferAmount = offer ? `$${money(offer.monthly_price_usd)}/mo` : '-';

  return (
    <div className="writer-memberships-page">
      <style>{styles}</style>

      <div className="writer-memberships-mobile-title">Memberships</div>

      {error ? (
        <div className="writer-memberships-alert" role="alert">
          {error}
        </div>
      ) : null}

      <section className="writer-memberships-summary">
        <article className="writer-memberships-stat">
          <span className="writer-memberships-stat-desktop-label">Eligibility</span>
          <span className="writer-memberships-stat-mobile-label">Eligible</span>
          <strong className="writer-memberships-stat-desktop-value">{eligibilityLabel}</strong>
          <strong className="writer-memberships-stat-mobile-value">{isEligible ? 'Yes' : 'No'}</strong>
        </article>

        <article className="writer-memberships-stat">
          <span className="writer-memberships-stat-desktop-label">Current offer</span>
          <span className="writer-memberships-stat-mobile-label">Offer</span>
          <strong className="writer-memberships-stat-desktop-value">{offerAmount}</strong>
          <strong className="writer-memberships-stat-mobile-value">{mobileOfferAmount}</strong>
        </article>

        <article className="writer-memberships-stat">
          <span className="writer-memberships-stat-desktop-label">Active members</span>
          <span className="writer-memberships-stat-mobile-label">Members</span>
          <strong>{activeMembers}</strong>
        </article>
      </section>

      <section className="writer-memberships-workspace">
        <article className="writer-memberships-offer-card">
          <header className="writer-memberships-card-head">
            <strong>Membership offer</strong>
            <span className={`writer-memberships-pill ${isEligible ? 'eligible' : 'neutral'}`}>
              {eligibilityLabel}
            </span>
          </header>

          <p className="writer-memberships-helper">
            {isEligible
              ? 'Set the monthly direct membership offer.'
              : eligibility?.reason || 'Direct Paid Membership is not available yet.'}
          </p>

          {!isEligible && eligibility?.policy?.minimum_followers !== null ? (
            <div className="writer-memberships-current-offer">
              <span>FOLLOWER REQUIREMENT</span>
              <strong>
                {Number(eligibility?.follower_count || 0).toLocaleString()} / {Number(
                  eligibility?.policy?.minimum_followers || 0
                ).toLocaleString()} followers
              </strong>
            </div>
          ) : null}

          <form className="writer-memberships-form" onSubmit={save}>
            <label className="writer-memberships-field">
              <span>MONTHLY PRICE (USD)</span>
              <div className="writer-memberships-price-control">
                <span className="writer-memberships-currency-prefix">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  disabled={!isEligible}
                  value={form.monthly_price_usd}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      monthly_price_usd: event.target.value,
                    }))
                  }
                />
              </div>
            </label>

            <label className="writer-memberships-field">
              <span>OFFER STATUS</span>
              <select
                value={form.status}
                disabled={!isEligible}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    status: event.target.value,
                  }))
                }
              >
                <option value="inactive">Inactive</option>
                <option value="active">Active</option>
              </select>
            </label>

            <div className="writer-memberships-current-offer">
              <span className="writer-memberships-current-desktop">CURRENT OFFER</span>
              <span className="writer-memberships-current-mobile">Current</span>
              <strong>{offerAmount}</strong>
            </div>

            <button type="submit" className="writer-memberships-save" disabled={!isEligible}>
              Save offer
            </button>
          </form>
        </article>

        <article className="writer-memberships-members-card">
          <header className="writer-memberships-card-head">
            <strong>Members</strong>
            <span className="writer-memberships-pill neutral">{activeMembers} active</span>
          </header>

          <div className="writer-memberships-desktop-list">
            <div className="writer-memberships-table-head">
              <span>READER</span>
              <span>STATUS</span>
              <span>STARTED</span>
            </div>

            {members.length ? (
              members.map((item) => (
                <div className="writer-memberships-member-row" key={item.id}>
                  <strong>Reader #{item.reader_user_id}</strong>
                  <span className={`writer-memberships-pill ${getStatusClass(item.status)}`}>
                    {item.status || '-'}
                  </span>
                  <span className="writer-memberships-member-date">
                    {formatDateTime(item.starts_at)}
                  </span>
                </div>
              ))
            ) : (
              <div className="writer-memberships-empty">No active Writer members yet.</div>
            )}
          </div>

          <div className="writer-memberships-mobile-list">
            {members.length ? (
              members.map((item) => (
                <div className="writer-memberships-member-card" key={item.id}>
                  <div className="writer-memberships-member-card-head">
                    <strong>Reader #{item.reader_user_id}</strong>
                    <span className={`writer-memberships-pill ${getStatusClass(item.status)}`}>
                      {item.status || '-'}
                    </span>
                  </div>
                  <span>Started {formatDateTime(item.starts_at)}</span>
                </div>
              ))
            ) : (
              <div className="writer-memberships-empty">No active Writer members yet.</div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .writer-memberships-page {
    width: 100%;
    color: #111827;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .writer-memberships-page input,
  .writer-memberships-page select,
  .writer-memberships-page button {
    font: inherit;
  }

  .writer-memberships-mobile-title,
  .writer-memberships-stat-mobile-label,
  .writer-memberships-stat-mobile-value,
  .writer-memberships-current-mobile,
  .writer-memberships-mobile-list {
    display: none;
  }

  .writer-memberships-alert {
    margin-bottom: 12px;
    padding: 11px 13px;
    border: 1px solid #fecaca;
    border-radius: 11px;
    background: #fef2f2;
    color: #b42318;
    font-size: 11px;
    line-height: 1.45;
    font-weight: 600;
  }

  .writer-memberships-summary {
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-memberships-stat {
    min-width: 0;
    height: 82px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-memberships-stat > span {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.3;
    font-weight: 500;
  }

  .writer-memberships-stat > strong {
    min-width: 0;
    color: #111827;
    font-size: 23px;
    line-height: 1.15;
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .writer-memberships-workspace {
    display: grid;
    grid-template-columns: minmax(320px, 430px) minmax(0, 1fr);
    gap: 14px;
    align-items: start;
  }

  .writer-memberships-offer-card,
  .writer-memberships-members-card {
    min-width: 0;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-memberships-card-head {
    min-height: 30px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-memberships-card-head > strong {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-memberships-pill {
    min-height: 24px;
    padding: 0 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    background: #f8fafc;
    color: #6b7280;
    font-size: 9px;
    line-height: 1;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .writer-memberships-pill.eligible,
  .writer-memberships-pill.active {
    border-color: #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .writer-memberships-pill.inactive,
  .writer-memberships-pill.neutral {
    border-color: #e5e7eb;
    background: #f8fafc;
    color: #6b7280;
  }

  .writer-memberships-helper {
    margin: 8px 0 12px;
    color: #6b7280;
    font-size: 10px;
    line-height: 1.4;
  }

  .writer-memberships-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .writer-memberships-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .writer-memberships-field > span {
    color: #6b7280;
    font-size: 9px;
    line-height: 1.2;
    font-weight: 600;
  }

  .writer-memberships-price-control {
    height: 42px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    gap: 2px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    background: #ffffff;
  }

  .writer-memberships-currency-prefix {
    flex: 0 0 auto;
    color: #111827;
    font-size: 11px;
    line-height: 1;
    font-weight: 500;
  }

  .writer-memberships-price-control input,
  .writer-memberships-field select {
    width: 100%;
    height: 42px;
    min-width: 0;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    outline: 0;
    background: #ffffff;
    color: #111827;
    font-size: 11px;
    font-weight: 500;
  }

  .writer-memberships-price-control input {
    height: 40px;
    padding: 0;
    border: 0;
    border-radius: 0;
  }

  .writer-memberships-field select {
    padding: 0 12px;
  }

  .writer-memberships-price-control:focus-within,
  .writer-memberships-field select:focus {
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.06);
  }

  .writer-memberships-current-offer {
    min-height: 60px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #f8fafc;
  }

  .writer-memberships-current-offer > span {
    color: #6b7280;
    font-size: 8px;
    line-height: 1.2;
    font-weight: 600;
  }

  .writer-memberships-current-offer > strong {
    color: #111827;
    font-size: 15px;
    line-height: 1.25;
    font-weight: 600;
  }

  .writer-memberships-save {
    width: 104px;
    height: 38px;
    border: 1px solid #1b1f25;
    border-radius: 10px;
    background: #1b1f25;
    color: #ffffff;
    font-size: 11px;
    line-height: 1;
    font-weight: 600;
    cursor: pointer;
  }

  .writer-memberships-members-card {
    display: flex;
    flex-direction: column;
  }

  .writer-memberships-desktop-list {
    margin-top: 0;
  }

  .writer-memberships-table-head {
    height: 34px;
    padding: 0 12px;
    display: grid;
    grid-template-columns: 180px 90px minmax(0, 1fr);
    align-items: center;
    background: #f8fafc;
  }

  .writer-memberships-table-head span {
    color: #6b7280;
    font-size: 9px;
    line-height: 1.2;
    font-weight: 600;
  }

  .writer-memberships-table-head span:last-child {
    text-align: right;
  }

  .writer-memberships-member-row {
    min-height: 58px;
    padding: 0 12px;
    display: grid;
    grid-template-columns: 180px 90px minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    border-top: 1px solid #f1f2f4;
  }

  .writer-memberships-member-row > strong {
    color: #111827;
    font-size: 11px;
    line-height: 1.35;
    font-weight: 600;
  }

  .writer-memberships-member-row .writer-memberships-pill {
    justify-self: start;
  }

  .writer-memberships-member-date {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.35;
    text-align: right;
  }

  .writer-memberships-empty {
    padding: 30px 12px;
    color: #6b7280;
    font-size: 10px;
    line-height: 1.4;
    text-align: center;
  }

  @media (max-width: 900px) {
    .writer-memberships-workspace {
      grid-template-columns: minmax(280px, 40%) minmax(0, 1fr);
    }

    .writer-memberships-table-head,
    .writer-memberships-member-row {
      grid-template-columns: 145px 78px minmax(0, 1fr);
    }
  }

  @media (max-width: 767px) {
    .writer-memberships-mobile-title {
      min-height: 50px;
      margin-bottom: 10px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #ffffff;
      color: #111827;
      font-size: 14px;
      line-height: 1.2;
      font-weight: 600;
    }

    .writer-memberships-alert {
      margin-bottom: 10px;
    }

    .writer-memberships-summary {
      margin-bottom: 10px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .writer-memberships-stat {
      height: 72px;
      padding: 10px;
      gap: 4px;
      border-radius: 14px;
    }

    .writer-memberships-stat-desktop-label,
    .writer-memberships-stat-desktop-value {
      display: none;
    }

    .writer-memberships-stat-mobile-label,
    .writer-memberships-stat-mobile-value {
      display: block;
    }

    .writer-memberships-stat > span {
      font-size: 8px;
    }

    .writer-memberships-stat > strong {
      font-size: 18px;
      line-height: 1.15;
    }

    .writer-memberships-workspace {
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
    }

    .writer-memberships-offer-card,
    .writer-memberships-members-card {
      width: 100%;
      padding: 14px;
      border-radius: 14px;
    }

    .writer-memberships-card-head > strong {
      font-size: 13px;
    }

    .writer-memberships-helper {
      display: none;
    }

    .writer-memberships-form {
      gap: 10px;
    }

    .writer-memberships-field > span {
      font-size: 9px;
    }

    .writer-memberships-price-control,
    .writer-memberships-field select {
      height: 42px;
      font-size: 11px;
    }

    .writer-memberships-current-desktop {
      display: none;
    }

    .writer-memberships-current-mobile {
      display: block;
    }

    .writer-memberships-current-offer {
      min-height: 54px;
      padding: 10px;
      gap: 3px;
    }

    .writer-memberships-current-offer > strong {
      font-size: 13px;
    }

    .writer-memberships-save {
      width: 100%;
      height: 38px;
    }

    .writer-memberships-desktop-list {
      display: none;
    }

    .writer-memberships-mobile-list {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .writer-memberships-member-card {
      width: 100%;
      padding: 11px;
      display: flex;
      flex-direction: column;
      gap: 7px;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      background: #ffffff;
    }

    .writer-memberships-member-card-head {
      min-height: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .writer-memberships-member-card-head > strong {
      flex: 1;
      min-width: 0;
      color: #111827;
      font-size: 11px;
      line-height: 1.3;
      font-weight: 600;
    }

    .writer-memberships-member-card > span {
      color: #6b7280;
      font-size: 9px;
      line-height: 1.35;
    }

    .writer-memberships-pill {
      min-height: 24px;
      padding: 0 9px;
      font-size: 9px;
    }
  }
`;
