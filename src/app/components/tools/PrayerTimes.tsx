"use client";

import { useCallback, useEffect, useState } from "react";

// Hanafi Asr (school=1) — the whole product follows the Hanafi school, so the
// default must match it rather than the API's Shafi'i default.
const API = "https://api.aladhan.com/v1";
const ORDER = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
const URDU: Record<string, string> = {
  Fajr: "فجر",
  Sunrise: "طلوعِ آفتاب",
  Dhuhr: "ظہر",
  Asr: "عصر",
  Maghrib: "مغرب",
  Isha: "عشاء",
};

type Timings = Record<string, string>;

interface Result {
  timings: Timings;
  hijri: string;
  place: string;
}

/** "17:42 (PKT)" → minutes since midnight. */
function toMinutes(t: string) {
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function to12h(t: string) {
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export default function PrayerTimes() {
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [city, setCity] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const load = useCallback(async (url: string, place: string) => {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Request failed");
      const json = await res.json();
      const data = json?.data;
      if (!data?.timings) throw new Error("No timings returned");
      const h = data.date?.hijri;
      setResult({
        timings: data.timings,
        hijri: h ? `${h.day} ${h.month?.en} ${h.year} AH` : "",
        place: data.meta?.timezone ? `${place} · ${data.meta.timezone}` : place,
      });
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("Could not fetch prayer times. Check your connection and try again.");
    }
  }, []);

  const useLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setMessage("This browser cannot share your location. Enter a city instead.");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        load(
          `${API}/timings?latitude=${latitude}&longitude=${longitude}&school=1`,
          "Your location"
        );
      },
      () => {
        setStatus("error");
        setMessage(
          "Location permission was declined. Enter a city name below instead."
        );
      },
      { timeout: 10_000 }
    );
  }, [load]);

  const useCity = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = city.trim();
      if (!q) return;
      load(
        `${API}/timingsByAddress?address=${encodeURIComponent(q)}&school=1`,
        q
      );
    },
    [city, load]
  );

  // Which prayer is next, so the current one can be highlighted.
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const nextPrayer = result
    ? ORDER.find((p) => p !== "Sunrise" && toMinutes(result.timings[p]) > minutesNow) ??
      "Fajr"
    : null;

  return (
    <div className="tool">
      <div className="tool-actions">
        <button type="button" className="btn btn-primary" onClick={useLocation}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Use my location
        </button>

        <form onSubmit={useCity} className="tool-inline-form">
          <label htmlFor="city" className="sr-only">
            City name
          </label>
          <input
            id="city"
            className="field"
            placeholder="or type a city — e.g. Karachi"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit" className="btn btn-ghost" disabled={!city.trim()}>
            Search
          </button>
        </form>
      </div>

      {status === "loading" && <p className="tool-status">Finding times…</p>}
      {status === "error" && (
        <p className="tool-status error" role="alert">
          {message}
        </p>
      )}

      {result && (
        <>
          <div className="tool-meta">
            <span>{result.place}</span>
            {result.hijri && <span>{result.hijri}</span>}
          </div>

          <ul className="prayer-list">
            {ORDER.map((p) => {
              const isNext = p === nextPrayer;
              return (
                <li key={p} className={`prayer-row${isNext ? " next" : ""}`}>
                  <span className="prayer-name">
                    {p}
                    <span className="urdu" dir="rtl">
                      {URDU[p]}
                    </span>
                  </span>
                  <span className="prayer-time">{to12h(result.timings[p])}</span>
                  {isNext && <span className="prayer-badge">Next</span>}
                </li>
              );
            })}
          </ul>

          <p className="tool-note">
            Asr is calculated on the Hanafi position (mithl-e-sani). Times are
            astronomical estimates — follow your local masjid where they differ.
          </p>
        </>
      )}
    </div>
  );
}
