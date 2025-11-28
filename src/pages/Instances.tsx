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
  InputRightElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  FaPenToSquare,
  FaChartLine,
  FaGauge,
  FaMicrochip,
  FaMapPin,
  FaPlus,
  FaMagnifyingGlass,
  FaNetworkWired,
  FaTrashCan,
  FaUserTag,
  FaPlugCircleBolt,
  FaTriangleExclamation,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { getSistemas, createSistema, updateSistema, deleteSistema, calcularCapacidadeTotal } from '../api/sistemas';
import { getClientes, loginCliente } from '../api/clientes';
import type { Sistema, Cliente } from '../models/domain';
import SistemaFormModal, { type SistemaFormData, type Localizacao, type Subsistema, type Painel } from '../components/SistemaFormModal';
import { useAuth } from '../context/AuthContext';

type NormalizedStatus = 'online' | 'offline' | 'alert';

// Tipo interno para display
type SistemaDisplay = Sistema & {
  cliente_nome?: string;
  status_operacional: NormalizedStatus;
  capacidade_total_Wp: number;
};

const STATUS_STYLES: Record<NormalizedStatus, { border: string; badgeBg: string; badgeColor: string; bg: string; label: string }> = {
  online: {
    border: 'linear-gradient(90deg, #15c1b0 0%, #0ea5e9 100%)',
    badgeBg: 'rgba(20,184,166,0.2)',
    badgeColor: 'teal.300',
    bg: 'linear-gradient(145deg, rgba(15,118,110,0.35) 0%, rgba(15,23,42,0.95) 70%)',
    label: 'Operacional',
  },
  offline: {
    border: 'linear-gradient(90deg, #94a3b8 0%, #475569 100%)',
    badgeBg: 'rgba(148,163,184,0.18)',
    badgeColor: 'gray.400',
    bg: 'linear-gradient(145deg, rgba(71,85,105,0.3) 0%, rgba(15,23,42,0.95) 70%)',
    label: 'Desconectado',
  },
  alert: {
    border: 'linear-gradient(90deg, #f97316 0%, #f43f5e 100%)',
    badgeBg: 'rgba(248,113,113,0.2)',
    badgeColor: 'orange.300',
    bg: 'linear-gradient(145deg, rgba(127,29,29,0.45) 0%, rgba(15,23,42,0.95) 75%)',
    label: 'Atenção',
  },
};

// Calcula capacidade total baseado nos painéis
function calcularCapacidadeLocalTotal(subsistemas: Subsistema[]): number {
  return subsistemas.reduce((total: number, sub: Subsistema) => {
    return total + sub.componentes.paineis.reduce((sum: number, p: Painel) => sum + (p.capacidade_Wp * p.quantidade), 0);
  }, 0);
}

// Normaliza status do sistema
function normalizeStatus(status?: string): NormalizedStatus {
  if (!status) return 'offline';
  const lower = status.toLowerCase();
  if (lower === 'online' || lower === 'operacional') return 'online';
  if (lower.includes('alerta') || lower.includes('erro') || lower === 'alert') return 'alert';
  return 'offline';
}

