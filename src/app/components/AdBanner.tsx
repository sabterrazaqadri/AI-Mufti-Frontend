// components/AdBanner.tsx
"use client";
import { useEffect } from "react";

export default function AdBanner({ adClient, adSlot }: { adClient: string; adSlot: string }) {
  useEffect(() => {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      // intentionally silent: ads may be blocked in dev
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
