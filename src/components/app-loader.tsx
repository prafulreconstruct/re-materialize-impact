import { useApp } from "@/lib/store";

export function AppLoader() {
  const { isLoading } = useApp();

  if (!isLoading) return null;

  return (
    <div className="app-loader" role="status" aria-live="polite" aria-label="Loading">
      <div className="app-loader-card">
        <div className="app-loader-spinner" aria-hidden="true" />
        <p className="app-loader-label">Loading</p>
      </div>
    </div>
  );
}
