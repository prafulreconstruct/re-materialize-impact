import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard-shell";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/dashboard/seller")({
  head: () => ({ meta: [{ title: "Seller dashboard — RE/CONSTRUCT" }] }),
  component: SellerLayout,
});

function SellerLayout() {
  const { currentUser, state, isInitializing, countUnreadMessages } = useApp();

  if (isInitializing) return null;

  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role !== "seller") return <Navigate to="/dashboard/buyer" />;

  const pendingInterests = state.interests.filter(
    (i) => i.sellerId === currentUser.id && i.status === "pending",
  ).length;
  const unreadMsgs = countUnreadMessages(currentUser.id);

  return (
    <DashboardShell
      role="seller"
      items={[
        { to: "/dashboard/seller", label: "Overview" },
        { to: "/dashboard/seller/listings", label: "Manage listings" },
        {
          to: "/dashboard/seller/interests",
          label: "Buyer interests",
          badge: pendingInterests || undefined,
        },
        { to: "/dashboard/seller/messages", label: "Messages", dot: unreadMsgs > 0 },
      ]}
    >
      <Outlet />
    </DashboardShell>
  );
}
