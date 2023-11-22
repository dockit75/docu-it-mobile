import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ImageBackground,
  StyleSheet,
  TextInput,
  FlatList,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { normalize, screenHeight, screenWidth } from '../../utilities/measurement';
import { Images } from '../../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Popover from 'react-native-popover-view';
import { COLORS } from '../../utilities/colors';
import NetworkManager from '../../services/NetworkManager';
import { Snackbar } from 'react-native-paper';
import { retrieveUserDetail } from '../../storageManager';
import DrawerNavigator from '../../components/common/DrawerNavigator';
import { Dialog } from '@rneui/themed';
import { FAMILY_LIST_EMPTY } from '../../utilities/strings';

const FamilyDocument = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [familyDetails, setFamilyDetail] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [currentItemId, setCurrentItemId] = useState([]);
  const [editFamilyCall, setEditFamilyCall] = useState(false);
  const [nullValue, setNullValue] = useState('');
  const [isNameValid, setIsNameValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoader, setIsLoader] = useState(true);

  const showModal = (item) => {
    setCurrentItemId(item);
    setEditFamilyCall(true);
    setIsModalVisible(true);
  };
  const showModalAdd = () => {
    setNewFamilyName('')
    setEditFamilyCall(false);
    setIsModalVisible(true);
  };
  const cancelModal = () => {
    Keyboard.dismiss()
    setCurrentItemId([]);
    setNewFamilyName('')
    setTimeout(() => setIsModalVisible(false), 1000);
    setErrorMessage('')
  };
  const editFamilyName = async () => {
    try {
      let params = {
        name: newFamilyName,
        familyId: currentItemId.id,
        adminId: userDetails.id,
      };
      // console.log('params',params)
      let editFamilyRes = await NetworkManager.editFamily(params);
      // console.log('editFamilyRes',editFamilyRes)
      if (editFamilyRes.data.code === 200) {
        Keyboard.dismiss()
        setErrorMessage('')
        setTimeout(() => alert(editFamilyRes.data.message), 1000)
      } else {
        Keyboard.dismiss()
        setErrorMessage('')
        setTimeout(() => alert(response.data.message), 1000)
      }

      setCurrentItemId([]);
    } catch (error) {

      setCurrentItemId([]);
      Keyboard.dismiss()
      setErrorMessage('')
      // console.error('Error fetching unique id:', error.response);
      setTimeout(() => alert(error.response.data.message), 1000)
    }
    getFamilyList();
    setIsModalVisible(false);
  };

  useEffect(() => {
    getFamilyList(true);
  }, []);

  const getFamilyList = async (loading) => {
    let UserId = await retrieveUserDetail();
    loading && setIsLoader(true)
    setUserDetails(UserId);
    try {
      let response = await NetworkManager.listFamily(UserId.id);
      // console.log('response',response)
      let FamilyList = response.data.response.familyList;
      if (response.data.code === 200) {
        setFamilyDetail(FamilyList);
      } else {
        alert(response.data.message)
      }
      setIsLoader(false)
    } catch (error) {
      setIsLoader(false)
      // console.error('Error fetching unique id:', error.response);

    }
  };

  const handleSaveFamily = async () => {
    // console.log('saveFamily--called')
    setEditFamilyCall(false);
    let params = {
      name: newFamilyName,
      adminId: userDetails.id,
    };
    // console.log('params family', params);
    try {
      let res = await NetworkManager.addFamily(params);
      if (res.data.code === 200) {
        Keyboard.dismiss()
        setNewFamilyName('')
        setErrorMessage('')
        setTimeout(() => alert(res.data.message), 1000)
      } else {
        Keyboard.dismiss()
        setNewFamilyName('')
        setErrorMessage('')
        setTimeout(() => alert(res.data.message), 1000)
      }
    } catch (error) {
      Keyboard.dismiss()
      // console.error('Error fetching unique id:', error.response);
      setTimeout(() => alert(error.response.data.message), 1000)
      setNewFamilyName('')
      setErrorMessage('')
    }
    getFamilyList();
    setIsModalVisible(false);
  };


  const handleFamilyDelete = async (item) => {
    const params = {
      familyId: item.id,
      adminId: userDetails.id
    }

    Alert.alert(
      'Are you want to delete the family?',
      '',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => { }
        },
        {
          text: 'Ok', onPress: async () => {
            try {
              let response = await NetworkManager.deleteFamily(params);
              if (response.data.code === 200) {
                Alert.alert(response.data.message)
                const updatedFamilyDetails = familyDetails.filter((family) => family.id !== item.id);
                setFamilyDetail(updatedFamilyDetails);
                // getFamilyList();
              }
            } catch (error) {
              // console.error('Error fetching unique id:', error.response);
              Alert.alert(error.response.data.message)
            }
          }, style: 'destructive'
        }
      ]
    )
  }



  return (
    <ImageBackground
      source={Images.REGISTRATION}
      resizeMode="cover"
      style={{ width: screenWidth, height: '100%' }}>
      <DrawerNavigator>
        <View style={{flex:1}}>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => navigation.goBack()} >
            <Icon name='arrow-u-left-top' color={'white'} size={32} />
          </TouchableOpacity>
          <TouchableOpacity onPress={showModalAdd} style={styles.addTouchable}>
            <Icon name='plus' size={30} color={'white'} />
          </TouchableOpacity>
        </View>

        <Popover
          isVisible={isModalVisible}
          onRequestClose={() => {
            Keyboard.dismiss()
            setTimeout(() => setIsModalVisible(false), 1000)
            setNewFamilyName('');
            setCurrentItemId([])
          }}
          popoverStyle={styles.popover}>
          <View style={styles.modalContent}>
            {editFamilyCall ? (
              <Text style={styles.textInputHeader}> Change Family Name </Text>
            ) : (
              <Text style={styles.textInputHeader}> Enter Family Name </Text>
            )}
            <TextInput
              value={editFamilyCall ? currentItemId.name : newFamilyName}
              onChangeText={text => {
                const alphabetRegex = /^[A-Za-z]+$/;
                if (setEditFamilyCall) {
                  // Handle edit mode (update currentItemId.name)
                  setCurrentItemId(prevState => ({ ...prevState, name: text }));
                  setNewFamilyName(text);
                } else {
                  // Handle non-edit mode (update newFamilyName)
                  setNewFamilyName(text);
                }
                const isValid = alphabetRegex.test(text);
                setIsNameValid(isValid);

                // Set the error message if the input is not valid
                if (!isValid) {
                  setErrorMessage('Name must contain only alphabets.');
                } else {
                  setErrorMessage('');
                }

              }}

              style={styles.input}
            />
            {errorMessage !== '' && (
              <Text style={styles.errorMessage}> {errorMessage} </Text>
            )}
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={cancelModal}
                style={styles.cancelButton}>
                <Text style={styles.buttonText}> Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={isNameValid ? (editFamilyCall ? editFamilyName : handleSaveFamily) : null}
                style={[styles.saveButton, { backgroundColor: isNameValid ? '#0e9b81' : 'gray', }]}>
                <Text style={styles.buttonText}> Save </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Popover>
        <View style={styles.header}>
          <View>
            <Text style={styles.familyName}> Family Name </Text>
          </View>
          <View>
            <Text style={styles.actionText}>Action</Text>
          </View>
        </View>
        {isLoader === true ? (<Dialog overlayStyle={{ width: 120 }} isVisible={isLoader} >
          <ActivityIndicator size={'large'} color={'#0e9b81'} />
          <Text style={{ textAlign: 'center', color: '#0e9b81' }}>Loading...</Text>
        </Dialog>) : (
          <FlatList
            data={familyDetails}
            style={{ flex: 1 }}
            ListEmptyComponent={<View style={styles.listEmptyComponent}>
              <Icon name='account-group' size={80} color={'white'}/>
              <Text style={{ color: 'white', fontSize: 20 }}>{FAMILY_LIST_EMPTY.familyEmpty}</Text>
            </View>}
            renderItem={({ item }) => (
              <View style={styles.FlatListContainer}>
                <View style={styles.innerContainer}>
                  <View style={styles.iconContainer}>
                    <Icon name="account-group" size={25} color="white" />
                  </View>
                  <View>
                    <TouchableOpacity onPress={() => navigation.navigate('FamilyMember', { familyItem: item })}>
                      <Text style={styles.text}>{item.name}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {item.createdBy === userDetails.id ?
                  <View style={styles.iconView}>
                    <TouchableOpacity
                      onPress={() => showModal(item)}
                      style={{ marginRight: 20 }}>
                      <Icon name="square-edit-outline" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleFamilyDelete(item)}
                      style={{ marginRight: 20 }}>
                      <Icon name="delete" size={20} color="white" />
                    </TouchableOpacity>
                  </View> : null}
              </View>
            )}
          />
          )}
          </View>
      </DrawerNavigator>
    </ImageBackground>
  );
};
export default FamilyDocument;

