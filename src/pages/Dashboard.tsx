import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Spinner,
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
import { 
  FaCloudArrowUp, 
  FaPowerOff, 
  FaTriangleExclamation, 
  FaBolt,
  FaSolarPanel,
  FaFan,
  FaListCheck,
  FaMapPin
} from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { getSistemas, getSistemaById, calcularCapacidadeTotal } from '../api/sistemas';
import { getUltimaLeitura } from '../api/leituras';
import type { Sistema, LeituraAtual } from '../models/domain';
import { useAuth } from '../context/AuthContext';
import RealtimeChart, { type Point } from '../components/RealtimeChart';

type NormalizedStatus = 'Online' | 'Offline' | 'Alerta/Erro';

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [sistemas, setSistemas] = useState<(Sistema & { capacidade_wp?: number; status_operacional?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSistemas();
        if (active) {
          setSistemas(data);
        }
      } catch (err) {
        if (active) {
          setError('Erro ao carregar sistemas. Verifique se o servidor está rodando.');
          setSistemas([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => {
    const online = sistemas.filter(s => s.status_operacional === 'Online').length;
    const offline = sistemas.filter(s => s.status_operacional === 'Offline').length;
    const alert = sistemas.filter(s => s.status_operacional === 'Alerta/Erro').length;
    const total = sistemas.length;
    const capacity = calcularCapacidadeTotal(sistemas as Sistema[]);
    return { online, offline, alert, total, capacity };
  }, [sistemas]);

  const prioritySystems = useMemo(() => {
    const statusOrder: Record<string, number> = { 
      'Alerta/Erro': 3,  // Maior prioridade
      'Offline': 2,      // Segunda prioridade
      'Online': 1        // Menor prioridade
    };
    const sorted = [...sistemas].sort((a, b) => {
      return (statusOrder[b.status_operacional ?? 'Online'] ?? 1) - (statusOrder[a.status_operacional ?? 'Online'] ?? 1);
    });
    const critical = sorted.filter(s => s.status_operacional !== 'Online');
    const healthy = sorted.filter(s => s.status_operacional === 'Online').slice(0, 2);
    return [...critical, ...healthy];
  }, [sistemas]);

  if (!isAdmin) {
    return <ClienteDashboard sistemaId={user?.sistema_id} />;
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="brand.400" thickness="4px" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box bg="red.900" p={6} borderRadius="xl" borderWidth="1px" borderColor="red.700">
        <Heading size="md" color="red.300" mb={2}>Erro ao carregar dashboard</Heading>
        <Text color="gray.300">{error}</Text>
        <Text color="gray.400" mt={2} fontSize="sm">
          Certifique-se de que o servidor backend está rodando em localhost:4000 e o MongoDB está conectado.
        </Text>
      </Box>
    );
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
          icon={FaCloudArrowUp}
          borderColor="brand.500"
          iconBg="rgba(20,184,166,0.15)"
          iconColor="brand.400"
          pulse
        />
        <StatCard
          label="Sistemas Offline"
          value={`${stats.offline}`}
          icon={FaPowerOff}
          borderColor="gray.500"
          iconBg="rgba(100,116,139,0.2)"
          iconColor="gray.400"
        />
        <StatCard
          label="Sistemas com Alerta"
          value={`${stats.alert}`}
          icon={FaTriangleExclamation}
          borderColor="red.500"
          iconBg="rgba(239,68,68,0.15)"
          iconColor="red.400"
          pulse={stats.alert > 0}
        />
        <StatCard
          label="Capacidade Total"
          value={`${stats.capacity.toLocaleString('pt-BR')}`}
          subValue="Wp"
          icon={FaBolt}
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
                      onClick={() => navigate(`/analises?sistema=${sistema._id}`)}
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
function ClienteDashboard({ sistemaId }: { sistemaId?: string }) {
  const [sistema, setSistema] = useState<Sistema | null>(null);
  const [leitura, setLeitura] = useState<LeituraAtual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (sistemaId) {
          const [sistemaData, leituraData] = await Promise.all([
            getSistemaById(sistemaId),
            getUltimaLeitura(sistemaId).catch(() => null)
          ]);
          
          if (active) {
            setSistema(sistemaData);
            setLeitura(leituraData);
          }
        } else {
          // Cliente sem sistema associado
          if (active) {
            setError('Nenhum sistema associado à sua conta.');
          }
        }
      } catch (err) {
        if (active) {
          setError('Erro ao carregar dados do sistema.');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [sistemaId]);

  // Dados simulados de geração diária quando não há leitura real
  const capacidadeWp = sistema ? calcularCapacidadeTotal([sistema]) : 1000;
  
  const geracaoDiaria: Point[] = useMemo(() => {
    const now = new Date();
    const points: Point[] = [];
    
    for (let hour = 6; hour <= 18; hour++) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0);
      const peakHour = 12;
      const spread = 3.5;
      const maxGen = capacidadeWp * 0.85;
      const value = maxGen * Math.exp(-Math.pow(hour - peakHour, 2) / (2 * spread * spread));
      points.push({ t: date.getTime(), v: Math.round(value) });
    }
    return points;
  }, [capacidadeWp]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="brand.400" thickness="4px" />
      </Flex>
    );
  }

  if (error || !sistema) {
    return (
      <Box bg="slate.800" p={6} borderRadius="xl" borderWidth="1px" borderColor="slate.700">
        <Heading size="md" color="gray.300" mb={2}>Sistema não disponível</Heading>
        <Text color="gray.400">{error || 'Nenhum sistema associado à sua conta.'}</Text>
        <Text color="gray.500" mt={2} fontSize="sm">
          Entre em contato com o administrador para associar um sistema à sua conta.
        </Text>
      </Box>
    );
  }

  // Valores padrão quando não há leitura
  const leituraAtual = leitura || {
    geracao_w: 0,
    consumo_w: 0,
    soc_bateria: 0,
    status: 'Sem dados',
  };

  const statusColor = leituraAtual.status === 'Gerando' ? 'brand.400' : leituraAtual.status === 'Erro' ? 'red.400' : 'gray.400';
  const batteryColor = leituraAtual.soc_bateria > 70 ? 'brand.500' : leituraAtual.soc_bateria > 30 ? 'yellow.500' : 'red.500';

  // Calcular métricas
  const mediaKwhDia = (capacidadeWp / 1000) * 4.5; // Estimativa: 4.5h de sol pico
  const mediaKwhMes = mediaKwhDia * 30;

  return (
    <Stack spacing={10}>
      <Box borderBottomWidth="1px" borderColor="slate.700" pb={4}>
        <Heading size="lg" fontWeight="extrabold" color="gray.100">
          {sistema.nome}
        </Heading>
        <Flex align="center" mt={1}>
          <Icon as={FaMapPin} color="brand.400" mr={2} />
          <Text fontSize="lg" color="brand.400" fontWeight="light">
            {sistema.localizacao?.rua ?? 'Endereço não informado'} - {sistema.localizacao?.cep ?? ''}
          </Text>
        </Flex>
      </Box>

      {/* Stat Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
        <Box
          bg="slate.800"
          borderRadius="2xl"
          boxShadow="xl"
          p={6}
          borderTopWidth="4px"
          borderColor={leituraAtual.status === 'Gerando' ? 'brand.500' : 'red.500'}
          transition="all 0.3s"
          _hover={{ bg: 'rgba(51,65,85,0.7)' }}
        >
          <Flex justify="space-between" align="center">
            <Box>
              <Text color="gray.400" fontSize="sm" textTransform="uppercase" letterSpacing="widest">
                Status Operacional
              </Text>
              <Text fontSize="3xl" fontWeight="extrabold" color={statusColor} mt={2}>
                {leituraAtual.status.toUpperCase()}
              </Text>
            </Box>
            <Box
              w={8}
              h={8}
              borderRadius="full"
              bg={statusColor}
              className={leituraAtual.status === 'Gerando' ? 'status-dot-online' : ''}
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
          <Icon as={FaSolarPanel} boxSize={8} color="yellow.400" mb={3} />
          <Text color="gray.400" fontSize="sm" textTransform="uppercase" letterSpacing="widest">
            Geração Instantânea
          </Text>
          <Text fontSize="3xl" fontWeight="extrabold" mt={1}>
            {leituraAtual.geracao_w} <Text as="span" fontSize="xl" fontWeight="medium" color="gray.400">W</Text>
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
          <Icon as={FaFan} boxSize={8} color="blue.400" mb={3} />
          <Text color="gray.400" fontSize="sm" textTransform="uppercase" letterSpacing="widest">
            Consumo da Carga
          </Text>
          <Text fontSize="3xl" fontWeight="extrabold" mt={1}>
            {leituraAtual.consumo_w} <Text as="span" fontSize="xl" fontWeight="medium" color="gray.400">W</Text>
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
                {leituraAtual.soc_bateria}%
              </Text>
            </Box>
            <Box className="battery-shell">
              <Box
                className="battery-level"
                style={{ height: `${leituraAtual.soc_bateria}%` }}
                bg={batteryColor}
              />
            </Box>
          </Flex>
        </Box>
      </SimpleGrid>

      {/* KPIs Panel */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        <Box gridColumn={{ lg: 'span 2' }} bg="slate.800" p={6} borderRadius="2xl" boxShadow="xl" borderWidth="1px" borderColor="rgba(51,65,85,0.5)">
          <Flex align="center" mb={4}>
            <Icon as={FaBolt} color="brand.400" mr={2} />
            <Heading size="md" fontWeight="bold" color="gray.100">
              Geração Diária (Estimativa)
            </Heading>
          </Flex>
          <Box h="320px">
            <RealtimeChart 
              data={geracaoDiaria} 
              label="Geração (W)"
              color="rgba(45, 212, 191, 1)"
              showArea
            />
          </Box>
        </Box>

        <Box bg="slate.800" p={6} borderRadius="2xl" boxShadow="xl" borderWidth="1px" borderColor="rgba(51,65,85,0.5)">
          <Flex align="center" mb={4}>
            <Icon as={FaListCheck} color="brand.400" mr={2} />
            <Heading size="md" fontWeight="bold" color="gray.100">
              KPIs Chave
            </Heading>
          </Flex>
          <Stack spacing={4}>
            <Flex justify="space-between" p={3} bg="rgba(51,65,85,0.5)" borderRadius="lg">
              <Text color="gray.400" fontWeight="medium">Capacidade Instalada</Text>
              <Text fontWeight="bold" fontSize="lg" color="brand.400">{capacidadeWp} Wp</Text>
            </Flex>
            <Flex justify="space-between" p={3} bg="rgba(51,65,85,0.5)" borderRadius="lg">
              <Text color="gray.400" fontWeight="medium">Produção Média Diária</Text>
              <Text fontWeight="bold" fontSize="lg">{mediaKwhDia.toFixed(1)} kWh</Text>
            </Flex>
            <Flex justify="space-between" p={3} bg="rgba(51,65,85,0.5)" borderRadius="lg">
              <Text color="gray.400" fontWeight="medium">Produção Média Mensal</Text>
              <Text fontWeight="bold" fontSize="lg">{mediaKwhMes.toFixed(0)} kWh</Text>
            </Flex>
            <Flex justify="space-between" p={3} bg="rgba(51,65,85,0.5)" borderRadius="lg">
              <Text color="gray.400" fontWeight="medium">Horas de Sol Pico Estimadas</Text>
              <Text fontWeight="bold" fontSize="lg">4.5 h</Text>
            </Flex>
          </Stack>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}
