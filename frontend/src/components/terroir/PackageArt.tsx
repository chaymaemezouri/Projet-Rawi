import { useId } from "react";
import type { BrandId, PackageShape } from "../../demo/terroirs";

type Colors = {
  ink: string;
  accent: string;
  soft: string;
  paper: string;
  gold: string;
  liquid: string;
};

const COLORS: Record<BrandId, Colors> = {
  tifawt: { ink: "#2C3318", accent: "#5C6B3A", soft: "#E4E0C8", paper: "#F7F3E8", gold: "#C4A15A", liquid: "#D4B15A" },
  zayna: { ink: "#3A2428", accent: "#7A3044", soft: "#F3D5DC", paper: "#FBF7F4", gold: "#C9A27A", liquid: "#F6E4D8" },
  atlas: { ink: "#2E332C", accent: "#6E5C86", soft: "#E4DCEB", paper: "#F4F0E6", gold: "#7D8F72", liquid: "#D5C6E2" },
};

const FRAMES: Record<PackageShape, { front: string; detail: string; label: { x: number; y: number; w: number; h: number } }> = {
  bottle: { front: "0 0 360 520", detail: "104 214 152 196", label: { x: 112, y: 222, w: 136, h: 180 } },
  vial: { front: "0 0 360 520", detail: "118 196 124 188", label: { x: 124, y: 204, w: 112, h: 168 } },
  jar: { front: "0 0 360 520", detail: "78 236 204 160", label: { x: 86, y: 248, w: 188, h: 136 } },
  soap: { front: "0 0 360 520", detail: "58 188 244 150", label: { x: 70, y: 200, w: 220, h: 124 } },
  pouch: { front: "0 0 360 520", detail: "96 168 168 220", label: { x: 108, y: 186, w: 144, h: 186 } },
  box: { front: "0 0 360 520", detail: "62 168 236 200", label: { x: 78, y: 184, w: 204, h: 168 } },
};

export function brandColors(id: BrandId) {
  return COLORS[id];
}

export function BrandLogo({ id, className }: { id: BrandId; className?: string }) {
  const color = COLORS[id];
  if (id === "tifawt") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill={color.paper} stroke={color.accent} strokeWidth="2" />
        <path d="M18 40c8-2 12-10 14-18 2 8 6 16 14 18" fill="none" stroke={color.accent} strokeWidth="2" />
        <path d="M24 34c3-6 4-8 4-8M40 34c-3-6-4-8-4-8" fill="none" stroke={color.gold} strokeWidth="2" />
        <path d="M32 18c4 6 6 10 6 16a6 6 0 1 1-12 0c0-6 2-10 6-16z" fill={color.gold} />
      </svg>
    );
  }
  if (id === "zayna") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill={color.paper} stroke={color.accent} strokeWidth="2" />
        <path d="M26 46c2-14 6-20 12-22" fill="none" stroke={color.accent} strokeWidth="2" />
        <circle cx="38" cy="22" r="3" fill={color.accent} />
        <path d="M18 28c4 2 6 6 6 6s-4 1-6-1 0-6 0-5zM46 30c-4 2-6 6-6 6s4 1 6-1 0-6 0-5z" fill={color.soft} stroke={color.accent} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill={color.paper} stroke={color.accent} strokeWidth="2" />
      <ellipse cx="30" cy="40" rx="12" ry="7" fill="none" stroke={color.accent} strokeWidth="2" />
      <path d="M36 38 46 22" stroke={color.gold} strokeWidth="3" />
      <path d="M20 30c2-8 6-12 8-14M18 24c4-4 8-6 10-6" fill="none" stroke={color.accent} strokeWidth="1.6" />
    </svg>
  );
}

function Glass({ id, colors, narrow }: { id: string; colors: Colors; narrow: boolean }) {
  const x = narrow ? 128 : 108;
  const w = narrow ? 104 : 144;
  return (
    <g>
      <rect x={x + w / 2 - 16} y="78" width="32" height="28" rx="4" fill={colors.gold} />
      <rect x={x + w / 2 - 10} y="104" width="20" height="34" fill={colors.accent} />
      <path d={`M${x + 16} 138 Q${x + w / 2} 118 ${x + w - 16} 138 L${x + w} 430 Q${x + w / 2} 468 ${x} 430 Z`} fill={`url(#${id}-glass)`} stroke={colors.accent} strokeWidth="3" />
      <path d={`M${x + 10} 250 L${x + w - 8} 236 L${x + w - 6} 424 Q${x + w / 2} 452 ${x + 8} 424 Z`} fill={colors.liquid} opacity="0.9" />
    </g>
  );
}

