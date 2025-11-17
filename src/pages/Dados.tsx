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
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client';
import type { Cliente, Sistema } from '../models/domain';
import { historyStore } from '../services/historyStore';

export default function Dados() {
  const currentUser = 'uL7';
  const addDisc = useDisclosure();
  const addSysDisc = useDisclosure();
  const editDisc = useDisclosure();
  const delDisc = useDisclosure();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [deleteType, setDeleteType] = useState<'cliente' | 'sistema'>('cliente');
  const [deleteTarget, setDeleteTarget] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editType, setEditType] = useState<'cliente' | 'sistema'>('cliente');
  const [editTarget, setEditTarget] = useState('');
  const [editSubmitLoading, setEditSubmitLoading] = useState(false);

  const buildClientePayload = (fd: FormData) => ({
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
  });

  const buildSistemaPayload = (fd: FormData) => ({
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
              capacidade_kWh:
                parseFloat(fd.get('subsistema.0.componentes.baterias.0.capacidade_kWh') as string) || 0,
              quantidade: parseInt(fd.get('subsistema.0.componentes.baterias.0.quantidade') as string) || 0,
            },
          ],
          paineis: [
            {
              marca: fd.get('subsistema.0.componentes.paineis.0.marca') as string,
              modelo: fd.get('subsistema.0.componentes.paineis.0.modelo') as string,
              capacidade_Wp:
                parseFloat(fd.get('subsistema.0.componentes.paineis.0.capacidade_Wp') as string) || 0,
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
  });

  const loadEntities = useCallback(async () => {
    setListLoading(true);
    try {
      const [clientesRes, sistemasRes] = await Promise.all([
        apiGet<Cliente[]>('/clientes'),
        apiGet<Sistema[]>('/sistemas'),
      ]);
      setClientes(clientesRes);
      setSistemas(sistemasRes);
    } catch (err: any) {
      toast({ title: 'Erro ao carregar registros', description: err.message, status: 'error' });
    } finally {
      setListLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!delDisc.isOpen) return;
    loadEntities();
  }, [delDisc.isOpen, loadEntities]);

  useEffect(() => {
    if (!editDisc.isOpen) return;
    loadEntities();
  }, [editDisc.isOpen, loadEntities]);

  useEffect(() => {
    const list = deleteType === 'cliente' ? clientes : sistemas;
    setDeleteTarget((prev) => {
      if (prev && list.some((item) => item._id === prev)) {
        return prev;
      }
      return list[0]?._id ?? '';
    });
  }, [deleteType, clientes, sistemas]);

  useEffect(() => {
    const list = editType === 'cliente' ? clientes : sistemas;
    setEditTarget((prev) => {
      if (prev && list.some((item) => item._id === prev)) {
        return prev;
      }
      return list[0]?._id ?? '';
    });
  }, [editType, clientes, sistemas]);

  const handleOpenDelete = () => {
    setDeleteType('cliente');
    setDeleteTarget('');
    delDisc.onOpen();
  };

  const handleOpenEdit = () => {
    setEditType('cliente');
    setEditTarget('');
    editDisc.onOpen();
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      toast({ title: 'Selecione um registro para excluir', status: 'warning' });
      return;
    }
    setDeleteLoading(true);
    try {
      const endpoint = deleteType === 'cliente' ? `/clientes/${deleteTarget}` : `/sistemas/${deleteTarget}`;
      await apiDelete(endpoint);
      toast({ title: `${deleteType === 'cliente' ? 'Cliente' : 'Sistema'} excluído!`, status: 'success', duration: 3000 });
      await loadEntities();
      delDisc.onClose();
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, status: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  async function handleAddCliente(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const payload = buildClientePayload(fd);
      await apiPost('/clientes', payload);
      historyStore.add({
        user: currentUser,
        action: 'insercao',
        entity: payload.nome,
        category: 'cliente',
      });
      toast({ title: 'Cliente adicionado!', status: 'success', duration: 3000 });
      addDisc.onClose();
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast({ title: 'Erro ao adicionar', description: err.message, status: 'error', duration: 5000 });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSistema(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const payload = buildSistemaPayload(fd);
      await apiPost('/sistemas', payload);
      historyStore.add({
        user: currentUser,
        action: 'insercao',
        entity: payload.nome,
        category: 'sistema',
      });
      toast({ title: 'Sistema adicionado!', status: 'success', duration: 3000 });
      addSysDisc.onClose();
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast({ title: 'Erro ao adicionar', description: err.message, status: 'error', duration: 5000 });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateCliente(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editTarget) {
      toast({ title: 'Selecione um cliente para editar', status: 'warning' });
      return;
    }
    setEditSubmitLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const payload = buildClientePayload(fd);
      await apiPut(`/clientes/${editTarget}`, payload);
      historyStore.add({
        user: currentUser,
        action: 'atualizacao',
        entity: payload.nome,
        category: 'cliente',
      });
      toast({ title: 'Cliente atualizado!', status: 'success', duration: 3000 });
      await loadEntities();
      editDisc.onClose();
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar', description: err.message, status: 'error', duration: 5000 });
    } finally {
      setEditSubmitLoading(false);
    }
  }

  async function handleUpdateSistema(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editTarget) {
      toast({ title: 'Selecione um sistema para editar', status: 'warning' });
      return;
    }
    setEditSubmitLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const payload = buildSistemaPayload(fd);
      await apiPut(`/sistemas/${editTarget}`, payload);
      historyStore.add({
        user: currentUser,
        action: 'atualizacao',
        entity: payload.nome,
        category: 'sistema',
      });
      toast({ title: 'Sistema atualizado!', status: 'success', duration: 3000 });
      await loadEntities();
      editDisc.onClose();
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar', description: err.message, status: 'error', duration: 5000 });
    } finally {
      setEditSubmitLoading(false);
    }
  }

  const currentDeleteList = deleteType === 'cliente' ? clientes : sistemas;
  const currentEditList = editType === 'cliente' ? clientes : sistemas;
  const selectedCliente = editType === 'cliente' ? clientes.find((cliente) => cliente._id === editTarget) : undefined;
  const selectedSistema = editType === 'sistema' ? sistemas.find((sistema) => sistema._id === editTarget) : undefined;

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
        <Button leftIcon={<EditIcon />} variant="outline" onClick={handleOpenEdit}>
          Editar
        </Button>
        <Button leftIcon={<DeleteIcon />} colorScheme="red" variant="outline" onClick={handleOpenDelete}>
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

      {/* Modal Editar */}
      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} isCentered size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar registro</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4} mb={4}>
              <FormControl>
                <FormLabel>Tipo de registro</FormLabel>
                <Select value={editType} onChange={(e) => setEditType(e.target.value as 'cliente' | 'sistema')}>
                  <option value="cliente">Cliente</option>
                  <option value="sistema">Sistema</option>
                </Select>
              </FormControl>
              {listLoading ? (
                <Flex align="center" justify="center" py={4}>
                  <Spinner size="sm" mr={2} />
                  <Text>Carregando registros...</Text>
                </Flex>
              ) : (
                <FormControl isDisabled={currentEditList.length === 0}>
                  <FormLabel>{editType === 'cliente' ? 'Selecione o cliente' : 'Selecione o sistema'}</FormLabel>
                  {currentEditList.length === 0 ? (
                    <Text color="gray.400" fontSize="sm">
                      Nenhum {editType === 'cliente' ? 'cliente' : 'sistema'} cadastrado.
                    </Text>
                  ) : (
                    <Select value={editTarget} onChange={(e) => setEditTarget(e.target.value)}>
                      {editType === 'cliente'
                        ? clientes.map((cliente) => (
                            <option key={cliente._id} value={cliente._id}>
                              {cliente.nome} — {cliente.cpf_cnpj}
                            </option>
                          ))
                        : sistemas.map((sistema) => (
                            <option key={sistema._id} value={sistema._id}>
                              {sistema.nome} — Cliente {sistema.id_cliente}
                            </option>
                          ))}
                    </Select>
                  )}
                </FormControl>
              )}
            </Stack>
            {editType === 'cliente' ? (
              selectedCliente ? (
                <ClienteForm
                  key={`edit-cliente-${selectedCliente._id}`}
                  onSubmit={handleUpdateCliente}
                  loading={editSubmitLoading}
                  initialValues={selectedCliente}
                  submitLabel="Salvar alterações"
                />
              ) : (
                <Text color="gray.400">Selecione um cliente para editar.</Text>
              )
            ) : selectedSistema ? (
              <SistemaForm
                key={`edit-sistema-${selectedSistema._id}`}
                onSubmit={handleUpdateSistema}
                loading={editSubmitLoading}
                initialValues={selectedSistema}
                submitLabel="Salvar alterações"
              />
            ) : (
              <Text color="gray.400">Selecione um sistema para editar.</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={editDisc.onClose} variant="ghost">Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Excluir */}
      <Modal isOpen={delDisc.isOpen} onClose={delDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Excluir registro</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Tipo de registro</FormLabel>
                <Select value={deleteType} onChange={(e) => setDeleteType(e.target.value as 'cliente' | 'sistema')}>
                  <option value="cliente">Cliente</option>
                  <option value="sistema">Sistema</option>
                </Select>
              </FormControl>
              {listLoading ? (
                <Flex align="center" justify="center" py={6}>
                  <Spinner size="sm" mr={2} />
                  <Text>Carregando registros...</Text>
                </Flex>
              ) : (
                <FormControl isDisabled={currentDeleteList.length === 0}>
                  <FormLabel>{deleteType === 'cliente' ? 'Selecione o cliente' : 'Selecione o sistema'}</FormLabel>
                  {currentDeleteList.length === 0 ? (
                    <Text color="gray.400" fontSize="sm">
                      Nenhum {deleteType === 'cliente' ? 'cliente' : 'sistema'} cadastrado.
                    </Text>
                  ) : (
                    <Select value={deleteTarget} onChange={(e) => setDeleteTarget(e.target.value)}>
                      {deleteType === 'cliente'
                        ? clientes.map((cliente) => (
                            <option key={cliente._id} value={cliente._id}>
                              {cliente.nome} — {cliente.cpf_cnpj}
                            </option>
                          ))
                        : sistemas.map((sistema) => (
                            <option key={sistema._id} value={sistema._id}>
                              {sistema.nome} — Cliente {sistema.id_cliente}
                            </option>
                          ))}
                    </Select>
                  )}
                </FormControl>
              )}
              <Text fontSize="sm" color="red.200">Esta ação é definitiva.</Text>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={delDisc.onClose} variant="ghost" mr={3}>Cancelar</Button>
            <Button colorScheme="red" onClick={handleDelete} isLoading={deleteLoading} isDisabled={!deleteTarget || listLoading}>
              Excluir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

type ClienteFormProps = {
  onSubmit: (_event: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  initialValues?: Partial<Cliente>;
  submitLabel?: string;
};

function ClienteForm({ onSubmit, loading, initialValues, submitLabel = 'Salvar cliente' }: ClienteFormProps) {
  const endereco = initialValues?.endereco;

  return (
    <Box as="form" onSubmit={onSubmit}>
      <Text fontWeight="semibold" mb={3}>Cliente</Text>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <FormControl isRequired>
          <FormLabel>Nome</FormLabel>
          <Input name="nome" placeholder="João da Silva" defaultValue={initialValues?.nome ?? ''} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>CPF/CNPJ</FormLabel>
          <Input name="cpf_cnpj" placeholder="123.456.789-00" defaultValue={initialValues?.cpf_cnpj ?? ''} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Tipo de pessoa</FormLabel>
          <Select name="tipo_pessoa" defaultValue={initialValues?.tipo_pessoa ?? 'F'}>
            <option value="F">Física</option>
            <option value="J">Jurídica</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Data de nascimento</FormLabel>
          <Input name="data_nasc" type="date" defaultValue={formatDateInput(initialValues?.data_nasc)} />
        </FormControl>
        <FormControl>
          <FormLabel>Telefone</FormLabel>
          <Input name="telefone" placeholder="+5593991234567" defaultValue={initialValues?.telefone ?? ''} />
        </FormControl>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input name="email" type="email" placeholder="email@dominio.com" defaultValue={initialValues?.email ?? ''} />
        </FormControl>
      </Grid>

      <Divider my={6} />
      <Text fontWeight="semibold" mb={3}>Endereço</Text>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <FormControl gridColumn={{ md: 'span 2' }}>
          <FormLabel>Rua</FormLabel>
          <Input name="endereco.rua" placeholder="Rua das Flores, 123" defaultValue={endereco?.rua ?? ''} />
        </FormControl>
        <FormControl>
          <FormLabel>Bairro</FormLabel>
          <Input name="endereco.bairro" placeholder="Centro" defaultValue={endereco?.bairro ?? ''} />
        </FormControl>
        <FormControl>
          <FormLabel>Complemento</FormLabel>
          <Input name="endereco.complemento" placeholder="Apto 101" defaultValue={endereco?.complemento ?? ''} />
        </FormControl>
        <FormControl>
          <FormLabel>CEP</FormLabel>
          <Input name="endereco.cep" placeholder="68000-000" defaultValue={endereco?.cep ?? ''} />
        </FormControl>
        <FormControl>
          <FormLabel>Cidade</FormLabel>
          <Input name="endereco.cidade" placeholder="Santarém" defaultValue={endereco?.cidade ?? ''} />
        </FormControl>
        <FormControl>
          <FormLabel>Estado</FormLabel>
          <Input name="endereco.estado" placeholder="PA" defaultValue={endereco?.estado ?? ''} />
        </FormControl>
      </Grid>
      <Divider my={6} />
      <Button type="submit" colorScheme="blue" isLoading={loading} w="full">{submitLabel}</Button>
    </Box>
  );
}

type SistemaFormProps = {
  onSubmit: (_event: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  initialValues?: Partial<Sistema>;
  submitLabel?: string;
};

function SistemaForm({ onSubmit, loading, initialValues, submitLabel = 'Salvar sistema' }: SistemaFormProps) {
  const localizacao = initialValues?.localizacao;
  const subs = initialValues?.subsistema?.[0];
  const baterias = subs?.componentes?.baterias?.[0];
  const paineis = subs?.componentes?.paineis?.[0];
  const inversores = subs?.componentes?.inversores?.[0];
  const controladores = subs?.componentes?.controladores?.[0];

  return (
    <Box as="form" onSubmit={onSubmit}>
      <Text fontWeight="semibold" mb={3}>Sistema</Text>

      {/* Identificação */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <FormControl>
          <FormLabel>ID do Cliente (ObjectId)</FormLabel>
          <Input name="id_cliente" placeholder="cliente_183" defaultValue={initialValues?.id_cliente ?? ''} />
        </FormControl>
        <FormControl gridColumn={{ md: 'span 2' }}>
          <FormLabel>Nome do sistema</FormLabel>
          <Input name="nome" placeholder="Casa Sede" defaultValue={initialValues?.nome ?? ''} />
        </FormControl>
      </Grid>

      <Divider my={6} />
      <Text fontWeight="semibold" mb={3}>Localização</Text>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <FormControl>
          <FormLabel>Latitude</FormLabel>
          <NumberInput defaultValue={localizacao?.latitude}>
            <NumberInputField name="localizacao.latitude" placeholder="-2.443" />
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>Longitude</FormLabel>
          <NumberInput defaultValue={localizacao?.longitude}>
            <NumberInputField name="localizacao.longitude" placeholder="-54.708" />
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>CEP</FormLabel>
          <Input name="localizacao.cep" placeholder="68040-000" defaultValue={localizacao?.cep ?? ''} />
        </FormControl>
        <FormControl gridColumn={{ md: 'span 2' }}>
          <FormLabel>Rua</FormLabel>
          <Input name="localizacao.rua" placeholder="Av. Tapajós, 2000" defaultValue={localizacao?.rua ?? ''} />
        </FormControl>
        <FormControl>
          <FormLabel>Bairro</FormLabel>
          <Input name="localizacao.bairro" placeholder="Aldeia" defaultValue={localizacao?.bairro ?? ''} />
        </FormControl>
      </Grid>

      <Divider my={6} />
      <Text fontWeight="semibold" mb={3}>Subsistema (1º item)</Text>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <FormControl>
          <FormLabel>Tipo do sistema</FormLabel>
          <Select name="subsistema.0.tipo_sistema" defaultValue={subs?.tipo_sistema ?? 'Híbrido'}>
            <option>Híbrido</option>
            <option>On-Grid</option>
            <option>Off-Grid</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Data de instalação</FormLabel>
          <Input type="date" name="subsistema.0.data_instalacao" defaultValue={formatDateInput(subs?.data_instalacao)} />
        </FormControl>
      </Grid>

      <Stack spacing={6} mt={4}>
        <Box>
          <Text fontWeight="medium" mb={2}>Baterias (1º item)</Text>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
            <FormControl>
              <FormLabel>Marca</FormLabel>
              <Input name="subsistema.0.componentes.baterias.0.marca" placeholder="Moura" defaultValue={baterias?.marca ?? ''} />
            </FormControl>
            <FormControl>
              <FormLabel>Modelo</FormLabel>
              <Input name="subsistema.0.componentes.baterias.0.modelo" placeholder="MS-500" defaultValue={baterias?.modelo ?? ''} />
            </FormControl>
            <FormControl>
              <FormLabel>Capacidade (kWh)</FormLabel>
              <NumberInput defaultValue={baterias?.capacidade_kWh}>
                <NumberInputField name="subsistema.0.componentes.baterias.0.capacidade_kWh" placeholder="10.5" />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Quantidade</FormLabel>
              <NumberInput defaultValue={baterias?.quantidade}>
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
              <Input name="subsistema.0.componentes.paineis.0.marca" placeholder="Canadian Solar" defaultValue={paineis?.marca ?? ''} />
            </FormControl>
            <FormControl>
              <FormLabel>Modelo</FormLabel>
              <Input name="subsistema.0.componentes.paineis.0.modelo" placeholder="CS-HiKu" defaultValue={paineis?.modelo ?? ''} />
            </FormControl>
            <FormControl>
              <FormLabel>Capacidade (Wp)</FormLabel>
              <NumberInput defaultValue={paineis?.capacidade_Wp}>
                <NumberInputField name="subsistema.0.componentes.paineis.0.capacidade_Wp" placeholder="540" />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Quantidade</FormLabel>
              <NumberInput defaultValue={paineis?.quantidade}>
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
                <Input name="subsistema.0.componentes.inversores.0.marca" placeholder="Fronius" defaultValue={inversores?.marca ?? ''} />
              </FormControl>
              <FormControl>
                <FormLabel>Modelo</FormLabel>
                <Input name="subsistema.0.componentes.inversores.0.modelo" placeholder="Primo GEN24" defaultValue={inversores?.modelo ?? ''} />
              </FormControl>
            </Grid>
          </Box>
          <Box>
            <Text fontWeight="medium" mb={2}>Controladores (1º item)</Text>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <FormControl>
                <FormLabel>Marca</FormLabel>
                <Input name="subsistema.0.componentes.controladores.0.marca" placeholder="Victron" defaultValue={controladores?.marca ?? ''} />
              </FormControl>
              <FormControl>
                <FormLabel>Modelo</FormLabel>
                <Input name="subsistema.0.componentes.controladores.0.modelo" placeholder="SmartSolar MPPT" defaultValue={controladores?.modelo ?? ''} />
              </FormControl>
            </Grid>
          </Box>
        </Grid>
      </Stack>
      <Divider my={6} />
      <Button type="submit" colorScheme="blue" isLoading={loading} w="full">{submitLabel}</Button>
    </Box>
  );
}

function formatDateInput(value?: string | Date | null) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
}
