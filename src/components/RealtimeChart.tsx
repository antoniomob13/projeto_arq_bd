import { useMemo } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export type Point = { t: number; v: number };

export default function RealtimeChart({ data }: { data: Point[] }) {
  const gridColor = useColorModeValue('#e2e8f0', '#2d3748');
  const stroke = useColorModeValue('#2b6cb0', '#63b3ed');

  const formatted = useMemo(
    () => data.map((p) => ({
      name: new Date(p.t).toLocaleTimeString(),
      value: Number(p.v.toFixed(2)),
    })),
    [data]
  );

  return (
    <Box w="100%" h="300px">
      <ResponsiveContainer>
        <LineChart data={formatted} margin={{ top: 5, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis dataKey="name" minTickGap={32} />
          <YAxis domain={[0, 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={stroke} dot={false} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
