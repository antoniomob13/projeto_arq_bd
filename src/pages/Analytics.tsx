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
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaFilter, FaArrowLeft } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
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
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { getSistemaById, getSistemas } from '../api/sistemas';
import { getLeiturasAgregadas, type DadoAgregado } from '../api/leituras';
import type { Sistema } from '../models/domain';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Formatar data para input date
function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Gerar dados simulados quando não há leituras reais
const gerarDadosSimulados = (capacidadeWp: number): DadoAgregado[] => {
  const horas = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
  const maxGen = capacidadeWp * 0.85;
  
  return horas.map((label, i) => {
    const hour = 6 + i * 2;
    const peakHour = 12;
    const spread = 3.5;
    const geracao = Math.round(maxGen * Math.exp(-Math.pow(hour - peakHour, 2) / (2 * spread * spread)));
    const consumo = Math.round(geracao * (0.3 + Math.random() * 0.4));
    
    return {
      label,
      // Potência (W)
      geracao,
      geracao_max: geracao,
      consumo,
      // Tensão (V)
      geracao_tensao: 220 + Math.random() * 10 - 5,
      consumo_tensao: 220 + Math.random() * 10 - 5,
      // Corrente (A)
      geracao_corrente: geracao > 0 ? geracao / 220 : 0,
      consumo_corrente: consumo / 220,
      // Energia (kWh)
      geracao_energia: geracao * 0.25 / 1000,
      consumo_energia: consumo * 0.25 / 1000,
      // Bateria
      bateria_soc: 50 + Math.random() * 40,
      bateria_tensao: 48 + Math.random() * 4 - 2,
      bateria_corrente: geracao > consumo ? Math.random() * 20 : -Math.random() * 15,
      // Outros
      temperatura: 30 + Math.random() * 15,
      amostras: 1,
    };
  });
};

