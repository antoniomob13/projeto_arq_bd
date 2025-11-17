import { Box, Button, Flex, SimpleGrid, Table, Tbody, Td, Th, Thead, Tr, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { historyStore, type HistoryEntry } from '../services/historyStore';

export default function Historico() {
  const [items, setItems] = useState<HistoryEntry[]>(historyStore.all());

  useEffect(() => {
    const onUpd = () => setItems(historyStore.all());
    window.addEventListener('history-updated', onUpd);
    return () => window.removeEventListener('history-updated', onUpd);
  }, []);

  const grouped = useMemo(() => {
    const clientes = items.filter((item) => item.category === 'cliente');
    const sistemas = items.filter((item) => item.category === 'sistema');
    const outros = items.filter((item) => item.category !== 'cliente' && item.category !== 'sistema');
    return { clientes, sistemas, outros };
  }, [items]);

  return (
    <Box p={4}>
      <Flex align="center" justify="space-between" mb={3}>
        <Text fontSize="2xl" fontWeight="semibold">Histórico</Text>
        <Button size="sm" variant="outline" onClick={() => historyStore.clear()}>Limpar histórico</Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, xl: 2 }} gap={6} mb={6}>
        <HistorySection title="Inserções de clientes" entries={grouped.clientes} empty="Nenhum cliente registrado." />
        <HistorySection title="Inserções de sistemas" entries={grouped.sistemas} empty="Nenhum sistema registrado." />
      </SimpleGrid>

      <HistorySection title="Outros eventos" entries={grouped.outros} empty="Sem eventos adicionais." />
    </Box>
  );
}

function HistorySection({ title, entries, empty }: { title: string; entries: HistoryEntry[]; empty: string }) {
  return (
    <Box bg="gray.800" borderWidth="1px" borderColor="gray.700" borderRadius="md" overflowX="auto" p={2}>
      <Text fontSize="lg" fontWeight="semibold" px={2} py={1}>{title}</Text>
      <Box>
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>Data</Th>
              <Th>Ação</Th>
              <Th>Entidade</Th>
              <Th>Inserido por</Th>
            </Tr>
          </Thead>
          <Tbody>
            {entries.length === 0 ? (
              <Tr>
                <Td colSpan={4}><Text color="gray.400">{empty}</Text></Td>
              </Tr>
            ) : (
              entries.map((e) => (
                <Tr key={e.id}>
                  <Td>{new Date(e.timestamp).toLocaleString('pt-BR')}</Td>
                  <Td textTransform="capitalize">{e.action}</Td>
                  <Td>{e.entity ?? '-'}</Td>
                  <Td>{e.user}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
