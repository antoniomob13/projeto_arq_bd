import { Box, Flex, Stat, StatArrow, StatHelpText, StatLabel, StatNumber, useColorModeValue } from '@chakra-ui/react';

export type MetricCardProps = {
  label: string;
  value: number | string;
  delta?: number; // positive or negative
  unit?: string;
};

export default function MetricCard({ label, value, delta = 0, unit = '' }: MetricCardProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const formatted = typeof value === 'number' ? value.toLocaleString() : value;
  const showDelta = typeof delta === 'number' && delta !== 0;

  return (
    <Box bg={bg} p={4} borderRadius="md" boxShadow="sm">
      <Stat>
        <StatLabel>{label}</StatLabel>
        <Flex align="baseline" gap={2}>
          <StatNumber>{formatted}{unit ? ` ${unit}` : ''}</StatNumber>
        </Flex>
        {showDelta && (
          <StatHelpText>
            <StatArrow type={delta >= 0 ? 'increase' : 'decrease'} />
            {Math.abs(delta).toFixed(1)}%
          </StatHelpText>
        )}
      </Stat>
    </Box>
  );
}
