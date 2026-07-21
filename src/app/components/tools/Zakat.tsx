"use client";

import { useMemo, useState } from "react";

// Classical nisab weights. Silver is the lower threshold, so using it brings more
// wealth into zakat — the position generally taken as safer for the poor.
const NISAB_SILVER_G = 612.36;
const NISAB_GOLD_G = 87.48;
const ZAKAT_RATE = 0.025;

const ASSET_FIELDS = [
  { key: "cash", label: "Cash in hand & bank", urdu: "نقد رقم" },
  { key: "gold", label: "Gold value", urdu: "سونا" },
  { key: "silver", label: "Silver value", urdu: "چاندی" },
  { key: "business", label: "Business stock & goods", urdu: "مالِ تجارت" },
  { key: "receivable", label: "Money owed to you", urdu: "قرض جو آپ کو ملنا ہے" },
  { key: "investments", label: "Investments & savings", urdu: "سرمایہ کاری" },
] as const;

type AssetKey = (typeof ASSET_FIELDS)[number]["key"];

const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export default function Zakat() {
  const [assets, setAssets] = useState<Record<AssetKey, string>>({
    cash: "", gold: "", silver: "", business: "", receivable: "", investments: "",
  });
  const [liabilities, setLiabilities] = useState("");
  const [metalPrice, setMetalPrice] = useState("");
  const [basis, setBasis] = useState<"silver" | "gold">("silver");
  const [currency, setCurrency] = useState("PKR");

  const totals = useMemo(() => {
    const gross = ASSET_FIELDS.reduce((s, f) => s + num(assets[f.key]), 0);
    const net = Math.max(0, gross - num(liabilities));
    const grams = basis === "silver" ? NISAB_SILVER_G : NISAB_GOLD_G;
    const price = num(metalPrice);
    const nisab = price > 0 ? price * grams : null;
    const eligible = nisab !== null && net >= nisab;
    return { gross, net, nisab, eligible, due: eligible ? net * ZAKAT_RATE : 0 };
  }, [assets, liabilities, metalPrice, basis]);

  const fmt = (n: number) =>
    `${currency} ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n)}`;

  return (
    <div className="tool">
      <div className="zakat-controls">
        <div className="field-group">
          <label htmlFor="currency">Currency</label>
          <input
            id="currency"
            className="field"
            value={currency}
            maxLength={4}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
          />
        </div>

        <fieldset className="field-group">
          <legend>Nisab basis</legend>
          <div className="segmented" role="radiogroup" aria-label="Nisab basis">
            {(["silver", "gold"] as const).map((b) => (
              <button
                key={b}
                type="button"
                role="radio"
                aria-checked={basis === b}
                className={basis === b ? "active" : ""}
                onClick={() => setBasis(b)}
              >
                {b === "silver" ? "Silver (612.36g)" : "Gold (87.48g)"}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="field-group">
          <label htmlFor="metal-price">
            Price of one gram of {basis} ({currency})
          </label>
          <input
            id="metal-price"
            className="field"
            type="number"
            inputMode="decimal"
            min="0"
            placeholder="e.g. 285"
            value={metalPrice}
            onChange={(e) => setMetalPrice(e.target.value)}
          />
          <p className="field-hint">
            Today&apos;s local rate — prices move, so this is not fetched for you.
          </p>
        </div>
      </div>

      <div className="zakat-columns">
        <fieldset className="zakat-block">
          <legend>Assets you have owned for a lunar year</legend>
          {ASSET_FIELDS.map((f) => (
            <div key={f.key} className="field-group">
              <label htmlFor={f.key}>
                {f.label}
                <span className="urdu" dir="rtl">
                  {f.urdu}
                </span>
              </label>
              <input
                id={f.key}
                className="field"
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={assets[f.key]}
                onChange={(e) => setAssets((a) => ({ ...a, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </fieldset>

        <div className="zakat-block">
          <fieldset>
            <legend>Deductions</legend>
            <div className="field-group">
              <label htmlFor="liabilities">
                Debts &amp; bills due
                <span className="urdu" dir="rtl">
                  واجب الادا قرض
                </span>
              </label>
              <input
                id="liabilities"
                className="field"
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={liabilities}
                onChange={(e) => setLiabilities(e.target.value)}
              />
            </div>
          </fieldset>

          <div className="zakat-result" aria-live="polite">
            <div className="zakat-line">
              <span>Net zakatable wealth</span>
              <strong>{fmt(totals.net)}</strong>
            </div>
            <div className="zakat-line">
              <span>Nisab ({basis})</span>
              <strong>{totals.nisab === null ? "—" : fmt(totals.nisab)}</strong>
            </div>
            <div className={`zakat-total${totals.eligible ? " due" : ""}`}>
              <span>Zakat payable (2.5%)</span>
              <strong>{fmt(totals.due)}</strong>
            </div>
            <p className="zakat-verdict">
              {totals.nisab === null
                ? "Enter the metal price to see whether you reach nisab."
                : totals.eligible
                ? "Your wealth is above nisab, so zakat is due on it."
                : "Your wealth is below nisab, so no zakat is due."}
            </p>
          </div>
        </div>
      </div>

      <p className="tool-note">
        An estimate only. Zakat on jewellery in use, business assets, partial-year
        holdings and money owed to others has details this calculator does not ask
        about — confirm your final figure with a qualified mufti.
      </p>
    </div>
  );
}
