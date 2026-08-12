import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

function formatUsd(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number.toFixed(2) : '0.00';
}

function gatewayLabel(provider) {
  if (provider === 'paystack') return 'Paystack';
  if (provider === 'flutterwave') return 'Flutterwave';
  if (provider === 'paypal') return 'PayPal';
  return provider;
}

export default function ReaderCreditTopUpPanel() {
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState('');
  const [provider, setProvider] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const settings = options?.settings || {};
  const gateways = Array.isArray(options?.gateways) ? options.gateways : [];

  useEffect(() => {
    let active = true;

    api.get('/api/reader/credits/top-up/options')
      .then((response) => {
        if (!active) return;

        const nextOptions = response?.data || null;
        const nextGateways = Array.isArray(nextOptions?.gateways)
          ? nextOptions.gateways
          : [];
        const quick = Number(
          nextOptions?.settings?.quick_option_one_credits || 0
        );

        setOptions(nextOptions);
        setCredits(quick > 0 ? String(quick) : '');
        setProvider(nextGateways[0]?.provider || '');
      })
      .catch((error) => {
        if (!active) return;
        setNotice({
          type: 'error',
          text:
            error?.response?.data?.message ||
            'Unable to load Reader credit purchase options.',
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const params = new URLSearchParams(window.location.search);
    const topup = String(params.get('topup') || '').toLowerCase();
    const reference = String(params.get('purchase_ref') || '').trim();

    if (topup === 'credited') {
      setNotice({
        type: 'success',
        text: 'Payment verified. Your Reader credits have been added.',
      });
    } else if (topup === 'cancelled') {
      setNotice({
        type: 'error',
        text: 'Payment was cancelled. No Reader credits were added.',
      });
    } else if (topup === 'failed') {
      setNotice({
        type: 'error',
        text: 'Payment could not be verified. No Reader credits were added.',
      });
    } else if (reference && ['pending', 'paid'].includes(topup)) {
      api.get(
        `/api/reader/credits/top-up/status/${encodeURIComponent(reference)}`
      )
        .then((response) => {
          if (!active) return;

          const purchase = response?.data?.purchase || {};
          const status = String(purchase.status || '').toLowerCase();

          if (status === 'credited') {
            window.location.replace('/reader/credits?topup=credited');
            return;
          }

          if (status === 'failed' || status === 'cancelled') {
            setNotice({
              type: 'error',
              text:
                purchase.failure_reason ||
                'Payment was not completed. No Reader credits were added.',
            });
            return;
          }

          setNotice({
            type: 'info',
            text:
              'Payment confirmation is still pending. You can refresh this page to check again.',
          });
        })
        .catch(() => {
          if (!active) return;
          setNotice({
            type: 'info',
            text:
              'Payment confirmation is still pending. You can refresh this page to check again.',
          });
        });
    }

    return () => {
      active = false;
    };
  }, []);

  const creditCount = useMemo(() => {
    const value = Number(credits);
    return Number.isSafeInteger(value) && value > 0 ? value : 0;
  }, [credits]);

  const amountUsd = useMemo(() => {
    const rate = Number(settings.credits_per_usd || 0);
    if (!creditCount || !rate) return 0;
    return Math.ceil((creditCount * 100) / rate) / 100;
  }, [creditCount, settings.credits_per_usd]);

  const validAmount =
    creditCount >= Number(settings.minimum_credits || 0) &&
    creditCount <= Number(settings.maximum_credits || 0);

  const canPurchase =
    Boolean(settings.enabled) &&
    gateways.length > 0 &&
    validAmount &&
    Boolean(provider) &&
    !submitting;

  function chooseQuick(value) {
    setCredits(String(value));
  }

  async function startCheckout() {
    if (!canPurchase) return;

    setSubmitting(true);
    setNotice(null);

    try {
      const response = await api.post(
        '/api/reader/credits/top-up/initialize',
        {
          credits: creditCount,
          provider,
        }
      );

      const checkoutUrl = response?.data?.checkout_url;

      if (!checkoutUrl) {
        throw new Error('Payment gateway did not return a checkout URL.');
      }

      window.location.assign(checkoutUrl);
    } catch (error) {
      setNotice({
        type: 'error',
        text:
          error?.response?.data?.message ||
          error?.message ||
          'Unable to start payment.',
      });
      setSubmitting(false);
    }
  }

  const quickOptions = [
    Number(settings.quick_option_one_credits || 0),
    Number(settings.quick_option_two_credits || 0),
  ].filter((value, index, all) => value > 0 && all.indexOf(value) === index);

  return (
    <>
      <style>{topUpCss}</style>

      {notice ? (
        <div
          className={`reader-credit-topup-notice ${notice.type || 'info'}`}
          role={notice.type === 'error' ? 'alert' : 'status'}
        >
          {notice.text}
        </div>
      ) : null}

      <section className="reader-credit-topup-card">
        <div className="reader-credit-topup-copy">
          <span className="reader-credit-topup-kicker">READER CREDITS</span>
          <h3>Top up your credits</h3>
          <p>
            {Number(settings.credits_per_usd || 100).toLocaleString()} credits
            = $1.00. Choose a quick amount or enter your own.
          </p>
        </div>

        <button
          type="button"
          className="reader-credit-topup-open"
          disabled={loading || !settings.enabled || gateways.length === 0}
          onClick={() => setOpen(true)}
        >
          {loading
            ? 'Loading...'
            : gateways.length === 0
              ? 'Payments unavailable'
              : 'Top up credits'}
        </button>
      </section>

      {open ? (
        <div
          className="reader-credit-topup-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              setOpen(false);
            }
          }}
        >
          <section
            className="reader-credit-topup-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Top up Reader credits"
          >
            <div className="reader-credit-topup-modal-head">
              <div>
                <span>TOP UP READER CREDITS</span>
                <h3>Choose your amount</h3>
              </div>
              <button
                type="button"
                aria-label="Close"
                disabled={submitting}
                onClick={() => setOpen(false)}
              >
                x
              </button>
            </div>

            <div className="reader-credit-topup-rate">
              <strong>
                {Number(settings.credits_per_usd || 100).toLocaleString()} credits
              </strong>
              <span>= $1.00 USD</span>
            </div>

            <div className="reader-credit-topup-quick">
              {quickOptions.map((value) => (
                <button
                  type="button"
                  key={value}
                  className={creditCount === value ? 'selected' : ''}
                  onClick={() => chooseQuick(value)}
                >
                  <strong>{value.toLocaleString()} credits</strong>
                  <span>
                    $
                    {formatUsd(
                      Math.ceil(
                        (value * 100) /
                          Number(settings.credits_per_usd || 100)
                      ) / 100
                    )}
                  </span>
                </button>
              ))}
            </div>

            <label className="reader-credit-topup-field">
              <span>Custom credits</span>
              <input
                type="number"
                min={Number(settings.minimum_credits || 1)}
                max={Number(settings.maximum_credits || 1000000)}
                step="1"
                value={credits}
                onChange={(event) => setCredits(event.target.value)}
                disabled={submitting}
              />
              <small>
                Minimum {Number(settings.minimum_credits || 0).toLocaleString()}
                {' '}credits. Maximum{' '}
                {Number(settings.maximum_credits || 0).toLocaleString()} credits.
              </small>
            </label>

            <div className="reader-credit-topup-total">
              <span>You pay</span>
              <strong>${formatUsd(amountUsd)} USD</strong>
            </div>

            <div className="reader-credit-topup-provider">
              <span>Payment method</span>
              <div>
                {gateways.map((gateway) => (
                  <button
                    type="button"
                    key={gateway.provider}
                    className={
                      provider === gateway.provider ? 'selected' : ''
                    }
                    onClick={() => setProvider(gateway.provider)}
                    disabled={submitting}
                  >
                    {gatewayLabel(gateway.provider)}
                  </button>
                ))}
              </div>
            </div>

            {!validAmount && creditCount > 0 ? (
              <div className="reader-credit-topup-validation" role="alert">
                Enter a whole-credit amount within the allowed range.
              </div>
            ) : null}

            <button
              type="button"
              className="reader-credit-topup-pay"
              disabled={!canPurchase}
              onClick={startCheckout}
            >
              {submitting
                ? 'Opening secure checkout...'
                : `Continue to ${gatewayLabel(provider) || 'payment'}`}
            </button>

            <p className="reader-credit-topup-security">
              Credits are added only after Bloggad verifies the payment on the
              server. Failed, cancelled or underpaid transactions add no credits.
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}

const topUpCss = `
  .reader-credit-topup-notice {
    margin: 0 0 14px;
    padding: 12px 14px;
    border: 1px solid #dbe4ef;
    border-radius: 12px;
    background: #f8fafc;
    color: #334155;
    font-size: 13px;
    line-height: 1.45;
  }
  .reader-credit-topup-notice.success {
    border-color: #bbf7d0;
    background: #f0fdf4;
    color: #166534;
  }
  .reader-credit-topup-notice.error {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }
  .reader-credit-topup-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin: 0 0 16px;
    padding: 18px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  }
  .reader-credit-topup-copy {
    min-width: 0;
  }
  .reader-credit-topup-kicker {
    display: block;
    margin-bottom: 5px;
    color: #64748b;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }
  .reader-credit-topup-copy h3 {
    margin: 0;
    color: #0f172a;
    font-size: 18px;
    line-height: 1.2;
  }
  .reader-credit-topup-copy p {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.45;
  }
  .reader-credit-topup-open,
  .reader-credit-topup-pay {
    border: 0;
    border-radius: 10px;
    background: #111827;
    color: #ffffff;
    font: inherit;
    font-weight: 750;
    cursor: pointer;
  }
  .reader-credit-topup-open {
    flex: 0 0 auto;
    min-height: 42px;
    padding: 0 18px;
    font-size: 13px;
  }
  .reader-credit-topup-open:disabled,
  .reader-credit-topup-pay:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .reader-credit-topup-overlay {
    position: fixed;
    z-index: 3000;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(15, 23, 42, 0.48);
  }
  .reader-credit-topup-modal {
    width: min(100%, 520px);
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    padding: 22px;
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 24px 80px rgba(15, 23, 42, 0.22);
  }
  .reader-credit-topup-modal-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }
  .reader-credit-topup-modal-head span {
    display: block;
    margin-bottom: 4px;
    color: #64748b;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }
  .reader-credit-topup-modal-head h3 {
    margin: 0;
    color: #0f172a;
    font-size: 21px;
  }
  .reader-credit-topup-modal-head > button {
    width: 34px;
    height: 34px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #ffffff;
    color: #475569;
    font-size: 16px;
    cursor: pointer;
  }
  .reader-credit-topup-rate {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 18px;
    padding: 12px 14px;
    border-radius: 12px;
    background: #f8fafc;
    color: #334155;
    font-size: 13px;
  }
  .reader-credit-topup-quick {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
  }
  .reader-credit-topup-quick button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    min-width: 0;
    padding: 14px;
    border: 1px solid #dbe4ef;
    border-radius: 12px;
    background: #ffffff;
    color: #0f172a;
    text-align: left;
    cursor: pointer;
  }
  .reader-credit-topup-quick button.selected {
    border-color: #111827;
    box-shadow: inset 0 0 0 1px #111827;
  }
  .reader-credit-topup-quick strong {
    font-size: 13px;
  }
  .reader-credit-topup-quick span {
    color: #64748b;
    font-size: 12px;
  }
  .reader-credit-topup-field {
    display: grid;
    gap: 6px;
    margin-top: 14px;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
  }
  .reader-credit-topup-field input {
    width: 100%;
    height: 44px;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    padding: 0 12px;
    background: #ffffff;
    color: #0f172a;
    font: inherit;
    font-size: 14px;
    outline: none;
  }
  .reader-credit-topup-field input:focus {
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.12);
  }
  .reader-credit-topup-field small {
    color: #94a3b8;
    font-weight: 500;
    line-height: 1.35;
  }
  .reader-credit-topup-total {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-top: 16px;
    padding: 14px 0;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
  }
  .reader-credit-topup-total span {
    color: #64748b;
    font-size: 12px;
  }
  .reader-credit-topup-total strong {
    color: #0f172a;
    font-size: 20px;
  }
  .reader-credit-topup-provider {
    margin-top: 16px;
  }
  .reader-credit-topup-provider > span {
    display: block;
    margin-bottom: 8px;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
  }
  .reader-credit-topup-provider > div {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .reader-credit-topup-provider button {
    min-height: 38px;
    padding: 0 13px;
    border: 1px solid #dbe4ef;
    border-radius: 9px;
    background: #ffffff;
    color: #334155;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
  .reader-credit-topup-provider button.selected {
    border-color: #111827;
    background: #111827;
    color: #ffffff;
  }
  .reader-credit-topup-validation {
    margin-top: 12px;
    color: #b91c1c;
    font-size: 12px;
  }
  .reader-credit-topup-pay {
    width: 100%;
    min-height: 46px;
    margin-top: 18px;
    font-size: 13px;
  }
  .reader-credit-topup-security {
    margin: 10px 0 0;
    color: #94a3b8;
    font-size: 10px;
    line-height: 1.45;
    text-align: center;
  }
  @media (max-width: 767px) {
    .reader-credit-topup-card {
      align-items: stretch;
      flex-direction: column;
      margin-bottom: 10px;
      padding: 14px;
      border-radius: 12px;
    }
    .reader-credit-topup-open {
      width: 100%;
    }
    .reader-credit-topup-overlay {
      align-items: flex-end;
      padding: 8px;
    }
    .reader-credit-topup-modal {
      max-height: calc(100vh - 16px);
      padding: 16px;
      border-radius: 16px;
    }
    .reader-credit-topup-quick {
      grid-template-columns: 1fr;
    }
  }
`;
