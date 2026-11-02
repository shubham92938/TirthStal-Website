import dayjs from "dayjs";
import { festivalsWithImages } from "./festivals";

export const allFestivals = festivalsWithImages;

export const getFestivalBySlug = (slug) => allFestivals.find((f) => f.slug === slug) || null;

/**
 * Next date a festival is celebrated, relative to `today`.
 * Dates in the data are for a single year; Hindu festivals follow the lunar
 * calendar so for past dates we roll forward by whole years and flag it
 * as approximate (`approx: true`).
 */
export const nextOccurrence = (festival, today = dayjs()) => {
  // Prefer an explicitly dated occurrence that is still in the future
  // (e.g. Simhastha 2028) before rolling an old date forward.
  const dated = [festival.date, festival.upcomingDate]
    .map((x) => dayjs(x))
    .filter((x) => x.isValid())
    .sort((a, b) => a.valueOf() - b.valueOf());
  if (!dated.length) return { date: null, approx: true, daysAway: null };
  const future = dated.find((x) => !x.isBefore(today, "day"));
  if (future) return { date: future, approx: false, daysAway: future.startOf("day").diff(today.startOf("day"), "day") };
  let d = dated[dated.length - 1];
  let approx = false;
  while (d.isBefore(today, "day")) { d = d.add(1, "year"); approx = true; }
  return { date: d, approx, daysAway: d.startOf("day").diff(today.startOf("day"), "day") };
};

export const upcomingFestivals = (limit = 4, today = dayjs()) =>
  allFestivals
    .map((f) => ({ ...f, next: nextOccurrence(f, today) }))
    .filter((f) => f.next.date)
    .sort((a, b) => a.next.daysAway - b.next.daysAway)
    .slice(0, limit);

export const festivalMonths = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
