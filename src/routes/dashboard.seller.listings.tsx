import { createFileRoute } from "@tanstack/react-router";
import { ImageUp, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ListingMedia } from "@/components/listing-media";
import { supabase } from "@/lib/supabase";
import { useApp, type Listing } from "@/lib/store";

export const Route = createFileRoute("/dashboard/seller/listings")({
  component: SellerListings,
});

const LISTING_IMAGE_BUCKET = "listing-images";

const EMPTY = {
  name: "",
  description: "",
  loc: "",
  price: 0,
  market: 0,
  source: "Excess stock" as Listing["source"],
  cat: "fixtures",
  catCode: "MAT-01",
  catLabel: "Doors & fixtures",
  icon: "door" as Listing["icon"],
  imagePaths: [],
} satisfies ListingFormData;

type FormData = Omit<
  Listing,
  "id" | "sellerId" | "sellerName" | "status" | "views" | "createdAt" | "imageUrls"
>;
type ListingFormData = FormData & { imagePaths: string[] };
type ListingFormInitial = ListingFormData | Listing;

type PendingUpload = {
  file: File;
  previewUrl: string;
};

function storageUrl(path: string) {
  return supabase.storage.from(LISTING_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

function normalizeFormData(initial: ListingFormInitial): ListingFormData {
  return {
    name: initial.name,
    description: initial.description,
    loc: initial.loc,
    price: initial.price,
    market: initial.market,
    source: initial.source,
    cat: initial.cat,
    catCode: initial.catCode,
    catLabel: initial.catLabel,
    icon: initial.icon,
    imagePaths: "imagePaths" in initial ? initial.imagePaths : [],
  };
}

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uploadListingImages(files: File[], sellerId: string) {
  const uploadedPaths: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error(`${file.name} is not an image file.`);
    }

    const safeName = sanitizeFileName(file.name) || "image";
    const path = `${sellerId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from(LISTING_IMAGE_BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

    if (error) throw error;
    uploadedPaths.push(path);
  }

  return uploadedPaths;
}

function SellerListings() {
  const { state, currentUser, addListing, updateListing, deleteListing } = useApp();
  const mine = state.listings.filter((l) => l.sellerId === currentUser!.id);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <>
      <div className="dash-head">
        <div>
          <div className="crumb">SHT 11 / SELLER · INVENTORY</div>
          <h1>Manage listings</h1>
        </div>
        <button className="btn-mini primary" onClick={() => setAdding(true)}>
          + Add listing
        </button>
      </div>

      {mine.length === 0 ? (
        <div className="empty">
          <h3>No listings yet</h3>
          <p>Create your first listing — it goes live as soon as you save.</p>
          <button className="btn-mini primary" onClick={() => setAdding(true)}>
            + Add listing
          </button>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-tbl">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Material</th>
                <th>Code</th>
                <th>Location</th>
                <th>Price</th>
                <th>Views</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mine.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div className="dash-thumb">
                      <ListingMedia
                        imageUrls={l.imageUrls}
                        icon={l.icon}
                        name={l.name}
                        source={l.source}
                      />
                    </div>
                  </td>
                  <td>{l.name}</td>
                  <td className="mono">{l.catCode}</td>
                  <td className="mono">{l.loc}</td>
                  <td className="mono">₹{l.price.toLocaleString("en-IN")}</td>
                  <td className="mono">{l.views}</td>
                  <td>
                    <span className={`pill ${l.status}`}>{l.status}</span>
                  </td>
                  <td>
                    <div className="dash-actions">
                      <button className="btn-mini" onClick={() => setEditing(l)}>
                        Edit
                      </button>
                      <button
                        className="btn-mini"
                        onClick={async () => {
                          try {
                            await updateListing(l.id, {
                              status: l.status === "live" ? "paused" : "live",
                            });
                          } catch (error) {
                            alert(
                              error instanceof Error
                                ? error.message
                                : "We couldn't update that listing right now.",
                            );
                          }
                        }}
                      >
                        {l.status === "live" ? "Pause" : "Activate"}
                      </button>
                      <button
                        className="btn-mini danger"
                        onClick={async () => {
                          if (!confirm("Delete this listing?")) return;
                          try {
                            await deleteListing(l.id);
                          } catch (error) {
                            alert(
                              error instanceof Error
                                ? error.message
                                : "We couldn't delete that listing right now.",
                            );
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(adding || editing) && (
        <ListingForm
          initial={editing ?? EMPTY}
          isEdit={!!editing}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSave={async (data) => {
            try {
              if (editing) await updateListing(editing.id, data);
              else await addListing(data);
              setAdding(false);
              setEditing(null);
            } catch (error) {
              alert(
                error instanceof Error ? error.message : "We couldn't save that listing right now.",
              );
            }
          }}
        />
      )}
    </>
  );
}

function ListingForm({
  initial,
  isEdit,
  onClose,
  onSave,
}: {
  initial: ListingFormInitial;
  isEdit: boolean;
  onClose: () => void;
  onSave: (data: ListingFormData) => Promise<void>;
}) {
  const { state, currentUser, isLoading } = useApp();
  const [f, setF] = useState<ListingFormData>(() => normalizeFormData(initial));
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setF(normalizeFormData(initial));
    setPendingUploads([]);
    setIsDragging(false);
  }, [initial]);

  useEffect(
    () => () => {
      pendingUploads.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    },
    [pendingUploads],
  );

  const categories = state.categories;

  const setCat = (key: string) => {
    const c = categories.find((x) => x.key === key)!;
    setF((draft) => ({ ...draft, cat: c.key, catCode: c.code, catLabel: c.label, icon: c.icon }));
  };

  const addFiles = (files: FileList | File[]) => {
    const nextFiles = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

    setPendingUploads((prev) => [...prev, ...nextFiles].slice(0, 8));
  };

  const removePending = (previewUrl: string) => {
    setPendingUploads((prev) => {
      const item = prev.find((entry) => entry.previewUrl === previewUrl);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((entry) => entry.previewUrl !== previewUrl);
    });
  };

  const removeExisting = (path: string) => {
    setF((draft) => ({ ...draft, imagePaths: draft.imagePaths.filter((item) => item !== path) }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentUser) {
        throw new Error("Please log in first.");
      }
      const uploadedPaths = pendingUploads.length
        ? await uploadListingImages(
            pendingUploads.map((item) => item.file),
            currentUser.id,
          )
        : [];

      const payload = {
        ...f,
        imagePaths: [...f.imagePaths, ...uploadedPaths],
      };

      await onSave(payload);
      pendingUploads.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setPendingUploads([]);
    } catch (error) {
      alert(error instanceof Error ? error.message : "We couldn't save that listing right now.");
    }
  };

  const imageCount = f.imagePaths.length + pendingUploads.length;

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal listing-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{isEdit ? "Edit listing" : "New listing"}</h3>
        <p className="sub">// SUBMIT FOR THE YARD</p>
        <form onSubmit={onSubmit}>
          <div className="image-drop-shell">
            <div
              className={`image-drop ${isDragging ? "dragging" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                addFiles(event.dataTransfer.files);
              }}
              role="button"
              tabIndex={0}
            >
              <input
                ref={fileInputRef}
                className="image-input"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  if (event.target.files) addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
              <Upload size={18} />
              <div>
                <div className="image-drop-title">Drag images here or browse</div>
                <div className="image-drop-sub">PNG, JPG, WEBP, HEIC. Up to 8 images.</div>
              </div>
              <button
                type="button"
                className="btn-mini"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <ImageUp size={14} />
                Choose files
              </button>
            </div>
            {imageCount > 0 ? (
              <div className="image-grid">
                {f.imagePaths.map((path) => (
                  <div className="image-tile" key={path}>
                    <img src={storageUrl(path)} alt="Listing" />
                    <button
                      type="button"
                      className="image-remove"
                      onClick={() => removeExisting(path)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {pendingUploads.map((item) => (
                  <div className="image-tile" key={item.previewUrl}>
                    <img src={item.previewUrl} alt={item.file.name} />
                    <button
                      type="button"
                      className="image-remove"
                      onClick={() => removePending(item.previewUrl)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="f-field">
            <label className="f-label">Material name *</label>
            <input
              className="f-input"
              required
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />
          </div>
          <div className="f-row">
            <div className="f-field">
              <label className="f-label">Category *</label>
              <select className="f-select" value={f.cat} onChange={(e) => setCat(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.code} — {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="f-field">
              <label className="f-label">Source *</label>
              <select
                className="f-select"
                value={f.source}
                onChange={(e) => setF({ ...f, source: e.target.value as Listing["source"] })}
              >
                <option>Demolition</option>
                <option>Excess stock</option>
              </select>
            </div>
          </div>
          <div className="f-row">
            <div className="f-field">
              <label className="f-label">Asking price (₹) *</label>
              <input
                className="f-input"
                type="number"
                required
                value={f.price || ""}
                onChange={(e) => setF({ ...f, price: Number(e.target.value) })}
              />
            </div>
            <div className="f-field">
              <label className="f-label">Market price (₹)</label>
              <input
                className="f-input"
                type="number"
                value={f.market || ""}
                onChange={(e) => setF({ ...f, market: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="f-field">
            <label className="f-label">Site location *</label>
            <input
              className="f-input"
              required
              value={f.loc}
              onChange={(e) => setF({ ...f, loc: e.target.value })}
            />
          </div>
          <div className="f-field">
            <label className="f-label">Description *</label>
            <textarea
              className="f-textarea"
              required
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-mini" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-mini primary" disabled={isLoading}>
              {isLoading ? "Saving..." : isEdit ? "Save changes" : "Publish listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
