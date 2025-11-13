export const fonts = {
  primary: "Poppins",
  weights: {
    thin: 100,
    medium: 500,
  },
} as const;

export const fontSizes = {
  hero: {
    mobile: "text-3xl",      // ~30px
    tablet: "text-4xl",      // ~36px
    desktop: "text-5xl"      // ~48px
  },
  h1: {
    mobile: "text-2xl",      // ~24px
    tablet: "text-3xl",      // ~30px
    desktop: "text-4xl"      // ~36px
  },
  h2: {
    mobile: "text-xl",       // ~20px
    tablet: "text-2xl",      // ~24px
    desktop: "text-3xl"      // ~30px
  },
  h3: {
    mobile: "text-base",     // ~16px
    tablet: "text-lg",       // ~18px
    desktop: "text-xl"       // ~20px
  },
  body: {
    mobile: "text-sm",       // ~14px
    tablet: "text-base",     // ~16px
    desktop: "text-lg"       // ~18px
  },
} as const;

export type FontWeight = keyof typeof fonts.weights;

// Helper function to get responsive font classes
export const getResponsiveFontSize = (size: keyof typeof fontSizes) => {
  const sizeConfig = fontSizes[size];
  return `${sizeConfig.mobile} md:${sizeConfig.tablet} lg:${sizeConfig.desktop}`;
};
