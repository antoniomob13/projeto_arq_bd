import { Box, Text } from '@chakra-ui/react';

// Simple SVG placeholder that looks like a chart area.
export default function ChartPlaceholder({ title = 'Visualização gráfica' }: { title?: string }) {
  return (
    <Box bg="gray.800" borderWidth="1px" borderColor="gray.700" borderRadius="md" p={4}>
      <Text fontWeight="semibold" mb={3}>{title}</Text>
      <Box as="figure" h="320px" w="100%" bg="gray.900" borderRadius="sm" position="relative" overflow="hidden">
        <svg width="100%" height="100%" viewBox="0 0 800 320" preserveAspectRatio="none">
          {/* grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2d3748" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="800" height="320" fill="url(#grid)" />
          {/* axes */}
          <line x1="50" y1="290" x2="780" y2="290" stroke="#4a5568" strokeWidth="2" />
          <line x1="50" y1="20" x2="50" y2="290" stroke="#4a5568" strokeWidth="2" />
          {/* mock line */}
          <path d="M50 270 C 150 250, 220 220, 260 235 S 360 210, 420 230 S 540 200, 600 210 S 720 180, 780 190"
            fill="none" stroke="#63b3ed" strokeWidth="3" />
        </svg>
        <Text position="absolute" bottom="2" right="3" fontSize="xs" color="gray.400">placeholder</Text>
      </Box>
    </Box>
  );
}
