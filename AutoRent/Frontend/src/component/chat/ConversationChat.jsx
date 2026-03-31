import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faPaperPlane, faSpinner, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { chatAPI } from "../../utils/api.js";
import { getSocket } from "../../utils/socket.js";

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
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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
      if (payload.message.senderId === currentUserId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.message.id)) return prev;
        return [...prev, payload.message];
      });
    };

    const onError = (payload) => {
      if (payload?.message) setError((prev) => prev || payload.message);
    };

    const onDeleted = (payload) => {
      if (payload?.conversationId !== convIdRef || !payload?.messageId) return;
      setMessages((prev) => prev.filter((m) => m.id !== payload.messageId));
    };

    socket.on("message", onMessage);
    socket.on("messageDeleted", onDeleted);
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
      socket.off("messageDeleted", onDeleted);
      socket.off("chatError", onError);
    };
  }, [targetUserId, currentUserId]);

  const handleSend = (attachmentUrl = null) => {
    const text = input.trim();
    if (!text && !attachmentUrl) return;
    if (!conversationId) return;

    const socket = getSocket();
    if (!socket) return;
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const optimistic = {
      id: tempId,
      conversationId,
      senderId: currentUserId,
      text: text || null,
      attachmentUrl: attachmentUrl || null,
      createdAt: now,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    socket.emit("sendMessage", {
      conversationId,
      text: text || null,
      attachmentUrl: attachmentUrl || null,
    });
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Image must be under 5 MB");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const url = await chatAPI.uploadImage(file);
      if (url) {
        handleSend(url);
      } else {
        setError("Upload succeeded but no URL returned");
      }
    } catch (err) {
      setError(err?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMessage = (messageId) => {
    const socket = getSocket();
    if (!socket) return;
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    socket.emit("deleteMessage", { messageId });
  };

  const isLight = theme === "light";

  const inner = (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-2xl shadow-2xl ${
        isLight ? "bg-white text-slate-900" : "bg-[#0b0f19] text-white"
      }`}
    >
      <div
        className={`flex shrink-0 items-center gap-3 px-4 py-3 border-b ${
          isLight ? "border-slate-200" : "border-white/10"
        }`}
      >
        {targetUser?.profilePicture ? (
          <img
            src={targetUser.profilePicture}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-orange-500/30"
          />
        ) : (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              isLight
                ? "bg-orange-100 text-orange-700"
                : "bg-orange-500/20 text-orange-300"
            }`}
          >
            {(chatWith[0] || "?").toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold">{chatWith}</h2>
          {targetUser?.city && (
            <p
              className={`truncate text-xs ${
                isLight ? "text-slate-500" : "text-white/50"
              }`}
            >
              {targetUser.city}
            </p>
          )}
        </div>
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

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-3 text-sm">
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
                className={`group flex items-end gap-1 ${mine ? "justify-end" : "justify-start"}`}
              >
                {mine && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(m.id)}
                    className={`mb-1 rounded-full p-1 opacity-0 transition group-hover:opacity-100 ${
                      isLight
                        ? "text-slate-400 hover:bg-red-50 hover:text-red-500"
                        : "text-white/30 hover:bg-red-500/20 hover:text-red-400"
                    }`}
                    title="Delete message"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                  </button>
                )}
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
                  {m.attachmentUrl && (
                    <img
                      src={m.attachmentUrl}
                      alt="Attachment"
                      className="mb-1 max-h-48 w-full cursor-pointer rounded-lg object-cover"
                      onClick={() => setPreviewImage(m.attachmentUrl)}
                    />
                  )}
                  {m.text && (
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  )}
                  <p
                    className={`mt-1 text-[10px] ${
                      mine
                        ? isLight ? "text-white/70" : "text-black/50"
                        : isLight ? "text-slate-500" : "text-white/60"
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
        className={`flex shrink-0 items-center gap-2 px-3 py-3 border-t ${
          isLight ? "border-slate-200" : "border-white/10"
        }`}
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !conversationId}
          className={`inline-flex items-center justify-center rounded-full p-2 transition ${
            isLight
              ? "text-slate-500 hover:bg-slate-100 hover:text-orange-500 disabled:opacity-40"
              : "text-white/50 hover:bg-white/10 hover:text-orange-400 disabled:opacity-40"
          }`}
          title="Send image"
        >
          {uploading ? (
            <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
          ) : (
            <FontAwesomeIcon icon={faImage} className="h-4 w-4" />
          )}
        </button>
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
          disabled={!conversationId || (!input.trim() && !uploading)}
          className={`inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold text-black shadow-sm transition ${
            isLight
              ? "bg-orange-500 hover:bg-orange-400 disabled:opacity-60"
              : "bg-orange-500 hover:bg-orange-400 disabled:opacity-60"
          }`}
        >
          <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
        </button>
      </form>

      {previewImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );

  if (variant === "page") {
    return <div className="flex h-full min-h-0 flex-col">{inner}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex h-[70vh] w-full max-w-xl min-h-0 flex-col">
        {inner}
      </div>
    </div>
  );
};

export default ConversationChat;
