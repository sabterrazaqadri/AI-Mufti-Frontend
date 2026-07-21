import type { Metadata } from "next";
import Zakat from "../../components/tools/Zakat";

export const metadata: Metadata = {
  title: "Zakat Calculator — Nisab by Gold or Silver",
  description:
    "Work out the zakat due on your cash, gold, silver, business stock and savings, with nisab calculated on either the silver (612.36g) or gold (87.48g) threshold.",
  alternates: { canonical: "/tools/zakat" },
};

export default function ZakatPage() {
  return (
    <>
      <div className="page-head">
        <span className="eyebrow" dir="rtl">
          حسابِ زکوٰۃ
        </span>
        <h1>Zakat Calculator</h1>
        <p>Add what you own, subtract what you owe, and see whether you reach nisab.</p>
      </div>
      <Zakat />
    </>
  );
}
