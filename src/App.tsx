import { Box, Flex, Heading, IconButton, Spacer, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import Dashboard from './pages/Dashboard';

export default function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('white', 'gray.800');

  return (
    <Flex direction="column" minH="100vh" bg={bg}>
      <Flex as="header" align="center" p={4} bg={headerBg} boxShadow="sm" position="sticky" top={0} zIndex={1}>
        <Heading size="md">Monitoring Dashboard</Heading>
        <Spacer />
        <IconButton
          aria-label="toggle color mode"
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          variant="ghost"
        />
      </Flex>
      <Box as="main" p={6} flex="1 1 auto">
        <Dashboard />
      </Box>
    </Flex>
  );
}
