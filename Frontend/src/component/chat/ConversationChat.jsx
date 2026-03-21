import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faTimes } from "@fortawesome/free-solid-svg-icons";
import { chatAPI } from "../../utils/api.js";
import { getSocket } from "../../utils/socket.js";

/**
 * Chat panel for renter–owner conversation (general chat, not tied to a booking).
 * Takes targetUserId, targetUser (for display name), and currentUser from parent.
 * `variant` controls layout: "modal" (full-screen overlay) or "page" (inline panel).
 */
const ConversationChat = ({
  targetUserId,
  targetUser,
  currentUser,
  onClose,
  variant = "modal",
  theme = "dark",
}) => {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const currentUserId = currentUser?.id ?? null;

  const displayName =
    targetUser &&
    [targetUser.firstName, targetUser.lastName].filter(Boolean).join(" ");
  const chatWith = displayName || targetUser?.email || "User";

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!targetUserId) return;
    const socket = getSocket();
    if (!socket) return;
    let cancelled = false;
    let convIdRef = null;

    const onMessage = (payload) => {
      if (payload?.conversationId !== convIdRef || !payload?.message) return;
      // Skip own messages – we already have them from optimistic update
      if (payload.message.senderId === currentUserId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.message.id)) return prev;
        return [...prev, payload.message];
      });
    };

    const onError = (payload) => {
      if (payload?.message) setError((prev) => prev || payload.message);
    };

    socket.on("message", onMessage);
    socket.on("chatError", onError);

    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        const conv = await chatAPI.ensureConversation({ targetUserId });
        const convId = conv?.id || null;
        convIdRef = convId;
        setConversationId(convId);

        if (!convId) {
          setError("Could not create or load conversation.");
          return;
        }

        socket.emit("joinConversation", { conversationId: convId });

        const data = await chatAPI.getMessages(convId, 50);
        if (!cancelled) setMessages(data?.messages ?? []);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load chat.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
      if (convIdRef) socket.emit("leaveConversation", { conversationId: convIdRef });
      socket.off("message", onMessage);
      socket.off("chatError", onError);
    };
  }, [targetUserId, currentUserId]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !conversationId) return;

    const socket = getSocket();
    if (!socket) return;
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const optimistic = {
      id: tempId,
      conversationId,
      senderId: currentUserId,
      text,
      createdAt: now,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    socket.emit("sendMessage", { conversationId, text });
  };

  const isLight = theme === "light";

  const inner = (
    <div
      className={`flex h-full flex-col rounded-2xl shadow-2xl ${
        isLight ? "bg-white text-slate-900" : "bg-[#0b0f19] text-white"
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${
          isLight ? "border-slate-200" : "border-white/10"
        }`}
      >
        <h2 className="text-sm font-semibold">
          Chat with {chatWith}
        </h2>
        {variant === "modal" && (
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full p-1 ${
              isLight
                ? "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm">
        {loading && (
          <p className={isLight ? "text-slate-500" : "text-white/60"}>
            Loading chat…
          </p>
        )}
        {error && !loading && (
          <p
            className={`rounded-lg px-3 py-2 ${
              isLight
                ? "bg-red-50 text-red-600"
                : "bg-red-500/10 text-red-300"
            }`}
          >
            {error}
          </p>
        )}
        {!loading &&
          !error &&
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                    mine
                      ? isLight
                        ? "bg-orange-500 text-white"
                        : "bg-orange-500 text-black"
                      : isLight
                        ? "bg-slate-100 text-slate-900"
                        : "bg-white/10 text-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      isLight ? "text-slate-500" : "text-white/60"
                    }`}
                  >
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      <form
        className={`flex items-center gap-2 px-3 py-3 border-t ${
          isLight ? "border-slate-200" : "border-white/10"
        }`}
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className={`flex-1 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 ${
            isLight
              ? "border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-orange-500"
              : "border border-white/20 bg-black/40 text-white placeholder-white/40 focus:border-orange-500"
          }`}
        />
        <button
          type="submit"
          disabled={!conversationId || !input.trim()}
          className={`inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold text-black shadow-sm transition ${
            isLight
              ? "bg-orange-500 hover:bg-orange-400 disabled:opacity-60"
              : "bg-orange-500 hover:bg-orange-400 disabled:opacity-60"
          }`}
        >
          <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
        </button>
      </form>
    </div>
  );

  if (variant === "page") {
    return inner;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex h-[70vh] w-full max-w-xl flex-col">
        {inner}
      </div>
    </div>
  );
};

export default ConversationChat;
