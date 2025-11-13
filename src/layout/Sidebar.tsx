import { Box, Flex, Icon, Link as ChakraLink, Text, VStack } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { ViewIcon } from '@chakra-ui/icons';
import { MdDataUsage, MdHistory, MdCode } from 'react-icons/md';

const items = [
  { to: '/visualizacao', label: 'Visualização', icon: ViewIcon },
  { to: '/dados', label: 'Dados', icon: MdDataUsage },
  { to: '/historico', label: 'Histórico', icon: MdHistory },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  return (
    <Box as="nav" w={{ base: '64', md: '64' }} bg="gray.800" borderRightWidth="1px" borderColor="gray.700" p={4}>
      <VStack align="stretch" spacing={1}>
        {items.map((it) => {
          const active = pathname === it.to;
          return (
            <ChakraLink
              as={Link}
              key={it.to}
              to={it.to}
              _hover={{ textDecoration: 'none' }}
              _activeLink={{}}
            >
              <Flex
                align="center"
                gap={3}
                px={3}
                py={2}
                borderRadius="md"
                bg={active ? 'gray.700' : 'transparent'}
                color={active ? 'blue.400' : 'gray.200'}
                _hover={{ bg: 'gray.700' }}
              >
                <Icon as={it.icon} />
                <Text fontWeight={active ? 'semibold' : 'normal'}>{it.label}</Text>
              </Flex>
            </ChakraLink>
          );
        })}
      </VStack>
    </Box>
  );
}
