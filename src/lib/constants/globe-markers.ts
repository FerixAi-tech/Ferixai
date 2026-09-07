/** Active FerixAI coverage regions shown on the interactive globe. */
export const GLOBE_MARKERS = [
  {
    id: "uae",
    label: "United Arab Emirates",
    shortLabel: "UAE",
    location: [24.4539, 54.3773] as [number, number],
    baseSize: 0.055,
  },
  {
    id: "tr",
    label: "Turkey",
    shortLabel: "Turkey",
    location: [39.9334, 32.8597] as [number, number],
    baseSize: 0.05,
  },
  {
    id: "usa",
    label: "United States",
    shortLabel: "USA",
    location: [39.8283, -98.5795] as [number, number],
    baseSize: 0.052,
  },
  {
    id: "ca",
    label: "Canada",
    shortLabel: "Canada",
    location: [56.1304, -106.3468] as [number, number],
    baseSize: 0.048,
  },
  {
    id: "au",
    label: "Australia",
    shortLabel: "Australia",
    location: [-25.2744, 133.7751] as [number, number],
    baseSize: 0.05,
  },
] as const;

export const MARKER_GLOW_COLOR: [number, number, number] = [0.15, 0.95, 0.55];
