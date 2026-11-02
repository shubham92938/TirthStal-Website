// ─────────────────────────────────────────────────────────────
// Single source of truth for temple data.
// Every page (list, detail, map, search, districts, home) reads
// from here so images / states / districts always agree.
// ─────────────────────────────────────────────────────────────
import { templesData } from "./temple";
import { templeImages } from "./templeImages";

const FALLBACK_IMAGE = "/images/placeholder-temple.jpg";

// Remote placeholder pictures used when a temple has no good photo
const SPARE_IMAGES = [
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
  "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800",
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
];

// Broad deity family, used for filters + chips
export const deityFamily = (deity = "") => {
  const d = deity.toLowerCase();
  if (d.includes("shiva") || d.includes("bhairav") || d.includes("mahadev")) return "Shiva";
  if (d.includes("vishnu") || d.includes("krishna") || /\bram\b/.test(d)) return "Vishnu";
  if (d.includes("ganesh")) return "Ganesh";
  if (d.includes("hanuman")) return "Hanuman";
  if (d.includes("sai")) return "Sai Baba";
  if (d.includes("surya") || d.includes("sun")) return "Surya";
  if (
    d.includes("goddess") || d.includes("devi") || d.includes("shakti") ||
    d.includes("durga") || d.includes("annapurna") || d.includes("narmada") ||
    d.includes("sharda") || d.includes("jagadamba") || d.includes("pitambara") ||
    d.includes("harsiddhi") || d.includes("lakshmi")
  ) return "Devi";
  return "Other";
};

const cleanDeity = (deity = "") => deity.replace(/^(Lord|Goddess)\s+/i, "");

const normalise = (t) => {
  const imgs = templeImages[t.slug] || t.images || [];
  // Local /images/temples/* files are not shipped — drop them, use remote photos
  const usable = imgs.filter((src) => !src.startsWith("/images/temples/"));
  return {
    ...t,
    images: usable.length ? usable : [SPARE_IMAGES[t.id % SPARE_IMAGES.length]],
    family: deityFamily(t.deity),
    shortDeity: cleanDeity(t.deity),
    // Backwards-compat for components that expect these
    timing: t.timings?.morning,
  };
};

export const allTemples = Object.values(templesData)
  .flatMap((districts) => Object.values(districts).flat())
  .map(normalise);

export const getTempleBySlug = (slug) =>
  allTemples.find((t) => t.slug === slug) || null;

export const getTemplesByDistrictName = (name) =>
  allTemples.filter((t) => t.district?.toLowerCase() === name?.toLowerCase());

export const templeStates = [...new Set(allTemples.map((t) => t.state))].sort();

export const districtsOfState = (state) => {
  const list = state && state !== "All States"
    ? allTemples.filter((t) => t.state === state)
    : allTemples;
  return [...new Set(list.map((t) => t.district))].sort();
};

export const templeTypes = [...new Set(allTemples.map((t) => t.type))].sort();

export const deityFamilies = ["Shiva", "Vishnu", "Devi", "Ganesh", "Hanuman", "Sai Baba", "Surya"]
  .map((name) => ({ name, count: allTemples.filter((t) => t.family === name).length }));

// Great-circle distance (km)
export const distanceKm = (a, b) => {
  if (!a || !b) return Infinity;
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export const getNearbyTemples = (temple, limit = 4) =>
  allTemples
    .filter((t) => t.id !== temple.id)
    .map((t) => ({ ...t, distance: Math.round(distanceKm(temple.coordinates, t.coordinates)) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

export const sortTemples = (list, sort) => {
  const out = [...list];
  switch (sort) {
    case "Name A-Z":      return out.sort((a, b) => a.name.localeCompare(b.name));
    case "Name Z-A":      return out.sort((a, b) => b.name.localeCompare(a.name));
    case "Rating":        return out.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "Most Visited":  return out.sort((a, b) => b.reviews - a.reviews);
    default:              return out.sort((a, b) => b.rating * Math.log10(b.reviews + 10) - a.rating * Math.log10(a.reviews + 10));
  }
};

export const SORT_OPTIONS = ["Popularity", "Name A-Z", "Name Z-A", "Rating", "Most Visited"];

export { FALLBACK_IMAGE };
