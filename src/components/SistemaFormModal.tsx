import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FiBattery, FiCpu, FiMapPin, FiPlus, FiServer, FiSun, FiTrash2, FiZap } from 'react-icons/fi';

// Tipos baseados no schema do MongoDB
export type Bateria = {
  marca: string;
  modelo: string;
  capacidade_kWh: number;
  quantidade: number;
};

export type Painel = {
  marca: string;
  modelo: string;
  capacidade_Wp: number;
  quantidade: number;
};

export type Inversor = {
  marca: string;
  modelo: string;
};

export type Controlador = {
  marca: string;
  modelo: string;
};

export type Componentes = {
  baterias: Bateria[];
  paineis: Painel[];
  inversores: Inversor[];
  controladores: Controlador[];
};

export type Subsistema = {
  _id?: string;
  tipo_sistema: 'Híbrido' | 'On-Grid' | 'Off-Grid';
  data_instalacao: string;
  componentes: Componentes;
};

export type Localizacao = {
  latitude: number;
  longitude: number;
  rua: string;
  bairro: string;
  cep: string;
};

export type SistemaFormData = {
  nome: string;
  id_cliente: string;
  localizacao: Localizacao;
  subsistema: Subsistema[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SistemaFormData) => void;
  initialData?: Partial<SistemaFormData>;
  isEditing?: boolean;
  clientes: Array<{ id: string; nome: string }>;
};

const emptyBateria: Bateria = { marca: '', modelo: '', capacidade_kWh: 0, quantidade: 1 };
const emptyPainel: Painel = { marca: '', modelo: '', capacidade_Wp: 0, quantidade: 1 };
const emptyInversor: Inversor = { marca: '', modelo: '' };
const emptyControlador: Controlador = { marca: '', modelo: '' };

const emptySubsistema: Subsistema = {
  tipo_sistema: 'Híbrido',
  data_instalacao: new Date().toISOString().split('T')[0],
  componentes: {
    baterias: [{ ...emptyBateria }],
    paineis: [{ ...emptyPainel }],
    inversores: [{ ...emptyInversor }],
    controladores: [{ ...emptyControlador }],
  },
};

const initialFormState: SistemaFormData = {
  nome: '',
  id_cliente: '',
  localizacao: {
    latitude: 0,
    longitude: 0,
    rua: '',
    bairro: '',
    cep: '',
  },
  subsistema: [{ ...emptySubsistema }],
};

