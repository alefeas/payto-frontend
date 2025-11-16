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

// CSS variables for use in Tailwind
export const colorsCss = `
  :root {
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-accent: ${colors.accent};
    --color-gray: ${colors.gray};
    --gradient-top-left: ${colors.gradient.topLeft};
    --gradient-top-right: ${colors.gradient.topRight};
    --gradient-bottom-right: ${colors.gradient.bottomRight};
    --gradient-bottom-left: ${colors.gradient.bottomLeft};
  }
`;
