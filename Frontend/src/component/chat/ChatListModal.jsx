import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { chatAPI } from "../../utils/api.js";

/**
 * Modal that shows a list of owners (for renters) or renters (for owners).
 * User selects one to start a chat.
 */
const ChatListModal = ({ userRole, onSelect, onClose }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchList = async () => {
      try {
        setLoading(true);
        setError(null);
        const data =
          userRole === "owner"
            ? await chatAPI.getRenters()
            : await chatAPI.getOwners();
        if (!cancelled) setList(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load list.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchList();
    return () => { cancelled = true; };
  }, [userRole]);

  const label = userRole === "owner" ? "renters" : "owners";
  const displayName = (u) =>
    [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "User";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl bg-[#0b0f19] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold">Chat with {label}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <p className="py-8 text-center text-white/60">Loading {label}…</p>
          )}
          {error && !loading && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-red-300">
              {error}
            </p>
          )}
          {!loading && !error && list.length === 0 && (
            <p className="py-8 text-center text-white/60">No {label} found.</p>
          )}
          {!loading && !error && list.length > 0 && (
            <ul className="space-y-4">
              {list.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(u)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10 hover:border-orange-500/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
                      <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white truncate">
                        {displayName(u)}
                      </p>
                      {u.email && (
                        <p className="text-xs text-white/60 truncate">
                          {u.email}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListModal;
