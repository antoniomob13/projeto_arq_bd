import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from '@chakra-ui/react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiUsers } from 'react-icons/fi';

// Mock data matching teste.html usuarios
const mockClientes = [
  {
    id: 'user1',
    nome: 'João Silva',
    email: 'joao@ufopa.br',
    tipo: 'cliente',
    sistema_id: 'sys1',
    sistema_nome: 'Unidade Tapajós 01',
    status: 'ativo',
    criado_em: '2024-01-15',
  },
  {
    id: 'user2',
    nome: 'Maria Santos',
    email: 'maria@prefeitura.gov.br',
    tipo: 'cliente',
    sistema_id: 'sys3',
    sistema_nome: 'Unidade Oriximiná 03',
    status: 'ativo',
    criado_em: '2024-02-20',
  },
  {
    id: 'user3',
    nome: 'Pedro Costa',
    email: 'pedro@comunidade.org',
    tipo: 'cliente',
    sistema_id: 'sys4',
    sistema_nome: 'Unidade Belterra 04',
    status: 'inativo',
    criado_em: '2024-03-10',
  },
  {
    id: 'admin1',
    nome: 'Admin LABER',
    email: 'admin@ufopa.br',
    tipo: 'admin',
    sistema_id: null,
    sistema_nome: null,
    status: 'ativo',
    criado_em: '2024-01-01',
  },
];

type MockCliente = (typeof mockClientes)[number];

export default function Historico() {
  const [clientes] = useState<MockCliente[]>(mockClientes);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClientes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clientes;
    return clientes.filter((cliente) => {
      const haystack = [cliente.nome, cliente.email, cliente.tipo, cliente.sistema_nome]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [clientes, searchTerm]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
  };

  const handleAction = (action: string) => {
    console.log(action);
  };

  return (
    <Stack spacing={8}>
      {/* Header */}
      <Flex
        direction={{ base: 'column', xl: 'row' }}
        justify="space-between"
        gap={6}
        align={{ base: 'flex-start', xl: 'center' }}
      >
        <Stack spacing={1}>
          <HStack spacing={2} color="teal.400" mb={1}>
            <Icon as={FiUsers} />
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" fontWeight="bold">
              Administração
            </Text>
          </HStack>
          <Heading size="lg" fontWeight="extrabold">
            Gestão de Clientes
          </Heading>
          <Text color="gray.400" maxW="3xl">
            Gerencie os usuários e clientes com acesso à plataforma.
          </Text>
        </Stack>

        <Button
          leftIcon={<FiPlus />}
          px={6}
          h={12}
          fontWeight="bold"
          bg="teal.500"
          color="white"
          _hover={{ bg: 'teal.400' }}
          borderRadius="xl"
          onClick={() => handleAction('Novo Cliente')}
        >
          Novo Cliente
        </Button>
      </Flex>

      {/* Search Bar */}
      <Box
        as="form"
        onSubmit={handleSearch}
        bg="slate.800"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="whiteAlpha.100"
        px={{ base: 4, md: 6 }}
        py={5}
      >
        <Flex gap={4} direction={{ base: 'column', md: 'row' }} align="stretch">
          <InputGroup flex="1">
            <InputLeftElement pointerEvents="none" h="full">
              <Icon as={FiSearch} color="gray.500" />
            </InputLeftElement>
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nome, email ou sistema..."
              height={12}
              borderRadius="xl"
              bg="slate.700"
              borderColor="whiteAlpha.100"
              _hover={{ borderColor: 'whiteAlpha.200' }}
              _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' }}
            />
          </InputGroup>
          <Button
            type="submit"
            bg="teal.500"
            _hover={{ bg: 'teal.400' }}
            px={8}
            h={12}
            fontWeight="bold"
            borderRadius="xl"
          >
            Buscar
          </Button>
        </Flex>
        <Text mt={3} fontSize="sm" color="gray.500">
          Exibindo {filteredClientes.length} de {clientes.length} usuários
        </Text>
      </Box>

      {/* Clients Table */}
      <Box bg="slate.800" borderRadius="2xl" borderWidth="1px" borderColor="whiteAlpha.100" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg="slate.700">
              <Tr>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4}>
                  Nome
                </Th>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4}>
                  Email
                </Th>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4}>
                  Tipo
                </Th>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4}>
                  Sistema Vinculado
                </Th>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4}>
                  Status
                </Th>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4} textAlign="right">
                  Ações
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredClientes.map((cliente) => (
                <Tr key={cliente.id} _hover={{ bg: 'whiteAlpha.50' }}>
                  <Td borderColor="whiteAlpha.100" fontWeight="medium">
                    {cliente.nome}
                  </Td>
                  <Td borderColor="whiteAlpha.100" color="gray.400">
                    {cliente.email}
                  </Td>
                  <Td borderColor="whiteAlpha.100">
                    <Badge
                      px={2}
                      py={1}
                      borderRadius="md"
                      bg={cliente.tipo === 'admin' ? 'purple.500/20' : 'blue.500/20'}
                      color={cliente.tipo === 'admin' ? 'purple.300' : 'blue.300'}
                      fontSize="xs"
                      textTransform="capitalize"
                    >
                      {cliente.tipo === 'admin' ? 'Administrador' : 'Cliente'}
                    </Badge>
                  </Td>
                  <Td borderColor="whiteAlpha.100" color="gray.400">
                    {cliente.sistema_nome ?? '—'}
                  </Td>
                  <Td borderColor="whiteAlpha.100">
                    <Badge
                      px={2}
                      py={1}
                      borderRadius="md"
                      bg={cliente.status === 'ativo' ? 'green.500/20' : 'gray.500/20'}
                      color={cliente.status === 'ativo' ? 'green.300' : 'gray.400'}
                      fontSize="xs"
                      textTransform="capitalize"
                    >
                      {cliente.status}
                    </Badge>
                  </Td>
                  <Td borderColor="whiteAlpha.100" textAlign="right">
                    <HStack spacing={2} justify="flex-end">
                      <Tooltip label="Editar">
                        <IconButton
                          aria-label="editar"
                          icon={<FiEdit2 />}
                          size="sm"
                          variant="ghost"
                          color="yellow.300"
                          bg="rgba(234,179,8,0.15)"
                          _hover={{ bg: 'rgba(234,179,8,0.25)' }}
                          onClick={() => handleAction('Editar ' + cliente.nome)}
                        />
                      </Tooltip>
                      <Tooltip label="Excluir">
                        <IconButton
                          aria-label="excluir"
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          color="red.300"
                          bg="rgba(248,113,113,0.15)"
                          _hover={{ bg: 'rgba(248,113,113,0.25)' }}
                          onClick={() => handleAction('Excluir ' + cliente.nome)}
                        />
                      </Tooltip>
                    </HStack>
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
