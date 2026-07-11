import { createFileRoute } from "@tanstack/react-router";
import { MessagesView } from "@/components/messages-view";

export const Route = createFileRoute("/dashboard/buyer/messages")({
  validateSearch: (s: Record<string, unknown>) => ({
    t: typeof s.t === "string" ? s.t : undefined,
  }),
  component: () => <MessagesView role="buyer" />,
});
