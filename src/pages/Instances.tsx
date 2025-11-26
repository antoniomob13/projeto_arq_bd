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
  Stack,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import {
  FiEdit2,
  FiExternalLink,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiServer,
  FiTrash2,
  FiUser,
  FiZap,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Mock data matching teste.html
const mockSistemas = [
  {
    id: 'sys1',
    nome: 'Unidade Tapajós 01',
    status_operacional: 'online',
    localizacao: { rua: 'Rua Vera Paz, Campus Tapajós', cep: '68040-000' },
    capacidade_wp: 1000,
    cliente: 'UFOPA',
  },
  {
    id: 'sys2',
    nome: 'Unidade Amazônia 02',
    status_operacional: 'online',
    localizacao: { rua: 'Av. Marechal Rondon, 100', cep: '68040-070' },
    capacidade_wp: 1500,
    cliente: 'UFOPA',
  },
  {
    id: 'sys3',
    nome: 'Unidade Oriximiná 03',
    status_operacional: 'offline',
    localizacao: { rua: 'Comunidade Ribeirinha', cep: '68270-000' },
    capacidade_wp: 800,
    cliente: 'Prefeitura',
  },
  {
    id: 'sys4',
    nome: 'Unidade Belterra 04',
    status_operacional: 'alert',
    localizacao: { rua: 'Estrada do Tapajós, Km 30', cep: '68143-000' },
    capacidade_wp: 2000,
    cliente: 'Comunidade',
  },
];

type MockSistema = (typeof mockSistemas)[number];
type NormalizedStatus = 'online' | 'offline' | 'alert';

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

export default function Instances() {
  const [sistemas] = useState<MockSistema[]>(mockSistemas);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const filteredSistemas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return sistemas;
    return sistemas.filter((sistema) => {
      const haystack = [
        sistema.nome,
        sistema.localizacao?.rua,
        sistema.localizacao?.cep,
        sistema.id,
        sistema.cliente,
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
          const status = normalizeStatus(sistema.status_operacional);
          acc[status] += 1;
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

  const handleAction = (action: string) =>
    toast({
      title: `Ação: ${action}`,
      description: 'Funcionalidade será implementada em breve.',
      status: 'info',
      duration: 3000,
    });

  return (
    <Stack spacing={8}>
      {/* Header */}
      <Flex direction={{ base: 'column', xl: 'row' }} justify="space-between" gap={6} align={{ base: 'flex-start', xl: 'center' }}>
        <Stack spacing={1}>
          <HStack spacing={2} color="teal.400" mb={1}>
            <Icon as={FiServer} />
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
          leftIcon={<FiPlus />} 
          px={6} 
          h={12} 
          fontWeight="bold" 
          bg="teal.500" 
          color="white" 
          _hover={{ bg: 'teal.400' }} 
          borderRadius="xl"
          onClick={() => handleAction('Novo Sistema')}
        >
          Novo Sistema
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
              key={sistema.id}
              sistema={sistema}
              onView={() => navigate(`/dados?sistema=${sistema.id}`)}
              onEdit={() => handleAction('Editar ' + sistema.nome)}
              onRemove={() => handleAction('Remover ' + sistema.nome)}
            />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}

function SystemCard({ sistema, onView, onEdit, onRemove }: SystemCardProps) {
  const status = normalizeStatus(sistema.status_operacional);
  const colors = STATUS_STYLES[status];
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
              <Icon as={FiMapPin} />
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
              <Icon as={FiUser} color="gray.500" boxSize={4} />
              <Text>
                Cliente: <Text as="span" fontWeight="semibold" color="white">{sistema.cliente}</Text>
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={FiZap} color="yellow.400" boxSize={4} />
              <Text>
                Capacidade: <Text as="span" fontWeight="semibold" color="yellow.400">{sistema.capacidade_wp.toLocaleString('pt-BR')} Wp</Text>
              </Text>
            </HStack>
          </Stack>
        </Box>

        {/* Actions */}
        <Flex justify="flex-end" gap={2}>
          <Tooltip label="Visualizar detalhes">
            <IconButton 
              aria-label="ver" 
              icon={<FiExternalLink />} 
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
              icon={<FiEdit2 />} 
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
              icon={<FiTrash2 />} 
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
  sistema: MockSistema;
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
      <Icon as={FiServer} boxSize={12} color="gray.600" mb={4} />
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

function normalizeStatus(status: string): NormalizedStatus {
  const normalized = status.toLowerCase();
  if (normalized.includes('alert') || normalized.includes('erro') || normalized.includes('atenção')) return 'alert';
  if (normalized.includes('off') || normalized.includes('desconect')) return 'offline';
  return 'online';
}