export default function Analytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAdmin, isCliente } = useAuth();
  const sistemaIdParam = searchParams.get('sistema');
  
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [sistemaAtual, setSistemaAtual] = useState<Sistema | null>(null);
  const [dadosAgregados, setDadosAgregados] = useState<DadoAgregado[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeituras, setLoadingLeituras] = useState(false);
  const [temDadosReais, setTemDadosReais] = useState(false);
  
  // Data inicial padrão: hoje
  const [dataInicial, setDataInicial] = useState(() => formatDateForInput(new Date()));
  const [periodo, setPeriodo] = useState<'diario' | 'semanal' | 'mensal' | 'anual'>('diario');
  const [variavel, setVariavel] = useState('potencia');
  const [tipoGrafico, setTipoGrafico] = useState('linha');
  const [subsistemaSelecionado, setSubsistemaSelecionado] = useState<number | 'todos'>('todos');

  // Carregar lista de sistemas (filtrada por cliente se não for admin)
  useEffect(() => {
    (async () => {
      try {
        const data = await getSistemas();
        
        // Se for cliente, filtrar apenas o sistema relacionado
        if (isCliente && user?.sistema_id) {
          const sistemasFiltrados = data.filter(s => s._id === user.sistema_id);
          setSistemas(sistemasFiltrados);
        } else {
          // Admin vê todos os sistemas
          setSistemas(data);
        }
      } catch (err) {
        console.error('Erro ao carregar sistemas:', err);
      }
    })();
  }, [isCliente, user?.sistema_id]);

  // Carregar sistema selecionado
  useEffect(() => {
    let active = true;
    
    (async () => {
      // Aguardar sistemas carregarem
      if (sistemas.length === 0) {
        return;
      }
      
      setLoading(true);
      try {
        if (sistemaIdParam) {
          // Verificar se o ID existe na lista de sistemas carregados
          const sistemaLocal = sistemas.find(s => s._id === sistemaIdParam);
          if (sistemaLocal) {
            if (active) {
              setSistemaAtual(sistemaLocal);
            }
          } else {
            // ID não existe, usar o primeiro sistema e limpar URL
            if (active) {
              setSistemaAtual(sistemas[0]);
              setSearchParams({});
            }
          }
        } else {
          // Nenhum ID na URL, usar primeiro sistema
          setSistemaAtual(sistemas[0]);
        }
      } catch (err) {
        console.error('Erro ao carregar sistema:', err);
        if (sistemas.length > 0 && active) {
          setSistemaAtual(sistemas[0]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [sistemaIdParam, sistemas, setSearchParams]);

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

  // Função para carregar dados do banco
  const carregarDados = useCallback(async () => {
    if (!sistemaAtual?._id) return;
    
    setLoadingLeituras(true);
    try {
      // Calcular data fim baseada no período
      let dataFim: string | undefined;
      const inicio = new Date(dataInicial);
      
      switch (periodo) {
        case 'semanal':
          const fimSemana = new Date(inicio);
          fimSemana.setDate(fimSemana.getDate() + 6);
          dataFim = formatDateForInput(fimSemana);
          break;
        case 'mensal':
          const fimMes = new Date(inicio);
          fimMes.setMonth(fimMes.getMonth() + 1);
          fimMes.setDate(fimMes.getDate() - 1);
          dataFim = formatDateForInput(fimMes);
          break;
        case 'anual':
          const fimAno = new Date(inicio);
          fimAno.setFullYear(fimAno.getFullYear() + 1);
          fimAno.setDate(fimAno.getDate() - 1);
          dataFim = formatDateForInput(fimAno);
          break;
        default: // diario
          dataFim = dataInicial;
      }
      
      const resultado = await getLeiturasAgregadas(
        sistemaAtual._id,
        dataInicial,
        dataFim,
        periodo,
        subsistemaSelecionado === 'todos' ? undefined : subsistemaSelecionado
      );
      
      if (resultado.dados.length > 0) {
        setDadosAgregados(resultado.dados);
        setTemDadosReais(true);
      } else {
        setDadosAgregados(gerarDadosSimulados(capacidadeWp));
        setTemDadosReais(false);
      }
    } catch (err) {
      console.error('Erro ao carregar leituras:', err);
      setDadosAgregados(gerarDadosSimulados(capacidadeWp));
      setTemDadosReais(false);
    } finally {
      setLoadingLeituras(false);
    }
  }, [sistemaAtual, dataInicial, periodo, capacidadeWp, subsistemaSelecionado]);

  // Carregar dados quando muda sistema ou ao montar
  useEffect(() => {
    if (sistemaAtual) {
      carregarDados();
    }
  }, [sistemaAtual, carregarDados]);

  // Handler para trocar de sistema
  const handleSistemaChange = (id: string) => {
    setSubsistemaSelecionado('todos'); // Reset subsistema ao trocar sistema
    setSearchParams({ sistema: id });
  };

  // Handler para aplicar filtros
  const handleAplicarFiltros = () => {
    carregarDados();
  };

  // Configuração do gráfico baseada na variável selecionada
  const chartConfig = useMemo(() => {
    switch (variavel) {
      case 'potencia':
        return {
          datasets: [
            {
              label: 'Geração (W)',
              dataKey: 'geracao' as const,
              color: 'rgba(45, 212, 191, 1)',
              bgColor: 'rgba(45, 212, 191, 0.15)',
            },
            {
              label: 'Consumo (W)',
              dataKey: 'consumo' as const,
              color: 'rgba(234, 179, 8, 1)',
              bgColor: 'rgba(234, 179, 8, 0.15)',
              dashed: true,
            },
          ],
          yAxisLabel: 'Potência (W)',
          stepSize: 100,
        };
      case 'energia':
        return {
          datasets: [
            {
              label: 'Geração (kWh)',
              dataKey: 'geracao_energia' as const,
              color: 'rgba(45, 212, 191, 1)',
              bgColor: 'rgba(45, 212, 191, 0.15)',
            },
            {
              label: 'Consumo (kWh)',
              dataKey: 'consumo_energia' as const,
              color: 'rgba(234, 179, 8, 1)',
              bgColor: 'rgba(234, 179, 8, 0.15)',
              dashed: true,
            },
          ],
          yAxisLabel: 'Energia (kWh)',
          stepSize: 0.5,
        };
      case 'tensao':
        return {
          datasets: [
            {
              label: 'Tensão Geração (V)',
              dataKey: 'geracao_tensao' as const,
              color: 'rgba(45, 212, 191, 1)',
              bgColor: 'rgba(45, 212, 191, 0.15)',
            },
            {
              label: 'Tensão Consumo (V)',
              dataKey: 'consumo_tensao' as const,
              color: 'rgba(234, 179, 8, 1)',
              bgColor: 'rgba(234, 179, 8, 0.15)',
              dashed: true,
            },
            {
              label: 'Tensão Bateria (V)',
              dataKey: 'bateria_tensao' as const,
              color: 'rgba(168, 85, 247, 1)',
              bgColor: 'rgba(168, 85, 247, 0.15)',
            },
          ],
          yAxisLabel: 'Tensão (V)',
          stepSize: 10,
        };
      case 'corrente':
        return {
          datasets: [
            {
              label: 'Corrente Geração (A)',
              dataKey: 'geracao_corrente' as const,
              color: 'rgba(45, 212, 191, 1)',
              bgColor: 'rgba(45, 212, 191, 0.15)',
            },
            {
              label: 'Corrente Consumo (A)',
              dataKey: 'consumo_corrente' as const,
              color: 'rgba(234, 179, 8, 1)',
              bgColor: 'rgba(234, 179, 8, 0.15)',
              dashed: true,
            },
            {
              label: 'Corrente Bateria (A)',
              dataKey: 'bateria_corrente' as const,
              color: 'rgba(168, 85, 247, 1)',
              bgColor: 'rgba(168, 85, 247, 0.15)',
            },
          ],
          yAxisLabel: 'Corrente (A)',
          stepSize: 5,
        };
      case 'geracao_consumo':
        return {
          datasets: [
            {
              label: 'Geração Fotovoltaica (W)',
              dataKey: 'geracao' as const,
              color: 'rgba(45, 212, 191, 1)',
              bgColor: 'rgba(45, 212, 191, 0.15)',
            },
            {
              label: 'Consumo Médio (W)',
              dataKey: 'consumo' as const,
              color: 'rgba(234, 179, 8, 1)',
              bgColor: 'rgba(234, 179, 8, 0.15)',
              dashed: true,
            },
          ],
          yAxisLabel: 'Potência (W)',
          stepSize: 100,
        };
      case 'bateria':
        return {
          datasets: [
            {
              label: 'Estado de Carga (%)',
              dataKey: 'bateria_soc' as const,
              color: 'rgba(34, 197, 94, 1)',
              bgColor: 'rgba(34, 197, 94, 0.15)',
            },
          ],
          yAxisLabel: 'SOC (%)',
          stepSize: 10,
        };
      case 'temperatura':
        return {
          datasets: [
            {
              label: 'Temperatura (°C)',
              dataKey: 'temperatura' as const,
              color: 'rgba(239, 68, 68, 1)',
              bgColor: 'rgba(239, 68, 68, 0.15)',
            },
          ],
          yAxisLabel: 'Temperatura (°C)',
          stepSize: 5,
        };
      default:
        return {
          datasets: [
            {
              label: 'Geração (W)',
              dataKey: 'geracao' as const,
              color: 'rgba(45, 212, 191, 1)',
              bgColor: 'rgba(45, 212, 191, 0.15)',
            },
          ],
          yAxisLabel: 'Potência (W)',
          stepSize: 100,
        };
    }
  }, [variavel]);

  // Calcular max Y para o gráfico
  const maxY = useMemo(() => {
    const allValues = dadosAgregados.flatMap(d => 
      chartConfig.datasets.map(ds => (d as any)[ds.dataKey] || 0)
    );
    const maxVal = Math.max(...allValues, 10);
    const step = chartConfig.stepSize;
    return Math.ceil(maxVal / step) * step + step;
  }, [dadosAgregados, chartConfig]);

  const chartData = useMemo(() => ({
    labels: dadosAgregados.map(d => d.label),
    datasets: chartConfig.datasets.map((ds, index) => ({
      label: ds.label,
      data: dadosAgregados.map(d => (d as any)[ds.dataKey] || 0),
      borderColor: ds.color,
      backgroundColor: tipoGrafico === 'barra' ? ds.color.replace('1)', '0.7)') : ds.bgColor,
      borderWidth: 2,
      borderDash: ds.dashed && tipoGrafico !== 'barra' ? [5, 5] : [],
      fill: tipoGrafico !== 'barra' && index === 0,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: ds.color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: 6,
    })),
  }), [dadosAgregados, chartConfig, tipoGrafico]);

  const chartOptions = useMemo(() => ({
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
        title: {
          display: true,
          text: chartConfig.yAxisLabel,
          color: '#94a3b8',
          font: { size: 12 },
        },
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          stepSize: chartConfig.stepSize,
        },
        beginAtZero: true,
        max: maxY,
      },
    },
  }), [chartConfig, maxY]);

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
          <FormControl flex="1" minW="180px">
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

          {/* Seletor de Subsistema */}
          <FormControl flex="1" minW="160px">
            <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
              Subsistema
            </FormLabel>
            <Select 
              value={subsistemaSelecionado === 'todos' ? 'todos' : subsistemaSelecionado.toString()} 
              onChange={(e) => {
                const val = e.target.value;
                setSubsistemaSelecionado(val === 'todos' ? 'todos' : parseInt(val, 10));
              }} 
              {...inputStyles}
            >
              <option value="todos">Todos</option>
              {(sistemaAtual?.subsistema || []).map((sub, idx) => (
                <option key={sub._id || idx} value={idx}>
                  {sub.tipo_sistema || `Subsistema ${idx + 1}`}
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
            <Select 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value as 'diario' | 'semanal' | 'mensal' | 'anual')} 
              {...inputStyles}
            >
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
              <option value="geracao_consumo">Geração vs Consumo (W)</option>
              <option value="bateria">Bateria (SOC %)</option>
              <option value="temperatura">Temperatura (°C)</option>
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
            onClick={handleAplicarFiltros}
            isLoading={loadingLeituras}
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
          {tipoGrafico === 'barra' ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </Box>
        {!temDadosReais && !loadingLeituras && (
          <Text color="gray.500" fontSize="sm" textAlign="center" mt={2}>
            * Dados simulados - nenhuma leitura real disponível para esta data/sistema
          </Text>
        )}
        {temDadosReais && !loadingLeituras && (
          <Text color="teal.400" fontSize="sm" textAlign="center" mt={2}>
            ✓ Exibindo {dadosAgregados.reduce((sum, d) => sum + d.amostras, 0).toLocaleString()} amostras do banco de dados
          </Text>
        )}
      </Box>
    </Stack>
  );
}
