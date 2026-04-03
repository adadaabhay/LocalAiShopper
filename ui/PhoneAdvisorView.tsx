import type { FormEvent } from 'react';
import type { PhoneAdvice } from './types';
import { defaultBrands, ramOptions, storageOptions } from './constants';

export type PhoneAdvisorViewProps = {
  brand: string;
  setBrand: (v: string) => void;
  model: string;
  setModel: (v: string) => void;
  ram: string;
  setRam: (v: string) => void;
  storage: string;
  setStorage: (v: string) => void;
  budget: number;
  setBudget: (v: number) => void;
  manualPrice: number;
  setManualPrice: (v: number) => void;
  providerMode: string;
  loading: boolean;
  error: string;
  result: PhoneAdvice | null;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export function PhoneAdvisorView({
  brand,
  setBrand,
  model,
  setModel,
  ram,
  setRam,
  storage,
  setStorage,
  budget,
  setBudget,
  manualPrice,
  setManualPrice,
  providerMode,
  loading,
  error,
  result,
  onSubmit,
}: PhoneAdvisorViewProps) {
  return (
    <div className="phone-advisor-root min-h-full">
      <div className="shell">
      <section className="hero">
        <p className="eyebrow">Phone advisor pipeline</p>
        <h1>Pick variant. Track prices. Get decision-ready advice.</h1>
        <p className="lede">
          Works with a cloud LLM (Gemini) or a local Ollama model. Pulls best-effort live offers from
          marketplaces and brand sources, then summarizes benchmarks, cautions, and alternatives.
        </p>
        <p className="provider-chip">Backend mode: {providerMode}</p>
      </section>

      <section className="panel">
        <form className="analyzer phone-form" onSubmit={onSubmit}>
          <label>
            Brand
            <input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Samsung" />
          </label>
          <label>
            Model
            <input value={model} onChange={(event) => setModel(event.target.value)} placeholder="Galaxy S24" />
          </label>
          <label>
            RAM
            <select value={ram} onChange={(event) => setRam(event.target.value)}>
              {ramOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Storage
            <select value={storage} onChange={(event) => setStorage(event.target.value)}>
              {storageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Budget (INR)
            <input
              type="number"
              value={budget}
              onChange={(event) => setBudget(Number(event.target.value || 0))}
              min={0}
            />
          </label>

          <label>
            Manual price override (INR, optional)
            <input
              type="number"
              value={manualPrice}
              onChange={(event) => setManualPrice(Number(event.target.value || 0))}
              min={0}
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Finding offers...' : 'Analyze this phone'}
          </button>
        </form>

        {error ? <p className="message error">{error}</p> : null}

        {!result && !error ? (
          <div className="placeholder">
            <h2>How this helps a real buyer</h2>
            <ul>
              <li>Variant-level selection (RAM + storage + budget).</li>
              <li>Best price and median snapshot from multiple sites.</li>
              <li>Benchmarks, cautions, and alternatives in your range.</li>
            </ul>
          </div>
        ) : null}

        {result ? (
          <div className="result">
            <div className="result-header">
              <div>
                <p className="eyebrow">Provider: {result.provider}</p>
                <h2>{result.query}</h2>
              </div>
              <p className="recommendation">{result.buyVerdict}</p>
            </div>

            <p className="summary">{result.insight}</p>

            <div className="quick-stats">
              <div className="stat">
                <span>Best price</span>
                <strong>{result.pricing.bestPriceLabel}</strong>
                {result.trend?.bestTrend?.pct != null ? (
                  <p className="stat-trend">
                    Trend: {result.trend.bestTrend.direction} {result.trend.bestTrend.pct}%
                  </p>
                ) : null}
                {result.trend?.persistence === 'memory' ? (
                  <p className="stat-note">Trend is per-server on Vercel (resets when cold).</p>
                ) : null}
              </div>
              <div className="stat">
                <span>Median price</span>
                <strong>{result.pricing.medianPriceLabel}</strong>
                {result.trend?.medianTrend?.pct != null ? (
                  <p className="stat-trend">
                    Trend: {result.trend.medianTrend.direction} {result.trend.medianTrend.pct}%
                  </p>
                ) : null}
              </div>
              <div className="stat">
                <span>Offers found</span>
                <strong>{result.pricing.totalOffers}</strong>
              </div>
            </div>

            <div className="advisor-grid">
              <article className="advisor-card">
                <h3>Benchmarks</h3>
                <div className="score-list">
                  {result.benchmarks.map((item) => (
                    <div key={item.metric} className="score-item">
                      <div>
                        <strong>{item.metric}</strong>
                        <p>{item.note}</p>
                      </div>
                      <span>{item.score}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="advisor-card">
                <h3>Best alternatives</h3>
                <ul>
                  {result.alternatives.map((item) => (
                    <li key={item.model}>
                      <strong>{item.model}</strong> - {item.estimatedPriceLabel} - {item.why}
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <article className="advisor-card">
              <h3>Offer board</h3>
              {result.offers.length === 0 ? (
                <p className="empty-offers">
                  No offers were detected (possible blocking/markup changes). You’ll still get an AI-assisted shortlist,
                  but verify on checkout.
                </p>
              ) : null}
              <div className="stores">
                {result.offers.map((offer) => {
                  const row = (
                    <>
                      <div>
                        <strong>
                          {offer.store} ({offer.sourceType})
                        </strong>
                        <p>{offer.title}</p>
                        <p>
                          Variant: {offer.ram} / {offer.storage} | Confidence: {offer.confidence}
                        </p>
                        {offer.variantMatchMode ? (
                          <p className="match-line">
                            Match: {offer.variantMatchMode}
                            {offer.variantConfirmed ? ' (PDP confirmed)' : ' (best-effort)'}
                          </p>
                        ) : null}
                      </div>
                      <span>{offer.priceLabel}</span>
                    </>
                  );
                  const key = `${offer.store}-${offer.title}-${offer.priceLabel}`;
                  if (offer.url && offer.url.trim()) {
                    return (
                      <a key={key} className="store" href={offer.url} target="_blank" rel="noreferrer">
                        {row}
                      </a>
                    );
                  }
                  return (
                    <div key={key} className="store store--static">
                      {row}
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="advisor-card">
              <h3>Cautions</h3>
              <ul>
                {result.cautions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <p className="disclaimer">
              Note: Prices are best-effort scraped snapshots. Verify the final price and variant on the checkout page.
            </p>
          </div>
        ) : null}
      </section>
      </div>
    </div>
  );
}
