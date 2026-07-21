import type { Metadata } from "next";
import HijriCalendar from "../../components/tools/HijriCalendar";

export const metadata: Metadata = {
  title: "Hijri Calendar — Today's Islamic Date",
  description:
    "Today's Hijri date alongside a full month view mapping Gregorian dates to the Islamic calendar, month by month.",
  alternates: { canonical: "/tools/calendar" },
};

export default function CalendarPage() {
  return (
    <>
      <div className="page-head">
        <span className="eyebrow" dir="rtl">
          اسلامی کیلنڈر
        </span>
        <h1>Hijri Calendar</h1>
        <p>Today&apos;s Islamic date, and any month side by side with the Gregorian one.</p>
      </div>
      <HijriCalendar />
    </>
  );
}
