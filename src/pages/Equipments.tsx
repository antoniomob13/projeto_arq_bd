import {
  Badge,
  Box,
  Heading,
  HStack,
  Icon,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { FaBolt, FaBatteryFull } from 'react-icons/fa6';

// Mock data - componentes do sistema do cliente
const sistemaCliente = {
  nome: 'Unidade Tapajós 01',
  geracaoPV: [
    { componente: 'Painel', marca: 'Canadian', modelo: '550W', quantidade: 2 },
  ],
  armazenamento: [
    { componente: 'Bateria', marca: 'Moura', modelo: '150Ah', quantidade: 2 },
    { componente: 'Controlador', marca: 'Victron', modelo: 'MPPT', quantidade: 1 },
  ],
};

export default function Equipments() {
  return (
    <Stack spacing={8}>
      {/* Header */}
      <Box>
        <Heading size="lg" fontWeight="extrabold" mb={2}>
          Inventário de Componentes
        </Heading>
        <Text color="gray.400">
          Lista detalhada de todos os equipamentos do sistema{' '}
          <Text as="span" color="teal.400" fontWeight="medium">
            {sistemaCliente.nome}
          </Text>
          .
        </Text>
      </Box>

      {/* Geração PV */}
      <Box bg="slate.800" borderRadius="2xl" borderWidth="1px" borderColor="whiteAlpha.100" overflow="hidden">
        <HStack px={6} py={4} justify="space-between" borderBottomWidth="1px" borderColor="whiteAlpha.100">
          <HStack spacing={3}>
            <Icon as={FaBolt} color="yellow.400" boxSize={5} />
            <Heading size="md" fontWeight="bold">
              Geração PV
            </Heading>
          </HStack>
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            bg="yellow.500/20"
            color="yellow.300"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
          >
            Geração
          </Badge>
        </HStack>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg="slate.700">
              <Tr>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4}>
                  Componente
                </Th>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4}>
                  Marca
                </Th>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4}>
                  Modelo
                </Th>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4} textAlign="right">
                  Quantidade
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {sistemaCliente.geracaoPV.map((item, idx) => (
                <Tr key={idx} _hover={{ bg: 'whiteAlpha.50' }}>
                  <Td borderColor="whiteAlpha.100" fontWeight="medium">
                    {item.componente}
                  </Td>
                  <Td borderColor="whiteAlpha.100" color="gray.400">
                    {item.marca}
                  </Td>
                  <Td borderColor="whiteAlpha.100" color="gray.400">
                    {item.modelo}
                  </Td>
                  <Td borderColor="whiteAlpha.100" textAlign="right">
                    <Badge
                      px={3}
                      py={1}
                      borderRadius="md"
                      bg="teal.500/20"
                      color="teal.300"
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {item.quantidade}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Armazenamento */}
      <Box bg="slate.800" borderRadius="2xl" borderWidth="1px" borderColor="whiteAlpha.100" overflow="hidden">
        <HStack px={6} py={4} justify="space-between" borderBottomWidth="1px" borderColor="whiteAlpha.100">
          <HStack spacing={3}>
            <Icon as={FaBatteryFull} color="green.400" boxSize={5} />
            <Heading size="md" fontWeight="bold">
              Armazenamento
            </Heading>
          </HStack>
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            bg="teal.500/20"
            color="teal.300"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
          >
            Bateria
          </Badge>
        </HStack>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg="slate.700">
              <Tr>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4}>
                  Componente
                </Th>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4}>
                  Marca
                </Th>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4}>
                  Modelo
                </Th>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4} textAlign="right">
                  Quantidade
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {sistemaCliente.armazenamento.map((item, idx) => (
                <Tr key={idx} _hover={{ bg: 'whiteAlpha.50' }}>
                  <Td borderColor="whiteAlpha.100" fontWeight="medium">
                    {item.componente}
                  </Td>
                  <Td borderColor="whiteAlpha.100" color="gray.400">
                    {item.marca}
                  </Td>
                  <Td borderColor="whiteAlpha.100" color="gray.400">
                    {item.modelo}
                  </Td>
                  <Td borderColor="whiteAlpha.100" textAlign="right">
                    <Badge
                      px={3}
                      py={1}
                      borderRadius="md"
                      bg="teal.500/20"
                      color="teal.300"
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {item.quantidade}
                    </Badge>
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
