// Importações
import { Alert, View } from 'react-native';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, setDoc, orderBy, query } from "firebase/firestore";
import { Button, DataTable, TextInput } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';

// Configurações do Firebase
const firebaseConfig = {};

// Objeto contendo as configurações do Firebase
const app = initializeApp(firebaseConfig);

// Conexão com o Firestore
const bd = getFirestore(app);

// Componente
export default function App() {

  // useState
  const [vetor, setVetor] = useState([]);
  const [codigo, setCodigo] = useState('');
  const [nome, setNome]   = useState('');
  const [idade, setIdade] = useState('');
  const [btnCadastrar, setBtnCadastrar] = useState(true);
  const [tipoFiltragem, setTipoFiltragem] = useState();

  // useEffect
  useEffect(() => {
    // Limpar o vetor
    setVetor([]);

    // Selecionar todos os clientes
    selecionar();
  }, []);

  // Selecionar todos os registros do Firestore
  const selecionar = async() => {

      // Retorno do Firebase
      const retorno = await getDocs(collection(bd, "clientes"));

      // Laço de repetição
      retorno.forEach((objCliente) => {
        
        let obj    = objCliente.data();
        obj.codigo = objCliente.id;

        setVetor(vetor => [...vetor, obj])

      });
  }

  // Método para cadastrar um cliente
  const cadastrar = async() => {

    // Retorno do Firestore
    const retorno = await addDoc(collection(bd, 'clientes'), {
      nome:nome,
      idade:idade
    });

    // Novo objeto
    let obj ={
      nome:nome,
      idade:parseInt(idade),
      codigo:retorno.id
    }

    // Adicionar no vetor
    setVetor([...vetor, obj]);

    // Limpar campos
    setNome('');
    setIdade('');

  }

  // Remover cliente
  const remover = async(codigo) => {
    
    // Retornar a exclusão
    const retorno = await deleteDoc(doc(bd, 'clientes', codigo))
    .then(() => {
      // Mensagem
      Alert.alert('Funcionou!')

      // Atualizar vetor
      setVetor(vetor.filter(cliente => {return cliente.codigo != codigo}));
    
    })
    .catch((erro) => { Alert.alert(`Falha ao remover: ${erro}`) });

  }

  // Método para alterar os clientes
  const alterar = async() => {
    
    // Retorno da alteração de dados
    const retorno = await setDoc(doc(bd, 'clientes', codigo), {
      nome:nome,
      idade:parseInt(idade),
    });

    // Atualizar vetor
    let indice = vetor.findIndex(cliente => {return cliente.codigo === codigo});

    let vetorTemp = vetor;

    vetorTemp[indice] = {
      nome:nome,
      idade:idade,
      codigo:codigo
    }

    // Executa o evento de cancelar para limpar os campos e visibilidade dos botões
    cancelar();

  }

  // Método para selecionar um cliente para ser editado
  const editarCliente = (indice) => {

    // Visibilidade dos botões
    setBtnCadastrar(false);

    // Objeto
    let obj = vetor[indice];

    // Exibir dados do cliente no formulário e armazenar o código
    setCodigo(obj.codigo);
    setNome(obj.nome);
    setIdade(obj.idade.toString());
  }

  // Método para cancelar a ação de edição
  const cancelar = () => {

    // Visibilidade dos botões
    setBtnCadastrar(true);

    // Limpar campos
    setNome('');
    setIdade('');

  }

  // Filtrar
  const filtrar = async(tipo) => {

    setVetor([]);

    let retorno;

    switch(tipo){
      case 'nome1':
        retorno = await getDocs(query(collection(bd, "clientes"), orderBy('nome', 'asc')));
      break;
      
      case 'nome2':
        retorno = await getDocs(query(collection(bd, "clientes"), orderBy('nome', 'desc')));
      break;
      
      case 'idade1':
        retorno = await getDocs(query(collection(bd, "clientes"), orderBy('idade', 'asc')));
      break;
      
      case 'idade2':
        retorno = await getDocs(query(collection(bd, "clientes"), orderBy('idade', 'desc')));
      break;

      case 'padrao':
        retorno = await getDocs(collection(bd, "clientes"));
    }

    retorno.forEach((objCliente) => {
        
      let obj    = objCliente.data();
      obj.codigo = objCliente.id;

      setVetor(vetor => [...vetor, obj])

    });
  }

  // Retorno
  return (
    <View>

      {/* Formulário */}
      <View style={{marginTop:70, width:300, marginLeft:50}}>
        <TextInput value={nome} onChangeText={setNome}  mode="outlined" placeholder="Nome"  />
        <TextInput value={idade} onChangeText={setIdade} mode="outlined" placeholder="Idade" />
        
        {btnCadastrar === true ?

          <Button onPress={cadastrar} style={{marginTop:10, width:150, marginLeft:80}} mode="contained">Cadastrar</Button>
        
        :
        
          <View>
            <Button onPress={alterar} style={{marginTop:10, width:150, marginLeft:80}} mode="contained">Editar</Button>
            <Button onPress={cancelar} style={{marginTop:10, width:150, marginLeft:80}} mode="contained">Cancelar</Button>
          </View>
        }
      </View>

      {/* Tipos de ordenação */}
      <View style={{width:300, marginLeft:50, marginTop:50, borderStyle:'solid', borderWidth:1, borderColor:'#999', borderRadius:5}}>
        <Picker
          selectedValue={tipoFiltragem}
          onValueChange={opcao =>
            {setTipoFiltragem(opcao); filtrar(opcao);}
          }
          >
            
          <Picker.Item label="Filtrar dados" value="padrao" />
          <Picker.Item label="Nome  (A - Z)" value="nome1" />
          <Picker.Item label="Nome  (Z - A)" value="nome2" />
          <Picker.Item label="Idade (menor - maior)" value="idade1" />
          <Picker.Item label="Idade (maior - menor)" value="idade2" />
        </Picker>

        {/* <Button onPress={() => {filtrar('nome1')}}>A - Z</Button>
        <Button onPress={() => {filtrar('nome2')}}>Z - A</Button>
        <Button onPress={() => {filtrar('idade1')}}>Menor para o maior</Button>
        <Button onPress={() => {filtrar('idade2')}}>Maior para o menor</Button> */}
      </View>

      {/* Tabela */}
      <DataTable style={{marginTop:50}}>
          <DataTable.Header>
              <DataTable.Title>Nome</DataTable.Title>
              <DataTable.Title>Idade</DataTable.Title>
              <DataTable.Title>Remover</DataTable.Title>
              <DataTable.Title>Editar</DataTable.Title>
          </DataTable.Header>

          {vetor.map((obj, indice) => {
            return(
              <DataTable.Row key={obj.codigo}>
                <DataTable.Cell>{obj.nome}</DataTable.Cell>
                <DataTable.Cell>{obj.idade}</DataTable.Cell>
                <DataTable.Cell><Button onPress={() => {remover(obj.codigo)}}>Remover</Button></DataTable.Cell>
                <DataTable.Cell><Button onPress={() => {editarCliente(indice)}}>Editar</Button></DataTable.Cell>
              </DataTable.Row>
            )
          })}
      </DataTable>
      
    </View>
  );
}
