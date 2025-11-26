import { Box } from '@chakra-ui/react';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export type Point = { t: number; v: number };

type RealtimeChartProps = {
  data: Point[];
  label?: string;
  color?: string;
  showArea?: boolean;
};

export default function RealtimeChart({
  data,
  label = 'Geração (W)',
  color = 'rgba(45, 212, 191, 1)',
  showArea = true,
}: RealtimeChartProps) {
  const labels = data.map((p) => {
    const date = new Date(p.t);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label,
        data: data.map((p) => p.v),
        borderColor: color,
        backgroundColor: showArea ? color.replace('1)', '0.15)') : 'transparent',
        borderWidth: 2,
        fill: showArea,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        pointHoverBackgroundColor: '#fff',
        pointBorderColor: color,
        pointHoverBorderColor: color,
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(51, 65, 85, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: { parsed: { y: number } }) => `${context.parsed.y} W`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback: (value: number | string) => `${value} W`,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <Box w="100%" h="100%">
      <Line data={chartData} options={options} />
    </Box>
  );
}
