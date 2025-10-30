import { Box, Flex } from '@chakra-ui/react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Topbar from './layout/Topbar';
import Instances from './pages/Instances';
import Dados from './pages/Dados';
import Historico from './pages/Historico';

export default function App() {
  return (
    <BrowserRouter>
      <Flex direction="column" minH="100vh">
  <Topbar userName="uL7" />
        <Flex flex="1 1 auto">
          <Sidebar />
          <Box flex="1 1 auto">
            <Routes>
            <Route path="/" element={<Navigate to="/visualizacao" replace />} />
            <Route path="/visualizacao" element={<Instances />} />
              <Route path="/dados" element={<Dados />} />
              <Route path="/historico" element={<Historico />} />
            </Routes>
          </Box>
        </Flex>
      </Flex>
    </BrowserRouter>
  );
}
