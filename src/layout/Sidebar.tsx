import { Box, Flex, Icon, Link as ChakraLink, Stack, Text } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaGaugeHigh, 
  FaSolarPanel, 
  FaChartLine, 
  FaServer, 
  FaNetworkWired, 
  FaUsersGear, 
  FaRightFromBracket,
  FaCube 
} from 'react-icons/fa6';
import { useMemo, type ComponentType } from 'react';
import { useAuth } from '../context/AuthContext';

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType;
};

export default function Sidebar() {
  const { pathname } = useLocation();
  const { logout, isAdmin } = useAuth();

  const navItems = useMemo<NavItem[]>(() => {
    if (isAdmin) {
      return [
        { to: '/dashboard', label: 'Dashboard Geral', icon: FaServer },
        { to: '/sistemas', label: 'Gestão de Sistemas', icon: FaNetworkWired },
        { to: '/clientes', label: 'Gestão de Clientes', icon: FaUsersGear },
      ];
    }
    // Cliente
    return [
      { to: '/dashboard', label: 'Dashboard Visão Geral', icon: FaGaugeHigh },
      { to: '/equipamentos', label: 'Inventário e Subsistemas', icon: FaSolarPanel },
      { to: '/analises', label: 'Gráficos & Análises', icon: FaChartLine },
    ];
  }, [isAdmin]);

  return (
    <Box
      as="nav"
      bg="slate.800"
      borderRightWidth="1px"
      borderColor="rgba(51,65,85,0.5)"
      w="64"
      display={{ base: 'none', md: 'flex' }}
      flexDirection="column"
      boxShadow="2xl"
      zIndex={20}
    >
      {/* Header com Logo */}
      <Flex
        align="center"
        justify="center"
        gap={3}
        h="16"
        borderBottomWidth="1px"
        borderColor="slate.700"
        bg="rgba(15,23,42,0.5)"
      >
        <Icon as={FaCube} boxSize={7} color="brand.400" />
        <Text fontSize="2xl" fontWeight="extrabold" letterSpacing="widest" color="gray.100">
          LABER
        </Text>
      </Flex>

      {/* Menu de Navegação */}
      <Stack as="nav" flex="1" py={4} spacing={2} overflowY="auto">
        {isAdmin && (
          <Text
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="wider"
            fontWeight="semibold"
            color="gray.500"
            mt={4}
            mb={2}
            px={6}
          >
            Administração da frota
          </Text>
        )}

        {navItems.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + '/');
          return (
            <ChakraLink key={item.to} as={Link} to={item.to} _hover={{ textDecoration: 'none' }}>
              <Flex
                align="center"
                gap={3}
                px={6}
                py={3.5}
                borderLeftWidth="4px"
                borderColor={active ? 'brand.400' : 'transparent'}
                bg={active ? 'rgba(51,65,85,0.7)' : 'transparent'}
                color={active ? 'white' : 'gray.300'}
                borderRightRadius="full"
                transition="all 0.2s"
                _hover={{
                  bg: 'rgba(51,65,85,0.7)',
                  borderColor: 'brand.400',
                  color: 'white',
                }}
              >
                <Icon as={item.icon} boxSize={5} />
                <Text fontWeight="medium">{item.label}</Text>
              </Flex>
            </ChakraLink>
          );
        })}

        {/* Botão Sair */}
        <ChakraLink
          onClick={logout}
          _hover={{ textDecoration: 'none' }}
          mt={12}
        >
          <Flex
            align="center"
            gap={3}
            px={6}
            py={3.5}
            borderLeftWidth="4px"
            borderColor="transparent"
            color="red.300"
            borderRightRadius="full"
            transition="all 0.2s"
            _hover={{
              bg: 'rgba(127,29,29,0.5)',
              borderColor: 'red.500',
            }}
          >
            <Icon as={FaRightFromBracket} boxSize={5} />
            <Text fontWeight="medium">Sair</Text>
          </Flex>
        </ChakraLink>
      </Stack>

      {/* Footer */}
      <Box
        px={4}
        py={4}
        borderTopWidth="1px"
        borderColor="slate.700"
        bg="rgba(2,6,23,0.5)"
        textAlign="center"
      >
        <Text fontSize="xs" color="gray.500">
          © 2025 UFOPA | Energy Tech
        </Text>
      </Box>
    </Box>
  );
}
