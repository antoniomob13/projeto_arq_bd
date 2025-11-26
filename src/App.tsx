import { Box, Flex } from '@chakra-ui/react';
import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Topbar from './layout/Topbar';
import Dashboard from './pages/Dashboard';
import Sistemas from './pages/Instances';
import Clientes from './pages/Historico';
import Equipments from './pages/Equipments';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sistemas" element={<Sistemas />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/equipamentos" element={<Equipments />} />
          <Route path="/analises" element={<Analytics />} />
          {/* Rotas antigas redirecionando para as novas */}
          <Route path="/visualizacao" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dados" element={<Navigate to="/sistemas" replace />} />
          <Route path="/historico" element={<Navigate to="/clientes" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Flex h="100vh" overflow="hidden" bg="slate.900" color="gray.100">
      <Sidebar />
      <Flex direction="column" flex="1" overflow="hidden" position="relative" bg="slate.900">
        <Topbar />
        <Box as="main" flex="1" overflowX="hidden" overflowY="auto" bg="slate.900" color="gray.100" p={{ base: 6, md: 10 }}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}
