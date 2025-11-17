import { Box, Text } from '@chakra-ui/react';

export type Point = { t: number; v: number };

export default function RealtimeChart(_props: { data: Point[] }) {
  // Placeholder component kept to avoid breaking imports if referenced.
  // Charting library was removed during layout-only scope.
  return (
    <Box w="100%" h="300px" display="flex" alignItems="center" justifyContent="center" bg="gray.800" borderWidth="1px" borderColor="gray.700" borderRadius="md">
      <Text color="gray.400">Gráfico desativado (apenas layout)</Text>
    </Box>
  );
}
