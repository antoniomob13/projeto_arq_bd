import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
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
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaBolt, FaBatteryFull, FaArrowLeft, FaTriangleExclamation, FaMicrochip } from 'react-icons/fa6';
import { getSistemaById } from '../api/sistemas';
import type { Sistema } from '../models/domain';
import { useAuth } from '../context/AuthContext';

export default function Equipments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  // Usa o sistema da URL ou o sistema do cliente logado
  const sistemaIdFromUrl = searchParams.get('sistema');
  const sistemaId = sistemaIdFromUrl || user?.sistema_id;
  
  const [sistema, setSistema] = useState<Sistema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sistemaId) {
      setError('Nenhum sistema associado à sua conta.');
      setLoading(false);
      return;
    }

    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getSistemaById(sistemaId);
        if (active) {
          setSistema(data);
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

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="brand.400" thickness="4px" />
      </Flex>
    );
  }

  if (error || !sistema) {
    return (
      <Box bg="slate.800" p={8} borderRadius="2xl" borderWidth="1px" borderColor="slate.700" maxW="600px" mx="auto" mt={10}>
        <Flex align="center" gap={3} mb={4}>
          <Icon as={FaTriangleExclamation} color="yellow.400" boxSize={6} />
          <Heading size="md" color="gray.200">Sistema não disponível</Heading>
        </Flex>
        <Text color="gray.400" mb={4}>
          {error || 'Não foi possível carregar os dados do sistema.'}
        </Text>
        <Button
          variant="ghost"
          leftIcon={<Icon as={FaArrowLeft} />}
          color="gray.400"
          _hover={{ color: 'gray.200', bg: 'slate.700' }}
          onClick={() => navigate(isAdmin ? '/sistemas' : '/dashboard')}
        >
          {isAdmin ? 'Voltar para Sistemas' : 'Voltar para Dashboard'}
        </Button>
      </Box>
    );
  }

  // Extrair equipamentos dos subsistemas
  const paineis: { componente: string; marca: string; modelo: string; potencia: number; quantidade: number }[] = [];
  const baterias: { componente: string; marca: string; modelo: string; capacidade: number; quantidade: number }[] = [];
  const controladores: { componente: string; marca: string; modelo: string; quantidade: number }[] = [];
  const inversores: { componente: string; marca: string; modelo: string; quantidade: number }[] = [];

  sistema.subsistema?.forEach((sub) => {
    // Painéis
    sub.componentes?.paineis?.forEach((painel) => {
      paineis.push({
        componente: 'Painel Solar',
        marca: painel.marca || 'N/A',
        modelo: painel.modelo || 'N/A',
        potencia: painel.capacidade_Wp || 0,
        quantidade: painel.quantidade || 1,
      });
    });

    // Baterias
    sub.componentes?.baterias?.forEach((bateria) => {
      baterias.push({
        componente: 'Bateria',
        marca: bateria.marca || 'N/A',
        modelo: bateria.modelo || 'N/A',
        capacidade: bateria.capacidade_kWh || 0,
        quantidade: bateria.quantidade || 1,
      });
    });

    // Controladores
    sub.componentes?.controladores?.forEach((controlador) => {
      controladores.push({
        componente: 'Controlador',
        marca: controlador.marca || 'N/A',
        modelo: controlador.modelo || 'N/A',
        quantidade: 1,
      });
    });

    // Inversores
    sub.componentes?.inversores?.forEach((inversor) => {
      inversores.push({
        componente: 'Inversor',
        marca: inversor.marca || 'N/A',
        modelo: inversor.modelo || 'N/A',
        quantidade: 1,
      });
    });
  });

  return (
    <Stack spacing={8}>
      {/* Header */}
      <Box>
        {(isAdmin || sistemaIdFromUrl) && (
          <Button
            variant="ghost"
            leftIcon={<Icon as={FaArrowLeft} />}
            color="gray.400"
            mb={3}
            _hover={{ color: 'gray.200', bg: 'slate.700' }}
            onClick={() => navigate(isAdmin ? '/sistemas' : '/dashboard')}
          >
            {isAdmin ? 'Voltar para Sistemas' : 'Voltar para Dashboard'}
          </Button>
        )}
        <Heading size="lg" fontWeight="extrabold" mb={2}>
          Inventário de Componentes
        </Heading>
        <Text color="gray.400">
          Lista detalhada de todos os equipamentos do sistema{' '}
          <Text as="span" color="teal.400" fontWeight="medium">
            {sistema.nome}
          </Text>
          .
        </Text>
      </Box>

      {/* Geração PV - Painéis */}
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
            {paineis.length} tipo(s)
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
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4}>
                  Potência
                </Th>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4} textAlign="right">
                  Quantidade
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {paineis.length === 0 ? (
                <Tr>
                  <Td colSpan={5} borderColor="whiteAlpha.100" textAlign="center" color="gray.500" py={8}>
                    Nenhum painel cadastrado
                  </Td>
                </Tr>
              ) : (
                paineis.map((item, idx) => (
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
                    <Td borderColor="whiteAlpha.100" color="yellow.300">
                      {item.potencia} Wp
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
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Armazenamento - Baterias */}
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
            bg="green.500/20"
            color="green.300"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
          >
            {baterias.length} bateria(s)
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
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4}>
                  Capacidade
                </Th>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4} textAlign="right">
                  Quantidade
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {baterias.length === 0 ? (
                <Tr>
                  <Td colSpan={5} borderColor="whiteAlpha.100" textAlign="center" color="gray.500" py={8}>
                    Nenhuma bateria cadastrada
                  </Td>
                </Tr>
              ) : (
                baterias.map((item, idx) => (
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
                    <Td borderColor="whiteAlpha.100" color="green.300">
                      {item.capacidade} Ah
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
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Controladores */}
      <Box bg="slate.800" borderRadius="2xl" borderWidth="1px" borderColor="whiteAlpha.100" overflow="hidden">
        <HStack px={6} py={4} justify="space-between" borderBottomWidth="1px" borderColor="whiteAlpha.100">
          <HStack spacing={3}>
            <Icon as={FaMicrochip} color="purple.400" boxSize={5} />
            <Heading size="md" fontWeight="bold">
              Controladores
            </Heading>
          </HStack>
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            bg="purple.500/20"
            color="purple.300"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
          >
            {controladores.length} unidade(s)
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
              {controladores.length === 0 ? (
                <Tr>
                  <Td colSpan={4} borderColor="whiteAlpha.100" textAlign="center" color="gray.500" py={8}>
                    Nenhum controlador cadastrado
                  </Td>
                </Tr>
              ) : (
                controladores.map((item, idx) => (
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
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Inversores */}
      <Box bg="slate.800" borderRadius="2xl" borderWidth="1px" borderColor="whiteAlpha.100" overflow="hidden">
        <HStack px={6} py={4} justify="space-between" borderBottomWidth="1px" borderColor="whiteAlpha.100">
          <HStack spacing={3}>
            <Icon as={FaBolt} color="orange.400" boxSize={5} />
            <Heading size="md" fontWeight="bold">
              Inversores
            </Heading>
          </HStack>
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            bg="orange.500/20"
            color="orange.300"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
          >
            {inversores.length} unidade(s)
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
              {inversores.length === 0 ? (
                <Tr>
                  <Td colSpan={4} borderColor="whiteAlpha.100" textAlign="center" color="gray.500" py={8}>
                    Nenhum inversor cadastrado
                  </Td>
                </Tr>
              ) : (
                inversores.map((item, idx) => (
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
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Stack>
  );
}
