import React, { useState } from 'react';
import {StyleSheet,Text,View,TextInput,TouchableOpacity,FlatList,Alert,Modal, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

function App() {
  const [todoInput, settodoInput] = React.useState('')

  const [Todos, setTodos] = React.useState([]);

  const StatusTab = [
    {
      status: 'All',
      completed: 'All'
    },
    {
      status: 'Complete',
      completed: true
    },
    {
      status: 'Incomplete',
      completed: false
    }
  ]

  const EditStatusTab = [
    {
      status: 'Complete',
      completed: true
    },
    {
      status: 'Incomplete',
      completed: false
    }
  ]

  const [Status,setStatus] = useState('All');

  const setStatusFilter = Status => {
    // if(Status !== 'All') {
    //   setTodos([...Todos.filter(e => e.completed === Status)])
    // } else {
    //   setTodos(Todos)
    // }
    setStatus(Status);
  };

  const ChangeStatus = editStatus => {
    seteditStatus(editStatus);
  };

  const [isRender,setisRender] = useState(false);
  const [modalVisible, setmodalVisible] = useState(false);
  const [editText, seteditText] = useState();
  const [editItem, seteditItem] = useState();
  const [editStatus, seteditStatus] = useState(Todos.completed);

  React.useEffect(()=>{
    GetTasks();
  },[]);

  React.useEffect(()=>{
    SaveTasks(Todos);
  },[Todos]);

  const ListItem = ({Todo}) => {
    return <View style={styles.ListItem}>
      <View style={{flex:1}}>
        <Text style={[styles.TaskText,{textDecorationLine: Todo?.completed?"line-through":"none"}]}>{Todo?.task}</Text>
      </View>
      {!Todo?.completed && (
        <TouchableOpacity style={[styles.EditIcon]} onPress={()=>completeTodo(Todo?.id)}>
          <Icon name='done' size={20} color='#FFFFFF'/>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[styles.EditIcon,{backgroundColor:'#5D76E8'}]}
      onPress={()=>editTodo(Todo)}>
        <Icon name='edit' size={20} color='#FFFFFF'/>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.EditIcon,{backgroundColor:'#D30404'}]} 
      onPress={()=>deleteTodo(Todo?.id)}>
        <Icon name='delete' size={20} color='#FFFFFF'/>
      </TouchableOpacity>
    </View>
  }

  const SaveTasks = async Todos =>{
    try {
      const stringifyTodos = JSON.stringify(Todos)
      await AsyncStorage.setItem('Todos', stringifyTodos)
    } catch (e) {
      console.log(e);
      // saving error
    }
  };

  const GetTasks = async () => {
    try {
      const Todos = await AsyncStorage.getItem('Todos');
      if(Todos != null){
        setTodos(JSON.parse(Todos));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addTodo = () =>{
    if(todoInput == ""){
      Alert.alert("Error","Please Input Task");
    }
    else{
    // console.log(todoInput);
    const newTodo = {
      id:Math.random(),
      task: todoInput,
      completed: false,
    };
    setTodos([...Todos,newTodo])
    settodoInput('');
    }
  }

  const completeTodo = (todoID) => {
    console.log(todoID);
    const newTodos = Todos.map((item)=>{
      if(item.id == todoID){
        return {...item,completed:true}
      }
      return item;
    });
    setTodos(newTodos);
  };

  const editTodo = (item) => {
    setmodalVisible(true);
    seteditText(item.task);
    seteditItem(item.id);
    seteditStatus(item.completed)
  };

  const handleEditItem = (editItem) =>{
    const newData =Todos.map(item =>{
      if (item.id == editItem) {
        item.task = editText;
        item.completed = editStatus;
        return item
      }
      return item;
    })
    setTodos(newData);
    setisRender(!isRender);
  }

  const onPressSaveEdit = () => {
    handleEditItem(editItem);
    setmodalVisible(false);
  }

  const deleteTodo = (todoID) =>{ 
    Alert.alert("Confirm","Delete Task?",[{
      text:"Yes",
      onPress: () => {const newTodos = Todos.filter(item => item.id != todoID);
       setTodos(newTodos)}
    },
    {text:"No"}
  ])
  };

  const getTodos = (status) => {
    return status === 'All'
      ? Todos
      : Todos.filter((item) => item.completed === status);
  };

  return (
    <View style={styles.Container}>
      <View style={styles.Header}>
        <TextInput style={styles.SearchBar} placeholder='Add Task' 
        value={todoInput} onChangeText={(text)=>settodoInput(text)}/>
        <TouchableOpacity onPress={addTodo}>
          <View style={styles.IconContainer}>
            <Icon name="add" color='#FFFFFF' size={30}/>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.TaskList}>
        <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding:20,paddingBottom:100}} 
        data={getTodos(Status)}
        keyExtractor={(item) => item.id.toString()} 
        renderItem={({item})=><ListItem Todo={item}/>}
        extraData={isRender}/>

        <Modal
        animationType='fade'
        visible={modalVisible}
        onRequestClose={() => setmodalVisible(false)}
        >
          <View style={styles.ModalView}>
            <Text style={styles.ModalText}>Change Task:</Text>
            <TextInput style={styles.ModalInput}
            onChangeText={(text) => seteditText(text)}
            defaultValue={editText}
            editable={true}
            multiline={false}
            maxLength={200}/>
            <Text style={styles.ModalText}>Task Status:</Text>
            {
              EditStatusTab.map(e => (
                <TouchableOpacity style={[styles.FilterTab, editStatus === e.completed && styles.FilterTabActive]}
                onPress={() => ChangeStatus(e.completed)}>
              <Text style={[styles.TabText, editStatus === e.status && styles.TabTextActive]}>{e.status}</Text>
            </TouchableOpacity>
              ))
            }
            <TouchableOpacity
            onPress={()=> onPressSaveEdit()}
            style={styles.SaveButton}>
              <Text style={styles.ModalText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>

      <View style={styles.Footer}>
        {
          StatusTab.map(e => (
            <TouchableOpacity style={[styles.FilterTab, Status === e.completed && styles.FilterTabActive]}
            onPress={() => setStatusFilter(e.completed)}>
              <Text style={[styles.TabText, Status === e.status && styles.TabTextActive]}>{e.status}</Text>
            </TouchableOpacity>
          ))
        }
      </View>

    </View>
  );
}
 
const styles = StyleSheet.create({
  Container:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  Header:{
    flexDirection: 'row',
    backgroundColor:'#000000',
    alignItems: "center",
    justifyContent: 'center',
    width:'100%'
  },
  SearchBar:{
    borderColor: "#FFFFFF",
    backgroundColor: "#DDDDDD",
    marginHorizontal: 5,
    width: '40%',
    height:'80%',
    borderRadius: 30
  },
  IconContainer:{
    height: 50,
    width: 50,
    backgroundColor: '#061380',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  TaskList:{
    flex: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  ListItem:{
    padding:20,
    backgroundColor:'#DEDEDE',
    flexDirection:'row',
    elevation:12,
    borderRadius:7,
    marginVertical:10
  },
  TaskText:{
    fontWeight:'bold',
    fontSize:15,
    color:'#000000',
  },
  EditIcon:{
    height:25,
    width:25,
    backgroundColor:'#1BCC48',
    justifyContent:'center',
    alignItems:'center',
    marginLeft:5,
    borderRadius:3
  },
  ModalView:{
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  ModalText:{
    fontSize:25,
    fontWeight:'bold',
    marginVertical:30,
    marginLeft:10
  },
  ModalInput:{
    width:'90%',
    height:70,
    borderColor:'#000000',
    borderWidth:1,
    fontSize:25
  },
  SaveButton:{
    backgroundColor:'#3AE3A0',
    paddingHorizontal:100,
    alignItems:'center',
    marginTop:20
  },
  Footer:{
    flexDirection:'row',
    alignSelf:'center',
    marginBottom:10
  },
  FilterTab:{
    width:Dimensions.get('window').width / 3.5,
    flexDirection:'row',
    borderWidth:1,
    borderColor:'#4A4A4A',
    padding:10,
    justifyContent:'center'
  },
  FilterTabActive:{
    backgroundColor:'#F87861'
  },
  TabText:{
    fontSize:16,
  },
  TabTextActive:{
    color:'#FFFFFF'
  },
});

export default App;
