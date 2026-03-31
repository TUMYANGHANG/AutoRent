import { faStar, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

/**
 * Modal to submit or update a vehicle review.
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onSubmit - (rating, comment) => Promise
 * @param {object} existingReview - { rating, comment } if updating
 * @param {string} vehicleName - for display
 */
const ReviewFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  existingReview = null,
  vehicleName = "this vehicle",
}) => {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const displayRating = hoverRating || rating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Please select a rating (1-5 stars)");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(rating, comment.trim() || null);
      onClose();
    } catch (err) {
      setError(err?.message ?? "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setRating(existingReview?.rating ?? 0);
      setComment(existingReview?.comment ?? "");
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1419] shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-xl font-bold text-white">
            {existingReview ? "Update your review" : "Rate this vehicle"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <p className="text-white/70">
            How was your experience with {vehicleName}?
          </p>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419] rounded p-1 transition"
              >
                <FontAwesomeIcon
                  icon={faStar}
                  className={`h-8 w-8 transition ${
                    star <= displayRating
                      ? "text-orange-400"
                      : "text-white/30"
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="review-comment" className="block text-sm font-medium text-white/80 mb-2">
              Comment (optional)
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Share your experience..."
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-3 font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating < 1}
              className="flex-1 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-black transition hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : existingReview ? "Update review" : "Submit review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewFormModal;
