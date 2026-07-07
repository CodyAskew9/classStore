"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  onScan: (text: string) => void;
  onClose: () => void;
}

/** Uses native BarcodeDetector when available (Chrome / Edge). */
export function QrScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;

    async function start() {
      if (typeof window === "undefined" || !("BarcodeDetector" in window)) {
        setSupported(false);
        setError("QR scanning needs Chrome or Edge. You can type your class code instead.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const detector = new (window as Window & { BarcodeDetector: new (opts: { formats: string[] }) => { detect: (src: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector({
          formats: ["qr_code"],
        });

        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0 && codes[0].rawValue) {
              onScan(codes[0].rawValue);
              stopCamera();
              return;
            }
          } catch {
            /* ignore frame errors */
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setError("Could not open the camera. Type your class code instead.");
      }
    }

    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stopCamera();
    };
  }, [onScan, stopCamera]);

  return (
    <div className="auth-qr-overlay">
      <div className="auth-qr-panel">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Scan class QR code</h2>
          <button type="button" className="btn-ghost px-3 py-1.5 text-sm" onClick={onClose}>
            Close
          </button>
        </div>
        {supported ? (
          <video ref={videoRef} className="auth-qr-video" playsInline muted />
        ) : null}
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <p className="mt-2 text-xs text-muted">Point the camera at the QR code your teacher posted.</p>
      </div>
    </div>
  );
}

function extractJoinCodeFromScan(text: string): string | null {
  const trimmed = text.trim();
  try {
    const url = new URL(trimmed);
    const fromQuery = url.searchParams.get("code");
    if (fromQuery) return fromQuery.toUpperCase();
    const parts = url.pathname.split("/").filter(Boolean);
    const joinIdx = parts.indexOf("join");
    if (joinIdx >= 0 && parts[joinIdx + 1]) return parts[joinIdx + 1].toUpperCase();
  } catch {
    /* not a URL */
  }
  if (/^[A-Z0-9]{4,12}$/i.test(trimmed)) return trimmed.toUpperCase();
  return null;
}

export { extractJoinCodeFromScan };
