import type { Metadata } from "next";
import PrayerTimes from "../../components/tools/PrayerTimes";

export const metadata: Metadata = {
  title: "Prayer Times — Hanafi Asr for Your Location",
  description:
    "Accurate Fajr, Dhuhr, Asr, Maghrib and Isha times for your city, calculated on the Hanafi position for Asr, with today's Hijri date.",
  alternates: { canonical: "/tools/prayer-times" },
};

export default function PrayerTimesPage() {
  return (
    <>
      <div className="page-head">
        <span className="eyebrow" dir="rtl">
          اوقاتِ نماز
        </span>
        <h1>Prayer Times</h1>
        <p>Today&apos;s salah times for wherever you are, with Asr on the Hanafi calculation.</p>
      </div>
      <PrayerTimes />
    </>
  );
}
