import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearch } from "@/lib/router-compat";
import { useApp } from "@/lib/store";

function isSameDay(a: number, b: number) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function formatMessageDate(at: number) {
  const d = new Date(at);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(at, today.getTime())) return "Today";
  if (isSameDay(at, yesterday.getTime())) return "Yesterday";

  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMessageTime(at: number) {
  return new Date(at).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function useCompactChat() {
  const [compact, setCompact] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 1024px)").matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const update = () => setCompact(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return compact;
}

export function MessagesView({ role }: { role: "buyer" | "seller" }) {
  const { state, currentUser, sendMessage, refreshMessages, markThreadRead, hasUnreadInThread } =
    useApp();
  const navigate = useNavigate();
  const search = useSearch() as { t?: string };
  const compact = useCompactChat();

  const myThreads = useMemo(() => {
    return state.threads
      .filter((t) =>
        role === "seller" ? t.sellerId === currentUser!.id : t.buyerId === currentUser!.id,
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [state.threads, role, currentUser]);

  const activeId = compact ? search.t : (search.t ?? myThreads[0]?.id);
  const chatOpen = compact ? Boolean(search.t) : true;
  const active = myThreads.find((t) => t.id === activeId);
  const messages = state.messages
    .filter((m) => m.threadId === activeId)
    .sort((a, b) => a.at - b.at);
  const [draft, setDraft] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior });
  };

  useEffect(() => {
    stickToBottomRef.current = true;
    scrollToBottom();
  }, [activeId]);

  useEffect(() => {
    if (stickToBottomRef.current) scrollToBottom();
  }, [messages.length]);

  const handleChatScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
  };

  useEffect(() => {
    if (!activeId) return;
    markThreadRead(activeId);
  }, [activeId, messages.length, markThreadRead]);

  useEffect(() => {
    if (!activeId) return;

    const poll = () => {
      void refreshMessages().catch((error) => {
        console.error(error);
      });
    };

    poll();
    const timer = window.setInterval(poll, 1000);
    return () => window.clearInterval(timer);
  }, [activeId, refreshMessages]);

  const listing = active ? state.listings.find((l) => l.id === active.listingId) : null;
  const counterpart = active
    ? role === "seller"
      ? { name: active.buyerName, phone: active.buyerPhone }
      : { name: active.sellerName, phone: active.sellerPhone }
    : null;

  const setActive = (id: string) =>
    navigate({
      to: role === "seller" ? "/dashboard/seller/messages" : "/dashboard/buyer/messages",
      search: { t: id },
    });

  const closeChat = () =>
    navigate({
      to: role === "seller" ? "/dashboard/seller/messages" : "/dashboard/buyer/messages",
    });

  const send = async () => {
    if (!active || !draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    stickToBottomRef.current = true;
    try {
      await sendMessage(active.id, text);
    } catch (error) {
      setDraft(text);
      alert(error instanceof Error ? error.message : "We couldn't send that message right now.");
    }
  };

  return (
    <div className="messages-layout">
      <div className="dash-head messages-head">
        <div>
          <div className="crumb">
            SHT {role === "seller" ? 13 : 24} / {role.toUpperCase()} · MESSAGES
          </div>
          <h1>Messages</h1>
        </div>
        <span className="mono" style={{ color: "var(--ink-soft)", fontSize: 12 }}>
          {myThreads.length} {myThreads.length === 1 ? "thread" : "threads"}
        </span>
      </div>

      {myThreads.length === 0 ? (
        <div className="empty">
          <h3>No conversations yet</h3>
          <p>
            {role === "seller"
              ? "Accept a buyer's quote to start a chat."
              : "Once a seller accepts your quote, a chat opens here."}
          </p>
        </div>
      ) : (
        <div className={`chat-wrap ${compact ? "chat-compact" : ""} ${chatOpen ? "chat-open" : ""}`}>
          <div className="thread-list">
            {myThreads.map((t) => {
              const l = state.listings.find((x) => x.id === t.listingId);
              const last = [...state.messages].reverse().find((m) => m.threadId === t.id);
              const otherName = role === "seller" ? t.buyerName : t.sellerName;
              return (
                <button
                  key={t.id}
                  className={`thread-item ${t.id === activeId ? "active" : ""}`}
                  onClick={() => setActive(t.id)}
                >
                  <div className="thread-item-top">
                    <div className="thread-name">{otherName || "—"}</div>
                    {hasUnreadInThread(currentUser!.id, t.id) ? (
                      <span className="thread-unread-dot" aria-label="Unread messages" />
                    ) : null}
                  </div>
                  <div className="thread-prev">
                    {l?.catCode} · {last?.text ?? "No messages yet"}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="chat-panel">
            {active && counterpart && listing ? (
              <>
                <div className="chat-head">
                  {compact ? (
                    <button type="button" className="chat-back" onClick={closeChat}>
                      ← Threads
                    </button>
                  ) : null}
                  <div className="name">{counterpart.name}</div>
                  <div className="sub">
                    {listing.catCode} · {listing.name} · {counterpart.phone}
                  </div>
                </div>
                <div className="chat-body" ref={bodyRef} onScroll={handleChatScroll}>
                  {messages.map((m, index) => {
                    const isMine = m.fromId === currentUser!.id;
                    const prev = messages[index - 1];
                    const showDate = !prev || !isSameDay(prev.at, m.at);

                    return (
                      <div key={m.id} className="chat-message-group">
                        {showDate ? (
                          <div className="chat-date-divider">{formatMessageDate(m.at)}</div>
                        ) : null}
                        <div className={`bubble-row ${isMine ? "mine" : "theirs"}`}>
                          <div className={`bubble ${isMine ? "mine" : ""}`}>{m.text}</div>
                          <div className="bubble-meta">
                            <span className="bubble-sender">{isMine ? "You" : counterpart.name}</span>
                            <span className="bubble-ts">
                              {formatMessageTime(m.at)}
                              {m.id.startsWith("optimistic-") ? " · sending" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form
                  className="chat-input"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send();
                  }}
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message…"
                  />
                  <button type="submit" disabled={!draft.trim()}>
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="chat-empty">Select a conversation</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
