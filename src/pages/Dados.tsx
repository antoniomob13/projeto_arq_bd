import { Box, Button, Flex, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { historyStore } from '../services/historyStore';

type Acao = 'insercao' | 'edicao' | 'exclusao';

export default function Dados() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [acao, setAcao] = useState<Acao>('insercao');
  const [nome, setNome] = useState('');
  const [responsavel, setResponsavel] = useState('');

  const abrirModal = (a: Acao) => {
    setAcao(a);
    onOpen();
  };

  const salvar = () => {
    if (!responsavel.trim()) return;
    historyStore.add({ action: acao, user: responsavel.trim(), entity: nome.trim() || undefined });
    setNome('');
    setResponsavel('');
    onClose();
  };

  const titulo = acao === 'insercao' ? 'Adicionar' : acao === 'edicao' ? 'Editar' : 'Excluir';

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4} fontWeight="semibold">Dados</Text>
      <Flex gap={2} mb={4}>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={() => abrirModal('insercao')}>Adicionar</Button>
        <Button leftIcon={<EditIcon />} variant="outline" onClick={() => abrirModal('edicao')}>Editar</Button>
        <Button leftIcon={<DeleteIcon />} variant="outline" colorScheme="red" onClick={() => abrirModal('exclusao')}>Excluir</Button>
      </Flex>

      <Text color="gray.400">Mário responsável por adicionar</Text>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{titulo} (apenas histórico)</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Nome</FormLabel>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Usina Arapiuns 1" />
            </FormControl>
            <FormControl>
              <FormLabel>Responsável</FormLabel>
              <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Seu nome" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose} variant="ghost">Cancelar</Button>
            <Button colorScheme={acao === 'exclusao' ? 'red' : 'teal'} onClick={salvar}>Salvar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