const styles = StyleSheet.create({
  TextSettings: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginRight: normalize(15),
  },
  header: {
    width: screenWidth - 25,
    marginLeft: 14,
    backgroundColor: 'rgb(212, 215, 219)',
    borderRadius: normalize(8),
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 10,
  },
  addTouchable: {
    backgroundColor: COLORS.darkTransparent,
    marginTop: 5,
    borderRadius: 25,
    marginRight: 20,
    // width: 60,
    padding: 5,
  },
  addText: {
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    width: 235,
    borderWidth: 1,
    marginBottom: 18,
    padding: 8,
    fontSize: 18,
    fontWeight: '500',
  },
  saveButton: {

    width: normalize(90),
    height: normalize(34),
    borderRadius: 20,
    color: 'white',
  },
  cancelButton: {
    backgroundColor: 'red',
    width: normalize(90),
    height: normalize(34),
    marginRight: 10,
    borderRadius: 20,
  },
  popover: {
    width: normalize(290),
    height: normalize(180),
    backgroundColor: 'rgb(212, 215, 219)',
    borderRadius: 8,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 30,
    // textDecorationLine:'underline',
    borderBottomColor: 'white',
    borderBottomWidth: 2
  },
  FlatListContainer: {
    height: normalize(50),
    backgroundColor: COLORS.darkTransparent,
    marginTop: 5,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    // width:'75%',
    marginLeft: 14,
    justifyContent: 'space-between',
    width: screenWidth - 25,
  },
  familyName:{
    fontSize: 20,
    fontWeight: '500',
    color: 'black',
    marginLeft: 20,
  },
  actionText:{
    fontSize: 20,
    fontWeight: '500',
    color: 'black',
    marginRight: 30,
  },
  listEmptyComponent:{ 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 130 
  },
  iconView:{ 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  innerContainer:{ 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  iconContainer:{ 
    height: 37, 
    width: 37, 
    borderRadius: 25, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  buttonText:{
    textAlign: 'center',
    marginTop: 6,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  textInputHeader:{
    color: 'black',
    fontSize: 18,
    fontWeight: '500',
    marginVertical: 10,
  },
  errorMessage:{ 
    color: 'red', 
    fontSize: 15, 
    marginVertical: 5, 
    marginBottom: 10 
  }
});
