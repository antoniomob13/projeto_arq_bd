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
  FaArrowUpRightFromSquare,
  FaMapPin,
  FaPlus,
  FaMagnifyingGlass,
  FaNetworkWired,
  FaTrashCan,
  FaUserTag,
  FaPlugCircleBolt,
} from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { getSistemas, createSistema, updateSistema, deleteSistema, calcularCapacidadeTotal } from '../api/sistemas';
import { getClientes } from '../api/clientes';
import type { Sistema, Cliente } from '../models/domain';
import SistemaFormModal, { type SistemaFormData, type Localizacao, type Subsistema, type Painel } from '../components/SistemaFormModal';

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
  const navigate = useNavigate();
  const toast = useToast();

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
          // Mapeia clientes para lookup rápido
          const clienteMap = new Map(clientesData.map((c: Cliente) => [c._id, c.nome]));
          
          // Converte sistemas para display
          const sistemasDisplay: SistemaDisplay[] = sistemasData.map((s: Sistema) => ({
            ...s,
            cliente_nome: s.id_cliente ? clienteMap.get(s.id_cliente) ?? 'Desconhecido' : 'Sem cliente',
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

  const handleRemove = async (sistema: SistemaDisplay) => {
    if (!sistema._id) return;
    
    try {
      await deleteSistema(sistema._id);
      setSistemas((prev) => prev.filter((s) => s._id !== sistema._id));
      toast({
        title: 'Sistema removido',
        description: `${sistema.nome} foi removido com sucesso.`,
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o sistema.',
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
              onEdit={() => handleOpenEdit(sistema)}
              onRemove={() => handleRemove(sistema)}
            />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}

function SystemCard({ sistema, onView, onEdit, onRemove }: SystemCardProps) {
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
          <Tooltip label="Visualizar detalhes">
            <IconButton 
              aria-label="ver" 
              icon={<FaArrowUpRightFromSquare />} 
              size="sm"
              variant="ghost" 
              color="blue.300" 
              bg="rgba(59,130,246,0.15)" 
              _hover={{ bg: 'rgba(59,130,246,0.25)' }} 
              onClick={onView} 
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
