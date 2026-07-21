"use client";

import { useCallback, useEffect, useState } from "react";

// Ka'bah, Masjid al-Haram.
const KAABA_LAT = 21.4224779;
const KAABA_LNG = 39.8251832;

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Initial great-circle bearing from a point to the Ka'bah, in degrees from true north. */
function qiblaBearing(lat: number, lng: number) {
  const dLng = rad(KAABA_LNG - lng);
  const y = Math.sin(dLng);
  const x =
    Math.cos(rad(lat)) * Math.tan(rad(KAABA_LAT)) - Math.sin(rad(lat)) * Math.cos(dLng);
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

/** Great-circle distance in km — context for how far the direction points. */
function distanceKm(lat: number, lng: number) {
  const dLat = rad(KAABA_LAT - lat);
  const dLng = rad(KAABA_LNG - lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat)) * Math.cos(rad(KAABA_LAT)) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const cardinal = (b: number) => COMPASS[Math.round(b / 45) % 8];

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

export default function Qibla() {
  const [bearing, setBearing] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("This browser cannot share your location.");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setBearing(qiblaBearing(latitude, longitude));
        setDistance(distanceKm(latitude, longitude));
        setLoading(false);
      },
      () => {
        setError("Location permission was declined, so the direction cannot be computed.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, []);

  // Live compass. iOS needs an explicit permission request from a user gesture and
  // reports webkitCompassHeading; other browsers give alpha relative to north.
  const enableCompass = useCallback(async () => {
    type Req = { requestPermission?: () => Promise<"granted" | "denied"> };
    const maybe = DeviceOrientationEvent as unknown as Req;
    try {
      if (typeof maybe.requestPermission === "function") {
        const state = await maybe.requestPermission();
        if (state !== "granted") {
          setError("Compass permission denied. The fixed bearing below still applies.");
          return;
        }
      }
    } catch {
      setError("This device did not allow compass access.");
      return;
    }

    const onOrient = (e: DeviceOrientationEvent) => {
      const iosHeading = (e as DeviceOrientationEventiOS).webkitCompassHeading;
      if (typeof iosHeading === "number") setHeading(iosHeading);
      else if (typeof e.alpha === "number") setHeading(360 - e.alpha);
    };
    window.addEventListener("deviceorientation", onOrient, true);
  }, []);

  useEffect(() => {
    return () => setHeading(null);
  }, []);

  // Needle points at the Qibla relative to where the phone is facing. Without a
  // compass reading it shows the absolute bearing from north instead.
  const needle = bearing === null ? 0 : heading === null ? bearing : bearing - heading;

  return (
    <div className="tool">
      <div className="tool-actions">
        <button type="button" className="btn btn-primary" onClick={locate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Find my Qibla
        </button>
        {bearing !== null && heading === null && (
          <button type="button" className="btn btn-ghost" onClick={enableCompass}>
            Enable live compass
          </button>
        )}
      </div>

      {loading && <p className="tool-status">Locating…</p>}
      {error && (
        <p className="tool-status error" role="alert">
          {error}
        </p>
      )}

      {bearing !== null && (
        <>
          <div className="qibla-dial" role="img" aria-label={`Qibla is ${Math.round(bearing)} degrees from north`}>
            <div className="qibla-ring">
              {COMPASS.map((c, i) => (
                <span key={c} className="qibla-tick" style={{ transform: `rotate(${i * 45}deg)` }}>
                  <em style={{ transform: `rotate(${-i * 45}deg)` }}>{c}</em>
                </span>
              ))}
              <div className="qibla-needle" style={{ transform: `rotate(${needle}deg)` }}>
                <span className="qibla-needle-head" />
              </div>
              <div className="qibla-hub" />
            </div>
          </div>

          <div className="qibla-readout">
            <div>
              <span className="stat-num">{Math.round(bearing)}°</span>
              <span className="stat-label">from true north ({cardinal(bearing)})</span>
            </div>
            {distance !== null && (
              <div>
                <span className="stat-num">{new Intl.NumberFormat("en-US").format(distance)} km</span>
                <span className="stat-label">to Masjid al-Haram</span>
              </div>
            )}
          </div>

          <p className="tool-note">
            {heading === null
              ? "This is the bearing from true north — line it up with a compass. Enable the live compass above to have the needle track your phone."
              : "The needle now tracks your phone. Phone compasses drift near metal and magnets; verify before relying on it for salah."}
          </p>
        </>
      )}
    </div>
  );
}
