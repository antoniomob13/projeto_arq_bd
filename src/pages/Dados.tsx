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
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';

export default function Dados() {
  const addDisc = useDisclosure();
  const editDisc = useDisclosure();
  const delDisc = useDisclosure();

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={2} fontWeight="semibold">Dados</Text>
      <Text color="gray.400" mb={4}>Somente layout. Nenhum dado será salvo.</Text>

      <Box display="flex" gap={3}>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={addDisc.onOpen}>
          Adicionar cliente
        </Button>
        <Button leftIcon={<EditIcon />} variant="outline" onClick={editDisc.onOpen}>
          Editar
        </Button>
        <Button leftIcon={<DeleteIcon />} colorScheme="red" variant="outline" onClick={delDisc.onOpen}>
          Excluir
        </Button>
      </Box>

      {/* Modal Adicionar */}
      <Modal isOpen={addDisc.isOpen} onClose={addDisc.onClose} isCentered size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Adicionar cliente</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ClienteForm />
          </ModalBody>
          <ModalFooter>
            <Button onClick={addDisc.onClose} variant="ghost">Fechar</Button>
          </ModalFooter>
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
            <ClienteForm />
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

function ClienteForm() {
  return (
    <Box as="form" onSubmit={(e) => e.preventDefault()}>
      <Text fontWeight="semibold" mb={3}>Cliente</Text>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <FormControl>
          <FormLabel>Nome</FormLabel>
          <Input name="nome" placeholder="João da Silva" />
        </FormControl>
        <FormControl>
          <FormLabel>CPF/CNPJ</FormLabel>
          <Input name="cpf_cnpj" placeholder="123.456.789-00" />
        </FormControl>
        <FormControl>
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
    </Box>
  );
}
