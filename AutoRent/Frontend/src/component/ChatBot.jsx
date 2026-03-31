import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faMinus,
  faPaperPlane,
  faRobot,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { getAuthToken } from "../utils/api.js";

const RASA_URL = import.meta.env.VITE_RASA_URL || "http://localhost:5005";

const SESSION_KEY = "autorent_chatbot_session";

function getSenderId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      crypto.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function renderMarkdown(text) {
  if (!text) return null;
  return text.split("\n").map((line, i) => {
    let html = line
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(
        /`(.+?)`/g,
        '<code class="bg-white/10 px-1 rounded text-xs">$1</code>'
      );
    if (line.trim() === "") return <br key={i} />;
    return (
      <span
        key={i}
        className="block"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });
}

async function sendToRasa(message) {
  const token = getAuthToken();
  const body = {
    sender: getSenderId(),
    message,
    metadata: token ? { token } : {},
  };

  const res = await fetch(`${RASA_URL}/webhooks/rest/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Rasa returned ${res.status}`);
  return res.json();
}

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Namaste! Welcome to AutoRent 🙏\nI can help you with vehicle rentals, bookings, payments, and more.\nHow can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const [showHint, setShowHint] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (open) {
      setShowHint(false);
      return;
    }
    const id = setInterval(() => {
      if (!openRef.current) {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 4000);
      }
    }, 30000);
    return () => clearInterval(id);
  }, [open]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setIsTyping(true);

    try {
      const responses = await sendToRasa(text);
      if (responses && responses.length > 0) {
        const botMessages = responses
          .filter((r) => r.text)
          .map((r) => ({ sender: "bot", text: r.text }));
        setMessages((prev) => [...prev, ...botMessages]);
        if (!openRef.current) setHasUnread(true);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "I'm sorry, I didn't get a response. Could you try again?",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!open) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
        {showHint && (
          <div
            className="mb-1 px-4 py-2.5 rounded-xl bg-[#0b0f19] border border-white/10 shadow-lg shadow-black/40 text-sm text-white/90 whitespace-nowrap animate-fade-in cursor-pointer"
            onClick={() => {
              setOpen(true);
              setHasUnread(false);
              setShowHint(false);
            }}
          >
            Hi, I&apos;m your AutoRent Assistant 👋
          </div>
        )}
        <button
          onClick={() => {
            setOpen(true);
            setHasUnread(false);
            setShowHint(false);
          }}
          className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/25 flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
          aria-label="Open chatbot"
        >
          <FontAwesomeIcon icon={faComment} className="text-xl" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#05070b] animate-pulse" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[420px] h-[620px] flex flex-col rounded-2xl shadow-2xl shadow-black/60 overflow-hidden border border-white/[0.06]"
      style={{ background: "#0b0f19" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0 bg-black/40">
        <div className="w-9 h-9 rounded-full bg-orange-500/15 flex items-center justify-center">
          <FontAwesomeIcon icon={faRobot} className="text-orange-400 text-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">
            AutoRent Assistant
          </h3>
          <p className="text-[11px] text-green-400">Online</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition cursor-pointer"
            title="Minimize"
          >
            <FontAwesomeIcon icon={faMinus} className="text-xs" />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-lg hover:bg-red-500/20 flex items-center justify-center text-white/50 hover:text-red-400 transition cursor-pointer"
            title="Close"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xs" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "bot" && (
              <div className="w-7 h-7 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0 mt-1 mr-2">
                <FontAwesomeIcon
                  icon={faRobot}
                  className="text-orange-400 text-[10px]"
                />
              </div>
            )}
            <div
              className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-orange-500 text-black font-medium rounded-2xl rounded-br-md"
                  : "bg-white/[0.06] text-gray-200 rounded-2xl rounded-bl-md border border-white/[0.06]"
              }`}
            >
              {msg.sender === "bot" ? renderMarkdown(msg.text) : msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0 mt-1 mr-2">
              <FontAwesomeIcon
                icon={faRobot}
                className="text-orange-400 text-[10px]"
              />
            </div>
            <div className="bg-white/[0.06] text-gray-400 rounded-2xl rounded-bl-md border border-white/[0.06] px-4 py-3 text-sm">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-orange-400/70 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-orange-400/70 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-orange-400/70 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/10 shrink-0 bg-black/40">
        <div className="flex items-center gap-2 bg-white/[0.05] rounded-xl border border-white/10 focus-within:border-orange-500/40 transition px-3 py-1">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none py-2"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-30 disabled:hover:bg-orange-500 flex items-center justify-center text-black transition cursor-pointer disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
          </button>
        </div>
        <p className="text-[10px] text-white/20 text-center mt-1.5">
          Powered by AutoRent AI
        </p>
      </div>
    </div>
  );
};

export default ChatBot;
