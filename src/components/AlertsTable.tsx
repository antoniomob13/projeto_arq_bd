import { Badge, Box, Table, Tbody, Td, Th, Thead, Tr, useColorModeValue } from '@chakra-ui/react';

export type Alert = {
  id: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
};

function severityColor(sev: Alert['severity']) {
  switch (sev) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    default:
      return 'yellow';
  }
}

export default function AlertsTable({ alerts }: { alerts: Alert[] }) {
  const bg = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={bg} p={4} borderRadius="md" boxShadow="sm">
      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>Hora</Th>
            <Th>Severidade</Th>
            <Th>Mensagem</Th>
          </Tr>
        </Thead>
        <Tbody>
          {alerts.length === 0 ? (
            <Tr>
              <Td colSpan={3} textAlign="center" opacity={0.6}>Sem alertas</Td>
            </Tr>
          ) : (
            alerts.map((a) => (
              <Tr key={a.id}>
                <Td>{new Date(a.timestamp).toLocaleTimeString()}</Td>
                <Td><Badge colorScheme={severityColor(a.severity)} textTransform="capitalize">{a.severity}</Badge></Td>
                <Td>{a.message}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
}
