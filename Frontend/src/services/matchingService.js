// Provider/service matching — Challenge 2 #3 (Matching & Ranking) and
// #4 (Decision & Recommendation).
//
// Ranks candidates by a weighted blend of three criteria:
//   1. Review rating  — higher average rating boosts rank.
//   2. Availability   — more available providers boost rank.
//   3. Proximity      — shorter distance from the user's address boosts rank.
//
// rankByMatch() also flags the top result (`_match.recommended`) and attaches a
// plain-language reason. Entry point: rankByMatch(items, userCoords).

// --- Weights ---------------------------------------------------------------
// Tune freely; the three should sum to 1.
export const MATCH_WEIGHTS = { rating: 0.45, availability: 0.3, proximity: 0.25 };

const RATING_SCALE = 5; // ratings are on a 0–5 scale
// Distance (km) at which the proximity score decays to 0. Anything farther
// still ranks, just with no proximity contribution.
const PROXIMITY_FALLOFF_KM = 25;

// --- Known locations -------------------------------------------------------
// Approximate coordinates used to turn a free-text address ("Shah Faisal
// Colony, Karachi") into a lat/lng. A small offline lookup — no geocoding API,
// so it stays free and works without a network round-trip.
const CITY_CENTERS = {
  karachi: { lat: 24.8607, lng: 67.0011 },
  lahore: { lat: 31.5204, lng: 74.3587 },
  islamabad: { lat: 33.6844, lng: 73.0479 },
  rawalpindi: { lat: 33.5651, lng: 73.0169 },
  hyderabad: { lat: 25.396, lng: 68.3578 },
  faisalabad: { lat: 31.4504, lng: 73.135 },
  multan: { lat: 30.1575, lng: 71.5249 },
  peshawar: { lat: 34.0151, lng: 71.5249 },
};

// Neighbourhood-level coordinates, tagged with their city so an address like
// "DHA Lahore" never resolves to Karachi's DHA.
const NEIGHBOURHOODS = [
  { city: 'karachi', aliases: ['shah faisal'], lat: 24.876, lng: 67.157 },
  { city: 'karachi', aliases: ['gulshan-e-iqbal', 'gulshan e iqbal', 'gulshan'], lat: 24.9215, lng: 67.089 },
  { city: 'karachi', aliases: ['gulistan-e-johar', 'gulistan e johar', 'johar'], lat: 24.918, lng: 67.13 },
  { city: 'karachi', aliases: ['korangi'], lat: 24.839, lng: 67.133 },
  { city: 'karachi', aliases: ['clifton'], lat: 24.8138, lng: 67.03 },
  { city: 'karachi', aliases: ['defence', 'dha'], lat: 24.8, lng: 67.065 },
  { city: 'karachi', aliases: ['pechs'], lat: 24.872, lng: 67.068 },
  { city: 'karachi', aliases: ['tariq road'], lat: 24.873, lng: 67.064 },
  { city: 'karachi', aliases: ['north nazimabad'], lat: 24.95, lng: 67.036 },
  { city: 'karachi', aliases: ['nazimabad'], lat: 24.912, lng: 67.033 },
  { city: 'karachi', aliases: ['fb area', 'federal b area'], lat: 24.93, lng: 67.064 },
  { city: 'karachi', aliases: ['malir'], lat: 24.893, lng: 67.207 },
  { city: 'karachi', aliases: ['landhi'], lat: 24.85, lng: 67.19 },
  { city: 'karachi', aliases: ['saddar'], lat: 24.86, lng: 67.022 },
  { city: 'karachi', aliases: ['bahria town'], lat: 25.003, lng: 67.306 },
  { city: 'lahore', aliases: ['gulberg'], lat: 31.5102, lng: 74.3441 },
  { city: 'lahore', aliases: ['model town'], lat: 31.484, lng: 74.327 },
  { city: 'lahore', aliases: ['johar town'], lat: 31.469, lng: 74.273 },
];

// Resolve a free-text address into { lat, lng }, or null when nothing matches.
// A neighbourhood inside the detected city wins; otherwise the city centre.
export function resolveCoordinates(text = '') {
  if (typeof text !== 'string' || !text.trim()) return null;
  const lower = text.toLowerCase();

  let city = null;
  for (const name of Object.keys(CITY_CENTERS)) {
    if (lower.includes(name)) {
      city = name;
      break;
    }
  }

  const hoodMatches = NEIGHBOURHOODS.filter((n) =>
    n.aliases.some((alias) => lower.includes(alias)),
  );
  const hood =
    hoodMatches.find((n) => n.city === city) ||
    (!city ? hoodMatches[0] : null) ||
    null;
  if (hood) return { lat: hood.lat, lng: hood.lng };

  if (city) return CITY_CENTERS[city];
  return null;
}

// --- Distance --------------------------------------------------------------
const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

// Great-circle distance between two { lat, lng } points (Haversine formula).
export function haversineKm(a, b) {
  if (!a || !b) return null;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// --- Scoring ---------------------------------------------------------------
const clamp01 = (n) => Math.min(1, Math.max(0, n));

// Turn an availability score (0–1) into a short human label.
export function availabilityLabel(score) {
  if (score >= 0.8) return 'Available today';
  if (score >= 0.5) return 'Available this week';
  return 'Limited availability';
}

// Plain-language "why" line — Challenge 2 #3 "clear reasoning for selection"
// and #4 "explain the decision in simple terms".
function buildReason(rating, availabilityText, distanceKm) {
  const parts = [];
  if (rating > 0) parts.push(`${rating.toFixed(1)}★`);
  parts.push(availabilityText);
  if (typeof distanceKm === 'number') {
    parts.push(`${distanceKm.toFixed(1)} km`);
  }
  return parts.join(' · ');
}

// Score one candidate (a service or provider) on each criterion (0..1) and
// blend them into a single weighted score. Returns the breakdown plus a
// human-readable availability label and reason so the UI can explain the pick.
function scoreCandidate(item, userCoords, weights) {
  const rating = Number(item.rating) || 0;
  const ratingScore = clamp01(rating / RATING_SCALE);

  const availabilityScore = clamp01(
    typeof item.availability === 'number' ? item.availability : 0.5,
  );
  const availabilityText = availabilityLabel(availabilityScore);

  let distanceKm = null;
  let proximityScore = 0.5; // neutral when a distance can't be computed
  const hasCoords =
    typeof item.lat === 'number' && typeof item.lng === 'number';
  if (userCoords && hasCoords) {
    distanceKm = haversineKm(userCoords, { lat: item.lat, lng: item.lng });
    proximityScore = clamp01(1 - distanceKm / PROXIMITY_FALLOFF_KM);
  }

  const score =
    weights.rating * ratingScore +
    weights.availability * availabilityScore +
    weights.proximity * proximityScore;

  return {
    score,
    ratingScore,
    availabilityScore,
    availabilityText,
    proximityScore,
    distanceKm,
    reason: buildReason(rating, availabilityText, distanceKm),
  };
}

// Rank items (services or providers) best-first by the weighted match score.
// `userCoords` may be null — ranking then leans on rating + availability. The
// #1 result is flagged `_match.recommended`; each item carries a `_match`
// object with the full score breakdown and a plain-language reason.
export function rankByMatch(items = [], userCoords = null, weights = MATCH_WEIGHTS) {
  const ranked = items
    .map((item) => ({
      ...item,
      _match: scoreCandidate(item, userCoords, weights),
    }))
    .sort((a, b) => b._match.score - a._match.score);
  if (ranked.length > 0) ranked[0]._match.recommended = true;
  return ranked;
}
