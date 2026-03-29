import { useEffect, useState } from "react";
import ConversationChat from "../../component/chat/ConversationChat.jsx";
import { chatAPI } from "../../utils/api.js";

const displayName = (o) =>
  [o?.firstName, o?.lastName].filter(Boolean).join(" ").trim() || "Owner";

const RenterChat = ({ user }) => {
  const [chatTargetUser, setChatTargetUser] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [chatListLoading, setChatListLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchOwners = async () => {
      try {
        setChatListLoading(true);
        setChatError(null);
        const data = await chatAPI.getOwners();
        if (!cancelled) {
          setChatList(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setChatList([]);
          setChatError(err?.message ?? "Failed to load owners.");
        }
      } finally {
        if (!cancelled) setChatListLoading(false);
      }
    };
    fetchOwners();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div id="chat" className="scroll-mt-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white">Messages</h2>
        <p className="mt-1 text-sm text-white/60">
          Chat with owners about vehicles and bookings
        </p>
      </div>

      <div className="flex h-[clamp(420px,75dvh,720px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f1419] shadow-xl">
        <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[minmax(260px,32%)_1fr] lg:items-stretch">
          <section className="flex min-h-0 flex-col border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
            <div className="shrink-0 border-b border-white/10 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">Owners</h3>
              <p className="mt-0.5 text-xs text-white/50">
                Select someone to open the conversation
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {chatListLoading ? (
                <p className="py-8 text-center text-sm text-white/50">
                  Loading…
                </p>
              ) : chatError ? (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {chatError}
                </p>
              ) : chatList.length === 0 ? (
                <p className="py-8 text-center text-sm text-white/50">
                  No owners available yet.
                </p>
              ) : (
                <ul className="space-y-1">
                  {chatList.map((o) => {
                    const name = displayName(o);
                    const selected = chatTargetUser?.id === o.id;
                    return (
                      <li key={o.id}>
                        <button
                          type="button"
                          onClick={() => setChatTargetUser(o)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                            selected
                              ? "border border-orange-400/50 bg-orange-500/15"
                              : "border border-transparent hover:bg-white/5"
                          }`}
                        >
                          {o.profilePicture ? (
                            <img
                              src={o.profilePicture}
                              alt=""
                              className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white/10"
                            />
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500/25 text-sm font-semibold text-orange-200">
                              {(name[0] || "O").toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-white">
                              {name}
                            </p>
                            {o.city && (
                              <p className="truncate text-xs text-white/45">
                                {o.city}
                              </p>
                            )}
                          </div>
                          {selected && (
                            <span
                              className="hidden h-8 w-1 shrink-0 rounded-full bg-orange-400 lg:block"
                              aria-hidden
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          <section className="flex min-h-0 flex-1 flex-col">
            {chatTargetUser ? (
              <ConversationChat
                targetUserId={chatTargetUser.id}
                targetUser={chatTargetUser}
                currentUser={user}
                onClose={() => setChatTargetUser(null)}
                variant="page"
              />
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-white/50">
                Select an owner on the left to start chatting.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default RenterChat;
