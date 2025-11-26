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
  Tag,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client';
import type { Sistema } from '../models/domain';
import { historyStore } from '../services/historyStore';
import ChartPlaceholder from '../components/ChartPlaceholder';

export default function Dados() {
  const currentUser = 'uL7';
  const addSysDisc = useDisclosure();
  const editDisc = useDisclosure();
  const delDisc = useDisclosure();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editTarget, setEditTarget] = useState('');
  const [editSubmitLoading, setEditSubmitLoading] = useState(false);

  const buildSistemaPayload = (fd: FormData) => ({
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

  const loadSistemas = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await apiGet<Sistema[]>('/sistemas');
      setSistemas(data);
    } catch (err: any) {
      toast({ title: 'Erro ao carregar sistemas', description: err.message, status: 'error' });
    } finally {
      setListLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSistemas();
  }, [loadSistemas]);

  useEffect(() => {
    if (!delDisc.isOpen && !editDisc.isOpen) return;
    loadSistemas();
  }, [delDisc.isOpen, editDisc.isOpen, loadSistemas]);

  useEffect(() => {
    setDeleteTarget((prev) => {
      if (prev && sistemas.some((item) => item._id === prev)) {
        return prev;
      }
      return sistemas[0]?._id ?? '';
    });
    setEditTarget((prev) => {
      if (prev && sistemas.some((item) => item._id === prev)) {
        return prev;
      }
      return sistemas[0]?._id ?? '';
    });
  }, [sistemas]);

  const handleOpenDelete = () => {
    delDisc.onOpen();
  };

  const handleOpenEdit = () => {
    editDisc.onOpen();
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      toast({ title: 'Selecione um sistema para excluir', status: 'warning' });
      return;
    }
    setDeleteLoading(true);
    try {
      const alvo = sistemas.find((sistema) => sistema._id === deleteTarget);
      await apiDelete(`/sistemas/${deleteTarget}`);
      historyStore.add({
        user: currentUser,
        action: 'exclusao',
        entity: alvo?.nome ?? deleteTarget,
        category: 'sistema',
      });
      toast({ title: 'Sistema excluído!', status: 'success', duration: 3000 });
      await loadSistemas();
      delDisc.onClose();
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, status: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

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
      await loadSistemas();
    } catch (err: any) {
      toast({ title: 'Erro ao adicionar', description: err.message, status: 'error', duration: 5000 });
    } finally {
      setLoading(false);
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
      await loadSistemas();
      editDisc.onClose();
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar', description: err.message, status: 'error', duration: 5000 });
    } finally {
      setEditSubmitLoading(false);
    }
  }

  const selectedSistema = sistemas.find((sistema) => sistema._id === editTarget);

  return (
    <Stack spacing={8}>
      <Box>
        <Text fontSize="xs" textTransform="uppercase" color="brand.200" letterSpacing="widest">
          Administração de registros
        </Text>
        <Text fontSize="3xl" fontWeight="extrabold">Inventário oficial dos sistemas</Text>
        <Text color="whiteAlpha.600" maxW="3xl">
          Centralize cadastros técnicos e mantenha a rastreabilidade das usinas do programa LABER em um só lugar.
        </Text>
      </Box>

      <Box>
        <ChartPlaceholder title="Geração diária simulada" />
      </Box>

      <Box bg="slate.800" borderRadius="2xl" borderWidth="1px" borderColor="whiteAlpha.100" p={5}>
        <Flex gap={3} flexWrap="wrap" align="center">
          <Button leftIcon={<AddIcon />} onClick={addSysDisc.onOpen}>
            Adicionar sistema
          </Button>
          <Button leftIcon={<EditIcon />} variant="outline" onClick={handleOpenEdit}>
            Editar sistema
          </Button>
          <Button leftIcon={<DeleteIcon />} colorScheme="red" variant="outline" onClick={handleOpenDelete}>
            Excluir sistema
          </Button>
          <Tag colorScheme="teal" variant="subtle">Inventário técnico</Tag>
        </Flex>
      </Box>

      {/* Modal Adicionar Sistema */}
      <Modal isOpen={addSysDisc.isOpen} onClose={addSysDisc.onClose} isCentered size="5xl">
        <ModalOverlay />
        <ModalContent bg="slate.900" borderWidth="1px" borderColor="whiteAlpha.100">
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
        <ModalContent bg="slate.900" borderWidth="1px" borderColor="whiteAlpha.100">
          <ModalHeader>Editar sistema</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4} mb={4}>
              {listLoading ? (
                <Flex align="center" justify="center" py={4}>
                  <Spinner size="sm" mr={2} />
                  <Text>Carregando sistemas...</Text>
                </Flex>
              ) : (
                <FormControl isDisabled={sistemas.length === 0}>
                  <FormLabel>Selecione o sistema</FormLabel>
                  {sistemas.length === 0 ? (
                    <Text color="gray.400" fontSize="sm">
                      Nenhum sistema cadastrado.
                    </Text>
                  ) : (
                    <Select value={editTarget} onChange={(e) => setEditTarget(e.target.value)}>
                      {sistemas.map((sistema) => (
                        <option key={sistema._id} value={sistema._id}>
                          {sistema.nome}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormControl>
              )}
            </Stack>
            {selectedSistema ? (
              <SistemaForm
                key={`edit-sistema-${selectedSistema._id}`}
                onSubmit={handleUpdateSistema}
                loading={editSubmitLoading}
                initialValues={selectedSistema}
                submitLabel="Salvar alterações"
              />
            ) : (
              <Text color="gray.400">Nenhum sistema disponível para edição.</Text>
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
        <ModalContent bg="slate.900" borderWidth="1px" borderColor="whiteAlpha.100">
          <ModalHeader>Excluir sistema</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              {listLoading ? (
                <Flex align="center" justify="center" py={6}>
                  <Spinner size="sm" mr={2} />
                  <Text>Carregando sistemas...</Text>
                </Flex>
              ) : (
                <FormControl isDisabled={sistemas.length === 0}>
                  <FormLabel>Selecione o sistema</FormLabel>
                  {sistemas.length === 0 ? (
                    <Text color="gray.400" fontSize="sm">
                      Nenhum sistema cadastrado.
                    </Text>
                  ) : (
                    <Select value={deleteTarget} onChange={(e) => setDeleteTarget(e.target.value)}>
                      {sistemas.map((sistema) => (
                        <option key={sistema._id} value={sistema._id}>
                          {sistema.nome}
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
    </Stack>
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
    <Box
      as="form"
      onSubmit={onSubmit}
      bg="slate.800"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      p={4}
      boxShadow="lg"
    >
      <Text fontWeight="semibold" mb={3}>Sistema</Text>

      {/* Identificação */}
      <FormControl mb={4}>
        <FormLabel>Nome do sistema</FormLabel>
        <Input name="nome" placeholder="Casa Sede" defaultValue={initialValues?.nome ?? ''} />
      </FormControl>

      <Divider my={6} borderColor="whiteAlpha.200" />
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

      <Divider my={6} borderColor="whiteAlpha.200" />
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
      <Divider my={6} borderColor="whiteAlpha.200" />
      <Button type="submit" colorScheme="teal" isLoading={loading} w="full">{submitLabel}</Button>
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
