"use client";
import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";

const SESSION_KEY = "jovo_initial_loaded";

export default function PageLoader() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(SESSION_KEY);
    if (alreadySeen) return;

    sessionStorage.setItem(SESSION_KEY, "1");

    const el = loaderRef.current;
    if (!el) return;

    el.style.display = "flex";
    void el.offsetHeight;
    el.style.opacity = "1";

    const t1 = setTimeout(() => {
      if (loaderRef.current) loaderRef.current.style.opacity = "0";
    }, 900);
    const t2 = setTimeout(() => {
      if (loaderRef.current) loaderRef.current.style.display = "none";
    }, 1300);
    timers.current = [t1, t2];

    return clearTimers;
  }, [clearTimers]);

  return (
    <div
      ref={loaderRef}
      style={{
        display: "none",
        opacity: 0,
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        transition: "opacity 0.4s ease",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "24rem",
          height: "24rem",
          borderRadius: "9999px",
          pointerEvents: "none",
          background:
            "radial-gradient(circle, rgba(255,140,0,0.12), transparent 70%)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <Image
          src="/images/Jovo_off_logo2.png"
          alt="JOVO"
          width={200}
          height={80}
          priority
          style={{
            objectFit: "cover",
            width: "12.5rem",
            height: "5rem",
            animation: "jovo-pulse 1s ease-in-out infinite",
            filter: "drop-shadow(0 0 20px rgba(255,140,0,0.4))",
          }}
        />
        <p
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: "0.75rem",
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Your Campus Marketplace
        </p>
        <div
          style={{
            width: "10rem",
            height: "0.25rem",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "9999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: "9999px",
              background: "linear-gradient(90deg, #B42225, #FF8C00)",
              animation: "jovo-bar 1s ease-out forwards",
              boxShadow: "0 0 8px rgba(255,140,0,0.6)",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {[
            { anim: "jovo-dot1 1s ease-in-out infinite", color: "#B42225" },
            { anim: "jovo-dot2 1s ease-in-out infinite", color: "#FF8C00" },
            { anim: "jovo-dot3 1s ease-in-out infinite", color: "#B42225" },
          ].map(({ anim, color }, i) => (
            <div
              key={i}
              style={{
                width: "0.5rem",
                height: "0.5rem",
                borderRadius: "9999px",
                background: color,
                animation: anim,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}