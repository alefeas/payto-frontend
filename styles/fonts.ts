export const fonts = {
  primary: "Poppins",
  weights: {
    thin: 100,
    medium: 500,
  },
} as const;

export type FontWeight = keyof typeof fonts.weights;

