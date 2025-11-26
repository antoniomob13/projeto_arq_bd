import { Box, Flex, Icon, Image, Text } from '@chakra-ui/react';
import { FaCircleUser } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { user } = useAuth();

  return (
    <Flex
      as="header"
      h="16"
      bg="slate.800"
      borderBottomWidth="1px"
      borderColor="rgba(51,65,85,0.5)"
      px={6}
      align="center"
      justify="space-between"
      boxShadow="xl"
      zIndex={10}
    >
      {/* Logo UFOPA */}
      <Flex align="center">
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Marca_UFOPA_2010.jpg/1200px-Marca_UFOPA_2010.jpg"
          alt="Logo UFOPA"
          h={8}
          w="auto"
          opacity={0.8}
          filter="grayscale(1)"
          transition="all 0.2s"
          _hover={{ filter: 'grayscale(0)' }}
        />
      </Flex>

      {/* Usuário */}
      <Flex
        align="center"
        cursor="pointer"
        p={2}
        borderRadius="xl"
        transition="all 0.2s"
        _hover={{ bg: 'rgba(51,65,85,0.7)' }}
      >
        <Box textAlign="right" mr={4} display={{ base: 'none', sm: 'block' }}>
          <Text fontSize="base" fontWeight="semibold" color="gray.100">
            {user?.name ?? 'Nome do Usuário'}
          </Text>
          <Text fontSize="xs" color="brand.400" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">
            {user?.role === 'admin' ? 'Administrador LABER' : 'Beneficiário'}
          </Text>
        </Box>
        <Flex
          h={10}
          w={10}
          borderRadius="full"
          bg="teal.800"
          color="brand.400"
          align="center"
          justify="center"
          borderWidth="2px"
          borderColor="teal.600"
          boxShadow="lg"
        >
          <Icon as={FaCircleUser} boxSize={5} />
        </Flex>
      </Flex>
    </Flex>
  );
}
