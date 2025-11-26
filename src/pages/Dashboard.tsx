import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { FiActivity, FiAlertTriangle, FiPower, FiZap } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../api/client';
import type { Sistema } from '../models/domain';
import { useAuth } from '../context/AuthContext';

type NormalizedStatus = 'Online' | 'Offline' | 'Alerta/Erro';

// Mock data for sistemas (same as teste.html)
const MOCK_SISTEMAS: Sistema[] = [
  { _id: 'sys1', nome: 'Unidade Tapajós 01', status_operacional: 'Online', localizacao: { latitude: -2.443, longitude: -54.708, rua: 'Rua Principal, 10', bairro: '', cep: '68040-000' }, subsistema: [], capacidade_wp: 1000 } as Sistema & { capacidade_wp: number },
  { _id: 'sys2', nome: 'Unidade Arapiuns 05', status_operacional: 'Offline', localizacao: { latitude: 0, longitude: 0, rua: 'Rua B', bairro: '', cep: '68000-000' }, subsistema: [], capacidade_wp: 500 } as Sistema & { capacidade_wp: number },
  { _id: 'sys3', nome: 'Unidade Várzea 02', status_operacional: 'Alerta/Erro', localizacao: { latitude: 0, longitude: 0, rua: 'Rua C', bairro: '', cep: '68000-000' }, subsistema: [], capacidade_wp: 2000 } as Sistema & { capacidade_wp: number },
  { _id: 'sys4', nome: 'Unidade Curuá-Una', status_operacional: 'Online', localizacao: { latitude: 0, longitude: 0, rua: 'Rua D', bairro: '', cep: '68000-000' }, subsistema: [], capacidade_wp: 5000 } as Sistema & { capacidade_wp: number },
  { _id: 'sys5', nome: 'Unidade Alter do Chão', status_operacional: 'Online', localizacao: { latitude: 0, longitude: 0, rua: 'Rua E', bairro: '', cep: '68000-000' }, subsistema: [], capacidade_wp: 3000 } as Sistema & { capacidade_wp: number },
];

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sistemas, setSistemas] = useState<(Sistema & { capacidade_wp?: number; status_operacional?: string })[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiGet<Sistema[]>('/sistemas');
        if (active && data.length > 0) {
          setSistemas(data);
        } else if (active) {
          setSistemas(MOCK_SISTEMAS);
        }
      } catch {
        if (active) setSistemas(MOCK_SISTEMAS);
      }
    })();
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => {
    const online = sistemas.filter(s => s.status_operacional === 'Online').length;
    const offline = sistemas.filter(s => s.status_operacional === 'Offline').length;
    const alert = sistemas.filter(s => s.status_operacional === 'Alerta/Erro').length;
    const total = sistemas.length;
    const capacity = sistemas.reduce((acc, s) => acc + (s.capacidade_wp ?? 0), 0);
    return { online, offline, alert, total, capacity };
  }, [sistemas]);

  const prioritySystems = useMemo(() => {
    const statusOrder: Record<string, number> = { 'Alerta/Erro': 3, 'Offline': 2, 'Online': 1 };
    const sorted = [...sistemas].sort((a, b) => {
      return (statusOrder[b.status_operacional ?? 'Online'] ?? 1) - (statusOrder[a.status_operacional ?? 'Online'] ?? 1);
    });
    const critical = sorted.filter(s => s.status_operacional !== 'Online');
    const healthy = sorted.filter(s => s.status_operacional === 'Online').slice(0, 2);
    return [...critical, ...healthy];
  }, [sistemas]);

  if (!isAdmin) {
    return <ClienteDashboard />;
  }

  return (
    <Stack spacing={10}>
      <Box>
        <Heading size="lg" fontWeight="extrabold" color="gray.100" mb={2}>
          Dashboard Central de Sistemas
        </Heading>
        <Text fontSize="lg" color="gray.400">
          Visão geral do status de operação de toda a frota LABER.
        </Text>
      </Box>

      {/* Stat Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6}>
        <StatCard
          label="Sistemas Online"
          value={`${stats.online}`}
          subValue={`/ ${stats.total}`}
          icon={FiActivity}
          borderColor="brand.500"
          iconBg="rgba(20,184,166,0.15)"
          iconColor="brand.400"
          pulse
        />
        <StatCard
          label="Sistemas Offline"
          value={`${stats.offline}`}
          icon={FiPower}
          borderColor="gray.500"
          iconBg="rgba(100,116,139,0.2)"
          iconColor="gray.400"
        />
        <StatCard
          label="Sistemas com Alerta"
          value={`${stats.alert}`}
          icon={FiAlertTriangle}
          borderColor="red.500"
          iconBg="rgba(239,68,68,0.15)"
          iconColor="red.400"
          pulse={stats.alert > 0}
        />
        <StatCard
          label="Capacidade Total"
          value={`${stats.capacity.toLocaleString('pt-BR')}`}
          subValue="Wp"
          icon={FiZap}
          borderColor="yellow.500"
          iconBg="rgba(234,179,8,0.15)"
          iconColor="yellow.400"
        />
      </SimpleGrid>

      {/* Priority Table */}
      <Box bg="slate.800" borderRadius="2xl" overflow="hidden" boxShadow="xl" borderWidth="1px" borderColor="rgba(51,65,85,0.5)">
        <Box px={6} py={4} borderBottomWidth="1px" borderColor="slate.700" bg="rgba(51,65,85,0.5)">
          <Heading size="md" fontWeight="bold" color="gray.100">
            Visão Rápida: Sistemas com Prioridade
          </Heading>
          <Text fontSize="sm" color="gray.400">
            Filtro automático para sistemas Offline ou com Alerta/Erro.
          </Text>
        </Box>
        <Box overflowX="auto">
          <Table variant="simple" size="md">
            <Thead bg="slate.700">
              <Tr>
                <Th color="gray.300" borderColor="slate.700">Prioridade</Th>
                <Th color="gray.300" borderColor="slate.700">Nome do Sistema</Th>
                <Th color="gray.300" borderColor="slate.700">Localização</Th>
                <Th color="gray.300" borderColor="slate.700" textAlign="right">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {prioritySystems.map((sistema) => (
                <Tr
                  key={sistema._id}
                  _hover={{ bg: 'rgba(51,65,85,0.7)' }}
                  transition="background 0.15s"
                  bg={sistema.status_operacional === 'Alerta/Erro' ? 'rgba(127,29,29,0.1)' : 'transparent'}
                >
                  <Td borderColor="slate.700">
                    <StatusBadge status={sistema.status_operacional as NormalizedStatus} />
                  </Td>
                  <Td borderColor="slate.700" fontWeight="medium" color="gray.200">
                    {sistema.nome}
                  </Td>
                  <Td borderColor="slate.700" color="gray.400">
                    {sistema.localizacao?.rua ?? 'N/A'}
                  </Td>
                  <Td borderColor="slate.700" textAlign="right">
                    <Button
                      size="sm"
                      variant="ghost"
                      color="brand.400"
                      _hover={{ bg: 'slate.600' }}
                      onClick={() => navigate(`/sistemas?id=${sistema._id}`)}
                    >
                      Dados
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Stack>
  );
}

function StatCard({
  label,
  value,
  subValue,
  icon,
  borderColor,
  iconBg,
  iconColor,
  pulse,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  pulse?: boolean;
}) {
  return (
    <Flex
      bg="slate.800"
      p={6}
      borderRadius="2xl"
      boxShadow="xl"
      borderBottomWidth="4px"
      borderColor={borderColor}
      align="center"
      transition="all 0.3s"
      _hover={{ transform: 'scale(1.01)' }}
    >
      <Flex
        bg={iconBg}
        p={4}
        borderRadius="xl"
        mr={4}
        boxShadow="inset 0 0 10px rgba(0,0,0,0.2)"
        animation={pulse ? 'pulse 2s infinite' : undefined}
        sx={pulse ? {
          '@keyframes pulse': {
            '0%': { boxShadow: `0 0 0 0 ${iconBg}` },
            '70%': { boxShadow: '0 0 0 12px transparent' },
            '100%': { boxShadow: '0 0 0 0 transparent' },
          },
        } : undefined}
      >
        <Icon as={icon} boxSize={6} color={iconColor} />
      </Flex>
      <Box>
        <Text color="gray.400" fontSize="sm" textTransform="uppercase" letterSpacing="widest">
          {label}
        </Text>
        <Text fontSize="3xl" fontWeight="extrabold" color="gray.100">
          {value}
          {subValue && <Text as="span" fontSize="base" color="gray.400" ml={1}>{subValue}</Text>}
        </Text>
      </Box>
    </Flex>
  );
}

function StatusBadge({ status }: { status: NormalizedStatus }) {
  const styles: Record<NormalizedStatus, { bg: string; color: string }> = {
    'Online': { bg: 'rgba(20,184,166,0.15)', color: 'brand.400' },
    'Offline': { bg: 'rgba(100,116,139,0.2)', color: 'gray.400' },
    'Alerta/Erro': { bg: 'rgba(239,68,68,0.15)', color: 'red.400' },
  };
  const s = styles[status] ?? styles['Online'];
  return (
    <Badge
      px={3}
      py={1}
      borderRadius="full"
      fontSize="xs"
      fontWeight="bold"
      textTransform="uppercase"
      bg={s.bg}
      color={s.color}
    >
      {status}
    </Badge>
  );
}

// Cliente Dashboard (renderUserHome from teste.html)
function ClienteDashboard() {
  // Mock data for client's system
  const sistema = {
    nome: 'Unidade Tapajós 01',
    localizacao: { rua: 'Rua Principal, 10', cep: '68040-000' },
    capacidade_wp: 1000,
    media_dia_kwh: 4.5,
    media_mes_kwh: 135,
  };

  const leitura = {
    geracao_w: 850,
    consumo_w: 420,
    soc_bateria: 82,
    status: 'Gerando',
  };

  const statusColor = leitura.status === 'Gerando' ? 'brand.400' : leitura.status === 'Erro' ? 'red.400' : 'gray.400';
  const batteryColor = leitura.soc_bateria > 70 ? 'brand.500' : leitura.soc_bateria > 30 ? 'yellow.500' : 'red.500';

  return (
    <Stack spacing={10}>
      <Box borderBottomWidth="1px" borderColor="slate.700" pb={4}>
        <Heading size="lg" fontWeight="extrabold" color="gray.100">
          {sistema.nome}
        </Heading>
        <Text fontSize="lg" color="brand.400" fontWeight="light" mt={1}>
          📍 {sistema.localizacao.rua} - {sistema.localizacao.cep}
        </Text>
      </Box>

      {/* Stat Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
        <Box
          bg="slate.800"
          borderRadius="2xl"
          boxShadow="xl"
          p={6}
          borderTopWidth="4px"
          borderColor={leitura.status === 'Gerando' ? 'brand.500' : 'red.500'}
          transition="all 0.3s"
          _hover={{ bg: 'rgba(51,65,85,0.7)' }}
        >
          <Flex justify="space-between" align="center">
            <Box>
              <Text color="gray.400" fontSize="sm" textTransform="uppercase" letterSpacing="widest">
                Status Operacional
              </Text>
              <Text fontSize="3xl" fontWeight="extrabold" color={statusColor} mt={2}>
                {leitura.status.toUpperCase()}
              </Text>
            </Box>
            <Box
              w={8}
              h={8}
              borderRadius="full"
              bg={statusColor}
              animation={leitura.status === 'Gerando' ? 'pulse-teal 2s infinite' : undefined}
              sx={{
                '@keyframes pulse-teal': {
                  '0%': { boxShadow: '0 0 0 0 rgba(45, 212, 191, 0.7)' },
                  '70%': { boxShadow: '0 0 0 12px rgba(45, 212, 191, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(45, 212, 191, 0)' },
                },
              }}
            />
          </Flex>
        </Box>

        <Box
          bg="slate.800"
          borderRadius="2xl"
          boxShadow="xl"
          p={6}
          transition="all 0.3s"
          _hover={{ bg: 'rgba(51,65,85,0.7)' }}
        >
          <Icon as={FiZap} boxSize={8} color="yellow.400" mb={3} />
          <Text color="gray.400" fontSize="sm" textTransform="uppercase" letterSpacing="widest">
            Geração Instantânea
          </Text>
          <Text fontSize="3xl" fontWeight="extrabold" mt={1}>
            {leitura.geracao_w} <Text as="span" fontSize="xl" fontWeight="medium" color="gray.400">W</Text>
          </Text>
        </Box>

        <Box
          bg="slate.800"
          borderRadius="2xl"
          boxShadow="xl"
          p={6}
          transition="all 0.3s"
          _hover={{ bg: 'rgba(51,65,85,0.7)' }}
        >
          <Text fontSize="3xl" mb={3}>💨</Text>
          <Text color="gray.400" fontSize="sm" textTransform="uppercase" letterSpacing="widest">
            Consumo da Carga
          </Text>
          <Text fontSize="3xl" fontWeight="extrabold" mt={1}>
            {leitura.consumo_w} <Text as="span" fontSize="xl" fontWeight="medium" color="gray.400">W</Text>
          </Text>
        </Box>

        <Box
          bg="slate.800"
          borderRadius="2xl"
          boxShadow="xl"
          p={6}
          transition="all 0.3s"
          _hover={{ bg: 'rgba(51,65,85,0.7)' }}
        >
          <Flex justify="space-between" align="center">
            <Box>
              <Text color="gray.400" fontSize="sm" textTransform="uppercase" letterSpacing="widest">
                Nível da Bateria (SOC)
              </Text>
              <Text fontSize="3xl" fontWeight="extrabold" mt={1}>
                {leitura.soc_bateria}%
              </Text>
            </Box>
            <Box
              w={10}
              h={16}
              borderWidth="2px"
              borderColor="gray.400"
              borderRadius="md"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: '-4px',
                left: '25%',
                width: '50%',
                height: '3px',
                bg: 'gray.400',
                borderRadius: 'sm',
              }}
            >
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                height={`${leitura.soc_bateria}%`}
                bg={batteryColor}
                transition="height 1s ease"
                borderRadius="xs"
              />
            </Box>
          </Flex>
        </Box>
      </SimpleGrid>

      {/* KPIs Panel */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        <Box gridColumn={{ lg: 'span 2' }} bg="slate.800" p={6} borderRadius="2xl" boxShadow="xl" borderWidth="1px" borderColor="rgba(51,65,85,0.5)">
          <Heading size="md" fontWeight="bold" mb={4} color="gray.100">
            ⚡ Geração Diária (Simulação)
          </Heading>
          <Box h="320px" bg="slate.700" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
            <Text color="gray.500">Gráfico Chart.js</Text>
          </Box>
        </Box>

        <Box bg="slate.800" p={6} borderRadius="2xl" boxShadow="xl" borderWidth="1px" borderColor="rgba(51,65,85,0.5)">
          <Heading size="md" fontWeight="bold" mb={4} color="gray.100">
            ✅ KPIs Chave
          </Heading>
          <Stack spacing={4}>
            <Flex justify="space-between" p={3} bg="rgba(51,65,85,0.5)" borderRadius="lg">
              <Text color="gray.400" fontWeight="medium">Capacidade Instalada</Text>
              <Text fontWeight="bold" fontSize="lg" color="brand.400">{sistema.capacidade_wp} Wp</Text>
            </Flex>
            <Flex justify="space-between" p={3} bg="rgba(51,65,85,0.5)" borderRadius="lg">
              <Text color="gray.400" fontWeight="medium">Produção Média Diária</Text>
              <Text fontWeight="bold" fontSize="lg">{sistema.media_dia_kwh} kWh</Text>
            </Flex>
            <Flex justify="space-between" p={3} bg="rgba(51,65,85,0.5)" borderRadius="lg">
              <Text color="gray.400" fontWeight="medium">Produção Média Mensal</Text>
              <Text fontWeight="bold" fontSize="lg">{sistema.media_mes_kwh} kWh</Text>
            </Flex>
            <Flex justify="space-between" p={3} bg="rgba(51,65,85,0.5)" borderRadius="lg">
              <Text color="gray.400" fontWeight="medium">Horas de Sol Pico Estimadas</Text>
              <Text fontWeight="bold" fontSize="lg">{(sistema.media_dia_kwh / (sistema.capacidade_wp / 1000)).toFixed(1)} h</Text>
            </Flex>
          </Stack>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}