function Jar({ id, colors }: { id: string; colors: Colors }) {
  return (
    <g>
      <rect x="118" y="150" width="124" height="28" rx="8" fill={colors.accent} />
      <rect x="108" y="176" width="144" height="16" fill={colors.gold} />
      <rect x="78" y="192" width="204" height="230" rx="28" fill={`url(#${id}-glass)`} stroke={colors.accent} strokeWidth="3" />
      <rect x="92" y="300" width="176" height="100" rx="16" fill={colors.liquid} />
    </g>
  );
}

function Soap({ colors }: { colors: Colors }) {
  return (
    <g>
      <rect x="48" y="168" width="264" height="176" rx="28" fill={colors.soft} stroke={colors.accent} strokeWidth="3" />
      <rect x="48" y="196" width="264" height="132" fill={colors.paper} opacity="0.35" />
    </g>
  );
}

function Pouch({ colors }: { colors: Colors }) {
  return (
    <g>
      <path d="M110 120h140l18 40-24 290H116L92 160z" fill="#C6A36A" stroke={colors.ink} strokeWidth="3" />
      <path d="M110 120c20 28 120 28 140 0" fill="none" stroke={colors.ink} strokeWidth="3" />
      <path d="M150 96c8 16 52 16 60 0" fill="none" stroke={colors.gold} strokeWidth="4" />
    </g>
  );
}

function Box({ colors }: { colors: Colors }) {
  return (
    <g>
      <path d="M70 150h220l-24 28H94z" fill={colors.accent} />
      <rect x="70" y="178" width="220" height="230" rx="8" fill={colors.paper} stroke={colors.accent} strokeWidth="3" />
      <rect x="70" y="178" width="220" height="36" fill={colors.soft} />
    </g>
  );
}

export function PackageArt({
  brandId,
  shape,
  brandName,
  productName,
  label,
  format,
  origin,
  dir,
  view = "front",
}: {
  brandId: BrandId;
  shape: PackageShape;
  brandName: string;
  productName: string;
  label: string;
  format: string;
  origin: string;
  dir: "ltr" | "rtl";
  view?: "front" | "detail";
}) {
  const raw = useId().replace(/:/g, "");
  const colors = COLORS[brandId];
  const frame = FRAMES[shape];
  const box = frame.label;
  return (
    <div className="relative aspect-[360/520] overflow-hidden">
    <div className={`relative h-full ${view === "detail" ? "origin-[50%_58%] scale-[1.7]" : ""}`}>
    <svg viewBox={frame.front} role="img" aria-label={`${brandName}. ${productName}. ${format}. ${origin}`} className="h-full w-full">
      <defs>
        <linearGradient id={`${raw}-glass`} x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="0.45" stopColor={colors.liquid} />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect width="360" height="520" fill={colors.paper} />
      {shape === "bottle" ? <Glass id={raw} colors={colors} narrow={false} /> : null}
      {shape === "vial" ? <Glass id={raw} colors={colors} narrow /> : null}
      {shape === "jar" ? <Jar id={raw} colors={colors} /> : null}
      {shape === "soap" ? <Soap colors={colors} /> : null}
      {shape === "pouch" ? <Pouch colors={colors} /> : null}
      {shape === "box" ? <Box colors={colors} /> : null}
    </svg>
      <div
        dir={dir}
        className="absolute flex flex-col justify-between overflow-hidden border text-start"
        style={{
          left: `${(box.x / 360) * 100}%`,
          top: `${(box.y / 520) * 100}%`,
          width: `${(box.w / 360) * 100}%`,
          height: `${(box.h / 520) * 100}%`,
          background: colors.paper,
          color: colors.ink,
          borderColor: colors.gold,
          borderRadius: 8,
          padding: "4%",
        }}
      >
        <span className="flex items-center gap-1">
          <BrandLogo id={brandId} className="h-5 w-5 shrink-0" />
          <span className="truncate text-[0.65rem]">{brandName}</span>
        </span>
        <strong className="font-serif text-sm leading-tight">{productName}</strong>
        <span className="line-clamp-3 text-[0.65rem] leading-snug">{label}</span>
        <span className="flex justify-between gap-1 text-[0.65rem]">
          <span>{format}</span>
          <span>{origin}</span>
        </span>
      </div>
    </div>
    </div>
  );
}