export default function Instances() {
  const [sistemas, setSistemas] = useState<SistemaDisplay[]>([]);
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSystem, setEditingSystem] = useState<SistemaDisplay | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteModal = useDisclosure();
  const [systemToDelete, setSystemToDelete] = useState<SistemaDisplay | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  // Carrega dados da API
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [sistemasData, clientesData] = await Promise.all([
          getSistemas(),
          getClientes().catch(() => [] as Cliente[])
        ]);
        
        if (active) {
          // Mapeia sistemas para seus clientes (cliente.sistema_id -> cliente.nome)
          const sistemaToClienteMap = new Map<string, string>();
          for (const cliente of clientesData) {
            if (cliente.sistema_id) {
              const sistemaId = typeof cliente.sistema_id === 'string' 
                ? cliente.sistema_id 
                : (cliente.sistema_id as any)?._id;
              if (sistemaId) {
                sistemaToClienteMap.set(sistemaId, cliente.nome);
              }
            }
          }
          
          // Converte sistemas para display
          const sistemasDisplay: SistemaDisplay[] = sistemasData.map((s: Sistema) => ({
            ...s,
            cliente_nome: sistemaToClienteMap.get(s._id) ?? 'Sem cliente',
            status_operacional: normalizeStatus((s as Sistema & { status_operacional?: string }).status_operacional),
            capacidade_total_Wp: calcularCapacidadeTotal([s]),
          }));
          
          setSistemas(sistemasDisplay);
          setClientes(clientesData.map((c: Cliente) => ({ id: c._id!, nome: c.nome })));
        }
      } catch (err) {
        if (active) {
          toast({
            title: 'Erro ao carregar dados',
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

  const filteredSistemas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return sistemas;
    return sistemas.filter((sistema) => {
      const haystack = [
        sistema.nome,
        sistema.localizacao?.rua,
        sistema.localizacao?.cep,
        sistema._id,
        sistema.cliente_nome,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [sistemas, searchTerm]);

  const statusCount = useMemo(
    () =>
      filteredSistemas.reduce(
        (acc, sistema) => {
          acc[sistema.status_operacional] += 1;
          return acc;
        },
        { online: 0, offline: 0, alert: 0 } as Record<NormalizedStatus, number>
      ),
    [filteredSistemas]
  );

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setSearchTerm((value) => value.trim());
  };

  const handleOpenNew = () => {
    setEditingSystem(null);
    onOpen();
  };

  const handleOpenEdit = (sistema: SistemaDisplay) => {
    setEditingSystem(sistema);
    onOpen();
  };

  const handleSubmit = async (data: SistemaFormData) => {
    const clienteNome = clientes.find((c) => c.id === data.id_cliente)?.nome ?? 'Desconhecido';
    const capacidadeTotal = calcularCapacidadeLocalTotal(data.subsistema);
    
    try {
      if (editingSystem && editingSystem._id) {
        // Edição
        const updated = await updateSistema(editingSystem._id, data);
        setSistemas((prev) =>
          prev.map((s) =>
            s._id === editingSystem._id
              ? { 
                  ...s, 
                  ...updated, 
                  cliente_nome: clienteNome,
                  status_operacional: normalizeStatus((updated as Sistema & { status_operacional?: string }).status_operacional),
                  capacidade_total_Wp: capacidadeTotal,
                }
              : s
          )
        );
        toast({
          title: 'Sistema atualizado',
          description: `${data.nome} foi atualizado com sucesso.`,
          status: 'success',
          duration: 3000,
        });
      } else {
        // Novo sistema
        const created = await createSistema(data);
        const newSystem: SistemaDisplay = {
          ...created,
          cliente_nome: clienteNome,
          status_operacional: 'online',
          capacidade_total_Wp: capacidadeTotal,
        };
        setSistemas((prev) => [...prev, newSystem]);
        toast({
          title: 'Sistema criado',
          description: `${data.nome} foi criado com sucesso.`,
          status: 'success',
          duration: 3000,
        });
      }
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o sistema.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleRemove = (sistema: SistemaDisplay) => {
    if (!sistema._id) return;
    setSystemToDelete(sistema);
    setDeletePassword('');
    setDeleteError('');
    deleteModal.onOpen();
  };

  const handleConfirmDelete = async () => {
    if (!systemToDelete?._id || !user?.email) return;
    
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      // Verifica a senha fazendo login
      await loginCliente({ email: user.email, senha: deletePassword });
      
      // Se chegou aqui, a senha está correta - pode excluir
      await deleteSistema(systemToDelete._id);
      setSistemas((prev) => prev.filter((s) => s._id !== systemToDelete._id));
      
      toast({
        title: 'Sistema removido',
        description: `${systemToDelete.nome} foi removido com sucesso.`,
        status: 'success',
        duration: 3000,
      });
      
      deleteModal.onClose();
      setSystemToDelete(null);
      setDeletePassword('');
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.message?.includes('401')) {
        setDeleteError('Senha incorreta. Tente novamente.');
      } else if (err?.response?.data?.error) {
        setDeleteError(err.response.data.error);
      } else {
        setDeleteError('Erro ao verificar credenciais. Tente novamente.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    deleteModal.onClose();
    setSystemToDelete(null);
    setDeletePassword('');
    setDeleteError('');
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
      <Flex direction={{ base: 'column', xl: 'row' }} justify="space-between" gap={6} align={{ base: 'flex-start', xl: 'center' }}>
        <Stack spacing={1}>
          <HStack spacing={2} color="teal.400" mb={1}>
            <Icon as={FaNetworkWired} />
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" fontWeight="bold">
              Administração
            </Text>
          </HStack>
          <Heading size="lg" fontWeight="extrabold">
            Gestão de Sistemas
          </Heading>
          <Text color="gray.400" maxW="3xl">
            Gerencie todos os sistemas fotovoltaicos cadastrados na plataforma.
          </Text>
        </Stack>

        <Button 
          leftIcon={<FaPlus />} 
          px={6} 
          h={12} 
          fontWeight="bold" 
          bg="teal.500" 
          color="white" 
          _hover={{ bg: 'teal.400' }} 
          borderRadius="xl"
          onClick={handleOpenNew}
        >
          Novo Sistema
        </Button>
      </Flex>

      {/* Modal de Formulário */}
      <SistemaFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        clientes={clientes}
        initialData={editingSystem ? {
          nome: editingSystem.nome,
          id_cliente: editingSystem.id_cliente ?? '',
          localizacao: editingSystem.localizacao,
          subsistema: editingSystem.subsistema,
        } : undefined}
        isEditing={!!editingSystem}
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
              placeholder="Buscar por nome, localização ou cliente..." 
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
          Exibindo {filteredSistemas.length} de {sistemas.length} sistemas • 
          <Text as="span" color="teal.400" fontWeight="medium"> {statusCount.online} Online</Text> • 
          <Text as="span" color="gray.400"> {statusCount.offline} Offline</Text> • 
          <Text as="span" color="orange.400"> {statusCount.alert} Alerta</Text>
        </Text>
      </Box>

      {/* Systems Grid */}
      {filteredSistemas.length === 0 ? (
        <EmptyState hasSystems={sistemas.length > 0} />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
          {filteredSistemas.map((sistema) => (
            <SystemCard
              key={sistema._id}
              sistema={sistema}
              onView={() => navigate(`/analises?sistema=${sistema._id}`)}
              onViewDetails={() => navigate(`/dashboard?sistema=${sistema._id}`)}
              onViewEquipment={() => navigate(`/equipamentos?sistema=${sistema._id}`)}
              onEdit={() => handleOpenEdit(sistema)}
              onRemove={() => handleRemove(sistema)}
            />
          ))}
        </SimpleGrid>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <Modal isOpen={deleteModal.isOpen} onClose={handleCancelDelete} isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent bg="slate.800" borderRadius="2xl" borderWidth="1px" borderColor="red.500/30" mx={4}>
          <ModalHeader pb={2}>
            <Flex align="center" gap={3}>
              <Box p={2} bg="red.500/20" borderRadius="lg">
                <Icon as={FaTriangleExclamation} color="red.400" boxSize={5} />
              </Box>
              <Box>
                <Text fontSize="lg" fontWeight="bold" color="gray.100">
                  Confirmar Exclusão
                </Text>
                <Text fontSize="sm" color="gray.400" fontWeight="normal">
                  Esta ação não pode ser desfeita
                </Text>
              </Box>
            </Flex>
          </ModalHeader>
          
          <ModalBody py={4}>
            <Stack spacing={4}>
              <Box bg="red.900/30" borderRadius="xl" p={4} borderWidth="1px" borderColor="red.500/20">
                <Text color="gray.300" fontSize="sm">
                  Você está prestes a excluir permanentemente o sistema:
                </Text>
                <Text color="white" fontWeight="bold" fontSize="lg" mt={1}>
                  {systemToDelete?.nome}
                </Text>
                <Text color="gray.400" fontSize="sm" mt={1}>
                  {systemToDelete?.cliente_nome && systemToDelete.cliente_nome !== 'Sem cliente' && (
                    <>Cliente: {systemToDelete.cliente_nome}</>
                  )}
                </Text>
              </Box>
              
              <Box>
                <Text color="gray.300" fontSize="sm" mb={2}>
                  Para confirmar, digite sua senha:
                </Text>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeleteError('');
                    }}
                    bg="slate.700"
                    borderColor={deleteError ? 'red.500' : 'whiteAlpha.200'}
                    _hover={{ borderColor: deleteError ? 'red.400' : 'whiteAlpha.300' }}
                    _focus={{ borderColor: deleteError ? 'red.400' : 'red.500', boxShadow: deleteError ? '0 0 0 1px var(--chakra-colors-red-500)' : '0 0 0 1px var(--chakra-colors-red-500)' }}
                    borderRadius="xl"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && deletePassword) {
                        handleConfirmDelete();
                      }
                    }}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                      variant="ghost"
                      size="sm"
                      color="gray.400"
                      _hover={{ color: 'gray.200' }}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                {deleteError && (
                  <Text color="red.400" fontSize="sm" mt={2}>
                    {deleteError}
                  </Text>
                )}
              </Box>
            </Stack>
          </ModalBody>
          
          <ModalFooter gap={3} pt={2}>
            <Button
              variant="ghost"
              onClick={handleCancelDelete}
              color="gray.400"
              _hover={{ bg: 'slate.700', color: 'gray.200' }}
              borderRadius="xl"
            >
              Cancelar
            </Button>
            <Button
              colorScheme="red"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
              loadingText="Excluindo..."
              isDisabled={!deletePassword}
              borderRadius="xl"
              leftIcon={<FaTrashCan />}
            >
              Excluir Sistema
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
}

function SystemCard({ sistema, onView, onViewDetails, onViewEquipment, onEdit, onRemove }: SystemCardProps) {
  const colors = STATUS_STYLES[sistema.status_operacional];
  const location = sistema.localizacao?.rua ?? 'Localização não informada';

  return (
    <Box 
      borderRadius="2xl" 
      p="2px" 
      bg={colors.border} 
      boxShadow="xl"
      transition="all 0.3s ease" 
      _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl' }}
    >
      <Box 
        bg="slate.800" 
        borderRadius="2xl" 
        p={6} 
        h="full"
      >
        {/* Header */}
        <Flex justify="space-between" align="flex-start" mb={4}>
          <Box>
            <Heading size="md" fontWeight="bold" mb={2}>
              {sistema.nome}
            </Heading>
            <HStack spacing={2} color="gray.400" fontSize="sm">
              <Icon as={FaMapPin} />
              <Text>{location}</Text>
            </HStack>
          </Box>
          <Badge 
            px={3} 
            py={1} 
            borderRadius="full" 
            bg={colors.badgeBg} 
            color={colors.badgeColor} 
            fontSize="xs" 
            fontWeight="bold"
          >
            {colors.label}
          </Badge>
        </Flex>

        {/* Info Box */}
        <Box bg="slate.700" borderRadius="xl" p={4} mb={4}>
          <Stack spacing={3} fontSize="sm" color="gray.300">
            <HStack spacing={2}>
              <Icon as={FaUserTag} color="gray.500" boxSize={4} />
              <Text>
                Cliente: <Text as="span" fontWeight="semibold" color="white">{sistema.cliente_nome}</Text>
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={FaPlugCircleBolt} color="yellow.400" boxSize={4} />
              <Text>
                Capacidade: <Text as="span" fontWeight="semibold" color="yellow.400">{sistema.capacidade_total_Wp.toLocaleString('pt-BR')} Wp</Text>
              </Text>
            </HStack>
          </Stack>
        </Box>

        {/* Actions */}
        <Flex justify="flex-end" gap={2}>
          <Tooltip label="Ver gráficos">
            <IconButton 
              aria-label="ver gráficos" 
              icon={<FaChartLine />} 
              size="sm"
              variant="ghost" 
              color="blue.300" 
              bg="rgba(59,130,246,0.15)" 
              _hover={{ bg: 'rgba(59,130,246,0.25)' }} 
              onClick={onView} 
            />
          </Tooltip>
          <Tooltip label="Visualizar detalhes">
            <IconButton 
              aria-label="visualizar detalhes" 
              icon={<FaGauge />} 
              size="sm"
              variant="ghost" 
              color="cyan.300" 
              bg="rgba(34,211,238,0.15)" 
              _hover={{ bg: 'rgba(34,211,238,0.25)' }} 
              onClick={onViewDetails} 
            />
          </Tooltip>
          <Tooltip label="Ver equipamentos">
            <IconButton 
              aria-label="ver equipamentos" 
              icon={<FaMicrochip />} 
              size="sm"
              variant="ghost" 
              color="purple.300" 
              bg="rgba(168,85,247,0.15)" 
              _hover={{ bg: 'rgba(168,85,247,0.25)' }} 
              onClick={onViewEquipment} 
            />
          </Tooltip>
          <Tooltip label="Editar sistema">
            <IconButton 
              aria-label="editar" 
              icon={<FaPenToSquare />} 
              size="sm"
              variant="ghost" 
              color="yellow.300" 
              bg="rgba(234,179,8,0.15)" 
              _hover={{ bg: 'rgba(234,179,8,0.25)' }} 
              onClick={onEdit} 
            />
          </Tooltip>
          <Tooltip label="Excluir sistema">
            <IconButton 
              aria-label="excluir" 
              icon={<FaTrashCan />} 
              size="sm"
              variant="ghost" 
              color="red.300" 
              bg="rgba(248,113,113,0.15)" 
              _hover={{ bg: 'rgba(248,113,113,0.25)' }} 
              onClick={onRemove} 
            />
          </Tooltip>
        </Flex>
      </Box>
    </Box>
  );
}

type SystemCardProps = {
  sistema: SistemaDisplay;
  onView: () => void;
  onViewDetails: () => void;
  onViewEquipment: () => void;
  onEdit: () => void;
  onRemove: () => void;
};

function EmptyState({ hasSystems }: { hasSystems: boolean }) {
  return (
    <Box 
      borderRadius="2xl" 
      borderWidth="1px" 
      borderColor="whiteAlpha.100" 
      bg="slate.800" 
      p={10} 
      textAlign="center"
    >
      <Icon as={FaNetworkWired} boxSize={12} color="gray.600" mb={4} />
      <Heading size="md" mb={2}>
        {hasSystems ? 'Nenhum sistema encontrado' : 'Nenhum sistema cadastrado'}
      </Heading>
      <Text color="gray.500">
        {hasSystems 
          ? 'Tente outros termos de busca.' 
          : 'Clique em "Novo Sistema" para cadastrar o primeiro sistema.'}
      </Text>
    </Box>
  );
}
