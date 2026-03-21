import { faStar, faStarHalfStroke } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const StarRating = ({
  rating,
  maxStars = 5,
  className = "",
  activeColor = "text-orange-400",
  inactiveColor = "text-white/30",
  size = "sm",
}) => {
  const r = Math.min(maxStars, Math.max(0, Number(rating) || 0));
  const full = Math.floor(r);
  const half = r % 1 >= 0.25 && r % 1 < 0.75 ? 1 : 0;
  const empty = maxStars - full - half;
  const iconClass = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3.5 w-3";

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${r} out of ${maxStars} stars`}>
      {Array.from({ length: full }, (_, i) => (
        <FontAwesomeIcon key={`f-${i}`} icon={faStar} className={`${iconClass} ${activeColor}`} />
      ))}
      {half > 0 && (
        <FontAwesomeIcon icon={faStarHalfStroke} className={`${iconClass} ${activeColor}`} />
      )}
      {Array.from({ length: empty }, (_, i) => (
        <FontAwesomeIcon key={`e-${i}`} icon={faStar} className={`${iconClass} ${inactiveColor}`} />
      ))}
    </div>
  );
};

export default StarRating;
