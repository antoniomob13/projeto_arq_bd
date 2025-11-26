import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  Select,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FiActivity, FiBarChart2, FiTrendingUp, FiZap, FiSun, FiBattery } from 'react-icons/fi';

// Mock data for charts (would be replaced by Chart.js or similar)
const mockDailyData = [
  { hora: '06:00', geracao: 50, consumo: 30 },
  { hora: '09:00', geracao: 450, consumo: 180 },
  { hora: '12:00', geracao: 850, consumo: 320 },
  { hora: '15:00', geracao: 680, consumo: 250 },
  { hora: '18:00', geracao: 200, consumo: 400 },
  { hora: '21:00', geracao: 0, consumo: 350 },
];

const mockMonthlyData = [
  { mes: 'Jan', geracao: 135, consumo: 98 },
  { mes: 'Fev', geracao: 142, consumo: 105 },
  { mes: 'Mar', geracao: 128, consumo: 92 },
  { mes: 'Abr', geracao: 155, consumo: 110 },
  { mes: 'Mai', geracao: 148, consumo: 102 },
  { mes: 'Jun', geracao: 138, consumo: 95 },
];

export default function Analytics() {
  const [periodo, setPeriodo] = useState('hoje');

  // Calculate stats
  const totalGeracao = mockDailyData.reduce((sum, d) => sum + d.geracao, 0);
  const totalConsumo = mockDailyData.reduce((sum, d) => sum + d.consumo, 0);
  const eficiencia = totalGeracao > 0 ? Math.round((totalConsumo / totalGeracao) * 100) : 0;
  const economia = Math.round((totalGeracao - totalConsumo) * 0.75); // R$ 0.75/kWh

  return (
    <Stack spacing={8}>
      {/* Header */}
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
        <Box>
          <HStack spacing={2} color="teal.400" mb={2}>
            <Icon as={FiActivity} />
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" fontWeight="bold">
              Análises
            </Text>
          </HStack>
          <Heading size="lg" fontWeight="extrabold" mb={2}>
            Gráficos & Análises
          </Heading>
          <Text color="gray.400">
            Acompanhe o desempenho do seu sistema ao longo do tempo.
          </Text>
        </Box>

        <Select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          w={{ base: 'full', md: '200px' }}
          bg="slate.700"
          borderColor="whiteAlpha.100"
          borderRadius="xl"
        >
          <option value="hoje">Hoje</option>
          <option value="semana">Esta Semana</option>
          <option value="mes">Este Mês</option>
          <option value="ano">Este Ano</option>
        </Select>
      </Flex>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4}>
        <StatCard
          icon={FiSun}
          label="Geração Total"
          value={`${(totalGeracao / 1000).toFixed(1)} kWh`}
          trend="+12%"
          trendUp={true}
          color="yellow.400"
        />
        <StatCard
          icon={FiZap}
          label="Consumo Total"
          value={`${(totalConsumo / 1000).toFixed(1)} kWh`}
          trend="-5%"
          trendUp={false}
          color="blue.400"
        />
        <StatCard
          icon={FiBattery}
          label="Eficiência"
          value={`${eficiencia}%`}
          trend="+3%"
          trendUp={true}
          color="green.400"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Economia Est."
          value={`R$ ${economia}`}
          trend="+8%"
          trendUp={true}
          color="teal.400"
        />
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Daily Chart */}
        <Box bg="slate.800" borderRadius="2xl" borderWidth="1px" borderColor="whiteAlpha.100" p={6}>
          <HStack spacing={3} mb={6}>
            <Icon as={FiBarChart2} color="teal.400" />
            <Heading size="sm" fontWeight="bold">
              Geração vs Consumo (Diário)
            </Heading>
          </HStack>

          {/* Simple bar chart visualization */}
          <Stack spacing={3}>
            {mockDailyData.map((data, idx) => (
              <Box key={idx}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="xs" color="gray.400">{data.hora}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {data.geracao}W / {data.consumo}W
                  </Text>
                </Flex>
                <Flex gap={2} align="center">
                  <Box flex="1" bg="slate.700" borderRadius="full" h="8px" overflow="hidden">
                    <Box
                      bg="linear-gradient(90deg, #14b8a6, #0ea5e9)"
                      h="full"
                      w={`${(data.geracao / 850) * 100}%`}
                      borderRadius="full"
                    />
                  </Box>
                  <Box flex="1" bg="slate.700" borderRadius="full" h="8px" overflow="hidden">
                    <Box
                      bg="linear-gradient(90deg, #3b82f6, #8b5cf6)"
                      h="full"
                      w={`${(data.consumo / 400) * 100}%`}
                      borderRadius="full"
                    />
                  </Box>
                </Flex>
              </Box>
            ))}
          </Stack>

          <Flex justify="center" gap={6} mt={4}>
            <HStack spacing={2}>
              <Box w={3} h={3} borderRadius="full" bg="teal.400" />
              <Text fontSize="xs" color="gray.400">Geração</Text>
            </HStack>
            <HStack spacing={2}>
              <Box w={3} h={3} borderRadius="full" bg="blue.400" />
              <Text fontSize="xs" color="gray.400">Consumo</Text>
            </HStack>
          </Flex>
        </Box>

        {/* Monthly Chart */}
        <Box bg="slate.800" borderRadius="2xl" borderWidth="1px" borderColor="whiteAlpha.100" p={6}>
          <HStack spacing={3} mb={6}>
            <Icon as={FiTrendingUp} color="teal.400" />
            <Heading size="sm" fontWeight="bold">
              Histórico Mensal (kWh)
            </Heading>
          </HStack>

          {/* Simple line chart visualization */}
          <Flex justify="space-between" align="flex-end" h="200px" gap={4} px={2}>
            {mockMonthlyData.map((data, idx) => (
              <Flex key={idx} direction="column" align="center" flex="1">
                <Flex direction="column" align="center" h="160px" justify="flex-end" gap={1}>
                  <Box
                    w="full"
                    bg="linear-gradient(180deg, #14b8a6, #0d9488)"
                    borderRadius="md"
                    h={`${(data.geracao / 160) * 100}%`}
                    minH="10px"
                  />
                  <Box
                    w="full"
                    bg="linear-gradient(180deg, #3b82f6, #2563eb)"
                    borderRadius="md"
                    h={`${(data.consumo / 160) * 100}%`}
                    minH="10px"
                  />
                </Flex>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  {data.mes}
                </Text>
              </Flex>
            ))}
          </Flex>

          <Flex justify="center" gap={6} mt={4}>
            <HStack spacing={2}>
              <Box w={3} h={3} borderRadius="full" bg="teal.400" />
              <Text fontSize="xs" color="gray.400">Geração (kWh)</Text>
            </HStack>
            <HStack spacing={2}>
              <Box w={3} h={3} borderRadius="full" bg="blue.400" />
              <Text fontSize="xs" color="gray.400">Consumo (kWh)</Text>
            </HStack>
          </Flex>
        </Box>
      </SimpleGrid>

      {/* Performance Insights */}
      <Box bg="slate.800" borderRadius="2xl" borderWidth="1px" borderColor="whiteAlpha.100" p={6}>
        <HStack spacing={3} mb={4}>
          <Icon as={FiActivity} color="teal.400" />
          <Heading size="sm" fontWeight="bold">
            Insights de Performance
          </Heading>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <InsightCard
            title="Melhor Horário"
            value="12:00 - 14:00"
            description="Período de maior geração solar"
            color="yellow.400"
          />
          <InsightCard
            title="Pico de Consumo"
            value="18:00 - 21:00"
            description="Horário com maior demanda"
            color="orange.400"
          />
          <InsightCard
            title="Autonomia Média"
            value="4.2 horas"
            description="Tempo médio com baterias"
            color="green.400"
          />
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
  trendUp,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  color: string;
}) {
  return (
    <Box bg="slate.800" borderRadius="2xl" borderWidth="1px" borderColor="whiteAlpha.100" p={5}>
      <HStack spacing={3} mb={3}>
        <Box p={2} borderRadius="lg" bg={`${color}20`}>
          <Icon as={icon} color={color} boxSize={5} />
        </Box>
        <Text fontSize="xs" color="gray.400" textTransform="uppercase">
          {label}
        </Text>
      </HStack>
      <Flex justify="space-between" align="flex-end">
        <Text fontSize="2xl" fontWeight="bold">
          {value}
        </Text>
        <Text fontSize="xs" color={trendUp ? 'green.400' : 'red.400'} fontWeight="medium">
          {trend}
        </Text>
      </Flex>
    </Box>
  );
}

function InsightCard({
  title,
  value,
  description,
  color,
}: {
  title: string;
  value: string;
  description: string;
  color: string;
}) {
  return (
    <Box bg="slate.700" borderRadius="xl" p={4}>
      <Text fontSize="xs" color="gray.400" textTransform="uppercase" mb={1}>
        {title}
      </Text>
      <Text fontSize="lg" fontWeight="bold" color={color} mb={1}>
        {value}
      </Text>
      <Text fontSize="xs" color="gray.500">
        {description}
      </Text>
    </Box>
  );
}
