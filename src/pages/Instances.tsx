import { Box, Button, ButtonGroup, Flex, Input, SimpleGrid, Spinner, Table, Tbody, Td, Th, Thead, Tr, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import ChartPlaceholder from '../components/ChartPlaceholder';
import { apiGet } from '../api/client';
import type { Cliente, Sistema } from '../models/domain';

type ViewMode = 'clientes' | 'sistemas';

export default function Instances() {
  const [view, setView] = useState<ViewMode>('clientes');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (view === 'clientes') {
          const data = await apiGet<Cliente[]>('/clientes');
          if (!active) return;
          setClientes(data);
        } else {
          const data = await apiGet<Sistema[]>('/sistemas');
          if (!active) return;
          setSistemas(data);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [view, refreshTick]);

  useEffect(() => {
    if (view !== 'sistemas') {
      setSelectedSystemId(null);
      return;
    }
    if (sistemas.length === 0) {
      setSelectedSystemId(null);
      return;
    }
    setSelectedSystemId((prev) => {
      if (prev && sistemas.some((s) => s._id === prev)) {
        return prev;
      }
      return sistemas[0]._id;
    });
  }, [view, sistemas]);

  const selectedSystem = useMemo(() => {
    if (!selectedSystemId) return undefined;
    return sistemas.find((s) => s._id === selectedSystemId);
  }, [sistemas, selectedSystemId]);

  const stats = useMemo(() => {
    if (view === 'sistemas' && selectedSystem) {
      const metrics = computeSystemMetrics(selectedSystem);
      return [
        { label: 'Potência atual (kW)', value: metrics.potenciaAtualKw },
        { label: 'Energia do dia (kWh)', value: metrics.energiaDiaKWh },
        { label: 'Alertas ativos', value: metrics.alertasAtivos },
      ];
    }
    return [
      { label: 'Potência atual (kW)', value: 'Selecione um sistema' },
      { label: 'Energia do dia (kWh)', value: '-' },
      { label: 'Alertas ativos', value: '-' },
    ];
  }, [view, selectedSystem]);

  const { columns, rows, emptyMessage } = useMemo(() => {
    if (view === 'clientes') {
      return {
        columns: ['Nome', 'CPF/CNPJ', 'Tipo', 'Cidade/UF', 'Contato', 'Sistemas'],
        rows: clientes.map((cliente) => ({
          id: cliente._id,
          cells: [
            cliente.nome,
            cliente.cpf_cnpj,
            cliente.tipo_pessoa === 'J' ? 'Jurídica' : 'Física',
            `${cliente.endereco?.cidade ?? '-'} / ${cliente.endereco?.estado ?? ''}`,
            cliente.email || cliente.telefone || '-',
            (cliente.sistemas?.length ?? 0).toString(),
          ],
        })),
        emptyMessage: 'Nenhum cliente cadastrado.',
      };
    }

    return {
      columns: ['Sistema', 'Cliente ID', 'Tipo', 'Localização', 'Instalação', 'Painéis', 'Baterias'],
      rows: sistemas.map((sistema) => {
        const sub = sistema.subsistema?.[0];
        const comp = sub?.componentes;
        const totalPaineis = comp?.paineis?.reduce((sum, p) => sum + (p.quantidade ?? 0), 0) ?? 0;
        const totalBaterias = comp?.baterias?.reduce((sum, b) => sum + (b.quantidade ?? 0), 0) ?? 0;
        return {
          id: sistema._id,
          cells: [
            sistema.nome,
            sistema.id_cliente,
            sub?.tipo_sistema ?? '-',
            [sistema.localizacao?.rua, sistema.localizacao?.bairro].filter(Boolean).join(', ') || '-',
            sub?.data_instalacao ? new Date(sub.data_instalacao).toLocaleDateString('pt-BR') : '-',
            totalPaineis.toString(),
            totalBaterias.toString(),
          ],
        };
      }),
      emptyMessage: 'Nenhum sistema cadastrado.',
    };
  }, [view, clientes, sistemas]);

  const handleRefresh = () => setRefreshTick((tick) => tick + 1);

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4} fontWeight="semibold">Usinas / Visualização</Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
        {stats.map((stat) => (
          <StatsCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </SimpleGrid>

      <Flex mb={3} gap={3} align={{ base: 'stretch', md: 'center' }} direction={{ base: 'column', md: 'row' }}>
        <Input placeholder="Pesquisar (em breve)" maxW="400px" isDisabled />
        <Flex align="center" gap={2}>
          <ButtonGroup size="sm" variant="outline">
            <Button onClick={() => setView('clientes')} isActive={view === 'clientes'}>Clientes</Button>
            <Button onClick={() => setView('sistemas')} isActive={view === 'sistemas'}>Sistemas</Button>
          </ButtonGroup>
          <Button size="sm" onClick={handleRefresh}>Atualizar</Button>
        </Flex>
      </Flex>

      <Box mb={4}>
        <ChartPlaceholder title="Visualização gráfica" />
      </Box>

      <Box bg="gray.800" borderWidth="1px" borderColor="gray.700" borderRadius="md" overflowX="auto">
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              {columns.map((col) => <Th key={col}>{col}</Th>)}
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={columns.length}>
                  <Flex align="center" justify="center" py={6} gap={2}>
                    <Spinner size="sm" />
                    <Text>Carregando...</Text>
                  </Flex>
                </Td>
              </Tr>
            ) : error ? (
              <Tr>
                <Td colSpan={columns.length}>
                  <Text color="red.300">{error}</Text>
                </Td>
              </Tr>
            ) : rows.length === 0 ? (
              <Tr>
                <Td colSpan={columns.length}>
                  <Text color="gray.400">{emptyMessage}</Text>
                </Td>
              </Tr>
            ) : (
              rows.map((row) => (
                <Tr
                  key={row.id}
                  onClick={() => view === 'sistemas' && setSelectedSystemId(row.id)}
                  cursor={view === 'sistemas' ? 'pointer' : 'default'}
                  bg={view === 'sistemas' && row.id === selectedSystemId ? 'gray.700' : undefined}
                >
                  {row.cells.map((cell, idx) => (
                    <Td key={`${row.id}-${idx}`}>{cell}</Td>
                  ))}
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
      {/* Botão Adicionar e modal foram movidos para a página de Dados */}
    </Box>
  );
}

function StatsCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Box bg="gray.800" borderWidth="1px" borderColor="gray.700" p={4} borderRadius="md">
      <Text fontSize="sm" color="gray.300">{label}</Text>
      <Text fontSize="2xl" fontWeight="bold" mt={2}>{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</Text>
    </Box>
  );
}

function computeSystemMetrics(sistema: Sistema) {
  const sub = sistema.subsistema?.[0];
  const comp = sub?.componentes;
  const totalWp = comp?.paineis?.reduce((sum, p) => sum + (p.capacidade_Wp ?? 0) * (p.quantidade ?? 0), 0) ?? 0;
  const potenciaNominalKw = totalWp / 1000;
  const potenciaAtualKw = potenciaNominalKw * 0.82;
  const energiaDiaKWh = potenciaAtualKw * 4;
  const alertasAtivos = (comp?.baterias?.length ?? 0) === 0 ? 1 : 0;
  const format = (value: number) => (Number.isFinite(value) && value > 0 ? Number(value.toFixed(2)).toLocaleString('pt-BR') : '-');
  return {
    potenciaAtualKw: format(potenciaAtualKw),
    energiaDiaKWh: format(energiaDiaKWh),
    alertasAtivos,
  };
}

