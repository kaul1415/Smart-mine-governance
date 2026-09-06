/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // MineGov AI design tokens — deep governance navy, not the generic
        // warm-cream / terracotta AI-default palette.
        ink: {
          900: '#0B1723', // primary text
          700: '#243444', // secondary text
          500: '#5B6B7C', // muted text
        },
        surface: {
          canvas: '#F5F6F8', // page background
          card: '#FFFFFF',
          sunken: '#EEF1F4',
        },
        border: {
          DEFAULT: '#DCE1E8',
          strong: '#C3CBD6',
        },
        brand: {
          900: '#081B33',
          800: '#0B2545', // primary — deep governance navy
          700: '#13355E',
          600: '#1B4965', // secondary steel blue
          100: '#E6ECF3',
        },
        risk: {
          low: '#2F6846',
          lowBg: '#E7F1EA',
          medium: '#B7791F',
          mediumBg: '#FBF0DE',
          high: '#B3401D',
          highBg: '#FBE7DD',
          critical: '#8C1D1D',
          criticalBg: '#F7E1E1',
        },
        status: {
          success: '#2F6846',
          successBg: '#E7F1EA',
          warning: '#B7791F',
          warningBg: '#FBF0DE',
          danger: '#B3261E',
          dangerBg: '#FBE7DD',
          info: '#1B4965',
          infoBg: '#E6ECF3',
          neutral: '#5B6B7C',
          neutralBg: '#EEF1F4',
        },
      },
      fontFamily: {
        sans: ['"Public Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 23, 35, 0.06)',
        popover: '0 4px 16px rgba(11, 23, 35, 0.12)',
      },
    },
  },
  plugins: [],
};
