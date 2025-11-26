import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  colors: {
    brand: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#0a4f4b',
      900: '#063a35',
    },
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5f5',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    accent: {
      400: '#facc15',
      500: '#eab308',
    },
  },
  shadows: {
    focusGlow: '0 0 40px rgba(45, 212, 191, 0.35)',
  },
  styles: {
    global: {
      body: {
        bg: 'slate.900',
        color: 'gray.100',
        minHeight: '100vh',
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(45, 212, 191, 0.15), transparent 45%)',
        backgroundAttachment: 'fixed',
      },
      '*::selection': {
        background: 'brand.400',
        color: 'slate.900',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'xl',
        fontWeight: 'semibold',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'slate.900',
          _hover: { bg: 'brand.400', boxShadow: 'focusGlow' },
          _active: { bg: 'brand.600' },
        },
        ghost: {
          color: 'brand.200',
          _hover: { bg: 'whiteAlpha.100' },
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'whiteAlpha.100',
            borderRadius: 'lg',
            _hover: { bg: 'whiteAlpha.200' },
            _focus: { bg: 'whiteAlpha.200', borderColor: 'brand.400', boxShadow: 'focusGlow' },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Select: {
      baseStyle: {
        field: {
          borderRadius: 'lg',
        },
      },
      variants: {
        filled: {
          field: {
            bg: 'whiteAlpha.100',
            borderRadius: 'lg',
            _hover: { bg: 'whiteAlpha.200' },
            _focus: { bg: 'whiteAlpha.200', borderColor: 'brand.400' },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Card: {
      baseStyle: {
        bg: 'slate.800',
        borderRadius: '2xl',
        borderWidth: '1px',
        borderColor: 'whiteAlpha.100',
        boxShadow: 'lg',
      },
    },
  },
});

export default theme;
