import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard-shell";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/dashboard/buyer")({
  head: () => ({ meta: [{ title: "Buyer dashboard — RE/CONSTRUCT" }] }),
  component: BuyerLayout,
});

function BuyerLayout() {
  const { currentUser, isInitializing, countUnreadMessages, state } = useApp();

  if (isInitializing) return null;

  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role !== "buyer") return <Navigate to="/dashboard/seller" />;

  const unreadMsgs = countUnreadMessages(currentUser.id);
  const cartCount = state.cart[currentUser.id]?.length ?? 0;
  const purchaseCount = state.purchases.filter(
    (purchase) => purchase.buyerId === currentUser.id,
  ).length;

  return (
    <DashboardShell
      role="buyer"
      items={[
        { to: "/dashboard/buyer", label: "Overview" },
        { to: "/dashboard/buyer/cart", label: "My cart", badge: cartCount },
        { to: "/dashboard/buyer/interests", label: "My interests" },
        { to: "/dashboard/buyer/messages", label: "Messages", dot: unreadMsgs > 0 },
        { to: "/dashboard/buyer/purchases", label: "Purchases", badge: purchaseCount },
      ]}
    >
      <Outlet />
    </DashboardShell>
  );
}
