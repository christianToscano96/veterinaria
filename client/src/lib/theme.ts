// Theme colors based on Stitch/Google design system
// Used across the entire app for consistent styling

// Primary colors
export const primary = "#9e18a6";
export const primaryContainer = "#bc3ac1";
export const onPrimary = "#ffffff";
export const onPrimaryContainer = "#fffbff";
export const primaryFixed = "#ffd6f8";
export const primaryFixedDim = "#ffa9fa";

// Secondary colors (Stitch uses different purple)
export const secondary = "#68548d";
export const secondaryContainer = "#d6beff";
export const onSecondary = "#ffffff";
export const onSecondaryContainer = "#5d4a82";
export const secondaryFixed = "#ebdcff";
export const secondaryFixedDim = "#d3bcfc";

// Tertiary colors
export const tertiary = "#814974";
export const tertiaryContainer = "#9c618e";
export const onTertiary = "#ffffff";
export const onTertiaryContainer = "#fffbff";
export const tertiaryFixed = "#ffd7f1";
export const tertiaryFixedDim = "#f6b1e3";

// Surface colors
export const surface = "#fff7fa";
export const surfaceContainer = "#fbe9f5";
export const surfaceContainerHigh = "#f5e3ef";
export const surfaceContainerHighest = "#efdee9";
export const surfaceContainerLow = "#ffeef9";
export const surfaceContainerLowest = "#ffffff";
export const surfaceDim = "#e6d5e1";
export const surfaceBright = "#fff7fa";
export const surfaceContainerHighAlt = "#ffeef9";

// Background
export const background = "#fff7fa";

// Text colors
export const onSurface = "#221921";
export const onSurfaceVariant = "#524250";
export const onBackground = "#221921";
export const onPrimaryFixed = "#37003b";
export const onPrimaryFixedVariant = "#7f0086";
export const onSecondaryFixed = "#230f45";
export const onSecondaryFixedVariant = "#503d73";
export const onTertiaryFixed = "#360630";
export const onTertiaryFixedVariant = "#69345e";

// Error colors
export const error = "#ba1a1a";
export const errorContainer = "#ffdad6";
export const onError = "#ffffff";
export const onErrorContainer = "#93000a";

// Outline colors
export const outline = "#847181";
export const outlineVariant = "#d7c0d1";

// Inverse colors
export const inverseOnSurface = "#feecf8";
export const inverseSurface = "#382d36";
export const inversePrimary = "#ffa9fa";

// Misc
export const surfaceTint = "#a11ca8";

// Complete theme object
export const theme = {
  primary,
  primaryContainer,
  onPrimary,
  onPrimaryContainer,
  primaryFixed,
  primaryFixedDim,
  secondary,
  secondaryContainer,
  onSecondary,
  onSecondaryContainer,
  secondaryFixed,
  secondaryFixedDim,
  tertiary,
  tertiaryContainer,
  onTertiary,
  onTertiaryContainer,
  tertiaryFixed,
  tertiaryFixedDim,
  surface,
  surfaceContainer,
  surfaceContainerHigh,
  surfaceContainerHighest,
  surfaceContainerLow,
  surfaceContainerLowest,
  surfaceDim,
  surfaceBright,
  surfaceContainerHighAlt,
  background,
  onSurface,
  onSurfaceVariant,
  onBackground,
  onPrimaryFixed,
  onPrimaryFixedVariant,
  onSecondaryFixed,
  onSecondaryFixedVariant,
  onTertiaryFixed,
  onTertiaryFixedVariant,
  error,
  errorContainer,
  onError,
  onErrorContainer,
  outline,
  outlineVariant,
  inverseOnSurface,
  inverseSurface,
  inversePrimary,
  surfaceTint,
};

// Reusable Style Generators
export const styles = {
  // Card styles
  card: {
    background: surfaceContainerLowest,
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(56, 45, 54, 0.04)",
  },
  cardHover: {
    transition: "all 0.2s",
    cursor: "pointer",
  },

  // Button styles
  buttonPrimary: {
    background: primary,
    color: onPrimary,
    fontWeight: 700,
    padding: "12px 24px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(158, 24, 166, 0.25)",
  },
  buttonSecondary: {
    background: "transparent",
    color: onSurface,
    fontWeight: 600,
    padding: "12px 24px",
    borderRadius: "12px",
    border: "1px solid outlineVariant",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s",
  },

  // Input styles
  input: {
    width: "100%",
    padding: "12px 16px",
    background: "transparent",
    border: "none",
    borderBottom: `2px solid ${outlineVariant}`,
    fontSize: "15px",
    color: onSurface,
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  inputWrapper: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute" as const,
    left: "0",
    color: outline,
  },

  // Label styles
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: onSurfaceVariant,
    marginBottom: "8px",
    display: "block",
  },

  // Badge/Tag styles
  badge: (
    variant:
      | "primary"
      | "secondary"
      | "error"
      | "success"
      | "warning" = "primary",
  ) => {
    const variants = {
      primary: { background: primaryFixed, color: onPrimaryFixedVariant },
      secondary: { background: secondaryFixed, color: onSecondaryFixedVariant },
      error: { background: errorContainer, color: onErrorContainer },
      success: { background: "#dcfce7", color: "#166534" },
      warning: { background: "#fef3c7", color: "#92400e" },
    };
    return {
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      ...variants[variant],
    };
  },

  // KPI Card styles
  kpiCard: {
    background: surfaceContainerLowest,
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
    minHeight: "128px",
  },

  // Section styles
  section: {
    background: surfaceContainer,
    borderRadius: "16px",
    padding: "32px",
  },

  // Grid helpers
  grid: (cols: number = 1, gap: string = "24px") => ({
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: gap,
  }),

  // Flex helpers
  flexBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flexCenter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  flexStart: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  // Text styles
  h1: {
    fontSize: "28px",
    fontWeight: 800,
    color: onSurface,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontSize: "24px",
    fontWeight: 700,
    color: onSurface,
    letterSpacing: "-0.02em",
  },
  h3: {
    fontSize: "20px",
    fontWeight: 700,
    color: onSurface,
  },
  h4: {
    fontSize: "16px",
    fontWeight: 600,
    color: onSurface,
  },
  body: {
    fontSize: "15px",
    color: onSurfaceVariant,
  },
  caption: {
    fontSize: "13px",
    color: onSurfaceVariant,
  },
  small: {
    fontSize: "12px",
    color: onSurfaceVariant,
  },
};

// Export everything
export default theme;