const inputStyles = {
  bg: 'slate.700',
  borderColor: 'whiteAlpha.100',
  _hover: { borderColor: 'whiteAlpha.200' },
  _focus: { borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' },
};

export default function SistemaFormModal({ isOpen, onClose, onSubmit, initialData, isEditing = false, clientes }: Props) {
  const [formData, setFormData] = useState<SistemaFormData>(() => ({
    ...initialFormState,
    ...initialData,
    localizacao: { ...initialFormState.localizacao, ...initialData?.localizacao },
    subsistema: initialData?.subsistema?.length ? initialData.subsistema : [{ ...emptySubsistema }],
  }));
  const [activeSubsistema, setActiveSubsistema] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleLocalizacaoChange = (field: keyof Localizacao, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      localizacao: { ...prev.localizacao, [field]: value },
    }));
  };

  const handleSubsistemaChange = (index: number, field: keyof Subsistema, value: string) => {
    setFormData((prev) => {
      const newSubsistemas = [...prev.subsistema];
      newSubsistemas[index] = { ...newSubsistemas[index], [field]: value };
      return { ...prev, subsistema: newSubsistemas };
    });
  };

  const handleComponenteChange = <T extends keyof Componentes>(
    subsistemaIndex: number,
    componentType: T,
    componentIndex: number,
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => {
      const newSubsistemas = [...prev.subsistema];
      const componentes = { ...newSubsistemas[subsistemaIndex].componentes };
      const items = [...componentes[componentType]];
      items[componentIndex] = { ...items[componentIndex], [field]: value };
      componentes[componentType] = items as Componentes[T];
      newSubsistemas[subsistemaIndex] = { ...newSubsistemas[subsistemaIndex], componentes };
      return { ...prev, subsistema: newSubsistemas };
    });
  };

  const addComponente = <T extends keyof Componentes>(subsistemaIndex: number, componentType: T) => {
    const emptyItems = {
      baterias: { ...emptyBateria },
      paineis: { ...emptyPainel },
      inversores: { ...emptyInversor },
      controladores: { ...emptyControlador },
    };
    setFormData((prev) => {
      const newSubsistemas = [...prev.subsistema];
      const componentes = { ...newSubsistemas[subsistemaIndex].componentes };
      componentes[componentType] = [...componentes[componentType], emptyItems[componentType]] as Componentes[T];
      newSubsistemas[subsistemaIndex] = { ...newSubsistemas[subsistemaIndex], componentes };
      return { ...prev, subsistema: newSubsistemas };
    });
  };

  const removeComponente = <T extends keyof Componentes>(subsistemaIndex: number, componentType: T, componentIndex: number) => {
    setFormData((prev) => {
      const newSubsistemas = [...prev.subsistema];
      const componentes = { ...newSubsistemas[subsistemaIndex].componentes };
      const items = [...componentes[componentType]];
      if (items.length > 1) {
        items.splice(componentIndex, 1);
        componentes[componentType] = items as Componentes[T];
        newSubsistemas[subsistemaIndex] = { ...newSubsistemas[subsistemaIndex], componentes };
      }
      return { ...prev, subsistema: newSubsistemas };
    });
  };

  const addSubsistema = () => {
    setFormData((prev) => ({
      ...prev,
      subsistema: [...prev.subsistema, { ...emptySubsistema }],
    }));
    setActiveSubsistema(formData.subsistema.length);
  };

  const removeSubsistema = (index: number) => {
    if (formData.subsistema.length > 1) {
      setFormData((prev) => ({
        ...prev,
        subsistema: prev.subsistema.filter((_, i) => i !== index),
      }));
      if (activeSubsistema >= formData.subsistema.length - 1) {
        setActiveSubsistema(Math.max(0, activeSubsistema - 1));
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast({ title: 'Nome é obrigatório', status: 'error', duration: 3000 });
      return;
    }
    if (!formData.localizacao.rua.trim()) {
      toast({ title: 'Endereço é obrigatório', status: 'error', duration: 3000 });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast({
        title: isEditing ? 'Sistema atualizado!' : 'Sistema cadastrado!',
        status: 'success',
        duration: 3000,
      });
      onClose();
      setFormData(initialFormState);
    } catch {
      toast({ title: 'Erro ao salvar sistema', status: 'error', duration: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormState);
    setActiveSubsistema(0);
    onClose();
  };

  const currentSubsistema = formData.subsistema[activeSubsistema];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl" scrollBehavior="inside" isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
      <ModalContent bg="slate.800" borderWidth="1px" borderColor="whiteAlpha.100" borderRadius="2xl" maxH="90vh">
        <ModalHeader borderBottomWidth="1px" borderColor="whiteAlpha.100" pb={4}>
          <HStack spacing={3}>
            <Box p={2} borderRadius="lg" bg="teal.500/20">
              <Icon as={FiServer} color="teal.400" boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="bold">
                {isEditing ? 'Editar Sistema' : 'Novo Sistema Fotovoltaico'}
              </Text>
              <Text fontSize="sm" color="gray.400" fontWeight="normal">
                Cadastro completo com subsistemas e componentes
              </Text>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="gray.400" />

        <ModalBody py={6}>
          <Stack spacing={6}>
            {/* Informações Básicas */}
            <Box>
              <SectionHeader icon={FiServer} title="Informações Básicas" />
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.300">Nome do Sistema</FormLabel>
                  <Input
                    placeholder="Ex: Casa Sede"
                    value={formData.nome}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                    {...inputStyles}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">Cliente Vinculado</FormLabel>
                  <Select
                    placeholder="Selecione um cliente"
                    value={formData.id_cliente}
                    onChange={(e) => setFormData((prev) => ({ ...prev, id_cliente: e.target.value }))}
                    bg="slate.700"
                    borderColor="whiteAlpha.100"
                  >
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Localização */}
            <Box>
              <SectionHeader icon={FiMapPin} title="Localização" />
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired gridColumn={{ md: 'span 2' }}>
                  <FormLabel fontSize="sm" color="gray.300">Endereço</FormLabel>
                  <Input
                    placeholder="Av. Tapajós, 2000"
                    value={formData.localizacao.rua}
                    onChange={(e) => handleLocalizacaoChange('rua', e.target.value)}
                    {...inputStyles}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">Bairro</FormLabel>
                  <Input
                    placeholder="Aldeia"
                    value={formData.localizacao.bairro}
                    onChange={(e) => handleLocalizacaoChange('bairro', e.target.value)}
                    {...inputStyles}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">CEP</FormLabel>
                  <Input
                    placeholder="68040-000"
                    value={formData.localizacao.cep}
                    onChange={(e) => handleLocalizacaoChange('cep', e.target.value)}
                    {...inputStyles}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">Latitude</FormLabel>
                  <NumberInput
                    value={formData.localizacao.latitude}
                    onChange={(_, val) => handleLocalizacaoChange('latitude', val || 0)}
                    precision={6}
                    step={0.001}
                  >
                    <NumberInputField {...inputStyles} />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.300">Longitude</FormLabel>
                  <NumberInput
                    value={formData.localizacao.longitude}
                    onChange={(_, val) => handleLocalizacaoChange('longitude', val || 0)}
                    precision={6}
                    step={0.001}
                  >
                    <NumberInputField {...inputStyles} />
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
            </Box>

            <Divider borderColor="whiteAlpha.100" />

            {/* Subsistemas */}
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <SectionHeader icon={FiCpu} title="Subsistemas" />
                <Button
                  size="sm"
                  leftIcon={<FiPlus />}
                  onClick={addSubsistema}
                  variant="outline"
                  colorScheme="teal"
                >
                  Adicionar Subsistema
                </Button>
              </Flex>

              {/* Tabs de Subsistemas */}
              <HStack spacing={2} mb={4} overflowX="auto" pb={2}>
                {formData.subsistema.map((_, idx) => (
                  <HStack key={idx} spacing={0}>
                    <Button
                      size="sm"
                      variant={activeSubsistema === idx ? 'solid' : 'outline'}
                      colorScheme={activeSubsistema === idx ? 'teal' : 'gray'}
                      onClick={() => setActiveSubsistema(idx)}
                      borderRightRadius={formData.subsistema.length > 1 ? 0 : 'md'}
                    >
                      Subsistema {idx + 1}
                    </Button>
                    {formData.subsistema.length > 1 && (
                      <IconButton
                        aria-label="Remover"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        borderLeftRadius={0}
                        onClick={() => removeSubsistema(idx)}
                      />
                    )}
                  </HStack>
                ))}
              </HStack>

              {currentSubsistema && (
                <Stack spacing={5} bg="slate.700/50" p={4} borderRadius="xl" borderWidth="1px" borderColor="whiteAlpha.100">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.300">Tipo do Sistema</FormLabel>
                      <Select
                        value={currentSubsistema.tipo_sistema}
                        onChange={(e) => handleSubsistemaChange(activeSubsistema, 'tipo_sistema', e.target.value)}
                        bg="slate.700"
                        borderColor="whiteAlpha.100"
                      >
                        <option value="Híbrido">Híbrido</option>
                        <option value="On-Grid">On-Grid</option>
                        <option value="Off-Grid">Off-Grid</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.300">Data de Instalação</FormLabel>
                      <Input
                        type="date"
                        value={currentSubsistema.data_instalacao}
                        onChange={(e) => handleSubsistemaChange(activeSubsistema, 'data_instalacao', e.target.value)}
                        {...inputStyles}
                      />
                    </FormControl>
                  </SimpleGrid>

                  {/* Painéis */}
                  <ComponentSection
                    title="Painéis Solares"
                    icon={FiSun}
                    iconColor="yellow.400"
                    onAdd={() => addComponente(activeSubsistema, 'paineis')}
                  >
                    {currentSubsistema.componentes.paineis.map((item, idx) => (
                      <SimpleGrid columns={{ base: 2, md: 5 }} spacing={3} key={idx}>
                        <Input placeholder="Marca" value={item.marca} onChange={(e) => handleComponenteChange(activeSubsistema, 'paineis', idx, 'marca', e.target.value)} size="sm" {...inputStyles} />
                        <Input placeholder="Modelo" value={item.modelo} onChange={(e) => handleComponenteChange(activeSubsistema, 'paineis', idx, 'modelo', e.target.value)} size="sm" {...inputStyles} />
                        <NumberInput value={item.capacidade_Wp} onChange={(_, val) => handleComponenteChange(activeSubsistema, 'paineis', idx, 'capacidade_Wp', val || 0)} size="sm" min={0}>
                          <NumberInputField placeholder="Wp" {...inputStyles} />
                          <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                        </NumberInput>
                        <NumberInput value={item.quantidade} onChange={(_, val) => handleComponenteChange(activeSubsistema, 'paineis', idx, 'quantidade', val || 1)} size="sm" min={1}>
                          <NumberInputField placeholder="Qtd" {...inputStyles} />
                          <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                        </NumberInput>
                        <IconButton aria-label="Remover" icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost" onClick={() => removeComponente(activeSubsistema, 'paineis', idx)} isDisabled={currentSubsistema.componentes.paineis.length <= 1} />
                      </SimpleGrid>
                    ))}
                  </ComponentSection>

                  {/* Baterias */}
                  <ComponentSection
                    title="Baterias"
                    icon={FiBattery}
                    iconColor="green.400"
                    onAdd={() => addComponente(activeSubsistema, 'baterias')}
                  >
                    {currentSubsistema.componentes.baterias.map((item, idx) => (
                      <SimpleGrid columns={{ base: 2, md: 5 }} spacing={3} key={idx}>
                        <Input placeholder="Marca" value={item.marca} onChange={(e) => handleComponenteChange(activeSubsistema, 'baterias', idx, 'marca', e.target.value)} size="sm" {...inputStyles} />
                        <Input placeholder="Modelo" value={item.modelo} onChange={(e) => handleComponenteChange(activeSubsistema, 'baterias', idx, 'modelo', e.target.value)} size="sm" {...inputStyles} />
                        <NumberInput value={item.capacidade_kWh} onChange={(_, val) => handleComponenteChange(activeSubsistema, 'baterias', idx, 'capacidade_kWh', val || 0)} size="sm" min={0} precision={1} step={0.5}>
                          <NumberInputField placeholder="kWh" {...inputStyles} />
                          <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                        </NumberInput>
                        <NumberInput value={item.quantidade} onChange={(_, val) => handleComponenteChange(activeSubsistema, 'baterias', idx, 'quantidade', val || 1)} size="sm" min={1}>
                          <NumberInputField placeholder="Qtd" {...inputStyles} />
                          <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                        </NumberInput>
                        <IconButton aria-label="Remover" icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost" onClick={() => removeComponente(activeSubsistema, 'baterias', idx)} isDisabled={currentSubsistema.componentes.baterias.length <= 1} />
                      </SimpleGrid>
                    ))}
                  </ComponentSection>

                  {/* Inversores */}
                  <ComponentSection
                    title="Inversores"
                    icon={FiZap}
                    iconColor="blue.400"
                    onAdd={() => addComponente(activeSubsistema, 'inversores')}
                  >
                    {currentSubsistema.componentes.inversores.map((item, idx) => (
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} key={idx}>
                        <Input placeholder="Marca" value={item.marca} onChange={(e) => handleComponenteChange(activeSubsistema, 'inversores', idx, 'marca', e.target.value)} size="sm" {...inputStyles} />
                        <Input placeholder="Modelo" value={item.modelo} onChange={(e) => handleComponenteChange(activeSubsistema, 'inversores', idx, 'modelo', e.target.value)} size="sm" {...inputStyles} />
                        <IconButton aria-label="Remover" icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost" onClick={() => removeComponente(activeSubsistema, 'inversores', idx)} isDisabled={currentSubsistema.componentes.inversores.length <= 1} />
                      </SimpleGrid>
                    ))}
                  </ComponentSection>

                  {/* Controladores */}
                  <ComponentSection
                    title="Controladores"
                    icon={FiCpu}
                    iconColor="purple.400"
                    onAdd={() => addComponente(activeSubsistema, 'controladores')}
                  >
                    {currentSubsistema.componentes.controladores.map((item, idx) => (
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} key={idx}>
                        <Input placeholder="Marca" value={item.marca} onChange={(e) => handleComponenteChange(activeSubsistema, 'controladores', idx, 'marca', e.target.value)} size="sm" {...inputStyles} />
                        <Input placeholder="Modelo" value={item.modelo} onChange={(e) => handleComponenteChange(activeSubsistema, 'controladores', idx, 'modelo', e.target.value)} size="sm" {...inputStyles} />
                        <IconButton aria-label="Remover" icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost" onClick={() => removeComponente(activeSubsistema, 'controladores', idx)} isDisabled={currentSubsistema.componentes.controladores.length <= 1} />
                      </SimpleGrid>
                    ))}
                  </ComponentSection>
                </Stack>
              )}
            </Box>
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
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Sistema'}
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

function ComponentSection({
  title,
  icon: IconComponent,
  iconColor,
  onAdd,
  children,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={2}>
        <HStack spacing={2}>
          <Icon as={IconComponent} color={iconColor} boxSize={4} />
          <Text fontSize="sm" fontWeight="medium" color="gray.300">{title}</Text>
        </HStack>
        <Button size="xs" leftIcon={<FiPlus />} variant="ghost" colorScheme="teal" onClick={onAdd}>
          Adicionar
        </Button>
      </Flex>
      <Stack spacing={2}>{children}</Stack>
    </Box>
  );
}
