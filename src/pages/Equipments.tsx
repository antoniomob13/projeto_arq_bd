import {
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Progress,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { FiCpu, FiSun, FiZap, FiBattery } from 'react-icons/fi';

// Mock data matching teste.html subsistema structure
const subsistema = {
  nome: 'Subsistema Principal',
  componentes: {
    paineis: [
      { modelo: 'Canadian Solar CS6P-260P', quantidade: 4, capacidade_Wp: 260 },
    ],
    inversores: [
      { modelo: 'Fronius Primo 3.0-1', quantidade: 1, potencia_max_W: 3000 },
    ],
    baterias: [
      { modelo: 'Pylontech US2000C', quantidade: 2, capacidade_Ah: 50 },
    ],
    controladores: [
      { modelo: 'Epever Tracer 4210AN', quantidade: 1 },
    ],
  },
};

export default function Equipments() {
  const totalPaineis = subsistema.componentes.paineis.reduce(
    (sum, p) => sum + p.quantidade,
    0
  );
  const totalCapacidade = subsistema.componentes.paineis.reduce(
    (sum, p) => sum + p.quantidade * p.capacidade_Wp,
    0
  );
  const totalBaterias = subsistema.componentes.baterias.reduce(
    (sum, b) => sum + b.quantidade,
    0
  );

  return (
    <Stack spacing={8}>
      {/* Header */}
      <Box>
        <HStack spacing={2} color="teal.400" mb={2}>
          <Icon as={FiCpu} />
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" fontWeight="bold">
            Inventário
          </Text>
        </HStack>
        <Heading size="lg" fontWeight="extrabold" mb={2}>
          Inventário e Subsistemas
        </Heading>
        <Text color="gray.400">
          Visualize todos os componentes do seu sistema fotovoltaico.
        </Text>
      </Box>

      {/* Subsystem Overview */}
      <Box bg="slate.800" borderRadius="2xl" borderWidth="1px" borderColor="whiteAlpha.100" p={6}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="md" fontWeight="bold">
              {subsistema.nome}
            </Heading>
            <Text color="gray.400" fontSize="sm">
              Resumo dos componentes instalados
            </Text>
          </Box>
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            bg="green.500/20"
            color="green.300"
            fontSize="xs"
            fontWeight="bold"
          >
            Operacional
          </Badge>
        </Flex>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <StatCard
            icon={FiSun}
            label="Painéis"
            value={totalPaineis.toString()}
            color="yellow.400"
          />
          <StatCard
            icon={FiZap}
            label="Capacidade Total"
            value={`${totalCapacidade} Wp`}
            color="teal.400"
          />
          <StatCard
            icon={FiBattery}
            label="Baterias"
            value={totalBaterias.toString()}
            color="blue.400"
          />
          <StatCard
            icon={FiCpu}
            label="Controladores"
            value={subsistema.componentes.controladores.length.toString()}
            color="purple.400"
          />
        </SimpleGrid>
      </Box>

      {/* Components Grid */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Painéis Solares */}
        <ComponentCard
          title="Painéis Solares"
          icon={FiSun}
          iconColor="yellow.400"
          items={subsistema.componentes.paineis.map((p) => ({
            name: p.modelo,
            detail: `${p.quantidade}x - ${p.capacidade_Wp} Wp cada`,
            progress: 85,
          }))}
        />

        {/* Inversores */}
        <ComponentCard
          title="Inversores"
          icon={FiZap}
          iconColor="teal.400"
          items={subsistema.componentes.inversores.map((i) => ({
            name: i.modelo,
            detail: `${i.quantidade}x - ${i.potencia_max_W} W máx`,
            progress: 72,
          }))}
        />

        {/* Baterias */}
        <ComponentCard
          title="Baterias"
          icon={FiBattery}
          iconColor="blue.400"
          items={subsistema.componentes.baterias.map((b) => ({
            name: b.modelo,
            detail: `${b.quantidade}x - ${b.capacidade_Ah} Ah`,
            progress: 82,
          }))}
        />

        {/* Controladores */}
        <ComponentCard
          title="Controladores de Carga"
          icon={FiCpu}
          iconColor="purple.400"
          items={subsistema.componentes.controladores.map((c) => ({
            name: c.modelo,
            detail: `${c.quantidade}x instalado`,
            progress: 100,
          }))}
        />
      </SimpleGrid>
    </Stack>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Box bg="slate.700" borderRadius="xl" p={4}>
      <HStack spacing={3}>
        <Box p={2} borderRadius="lg" bg={`${color}20`}>
          <Icon as={icon} color={color} boxSize={5} />
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.400" textTransform="uppercase">
            {label}
          </Text>
          <Text fontSize="lg" fontWeight="bold" color={color}>
            {value}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
}

function ComponentCard({
  title,
  icon,
  iconColor,
  items,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  items: { name: string; detail: string; progress: number }[];
}) {
  return (
    <Box bg="slate.800" borderRadius="2xl" borderWidth="1px" borderColor="whiteAlpha.100" p={6}>
      <HStack spacing={3} mb={4}>
        <Box p={2} borderRadius="lg" bg={`${iconColor}20`}>
          <Icon as={icon} color={iconColor} boxSize={5} />
        </Box>
        <Heading size="sm" fontWeight="bold">
          {title}
        </Heading>
      </HStack>

      <Stack spacing={4}>
        {items.map((item, idx) => (
          <Box key={idx} bg="slate.700" borderRadius="xl" p={4}>
            <Flex justify="space-between" align="flex-start" mb={2}>
              <Box>
                <Text fontWeight="medium" fontSize="sm">
                  {item.name}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {item.detail}
                </Text>
              </Box>
              <Badge
                px={2}
                py={1}
                borderRadius="md"
                bg="green.500/20"
                color="green.300"
                fontSize="xs"
              >
                Ativo
              </Badge>
            </Flex>
            <Box>
              <Flex justify="space-between" mb={1}>
                <Text fontSize="xs" color="gray.500">
                  Eficiência
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {item.progress}%
                </Text>
              </Flex>
              <Progress
                value={item.progress}
                size="sm"
                borderRadius="full"
                bg="slate.600"
                sx={{
                  '& > div': {
                    background: `linear-gradient(90deg, ${iconColor}, ${iconColor})`,
                  },
                }}
              />
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
