/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Orchid (Veterinaria Pandy) - Exact match with theme.ts
        primary: {
          DEFAULT: '#9e18a6',
          container: '#bc3ac1',
          foreground: '#ffffff',
        },
        // Secondary - Match with theme.ts
        secondary: {
          DEFAULT: '#68548d',
          container: '#d6beff',
          foreground: '#ffffff',
        },
        // Surface - Match with theme.ts
        surface: {
          DEFAULT: '#ffffff',
          dim: '#e6d5e1',
          variant: '#d7c0d1',
        },
        // Status colors
        status: {
          ok: '#22c55e',
          warning: '#eab308',
          error: '#ef4444',
          info: '#3b82f6',
        },
        // Backgrounds - Exact match with theme.ts
        background: '#fff7fa',
        foreground: '#221921',
        'on-surface': '#221921',
        'on-surface-variant': '#524250',
        
        // Standard shadcn/ui (for compatibility)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'soft': '0 20px 40px rgba(56, 45, 54, 0.06)',
        'soft-hover': '0 20px 40px rgba(56, 45, 54, 0.08)',
      },
    },
  },
  plugins: [],
}