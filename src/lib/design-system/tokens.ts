/**
 * Design System Tokens
 * Centralized design tokens for consistent UI/UX across the enterprise platform
 */

export const designTokens = {
  // Color Palette
  colors: {
    // Primary Brand Colors
    primary: {
      50: 'hsl(214, 100%, 97%)',
      100: 'hsl(214, 95%, 93%)',
      200: 'hsl(214, 87%, 85%)',
      300: 'hsl(214, 82%, 73%)',
      400: 'hsl(214, 78%, 58%)',
      500: 'hsl(214, 84%, 47%)',
      600: 'hsl(214, 89%, 39%)',
      700: 'hsl(214, 92%, 31%)',
      800: 'hsl(214, 89%, 25%)',
      900: 'hsl(214, 84%, 20%)',
      950: 'hsl(214, 87%, 13%)'
    },
    
    // Semantic Colors
    semantic: {
      success: {
        light: 'hsl(142, 76%, 36%)',
        DEFAULT: 'hsl(142, 71%, 45%)',
        dark: 'hsl(142, 84%, 31%)'
      },
      warning: {
        light: 'hsl(43, 96%, 56%)',
        DEFAULT: 'hsl(38, 92%, 50%)',
        dark: 'hsl(32, 95%, 44%)'
      },
      error: {
        light: 'hsl(0, 84%, 60%)',
        DEFAULT: 'hsl(0, 72%, 51%)',
        dark: 'hsl(0, 74%, 42%)'
      },
      info: {
        light: 'hsl(199, 89%, 48%)',
        DEFAULT: 'hsl(199, 89%, 42%)',
        dark: 'hsl(199, 89%, 36%)'
      }
    },
    
    // Neutral Colors
    neutral: {
      0: 'hsl(0, 0%, 100%)',
      50: 'hsl(210, 40%, 98%)',
      100: 'hsl(210, 40%, 96%)',
      200: 'hsl(214, 32%, 91%)',
      300: 'hsl(213, 27%, 84%)',
      400: 'hsl(215, 20%, 65%)',
      500: 'hsl(215, 16%, 47%)',
      600: 'hsl(215, 19%, 35%)',
      700: 'hsl(215, 25%, 27%)',
      800: 'hsl(217, 33%, 17%)',
      900: 'hsl(222, 84%, 5%)',
      950: 'hsl(229, 84%, 5%)'
    }
  },
  
  // Typography Scale
  typography: {
    fontFamilies: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'Segoe UI Mono', 'Roboto Mono', 'monospace'],
      display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif']
    },
    
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    }
  },
  
  // Spacing Scale
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem'
  },
  
  // Animation & Transitions
  animation: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
} as const;

export type DesignTokens = typeof designTokens;