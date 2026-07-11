import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { CatIcon, type CategoryIcon } from "@/lib/catalog";

export function ListingMedia({
  imageUrls,
  icon,
  name,
  source,
}: {
  imageUrls: string[];
  icon: CategoryIcon;
  name: string;
  source: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const primaryImage = imageUrls[activeIndex];

  useEffect(() => {
    setActiveIndex(0);
  }, [imageUrls]);

  return (
    <div className="listing-media">
      <span className={`src-tag ${source === "Excess stock" ? "excess" : ""}`}>{source}</span>
      {primaryImage ? (
        <img className="listing-media-img" src={primaryImage} alt={name} loading="lazy" />
      ) : (
        <div className="listing-media-fallback" aria-hidden="true">
          <CatIcon kind={icon} />
        </div>
      )}
      {imageUrls.length > 1 ? (
        <>
          <button
            type="button"
            className="listing-media-nav listing-media-prev"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex((current) => (current - 1 + imageUrls.length) % imageUrls.length);
            }}
            aria-label="Previous image"
          >
            <ArrowLeft size={14} />
          </button>
          <button
            type="button"
            className="listing-media-nav listing-media-next"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex((current) => (current + 1) % imageUrls.length);
            }}
            aria-label="Next image"
          >
            <ArrowRight size={14} />
          </button>
          <div className="listing-media-dots" aria-hidden="true">
            {imageUrls.map((_, index) => (
              <span
                key={`${name}-dot-${index}`}
                className={index === activeIndex ? "active" : ""}
              />
            ))}
          </div>
          <span className="listing-media-count">
            {activeIndex + 1}/{imageUrls.length}
          </span>
        </>
      ) : null}
    </div>
  );
}
