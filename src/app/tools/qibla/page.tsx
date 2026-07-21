import type { Metadata } from "next";
import Qibla from "../../components/tools/Qibla";

export const metadata: Metadata = {
  title: "Qibla Direction — Live Compass to the Ka'bah",
  description:
    "Find the exact Qibla direction from your location: the bearing in degrees from true north, distance to Masjid al-Haram, and a live compass on mobile.",
  alternates: { canonical: "/tools/qibla" },
};

export default function QiblaPage() {
  return (
    <>
      <div className="page-head">
        <span className="eyebrow" dir="rtl">
          سمتِ قبلہ
        </span>
        <h1>Qibla Direction</h1>
        <p>The bearing to the Ka&apos;bah from exactly where you are standing.</p>
      </div>
      <Qibla />
    </>
  );
}
