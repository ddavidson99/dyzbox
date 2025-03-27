import type { Config } from "tailwindcss";
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827"
        },
        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "#0A0A0A",
        background: "#FFFFFF",
        foreground: "#0A0A0A",
        primary: {
          DEFAULT: "#212121",
          foreground: "#FAFAFA",
        },
        secondary: {
          DEFAULT: "#F5F5F7",
          foreground: "#212121",
        },
        destructive: {
          DEFAULT: "#DC2828",
          foreground: "#FAFAFA",
        },
        muted: {
          DEFAULT: "#F5F5F7",
          foreground: "#787882",
        },
        accent: {
          DEFAULT: "#F5F5F7",
          foreground: "#212121",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0A0A0A",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0A0A0A",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#212121',
            a: {
              color: '#0066CC',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            p: {
              marginTop: '0.75em',
              marginBottom: '0.75em',
            },
            code: {
              borderRadius: '0.25rem',
              padding: '0.15rem 0.3rem',
              borderWidth: '1px',
              borderColor: '#E5E7EB',
              backgroundColor: '#F3F4F6',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config; 