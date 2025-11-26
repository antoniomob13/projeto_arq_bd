import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Input,
  Select,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaFilter, FaArrowLeft } from 'react-icons/fa6';
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
import { getSistemaById, getSistemas } from '../api/sistemas';
import { getLeituras, agruparLeiturasPorHora } from '../api/leituras';
import type { Sistema, Leitura } from '../models/domain';

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

// Gerar dados simulados quando não há leituras reais
const gerarDadosSimulados = (capacidadeWp: number) => {
  const horas = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
  const maxGen = capacidadeWp * 0.85;
  
  // Curva de geração solar (pico ao meio-dia)
  const geracao = horas.map((_, i) => {
    const hour = 6 + i * 2;
    const peakHour = 12;
    const spread = 3.5;
    return Math.round(maxGen * Math.exp(-Math.pow(hour - peakHour, 2) / (2 * spread * spread)));
  });
  
  // Curva de consumo (mais variável)
  const consumo = geracao.map(g => Math.round(g * (0.3 + Math.random() * 0.4)));
  
  return { horas, geracao, consumo };
};

export default function Analytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const sistemaIdParam = searchParams.get('sistema');
  
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [sistemaAtual, setSistemaAtual] = useState<Sistema | null>(null);
  const [leituras, setLeituras] = useState<Leitura[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeituras, setLoadingLeituras] = useState(false);
  
  const [dataInicial, setDataInicial] = useState('');
  const [periodo, setPeriodo] = useState('diario');
  const [variavel, setVariavel] = useState('potencia');
  const [tipoGrafico, setTipoGrafico] = useState('linha');

  // Carregar lista de sistemas
  useEffect(() => {
    (async () => {
      try {
        const data = await getSistemas();
        setSistemas(data);
      } catch (err) {
        console.error('Erro ao carregar sistemas:', err);
      }
    })();
  }, []);

  // Carregar sistema selecionado
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        if (sistemaIdParam) {
          const sistema = await getSistemaById(sistemaIdParam);
          if (active) {
            setSistemaAtual(sistema);
          }
        } else if (sistemas.length > 0 && !sistemaAtual) {
          // Se não há sistema na URL, usar o primeiro da lista
          setSistemaAtual(sistemas[0]);
        }
      } catch (err) {
        console.error('Erro ao carregar sistema:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [sistemaIdParam, sistemas]);

  // Carregar leituras do sistema
  useEffect(() => {
    let active = true;
    if (!sistemaAtual) return;
    
    (async () => {
      setLoadingLeituras(true);
      try {
        // Buscar leituras de todos os subsistemas do sistema
        const subsistemaIds = sistemaAtual.subsistema?.map(s => s._id) || [];
        const todasLeituras: Leitura[] = [];
        
        for (const subId of subsistemaIds) {
          const leit = await getLeituras(subId);
          todasLeituras.push(...leit);
        }
        
        if (active) {
          setLeituras(todasLeituras);
        }
      } catch (err) {
        console.error('Erro ao carregar leituras:', err);
      } finally {
        if (active) setLoadingLeituras(false);
      }
    })();
    return () => { active = false; };
  }, [sistemaAtual]);

  // Calcular capacidade do sistema
  const capacidadeWp = useMemo(() => {
    if (!sistemaAtual) return 1000;
    let total = 0;
    for (const sub of sistemaAtual.subsistema || []) {
      for (const painel of sub.componentes?.paineis || []) {
        total += (painel.capacidade_Wp || 0) * (painel.quantidade || 0);
      }
    }
    return total || 1000;
  }, [sistemaAtual]);

  // Processar dados para o gráfico
  const dados = useMemo(() => {
    if (leituras.length > 0) {
      const agrupados = agruparLeiturasPorHora(leituras);
      return {
        horas: agrupados.map(a => a.hora),
        geracao: agrupados.map(a => a.geracao),
        consumo: agrupados.map(a => a.consumo),
      };
    }
    // Se não há leituras, gerar dados simulados
    return gerarDadosSimulados(capacidadeWp);
  }, [leituras, capacidadeWp]);

  // Handler para trocar de sistema
  const handleSistemaChange = (id: string) => {
    setSearchParams({ sistema: id });
  };

  // Calcular max Y para o gráfico
  const maxY = useMemo(() => {
    const maxVal = Math.max(...dados.geracao, ...dados.consumo);
    return Math.ceil(maxVal / 100) * 100 + 100;
  }, [dados]);

  const chartData = {
    labels: dados.horas,
    datasets: [
      {
        label: 'Geração Fotovoltaica (W)',
        data: dados.geracao,
        borderColor: 'rgba(45, 212, 191, 1)',
        backgroundColor: 'rgba(45, 212, 191, 0.15)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(45, 212, 191, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
      {
        label: 'Consumo Médio (W)',
        data: dados.consumo,
        borderColor: 'rgba(234, 179, 8, 1)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(234, 179, 8, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'center' as const,
        labels: {
          color: '#94a3b8',
          usePointStyle: true,
          pointStyle: 'rect',
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(51, 65, 85, 0.5)',
        borderWidth: 1,
        padding: 12,
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
          stepSize: 100,
        },
        beginAtZero: true,
        max: maxY,
      },
    },
  };

  const inputStyles = {
    bg: 'slate.700',
    borderColor: 'whiteAlpha.100',
    borderRadius: 'lg',
    _hover: { borderColor: 'whiteAlpha.200' },
    _focus: { borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' },
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="brand.400" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Stack spacing={8}>
      {/* Header */}
      <Box>
        <Flex align="center" gap={3} mb={2}>
          <IconButton
            aria-label="Voltar"
            icon={<Icon as={FaArrowLeft} />}
            variant="ghost"
            color="gray.400"
            _hover={{ bg: 'slate.700', color: 'brand.400' }}
            borderRadius="lg"
            size="sm"
            onClick={() => navigate(-1)}
          />
          <Heading size="lg" fontWeight="extrabold">
            Análises Detalhadas
          </Heading>
        </Flex>
        <Text color="gray.400" ml={10}>
          Dados históricos para{' '}
          <Text as="span" color="teal.400" fontWeight="medium">
            {sistemaAtual?.nome || 'Sistema não selecionado'}
          </Text>
          .
        </Text>
      </Box>

      {/* Filtros */}
      <Box bg="slate.800" borderRadius="2xl" borderWidth="1px" borderColor="whiteAlpha.100" p={6}>
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          gap={4} 
          align={{ base: 'stretch', lg: 'flex-end' }}
          wrap="wrap"
        >
          {/* Seletor de Sistema */}
          <FormControl flex="1" minW="200px">
            <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
              Sistema
            </FormLabel>
            <Select 
              value={sistemaAtual?._id || ''} 
              onChange={(e) => handleSistemaChange(e.target.value)} 
              {...inputStyles}
            >
              {sistemas.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.nome}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl flex="1">
            <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
              Data Inicial
            </FormLabel>
            <Input
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              placeholder="dd/mm/aaaa"
              {...inputStyles}
            />
          </FormControl>

          <FormControl flex="1">
            <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
              Período
            </FormLabel>
            <Select value={periodo} onChange={(e) => setPeriodo(e.target.value)} {...inputStyles}>
              <option value="diario">Diário</option>
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
            </Select>
          </FormControl>

          <FormControl flex="1">
            <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
              Variável Principal
            </FormLabel>
            <Select value={variavel} onChange={(e) => setVariavel(e.target.value)} {...inputStyles}>
              <option value="potencia">Potência (W)</option>
              <option value="energia">Energia (kWh)</option>
              <option value="tensao">Tensão (V)</option>
              <option value="corrente">Corrente (A)</option>
            </Select>
          </FormControl>

          <FormControl flex="1">
            <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
              Tipo de Gráfico
            </FormLabel>
            <Select value={tipoGrafico} onChange={(e) => setTipoGrafico(e.target.value)} {...inputStyles}>
              <option value="linha">Linha Suave</option>
              <option value="barra">Barras</option>
              <option value="area">Área</option>
            </Select>
          </FormControl>

          <Button
            leftIcon={<Icon as={FaFilter} />}
            bg="blue.600"
            color="white"
            _hover={{ bg: 'blue.500' }}
            borderRadius="xl"
            px={6}
            h="42px"
            fontWeight="bold"
            boxShadow="lg"
          >
            Aplicar Filtros
          </Button>
        </Flex>
      </Box>

      {/* Gráfico Principal */}
      <Box 
        bg="slate.800" 
        borderRadius="2xl" 
        borderWidth="1px" 
        borderColor="whiteAlpha.100" 
        p={6}
        position="relative"
      >
        {loadingLeituras && (
          <Flex 
            position="absolute" 
            top={0} 
            left={0} 
            right={0} 
            bottom={0} 
            bg="blackAlpha.600" 
            justify="center" 
            align="center"
            borderRadius="2xl"
            zIndex={10}
          >
            <Spinner size="xl" color="brand.400" thickness="4px" />
          </Flex>
        )}
        <Box h="450px">
          <Line data={chartData} options={chartOptions} />
        </Box>
        {leituras.length === 0 && !loadingLeituras && (
          <Text color="gray.500" fontSize="sm" textAlign="center" mt={2}>
            * Dados simulados - nenhuma leitura real disponível para este sistema
          </Text>
        )}
      </Box>
    </Stack>
  );
}
