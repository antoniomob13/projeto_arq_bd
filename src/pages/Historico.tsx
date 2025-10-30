import { Box, Button, Flex, Table, Tbody, Td, Th, Thead, Tr, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { historyStore, type HistoryEntry } from '../services/historyStore';

export default function Historico() {
  const [items, setItems] = useState<HistoryEntry[]>(historyStore.all());

  useEffect(() => {
    const onUpd = () => setItems(historyStore.all());
    window.addEventListener('history-updated', onUpd as EventListener);
    return () => window.removeEventListener('history-updated', onUpd as EventListener);
  }, []);

  return (
    <Box p={4}>
      <Flex align="center" justify="space-between" mb={3}>
        <Text fontSize="2xl" fontWeight="semibold">Histórico</Text>
        <Button size="sm" variant="outline" onClick={() => historyStore.clear()}>Limpar histórico</Button>
      </Flex>

      <Box bg="gray.800" borderWidth="1px" borderColor="gray.700" borderRadius="md" overflowX="auto">
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
            {items.length === 0 ? (
              <Tr>
                <Td colSpan={4}><Text color="gray.400">Sem eventos registrados.</Text></Td>
              </Tr>
            ) : (
              items.map((e) => (
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
