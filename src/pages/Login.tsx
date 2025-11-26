import {
  Box,
  Button,
  Code,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBoltLightning, FaEnvelope, FaLock, FaRightToBracket } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: 'Bem-vindo de volta!', status: 'success', duration: 2000 });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast({
        title: 'Acesso negado',
        description: err?.message ?? 'Verifique suas credenciais.',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      px={4}
      bg="#0b1529"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 35%, rgba(45, 212, 191, 0.2), transparent 55%)',
        opacity: 0.7,
      }}
    >
      <Stack spacing={12} w="full" maxW="520px" textAlign="center" position="relative" zIndex={1}>
        <Stack spacing={3} color="white" align="center">
          <Flex
            borderRadius="full"
            bg="rgba(20, 184, 166, 0.2)"
            borderWidth="2px"
            borderColor="brand.400"
            color="brand.400"
            w="20"
            h="20"
            align="center"
            justify="center"
            boxShadow="focusGlow"
          >
            <Icon as={FaBoltLightning} boxSize={9} />
          </Flex>
          <Heading size="lg" letterSpacing="widest">
            LABER
          </Heading>
          <Text fontSize="sm" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="widest">
            Plataforma de Monitoramento de Energia
          </Text>
        </Stack>

        <Box
          as="form"
          onSubmit={handleSubmit}
          bg="rgba(15, 23, 42, 0.95)"
          borderRadius="3xl"
          p={{ base: 6, md: 10 }}
          borderWidth="1px"
          borderColor="whiteAlpha.100"
          boxShadow="xl"
        >
          <Stack spacing={8} color="white" textAlign="left">
            <Box>
              <Heading size="md" fontWeight="semibold">
                Acesso seguro
              </Heading>
              <Text fontSize="sm" color="whiteAlpha.600">
                Utilize as credenciais fornecidas pela equipe LABER para entrar.
              </Text>
              <Divider mt={4} borderColor="whiteAlpha.200" />
            </Box>

            <FormControl isRequired>
              <FormLabel fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="brand.200">
                Usuário (email)
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="brand.300">
                  <Icon as={FaEnvelope} />
                </InputLeftElement>
                <Input
                  type="email"
                  placeholder="admin@ufopa.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="brand.200">
                Senha
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="brand.300">
                  <Icon as={FaLock} />
                </InputLeftElement>
                <Input
                  type="password"
                  placeholder="Senha de acesso"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              size="lg"
              rightIcon={<FaRightToBracket />}
              fontWeight="bold"
              isLoading={loading}
              boxShadow="focusGlow"
            >
              ENTRAR NO PAINEL
            </Button>

            <Box bg="whiteAlpha.50" borderRadius="xl" p={4} borderWidth="1px" borderColor="whiteAlpha.100">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="whiteAlpha.600" mb={3}>
                Credenciais de teste
              </Text>
              <SimpleGrid columns={2} spacing={3} fontSize="xs" color="whiteAlpha.800">
                <Text>Administrador:</Text>
                <Code color="brand.200" bg="whiteAlpha.100">admin@laber.ufopa.br</Code>
                <Text>Senha:</Text>
                <Code color="brand.200" bg="whiteAlpha.100">admin123</Code>
                <Text>Cliente:</Text>
                <Code color="brand.200" bg="whiteAlpha.100">joao@ufopa.br</Code>
                <Text>Senha:</Text>
                <Code color="brand.200" bg="whiteAlpha.100">123456</Code>
              </SimpleGrid>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
