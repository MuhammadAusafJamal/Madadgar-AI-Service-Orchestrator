export const CATEGORIES = [
  { id: 'electrician', name: 'Electrician', icon: 'flash-outline', iconColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.18)', sortOrder: 1 },
  { id: 'plumber', name: 'Plumber', icon: 'water-outline', iconColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.18)', sortOrder: 2 },
  { id: 'ac-repair', name: 'AC Repair', icon: 'snow-outline', iconColor: '#06B6D4', backgroundColor: 'rgba(6,182,212,0.18)', sortOrder: 3 },
  { id: 'cleaning', name: 'Cleaning', icon: 'sparkles-outline', iconColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.18)', sortOrder: 4 },
  { id: 'carpentry', name: 'Carpentry', icon: 'hammer-outline', iconColor: '#F97316', backgroundColor: 'rgba(249,115,22,0.18)', sortOrder: 5 },
  { id: 'tutoring', name: 'Tutoring', icon: 'school-outline', iconColor: '#8B5CF6', backgroundColor: 'rgba(139,92,246,0.18)', sortOrder: 6 },
  { id: 'beauty', name: 'Beauty', icon: 'cut-outline', iconColor: '#EC4899', backgroundColor: 'rgba(236,72,153,0.18)', sortOrder: 7 },
  { id: 'catering', name: 'Catering', icon: 'restaurant-outline', iconColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.18)', sortOrder: 8 },
];

const FALLBACK = {
  id: 'other',
  name: 'Other',
  icon: 'apps-outline',
  iconColor: '#9CA3AF',
  backgroundColor: 'rgba(156,163,175,0.18)',
  sortOrder: 999,
};

const byId = new Map(CATEGORIES.map((c) => [c.id, c]));

export const getCategoryById = (id) => byId.get(id) || FALLBACK;

export const getCategoryByName = (name) => {
  if (!name) return null;
  const normalized = String(name).trim().toLowerCase();
  return (
    CATEGORIES.find((c) => c.name.toLowerCase() === normalized) ||
    CATEGORIES.find((c) => c.id === normalized) ||
    null
  );
};

export const categoryIdFromName = (name) => {
  const found = getCategoryByName(name);
  return found ? found.id : null;
};
