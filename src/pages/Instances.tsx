import { Box, Flex, Input, SimpleGrid, Table, Tbody, Td, Th, Thead, Tr, Text } from '@chakra-ui/react';
import ChartPlaceholder from '../components/ChartPlaceholder';
 

export default function Instances() {

  return (
    <Box p={4}>
  <Text fontSize="2xl" mb={4} fontWeight="semibold">Usinas / Visualização</Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
        <PlaceholderCard label="Potência atual (kW)" />
        <PlaceholderCard label="Energia do dia (kWh)" />
        <PlaceholderCard label="Alertas ativos" />
      </SimpleGrid>

      <Flex mb={3} gap={3}>
        <Input placeholder="Pesquisar" maxW="400px" />
      </Flex>

      <Box mb={4}>
        <ChartPlaceholder title="Visualização gráfica" />
      </Box>

      <Box bg="gray.800" borderWidth="1px" borderColor="gray.700" borderRadius="md" overflowX="auto">
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th></Th>
              <Th>Usina</Th>
              <Th>Inversor</Th>
              <Th>Modelo</Th>
              <Th>Strings</Th>
              <Th>Pot. Nominal</Th>
              <Th>Pot. Atual</Th>
              <Th>Irradiância</Th>
              <Th>Temp. Módulo</Th>
              <Th>PR</Th>
              <Th>Último envio</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td colSpan={12}>
                <Text color="gray.400">Sem dados — apenas layout por enquanto.</Text>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
      {/* Botão Adicionar e modal foram movidos para a página de Dados */}
    </Box>
  );
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <Box bg="gray.800" borderWidth="1px" borderColor="gray.700" p={4} borderRadius="md">
      <Text fontSize="sm" color="gray.300">{label}</Text>
      <Box h="20px" w="120px" bg="gray.700" mt={2} borderRadius="sm" />
    </Box>
  );
}
