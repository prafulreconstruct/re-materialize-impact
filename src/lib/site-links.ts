import type { Category } from "./store";

const categoryDescriptions: Record<string, string> = {
  fixtures: "MAT-01 · doors, windows, hardware",
  tiles: "MAT-02 · tiles, stone, flooring",
  steel: "MAT-03 · beams, angles, channels",
  sanitary: "MAT-04 · basins, fittings, WC",
  wood: "MAT-05 · timber, plywood, joinery",
  electrical: "MAT-06 · panels, cable, fittings",
  other: "MAT-07 · other materials",
};

export function getYardLinks(categories: Category[]) {
  const browseLinks = categories
    .filter((c) => c.key !== "other")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      to: `/browse?cat=${encodeURIComponent(c.key)}`,
      label: c.label,
      desc: categoryDescriptions[c.key] ?? `${c.code} · ${c.label}`,
    }));

  return [
    { to: "/browse", label: "All listings", desc: "Every live material on the yard" },
    ...browseLinks,
  ];
}

export const legalLinks = [
  { to: "/mission", label: "Mission", desc: "Why RE/CONSTRUCT exists" },
  { to: "/ngo", label: "NGO programme", desc: "Priority access for community builders" },
  { to: "/contact", label: "Contact us", desc: "Support & partnerships" },
  { to: "/privacy", label: "Privacy policy", desc: "How we handle your data" },
  { to: "/terms", label: "Terms of use", desc: "Rules for buyers & sellers" },
  { to: "/about", label: "About RE/CONSTRUCT", desc: "Platform overview" },
] as const;
