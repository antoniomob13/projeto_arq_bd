import {
  Box,
  Button,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Grid,
  Divider,
  NumberInput,
  NumberInputField,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { apiPost } from '../api/client';

export default function Dados() {
  const addDisc = useDisclosure();
  const addSysDisc = useDisclosure();
  const editDisc = useDisclosure();
  const delDisc = useDisclosure();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleAddCliente(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const payload = {
        nome: fd.get('nome') as string,
        cpf_cnpj: fd.get('cpf_cnpj') as string,
        tipo_pessoa: fd.get('tipo_pessoa') as string,
        data_nasc: fd.get('data_nasc') ? new Date(fd.get('data_nasc') as string) : undefined,
        telefone: fd.get('telefone') as string,
        email: fd.get('email') as string,
        endereco: {
          rua: fd.get('endereco.rua') as string,
          bairro: fd.get('endereco.bairro') as string,
          complemento: fd.get('endereco.complemento') as string,
          cep: fd.get('endereco.cep') as string,
          cidade: fd.get('endereco.cidade') as string,
          estado: fd.get('endereco.estado') as string,
        },
      };
      await apiPost('/clientes', payload);
      toast({ title: 'Cliente adicionado!', status: 'success', duration: 3000 });
      addDisc.onClose();
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast({ title: 'Erro ao adicionar', description: err.message, status: 'error', duration: 5000 });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSistema(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const payload = {
        id_cliente: fd.get('id_cliente') as string,
        nome: fd.get('nome') as string,
        localizacao: {
          latitude: parseFloat(fd.get('localizacao.latitude') as string) || 0,
          longitude: parseFloat(fd.get('localizacao.longitude') as string) || 0,
          rua: fd.get('localizacao.rua') as string,
          bairro: fd.get('localizacao.bairro') as string,
          cep: fd.get('localizacao.cep') as string,
        },
        subsistema: [
          {
            tipo_sistema: fd.get('subsistema.0.tipo_sistema') as string,
            data_instalacao: fd.get('subsistema.0.data_instalacao')
              ? new Date(fd.get('subsistema.0.data_instalacao') as string)
              : undefined,
            componentes: {
              baterias: [
                {
                  marca: fd.get('subsistema.0.componentes.baterias.0.marca') as string,
                  modelo: fd.get('subsistema.0.componentes.baterias.0.modelo') as string,
                  capacidade_kWh: parseFloat(fd.get('subsistema.0.componentes.baterias.0.capacidade_kWh') as string) || 0,
                  quantidade: parseInt(fd.get('subsistema.0.componentes.baterias.0.quantidade') as string) || 0,
                },
              ],
              paineis: [
                {
                  marca: fd.get('subsistema.0.componentes.paineis.0.marca') as string,
                  modelo: fd.get('subsistema.0.componentes.paineis.0.modelo') as string,
                  capacidade_Wp: parseFloat(fd.get('subsistema.0.componentes.paineis.0.capacidade_Wp') as string) || 0,
                  quantidade: parseInt(fd.get('subsistema.0.componentes.paineis.0.quantidade') as string) || 0,
                },
              ],
              inversores: [
                {
                  marca: fd.get('subsistema.0.componentes.inversores.0.marca') as string,
                  modelo: fd.get('subsistema.0.componentes.inversores.0.modelo') as string,
                },
              ],
              controladores: [
                {
                  marca: fd.get('subsistema.0.componentes.controladores.0.marca') as string,
                  modelo: fd.get('subsistema.0.componentes.controladores.0.modelo') as string,
                },
              ],
            },
          },
        ],
      };
      await apiPost('/sistemas', payload);
      toast({ title: 'Sistema adicionado!', status: 'success', duration: 3000 });
      addSysDisc.onClose();
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast({ title: 'Erro ao adicionar', description: err.message, status: 'error', duration: 5000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={2} fontWeight="semibold">Dados</Text>
      <Text color="gray.400" mb={4}>Adicione clientes e sistemas ao banco de dados.</Text>

      <Box display="flex" gap={3} flexWrap="wrap">
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={addDisc.onOpen}>
          Adicionar cliente
        </Button>
        <Button leftIcon={<AddIcon />} variant="outline" onClick={addSysDisc.onOpen}>
          Adicionar sistema
        </Button>
        <Button leftIcon={<EditIcon />} variant="outline" onClick={editDisc.onOpen}>
          Editar
        </Button>
        <Button leftIcon={<DeleteIcon />} colorScheme="red" variant="outline" onClick={delDisc.onOpen}>
          Excluir
        </Button>
      </Box>

      {/* Modal Adicionar Cliente */}
      <Modal isOpen={addDisc.isOpen} onClose={addDisc.onClose} isCentered size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Adicionar cliente</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ClienteForm onSubmit={handleAddCliente} loading={loading} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal Adicionar Sistema */}
      <Modal isOpen={addSysDisc.isOpen} onClose={addSysDisc.onClose} isCentered size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Adicionar sistema</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SistemaForm onSubmit={handleAddSistema} loading={loading} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal Editar (somente layout) */}
      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} isCentered size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar cliente</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color="gray.500" mb={4}>Somente layout. Nenhuma alteração será salva.</Text>
            <ClienteForm onSubmit={(e) => e.preventDefault()} loading={false} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={editDisc.onClose} variant="ghost">Fechar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Excluir (somente layout) */}
      <Modal isOpen={delDisc.isOpen} onClose={delDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Excluir cliente</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Somente layout. Confirme para fechar.</Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={delDisc.onClose} variant="ghost" mr={3}>Cancelar</Button>
            <Button colorScheme="red" onClick={delDisc.onClose}>Excluir</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function ClienteForm({ onSubmit, loading }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; loading: boolean }) {
  return (
    <Box as="form" onSubmit={onSubmit}>
      <Text fontWeight="semibold" mb={3}>Cliente</Text>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <FormControl isRequired>
          <FormLabel>Nome</FormLabel>
          <Input name="nome" placeholder="João da Silva" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>CPF/CNPJ</FormLabel>
          <Input name="cpf_cnpj" placeholder="123.456.789-00" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Tipo de pessoa</FormLabel>
          <Select name="tipo_pessoa" defaultValue="F">
            <option value="F">Física</option>
            <option value="J">Jurídica</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Data de nascimento</FormLabel>
          <Input name="data_nasc" type="date" />
        </FormControl>
        <FormControl>
          <FormLabel>Telefone</FormLabel>
          <Input name="telefone" placeholder="+5593991234567" />
        </FormControl>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input name="email" type="email" placeholder="email@dominio.com" />
        </FormControl>
      </Grid>

      <Divider my={6} />
      <Text fontWeight="semibold" mb={3}>Endereço</Text>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <FormControl gridColumn={{ md: 'span 2' }}>
          <FormLabel>Rua</FormLabel>
          <Input name="endereco.rua" placeholder="Rua das Flores, 123" />
        </FormControl>
        <FormControl>
          <FormLabel>Bairro</FormLabel>
          <Input name="endereco.bairro" placeholder="Centro" />
        </FormControl>
        <FormControl>
          <FormLabel>Complemento</FormLabel>
          <Input name="endereco.complemento" placeholder="Apto 101" />
        </FormControl>
        <FormControl>
          <FormLabel>CEP</FormLabel>
          <Input name="endereco.cep" placeholder="68000-000" />
        </FormControl>
        <FormControl>
          <FormLabel>Cidade</FormLabel>
          <Input name="endereco.cidade" placeholder="Santarém" />
        </FormControl>
        <FormControl>
          <FormLabel>Estado</FormLabel>
          <Input name="endereco.estado" placeholder="PA" />
        </FormControl>
      </Grid>
      <Divider my={6} />
      <Button type="submit" colorScheme="blue" isLoading={loading} w="full">Salvar cliente</Button>
    </Box>
  );
}

function SistemaForm({ onSubmit, loading }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; loading: boolean }) {
  return (
    <Box as="form" onSubmit={onSubmit}>
      <Text fontWeight="semibold" mb={3}>Sistema</Text>

      {/* Identificação */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <FormControl>
          <FormLabel>ID do Cliente (ObjectId)</FormLabel>
          <Input name="id_cliente" placeholder="cliente_183" />
        </FormControl>
        <FormControl gridColumn={{ md: 'span 2' }}>
          <FormLabel>Nome do sistema</FormLabel>
          <Input name="nome" placeholder="Casa Sede" />
        </FormControl>
      </Grid>

      <Divider my={6} />
      <Text fontWeight="semibold" mb={3}>Localização</Text>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <FormControl>
          <FormLabel>Latitude</FormLabel>
          <NumberInput>
            <NumberInputField name="localizacao.latitude" placeholder="-2.443" />
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>Longitude</FormLabel>
          <NumberInput>
            <NumberInputField name="localizacao.longitude" placeholder="-54.708" />
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>CEP</FormLabel>
          <Input name="localizacao.cep" placeholder="68040-000" />
        </FormControl>
        <FormControl gridColumn={{ md: 'span 2' }}>
          <FormLabel>Rua</FormLabel>
          <Input name="localizacao.rua" placeholder="Av. Tapajós, 2000" />
        </FormControl>
        <FormControl>
          <FormLabel>Bairro</FormLabel>
          <Input name="localizacao.bairro" placeholder="Aldeia" />
        </FormControl>
      </Grid>

      <Divider my={6} />
      <Text fontWeight="semibold" mb={3}>Subsistema (1º item)</Text>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <FormControl>
          <FormLabel>Tipo do sistema</FormLabel>
          <Select name="subsistema.0.tipo_sistema" defaultValue="Híbrido">
            <option>Híbrido</option>
            <option>On-Grid</option>
            <option>Off-Grid</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Data de instalação</FormLabel>
          <Input type="date" name="subsistema.0.data_instalacao" />
        </FormControl>
      </Grid>

      <Stack spacing={6} mt={4}>
        <Box>
          <Text fontWeight="medium" mb={2}>Baterias (1º item)</Text>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
            <FormControl>
              <FormLabel>Marca</FormLabel>
              <Input name="subsistema.0.componentes.baterias.0.marca" placeholder="Moura" />
            </FormControl>
            <FormControl>
              <FormLabel>Modelo</FormLabel>
              <Input name="subsistema.0.componentes.baterias.0.modelo" placeholder="MS-500" />
            </FormControl>
            <FormControl>
              <FormLabel>Capacidade (kWh)</FormLabel>
              <NumberInput>
                <NumberInputField name="subsistema.0.componentes.baterias.0.capacidade_kWh" placeholder="10.5" />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Quantidade</FormLabel>
              <NumberInput>
                <NumberInputField name="subsistema.0.componentes.baterias.0.quantidade" placeholder="2" />
              </NumberInput>
            </FormControl>
          </Grid>
        </Box>

        <Box>
          <Text fontWeight="medium" mb={2}>Painéis (1º item)</Text>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
            <FormControl>
              <FormLabel>Marca</FormLabel>
              <Input name="subsistema.0.componentes.paineis.0.marca" placeholder="Canadian Solar" />
            </FormControl>
            <FormControl>
              <FormLabel>Modelo</FormLabel>
              <Input name="subsistema.0.componentes.paineis.0.modelo" placeholder="CS-HiKu" />
            </FormControl>
            <FormControl>
              <FormLabel>Capacidade (Wp)</FormLabel>
              <NumberInput>
                <NumberInputField name="subsistema.0.componentes.paineis.0.capacidade_Wp" placeholder="540" />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Quantidade</FormLabel>
              <NumberInput>
                <NumberInputField name="subsistema.0.componentes.paineis.0.quantidade" placeholder="20" />
              </NumberInput>
            </FormControl>
          </Grid>
        </Box>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <Box>
            <Text fontWeight="medium" mb={2}>Inversores (1º item)</Text>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <FormControl>
                <FormLabel>Marca</FormLabel>
                <Input name="subsistema.0.componentes.inversores.0.marca" placeholder="Fronius" />
              </FormControl>
              <FormControl>
                <FormLabel>Modelo</FormLabel>
                <Input name="subsistema.0.componentes.inversores.0.modelo" placeholder="Primo GEN24" />
              </FormControl>
            </Grid>
          </Box>
          <Box>
            <Text fontWeight="medium" mb={2}>Controladores (1º item)</Text>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <FormControl>
                <FormLabel>Marca</FormLabel>
                <Input name="subsistema.0.componentes.controladores.0.marca" placeholder="Victron" />
              </FormControl>
              <FormControl>
                <FormLabel>Modelo</FormLabel>
                <Input name="subsistema.0.componentes.controladores.0.modelo" placeholder="SmartSolar MPPT" />
              </FormControl>
            </Grid>
          </Box>
        </Grid>
      </Stack>
      <Divider my={6} />
      <Button type="submit" colorScheme="blue" isLoading={loading} w="full">Salvar sistema</Button>
    </Box>
  );
}
