import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FiHome, FiMail, FiPhone, FiUser } from 'react-icons/fi';

// Tipos baseados no schema do MongoDB
export type Endereco = {
  rua?: string;
  bairro?: string;
  complemento?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
};

export type ClienteFormData = {
  nome: string;
  cpf_cnpj: string;
  tipo_pessoa: 'F' | 'J';
  data_nasc: string;
  telefone: string;
  email: string;
  senha: string;
  endereco: Endereco;
  status: 'ativo' | 'inativo';
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClienteFormData) => void;
  initialData?: Partial<ClienteFormData>;
  isEditing?: boolean;
};

const initialFormState: ClienteFormData = {
  nome: '',
  cpf_cnpj: '',
  tipo_pessoa: 'F',
  data_nasc: '',
  telefone: '',
  email: '',
  senha: '',
  endereco: {
    rua: '',
    bairro: '',
    complemento: '',
    cep: '',
    cidade: 'Santarém',
    estado: 'PA',
  },
  status: 'ativo',
};

const inputStyles = {
  bg: 'slate.700',
  borderColor: 'whiteAlpha.100',
  _hover: { borderColor: 'whiteAlpha.200' },
  _focus: { borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' },
};

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export default function ClienteFormModal({ isOpen, onClose, onSubmit, initialData, isEditing = false }: Props) {
  const [formData, setFormData] = useState<ClienteFormData>(() => ({
    ...initialFormState,
    ...initialData,
    endereco: { ...initialFormState.endereco, ...initialData?.endereco },
  }));
  const [confirmSenha, setConfirmSenha] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleChange = (field: keyof ClienteFormData, value: string | boolean) => {
    if (field === 'status') {
      setFormData((prev) => ({ ...prev, status: value ? 'ativo' : 'inativo' }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleEnderecoChange = (field: keyof Endereco, value: string) => {
    setFormData((prev) => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value },
    }));
  };

  // Formatar CPF/CNPJ
  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (formData.tipo_pessoa === 'F') {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14);
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
        .slice(0, 18);
    }
  };

  // Formatar Telefone
  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15);
    }
  };

  // Formatar CEP
  const formatCep = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.nome.trim()) {
      toast({ title: 'Nome é obrigatório', status: 'error', duration: 3000 });
      return;
    }
    if (!formData.cpf_cnpj.trim()) {
      toast({ title: `${formData.tipo_pessoa === 'F' ? 'CPF' : 'CNPJ'} é obrigatório`, status: 'error', duration: 3000 });
      return;
    }
    if (!formData.email.trim()) {
      toast({ title: 'Email é obrigatório', status: 'error', duration: 3000 });
      return;
    }
    if (!formData.email.includes('@')) {
      toast({ title: 'Email inválido', status: 'error', duration: 3000 });
      return;
    }
    if (!isEditing && !formData.senha) {
      toast({ title: 'Senha é obrigatória', status: 'error', duration: 3000 });
      return;
    }
    if (!isEditing && formData.senha.length < 6) {
      toast({ title: 'Senha deve ter pelo menos 6 caracteres', status: 'error', duration: 3000 });
      return;
    }
    if (!isEditing && formData.senha !== confirmSenha) {
      toast({ title: 'As senhas não coincidem', status: 'error', duration: 3000 });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast({
        title: isEditing ? 'Cliente atualizado!' : 'Cliente cadastrado!',
        status: 'success',
        duration: 3000,
      });
      onClose();
      setFormData(initialFormState);
      setConfirmSenha('');
    } catch {
      toast({ title: 'Erro ao salvar cliente', status: 'error', duration: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormState);
    setConfirmSenha('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="3xl" scrollBehavior="inside" isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
      <ModalContent bg="slate.800" borderWidth="1px" borderColor="whiteAlpha.100" borderRadius="2xl" maxH="90vh">
        <ModalHeader borderBottomWidth="1px" borderColor="whiteAlpha.100" pb={4}>
          <HStack spacing={3}>
            <Box p={2} borderRadius="lg" bg="blue.500/20">
              <Icon as={FiUser} color="blue.400" boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="bold">
                {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
              </Text>
              <Text fontSize="sm" color="gray.400" fontWeight="normal">
                Cadastro completo de pessoa física ou jurídica
              </Text>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="gray.400" />

        <ModalBody py={6}>
          <Stack spacing={6}>
            {/* Tipo de Pessoa */}
            <FormControl>
              <FormLabel fontSize="sm" color="gray.300">Tipo de Pessoa</FormLabel>
              <RadioGroup
                value={formData.tipo_pessoa}
                onChange={(val) => {
                  handleChange('tipo_pessoa', val);
                  handleChange('cpf_cnpj', ''); // Limpa o campo ao trocar
                }}
              >
                <HStack spacing={6}>
                  <Radio value="F" colorScheme="teal">
                    <Text color="gray.300">Pessoa Física</Text>
                  </Radio>
                  <Radio value="J" colorScheme="teal">
                    <Text color="gray.300">Pessoa Jurídica</Text>
                  </Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            {/* Informações Pessoais */}
            <Box>
              <SectionHeader icon={FiUser} title="Informações Pessoais" />
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired gridColumn={{ md: 'span 2' }}>
                  <FormLabel fontSize="sm" color="gray.300">
                    {formData.tipo_pessoa === 'F' ? 'Nome Completo' : 'Razão Social'}
                  </FormLabel>
                  <Input
                    placeholder={formData.tipo_pessoa === 'F' ? 'João da Silva' : 'Empresa LTDA'}
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    {...inputStyles}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.300">
                    {formData.tipo_pessoa === 'F' ? 'CPF' : 'CNPJ'}
                  </FormLabel>
                  <Input
                    placeholder={formData.tipo_pessoa === 'F' ? '000.000.000-00' : '00.000.000/0000-00'}
                    value={formData.cpf_cnpj}
                    onChange={(e) => handleChange('cpf_cnpj', formatCpfCnpj(e.target.value))}
                    {...inputStyles}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">
                    {formData.tipo_pessoa === 'F' ? 'Data de Nascimento' : 'Data de Fundação'}
                  </FormLabel>
                  <Input
                    type="date"
                    value={formData.data_nasc}
                    onChange={(e) => handleChange('data_nasc', e.target.value)}
                    {...inputStyles}
                  />
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Contato */}
            <Box>
              <SectionHeader icon={FiPhone} title="Contato" />
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">Telefone</FormLabel>
                  <Input
                    placeholder="(93) 99123-4567"
                    value={formData.telefone}
                    onChange={(e) => handleChange('telefone', formatTelefone(e.target.value))}
                    {...inputStyles}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.300">
                    <HStack spacing={1}>
                      <Icon as={FiMail} />
                      <Text>Email</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    {...inputStyles}
                  />
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Credenciais */}
            {!isEditing && (
              <Box>
                <SectionHeader icon={FiUser} title="Credenciais de Acesso" />
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="gray.300">Senha</FormLabel>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.senha}
                      onChange={(e) => handleChange('senha', e.target.value)}
                      {...inputStyles}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="gray.300">Confirmar Senha</FormLabel>
                    <Input
                      type="password"
                      placeholder="Repita a senha"
                      value={confirmSenha}
                      onChange={(e) => setConfirmSenha(e.target.value)}
                      {...inputStyles}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
            )}

            <Divider borderColor="whiteAlpha.100" />

            {/* Endereço */}
            <Box>
              <SectionHeader icon={FiHome} title="Endereço" />
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl gridColumn={{ md: 'span 2' }}>
                  <FormLabel fontSize="sm" color="gray.300">Rua / Logradouro</FormLabel>
                  <Input
                    placeholder="Rua das Flores, 123"
                    value={formData.endereco.rua}
                    onChange={(e) => handleEnderecoChange('rua', e.target.value)}
                    {...inputStyles}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">Bairro</FormLabel>
                  <Input
                    placeholder="Centro"
                    value={formData.endereco.bairro}
                    onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                    {...inputStyles}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">Complemento</FormLabel>
                  <Input
                    placeholder="Apto 101"
                    value={formData.endereco.complemento}
                    onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                    {...inputStyles}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">CEP</FormLabel>
                  <Input
                    placeholder="68000-000"
                    value={formData.endereco.cep}
                    onChange={(e) => handleEnderecoChange('cep', formatCep(e.target.value))}
                    {...inputStyles}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">Cidade</FormLabel>
                  <Input
                    placeholder="Santarém"
                    value={formData.endereco.cidade}
                    onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                    {...inputStyles}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">Estado</FormLabel>
                  <Select
                    value={formData.endereco.estado}
                    onChange={(e) => handleEnderecoChange('estado', e.target.value)}
                    bg="slate.700"
                    borderColor="whiteAlpha.100"
                  >
                    {estados.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Status */}
            <FormControl>
              <FormLabel fontSize="sm" color="gray.300">Status da Conta</FormLabel>
              <HStack spacing={3}>
                <Switch
                  colorScheme="teal"
                  isChecked={formData.status === 'ativo'}
                  onChange={(e) => handleChange('status', e.target.checked)}
                />
                <Text fontSize="sm" color={formData.status === 'ativo' ? 'green.400' : 'gray.500'}>
                  {formData.status === 'ativo' ? 'Conta Ativa' : 'Conta Inativa'}
                </Text>
              </HStack>
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor="whiteAlpha.100" pt={4}>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose} color="gray.400" _hover={{ bg: 'whiteAlpha.100' }}>
              Cancelar
            </Button>
            <Button
              bg="teal.500"
              color="white"
              _hover={{ bg: 'teal.400' }}
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Salvando..."
            >
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function SectionHeader({ icon: IconComponent, title }: { icon: React.ElementType; title: string }) {
  return (
    <HStack spacing={2} mb={3}>
      <Icon as={IconComponent} color="teal.400" />
      <Heading size="sm" fontWeight="semibold" color="teal.400" textTransform="uppercase" letterSpacing="wide">
        {title}
      </Heading>
    </HStack>
  );
}
