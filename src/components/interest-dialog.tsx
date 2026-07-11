import { useState } from "react";
import { ListingMedia } from "@/components/listing-media";
import { useApp, type Listing } from "@/lib/store";

export function InterestDialog({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const { submitInterest, currentUser } = useApp();
  const [quote, setQuote] = useState(listing.price);
  const [delivery, setDelivery] = useState("Self pickup");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await submitInterest({
        listingId: listing.id,
        quotePrice: quote,
        deliveryPref: delivery,
        note,
      });
      setDone(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : "We couldn't send your quote right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="modal-back" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h3>Log in to continue</h3>
          <p className="sub">// BUYER ACCOUNT REQUIRED</p>
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            You need a buyer account to send a quote to the seller.
          </p>
          <div className="modal-actions">
            <button className="btn-mini" onClick={onClose}>
              Cancel
            </button>
            <a href="/login" className="btn-mini primary">
              Log in →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-media">
          <ListingMedia
            imageUrls={listing.imageUrls}
            icon={listing.icon}
            name={listing.name}
            source={listing.source}
          />
        </div>
        {done ? (
          <>
            <h3>Quote sent ✓</h3>
            <p className="sub">
              // {listing.catCode} — {listing.name}
            </p>
            <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
              Your quote of <strong>₹{quote.toLocaleString("en-IN")}</strong> has been sent to{" "}
              {listing.sellerName}. You'll see it in your dashboard under{" "}
              <strong>My interests</strong>. When the seller accepts, a chat will open.
            </p>
            <div className="modal-actions">
              <button className="btn-mini primary" onClick={onClose}>
                Got it
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <h3>Show interest</h3>
            <p className="sub">
              // {listing.catCode} — Asking ₹{listing.price.toLocaleString("en-IN")}
            </p>
            <p style={{ fontSize: 13.5, marginBottom: 16, color: "var(--ink-soft)" }}>
              {listing.name}
            </p>

            <div className="f-field">
              <label className="f-label">Your quote (₹) *</label>
              <input
                className="f-input"
                type="number"
                required
                value={quote}
                onChange={(e) => setQuote(Number(e.target.value))}
                min={1}
              />
            </div>
            <div className="f-field">
              <label className="f-label">Delivery preference *</label>
              <select
                className="f-select"
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
              >
                <option>Self pickup</option>
                <option>Seller arranges delivery</option>
                <option>Third-party logistics</option>
              </select>
            </div>
            <div className="f-field">
              <label className="f-label">Note to seller</label>
              <textarea
                className="f-textarea"
                placeholder="Pickup window, payment terms, anything else…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-mini" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-mini primary" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send quote →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
