import { useEffect, useState } from "react";
import {
  GlassPanel,
  PageHeader,
} from "../../component/dashboard/DashboardPrimitives.jsx";
import { adminAPI } from "../../utils/api.js";

const sourceLabel = (s) =>
  s === "contact"
    ? "Contact form"
    : s === "faq"
      ? "FAQ questions"
      : s === "footer"
        ? "Quick contact"
        : s;

const mailtoReplyHref = (r) => {
  const subject = encodeURIComponent("Re: Your message to AutoRent");
  const body = encodeURIComponent(
    `Hi ${r.name},\n\n\n\n---\nTheir message:\n${r.message}`,
  );
  return `mailto:${r.email}?subject=${subject}&body=${body}`;
};

const formatTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
};

const AdminInquiries = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminAPI
      .getContactInquiries()
      .then((data) => {
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inquiry permanently?")) return;
    setDeletingId(id);
    try {
      await adminAPI.deleteContactInquiry(id);
      setRows((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      alert(e?.message || "Could not delete inquiry.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Contact inquiries"
        subtitle="Messages from contact forms, FAQ, and quick contact. Reply opens your mail app."
      />

      {loading ? (
        <GlassPanel className="py-16 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-slate-600">Loading…</p>
        </GlassPanel>
      ) : rows.length === 0 ? (
        <GlassPanel className="py-16 text-center">
          <p className="text-sm font-medium text-slate-600">No inquiries yet.</p>
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <article
              key={r.id}
              className="dash-panel rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-sm transition hover:border-teal-200/80 hover:shadow-[0_16px_48px_rgba(15,23,42,0.1)]"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-gradient-to-r from-slate-800 to-slate-900 px-3 py-1 text-xs font-medium text-white shadow-sm">
                  {sourceLabel(r.source)}
                </span>
                <time className="text-xs font-medium text-slate-500">
                  {formatTime(r.createdAt)}
                </time>
              </div>
              <p className="font-semibold text-slate-900">
                {r.name}{" "}
                <span className="font-normal text-slate-500">&lt;{r.email}&gt;</span>
              </p>
              {(r.phone || r.subject) && (
                <p className="mt-1 text-sm text-slate-600">
                  {r.phone ? `Phone: ${r.phone}` : ""}
                  {r.phone && r.subject ? " · " : ""}
                  {r.subject ? `Subject: ${r.subject}` : ""}
                </p>
              )}
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                {r.message}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <a
                  href={mailtoReplyHref(r)}
                  className="inline-flex items-center rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:from-teal-500 hover:to-emerald-500"
                >
                  Reply
                </a>
                <button
                  type="button"
                  disabled={deletingId === r.id}
                  onClick={() => handleDelete(r.id)}
                  className="inline-flex items-center rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                >
                  {deletingId === r.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
};

export default AdminInquiries;
