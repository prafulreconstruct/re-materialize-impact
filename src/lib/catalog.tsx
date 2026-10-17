export type CategoryIcon = "door" | "tile" | "steel" | "sanitary" | "wood" | "electric" | "other";

export function CatIcon({ kind }: { kind: CategoryIcon }) {
  switch (kind) {
    case "door":
      return (
        <svg viewBox="0 0 48 48">
          <rect x="13" y="6" width="22" height="36" />
          <rect x="18" y="11" width="12" height="11" />
          <rect x="18" y="27" width="12" height="10" />
          <circle cx="31.5" cy="24.5" r="1.4" />
        </svg>
      );
    case "tile":
      return (
        <svg viewBox="0 0 48 48">
          <rect x="8" y="8" width="14" height="14" />
          <rect x="26" y="8" width="14" height="14" />
          <rect x="8" y="26" width="14" height="14" />
          <rect x="26" y="26" width="14" height="14" />
        </svg>
      );
    case "steel":
      return (
        <svg viewBox="0 0 48 48">
          <line x1="10" y1="40" x2="34" y2="8" />
          <line x1="16" y1="42" x2="40" y2="10" />
          <line x1="22" y1="44" x2="46" y2="12" />
          <line x1="6" y1="44" x2="28" y2="6" />
        </svg>
      );
    case "sanitary":
      return (
        <svg viewBox="0 0 48 48">
          <ellipse cx="24" cy="18" rx="15" ry="7" />
          <path d="M9 18 L11 28 Q24 34 37 28 L39 18" />
          <line x1="24" y1="34" x2="24" y2="42" />
          <line x1="16" y1="42" x2="32" y2="42" />
        </svg>
      );
    case "wood":
      return (
        <svg viewBox="0 0 48 48">
          <rect x="6" y="16" width="36" height="16" />
          <circle cx="14" cy="24" r="3.2" />
          <circle cx="24" cy="24" r="3.2" />
          <circle cx="34" cy="24" r="3.2" />
        </svg>
      );
    case "electric":
      return (
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="20" r="11" />
          <path d="M20 31 L20 36 L28 36 L28 31" />
          <line x1="21" y1="40" x2="27" y2="40" />
        </svg>
      );
    case "other":
    default:
      return (
        <svg viewBox="0 0 48 48">
          <rect x="10" y="10" width="28" height="28" rx="4" />
          <circle cx="18" cy="20" r="2" />
          <circle cx="30" cy="20" r="2" />
          <circle cx="24" cy="30" r="2" />
        </svg>
      );
  }
}
