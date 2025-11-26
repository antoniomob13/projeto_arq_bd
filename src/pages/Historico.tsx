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
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { 
  FaPenToSquare, 
  FaEnvelope, 
  FaMapPin, 
  FaPhone, 
  FaPlus, 
  FaMagnifyingGlass, 
  FaTrashCan, 
  FaUsersGear,
  FaUserPlus
} from 'react-icons/fa6';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../api/clientes';
import type { Cliente } from '../models/domain';
import ClienteFormModal, { type ClienteFormData, type Endereco } from '../components/ClienteFormModal';

// Tipo para display na tabela
type ClienteDisplay = Cliente & {
  status: 'ativo' | 'inativo';
  criado_em: string;
};

export default function Historico() {
  const [clientes, setClientes] = useState<ClienteDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCliente, setEditingCliente] = useState<ClienteDisplay | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Carrega clientes da API
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getClientes();
        if (active) {
          // Mapeia para display
          const clientesDisplay: ClienteDisplay[] = data.map((c: Cliente) => ({
            ...c,
            status: c.ativo !== false ? 'ativo' : 'inativo',
            criado_em: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
          }));
          setClientes(clientesDisplay);
        }
      } catch (err) {
        if (active) {
          toast({
            title: 'Erro ao carregar clientes',
            description: 'Verifique se o servidor está rodando.',
            status: 'error',
            duration: 5000,
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [toast]);

  const filteredClientes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clientes;
    return clientes.filter((cliente) => {
      const haystack = [
        cliente.nome,
        cliente.email,
        cliente.telefone,
        cliente.endereco?.cidade,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [clientes, searchTerm]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
  };

  const handleOpenNew = () => {
    setEditingCliente(null);
    onOpen();
  };

  const handleOpenEdit = (cliente: ClienteDisplay) => {
    setEditingCliente(cliente);
    onOpen();
  };

  const handleSubmit = async (data: ClienteFormData) => {
    // Converte endereco do form para o formato da API
    const enderecoApi = {
      rua: data.endereco.rua || undefined,
      bairro: data.endereco.bairro || undefined,
      complemento: data.endereco.complemento || undefined,
      cidade: data.endereco.cidade || undefined,
      estado: data.endereco.estado || undefined,
      cep: data.endereco.cep || undefined,
    };

    try {
      if (editingCliente && editingCliente._id) {
        // Edição
        const updated = await updateCliente(editingCliente._id, {
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          endereco: enderecoApi,
          ativo: data.status === 'ativo',
          ...(data.senha ? { senha: data.senha } : {}),
        });
        setClientes((prev) =>
          prev.map((c) =>
            c._id === editingCliente._id
              ? { 
                  ...c, 
                  ...updated, 
                  status: updated.ativo !== false ? 'ativo' : 'inativo',
                }
              : c
          )
        );
        toast({
          title: 'Cliente atualizado',
          description: `${data.nome} foi atualizado com sucesso.`,
          status: 'success',
          duration: 3000,
        });
      } else {
        // Novo cliente
        const created = await createCliente({
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          tipo: 'cliente',
          telefone: data.telefone,
          endereco: enderecoApi,
          ativo: data.status === 'ativo',
        });
        const newCliente: ClienteDisplay = {
          ...created,
          status: created.ativo !== false ? 'ativo' : 'inativo',
          criado_em: new Date().toISOString().split('T')[0],
        };
        setClientes((prev) => [...prev, newCliente]);
        toast({
          title: 'Cliente criado',
          description: `${data.nome} foi criado com sucesso.`,
          status: 'success',
          duration: 3000,
        });
      }
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o cliente.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleRemove = async (cliente: ClienteDisplay) => {
    if (!cliente._id) return;
    
    try {
      await deleteCliente(cliente._id);
      setClientes((prev) => prev.filter((c) => c._id !== cliente._id));
      toast({
        title: 'Cliente removido',
        description: `${cliente.nome} foi removido com sucesso.`,
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o cliente.',
        status: 'error',
        duration: 5000,
      });
    }
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
      <Flex
        direction={{ base: 'column', xl: 'row' }}
        justify="space-between"
        gap={6}
        align={{ base: 'flex-start', xl: 'center' }}
      >
        <Stack spacing={1}>
          <HStack spacing={2} color="teal.400" mb={1}>
            <Icon as={FaUsersGear} />
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
          leftIcon={<FaUserPlus />}
          px={6}
          h={12}
          fontWeight="bold"
          bg="teal.500"
          color="white"
          _hover={{ bg: 'teal.400' }}
          borderRadius="xl"
          onClick={handleOpenNew}
        >
          Novo Cliente
        </Button>
      </Flex>

      {/* Modal de Formulário */}
      <ClienteFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        initialData={editingCliente ? {
          nome: editingCliente.nome,
          cpf_cnpj: '',
          tipo_pessoa: 'F',
          data_nasc: '',
          telefone: editingCliente.telefone ?? '',
          email: editingCliente.email,
          senha: '',
          endereco: editingCliente.endereco ?? {
            rua: '',
            bairro: '',
            complemento: '',
            cep: '',
            cidade: '',
            estado: 'PA',
          },
          status: editingCliente.status,
        } : undefined}
        isEditing={!!editingCliente}
      />

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
              <Icon as={FaMagnifyingGlass} color="gray.500" />
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
                  CPF/CNPJ
                </Th>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4}>
                  Contato
                </Th>
                <Th color="gray.400" borderColor="whiteAlpha.100" py={4}>
                  Cidade
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
                <Tr key={cliente._id} _hover={{ bg: 'whiteAlpha.50' }}>
                  <Td borderColor="whiteAlpha.100">
                    <Stack spacing={0}>
                      <Text fontWeight="medium">{cliente.nome}</Text>
                      <Badge
                        w="fit-content"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                        bg={cliente.tipo_pessoa === 'juridica' ? 'purple.500/20' : 'blue.500/20'}
                        color={cliente.tipo_pessoa === 'juridica' ? 'purple.300' : 'blue.300'}
                        fontSize="xs"
                      >
                        {cliente.tipo_pessoa === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                      </Badge>
                    </Stack>
                  </Td>
                  <Td borderColor="whiteAlpha.100" color="gray.400" fontFamily="mono" fontSize="sm">
                    {cliente.cpf_cnpj ?? '-'}
                  </Td>
                  <Td borderColor="whiteAlpha.100">
                    <Stack spacing={1}>
                      <HStack spacing={1} color="gray.400" fontSize="sm">
                        <Icon as={FaEnvelope} boxSize={3} />
                        <Text>{cliente.email}</Text>
                      </HStack>
                      {cliente.telefone && (
                        <HStack spacing={1} color="gray.500" fontSize="xs">
                          <Icon as={FaPhone} boxSize={3} />
                          <Text>{cliente.telefone}</Text>
                        </HStack>
                      )}
                    </Stack>
                  </Td>
                  <Td borderColor="whiteAlpha.100">
                    <HStack spacing={1} color="gray.400" fontSize="sm">
                      <Icon as={FaMapPin} boxSize={3} />
                      <Text>{cliente.endereco?.cidade ?? '-'}/{cliente.endereco?.estado ?? '-'}</Text>
                    </HStack>
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
                          icon={<FaPenToSquare />}
                          size="sm"
                          variant="ghost"
                          color="yellow.300"
                          bg="rgba(234,179,8,0.15)"
                          _hover={{ bg: 'rgba(234,179,8,0.25)' }}
                          onClick={() => handleOpenEdit(cliente)}
                        />
                      </Tooltip>
                      <Tooltip label="Excluir">
                        <IconButton
                          aria-label="excluir"
                          icon={<FaTrashCan />}
                          size="sm"
                          variant="ghost"
                          color="red.300"
                          bg="rgba(248,113,113,0.15)"
                          _hover={{ bg: 'rgba(248,113,113,0.25)' }}
                          onClick={() => handleRemove(cliente)}
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
