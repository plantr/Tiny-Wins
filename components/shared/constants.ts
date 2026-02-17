export interface IconOption {
  name: string;
  label: string;
}

export interface ColorOption {
  color: string;
  gradient: readonly [string, string, ...string[]];
}

export const ICON_OPTIONS: IconOption[] = [
  { name: "water", label: "Water" },
  { name: "fitness", label: "Exercise" },
  { name: "book", label: "Reading" },
  { name: "leaf", label: "Meditation" },
  { name: "walk", label: "Walking" },
  { name: "bed", label: "Sleep" },
  { name: "nutrition", label: "Nutrition" },
  { name: "musical-notes", label: "Music" },
  { name: "code-slash", label: "Coding" },
  { name: "pencil", label: "Writing" },
  { name: "barbell", label: "Gym" },
  { name: "bicycle", label: "Cycling" },
];

export const COLOR_OPTIONS: ColorOption[] = [
  { color: "#FF3B7F", gradient: ["#FF3B7F", "#FF6B9D", "#FF8CB0"] as const },
  { color: "#FF8C42", gradient: ["#FF8C42", "#FFB347", "#FFCF70"] as const },
  { color: "#7B61FF", gradient: ["#7B61FF", "#9B87FF", "#B8A5FF"] as const },
  { color: "#00E5C3", gradient: ["#00E5C3", "#00C4A7", "#00A88B"] as const },
  { color: "#FFD600", gradient: ["#FFD600", "#FFE34D", "#FFF080"] as const },
  { color: "#FF6B9D", gradient: ["#FF6B9D", "#FF3B7F", "#7B61FF"] as const },
  { color: "#4DA6FF", gradient: ["#4DA6FF", "#2D8CFF", "#0066FF"] as const },
  { color: "#FF4D6A", gradient: ["#FF4D6A", "#FF8C42", "#00E5C3"] as const },
];

export const UNIT_OPTIONS = ["times", "minutes", "hours", "glasses", "pages", "steps", "visits"];

export const FREQUENCY_OPTIONS = ["Daily", "Weekdays", "Weekends", "3x per week", "Custom"];
