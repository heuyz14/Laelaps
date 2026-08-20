export type DistanceUnit = "km" | "mi";

const metersPerMile = 1609.344;

export function formatDistance(
  meters: number,
  unit: DistanceUnit = "km",
): string {
  const value = unit === "km" ? meters / 1000 : meters / metersPerMile;
  return `${value.toFixed(1)} ${unit}`;
}

export function formatPace(secondsPerKm: number, unit: DistanceUnit): string {
  const adjustedSeconds =
    unit === "km" ? secondsPerKm : Math.round(secondsPerKm * 1.609344);
  const minutes = Math.floor(adjustedSeconds / 60);
  const seconds = adjustedSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")} /${unit}`;
}
