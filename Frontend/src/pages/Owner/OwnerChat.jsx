import { useEffect, useState } from "react";
import ConversationChat from "../../component/chat/ConversationChat.jsx";
import { chatAPI } from "../../utils/api.js";

const displayName = (u) =>
  [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim() || "Renter";

const OwnerChat = ({ user }) => {
  const [chatTargetUser, setChatTargetUser] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [chatListLoading, setChatListLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchChatList = async () => {
      try {
        setChatListLoading(true);
        setChatError(null);
        const data = await chatAPI.getRenters();
        if (!cancelled) {
          setChatList(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setChatList([]);
          setChatError(err?.message ?? "Failed to load renters.");
        }
      } finally {
        if (!cancelled) {
          setChatListLoading(false);
        }
      }
    };
    fetchChatList();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Messages</h2>
        <p className="mt-1 text-slate-600">
          Chat with your renters in real time
        </p>
      </div>
      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl h-[clamp(420px,75dvh,720px)]">
        <div className="grid h-full min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(260px,32%)_1fr] lg:items-stretch">
          <section className="flex min-h-0 flex-col border-b border-slate-200 lg:border-b-0 lg:border-r">
            <div className="shrink-0 border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Renters</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Select someone to open the conversation
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {chatListLoading ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  Loading…
                </p>
              ) : chatError ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {chatError}
                </p>
              ) : chatList.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  No renters found yet.
                </p>
              ) : (
                <ul className="space-y-1">
                  {chatList.map((u) => {
                    const name = displayName(u);
                    const selected = chatTargetUser?.id === u.id;
                    return (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => setChatTargetUser(u)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                            selected
                              ? "border border-orange-200 bg-orange-50"
                              : "border border-transparent hover:bg-slate-50"
                          }`}
                        >
                          {u.profilePicture ? (
                            <img
                              src={u.profilePicture}
                              alt=""
                              className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-slate-200"
                            />
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                              {(name[0] || "R").toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-slate-900">
                              {name}
                            </p>
                            {u.city && (
                              <p className="truncate text-xs text-slate-500">
                                {u.city}
                              </p>
                            )}
                          </div>
                          {selected && (
                            <span
                              className="hidden h-8 w-1 shrink-0 rounded-full bg-orange-500 lg:block"
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
                theme="light"
              />
            ) : (
              <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-slate-500">
                Select a renter on the left to start chatting.
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default OwnerChat;
