export const colors = {
  primary: "#ffffff",
  secondary: "#000000",
  accent: "#002bff",
  gray: "#eeeeee",
  gradient: {
    topLeft: "#002bff",
    topRight: "#0078ff",
    bottomRight: "#0000d4",
    bottomLeft: "#0078ff",
  },
  secondaryGradient: {
    from: "#ffffff",
    to: "#eeeeee",
  },
} as const;

export type ColorKey = keyof typeof colors;

