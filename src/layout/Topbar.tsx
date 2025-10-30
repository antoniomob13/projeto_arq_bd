import { Box, Flex, HStack, Spacer, Text } from '@chakra-ui/react';
import { MdAccountCircle } from 'react-icons/md';

export default function Topbar({ userName = 'Usuário' }: { userName?: string }) {
  return (
    <Box as="header" bg="teal.800" borderBottomWidth="1px" borderColor="gray.700" px={4} py={2}>
      <Flex align="center" gap={4}>
        <Text fontWeight="semibold">Monitor Manager</Text>
        <Spacer />
        <HStack spacing={2}>
          <MdAccountCircle size={22} />
          <Text>{userName}</Text>
        </HStack>
      </Flex>
    </Box>
  );
}
