"use client";

import { useCallback, useEffect, useState } from "react";

const API = "https://api.aladhan.com/v1";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Day {
  gregorian: number;
  hijri: number;
  hijriMonth: string;
  weekdayIndex: number; // 0 = Monday
  isToday: boolean;
  iso: string;
}

interface MonthData {
  label: string;
  hijriLabel: string;
  days: Day[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function HijriCalendar() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [data, setData] = useState<MonthData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (m: number, y: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/gToHCalendar/${m}/${y}`);
      if (!res.ok) throw new Error("Request failed");
      const json = await res.json();
      const rows: unknown[] = json?.data ?? [];
      if (!rows.length) throw new Error("Empty month");

      const todayIso = new Date().toISOString().slice(0, 10);
      const days: Day[] = rows.map((row) => {
        const r = row as {
          gregorian: { day: string; month: { number: number }; year: string; weekday: { en: string } };
          hijri: { day: string; month: { en: string } };
        };
        const iso = `${r.gregorian.year}-${String(r.gregorian.month.number).padStart(2, "0")}-${r.gregorian.day}`;
        const wd = WEEKDAYS.indexOf(r.gregorian.weekday.en.slice(0, 3));
        return {
          gregorian: Number(r.gregorian.day),
          hijri: Number(r.hijri.day),
          hijriMonth: r.hijri.month.en,
          weekdayIndex: wd < 0 ? 0 : wd,
          isToday: iso === todayIso,
          iso,
        };
      });

      const hijriMonths = Array.from(new Set(days.map((d) => d.hijriMonth)));
      setData({
        label: `${MONTH_NAMES[m - 1]} ${y}`,
        hijriLabel: hijriMonths.join(" – "),
        days,
      });
    } catch {
      setError("Could not load the calendar. Please try again.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(month, year);
  }, [month, year, load]);

  const shift = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  const todayCell = data?.days.find((d) => d.isToday);
  const leading = data ? data.days[0].weekdayIndex : 0;

  return (
    <div className="tool">
      {todayCell && (
        <div className="hijri-today">
          <span className="stat-num">
            {todayCell.hijri} {todayCell.hijriMonth}
          </span>
          <span className="stat-label">Today in the Hijri calendar</span>
        </div>
      )}

      <div className="cal-head">
        <button type="button" className="icon-button" onClick={() => shift(-1)} aria-label="Previous month">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="cal-title">
          <strong>{data?.label ?? "…"}</strong>
          {data?.hijriLabel && <span>{data.hijriLabel}</span>}
        </div>
        <button type="button" className="icon-button" onClick={() => shift(1)} aria-label="Next month">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {loading && <p className="tool-status">Loading…</p>}
      {error && (
        <p className="tool-status error" role="alert">
          {error}
        </p>
      )}

      {data && (
        <div className="cal-grid" role="grid" aria-label={`${data.label} calendar`}>
          {WEEKDAYS.map((w) => (
            <div key={w} className="cal-weekday" role="columnheader">
              {w}
            </div>
          ))}
          {Array.from({ length: leading }).map((_, i) => (
            <div key={`pad-${i}`} className="cal-cell empty" aria-hidden="true" />
          ))}
          {data.days.map((d) => (
            <div key={d.iso} className={`cal-cell${d.isToday ? " today" : ""}`} role="gridcell">
              <span className="cal-greg">{d.gregorian}</span>
              <span className="cal-hijri">{d.hijri}</span>
            </div>
          ))}
        </div>
      )}

      <p className="tool-note">
        Hijri dates are calculated astronomically. The start of a month depends on
        local moon sighting — follow your local ru&apos;yat-e-hilal committee.
      </p>
    </div>
  );
}
