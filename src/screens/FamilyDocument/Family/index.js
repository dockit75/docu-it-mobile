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
import { normalize, screenHeight, screenWidth } from '../../../utilities/measurement';
import { Images } from '../../../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Popover from 'react-native-popover-view';
import { COLORS } from '../../../utilities/colors';
import NetworkManager from '../../../services/NetworkManager';
import { Snackbar } from 'react-native-paper';
import { retrieveUserDetail } from '../../../storageManager';
import DrawerNavigator from '../../../components/common/DrawerNavigator';
import { Dialog ,LinearProgress} from '@rneui/themed';
import { FAMILY_LIST_EMPTY } from '../../../utilities/strings';
import CustomSnackBar from '../../../components/common/SnackBar';
import FamilyModal from '../Family/components/FamilyModal';
import Loader from '../../../components/common/Loader';
import FamilyFlatlist from '../Family/components/FamilyFLatlist';

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
  const [isNameEdited, setIsNameEdited] = useState(false);
  const [previousCurrentItemId,SetPreviousCurrentItemId] = useState([])
  const [savePressed,setSavePressed] = useState(false)
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)


  const showModalAdd = () => {
    console.log('show add modal called')

    setNewFamilyName('')
    setEditFamilyCall(false);
    setIsModalVisible(true);
    console.log('ismodalVisible===>addd',isModalVisible)
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
      let FamilyList = response.data.response.familyList;
      if (response.data.code === 200) {
        setFamilyDetail(FamilyList);
      } else {
        alert(response.data.message)
      }
      setIsLoader(false)
    } catch (error) {
      setIsLoader(false)
    }
  };
 

  return (
    <ImageBackground
      source={Images.REGISTRATION}
      resizeMode="cover"
      style={{ width: screenWidth, height: '100%' }}>
      <DrawerNavigator>
        <View style={{flex:1,height:'100%'}}>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => navigation.goBack()} >
            <Icon name='arrow-u-left-top' color={'white'} size={32} />
          </TouchableOpacity>
          <TouchableOpacity onPress={showModalAdd} style={styles.addTouchable}>
            <Icon name='plus' size={30} color={'white'} />
          </TouchableOpacity>
        </View>

       {isModalVisible === true && <FamilyModal isModalVisible={isModalVisible} editFamilyCall={editFamilyCall} userDetails={userDetails}  currentItemId={currentItemId} getFamilyList={getFamilyList}/>}

        <View style={styles.header}>
          <View>
            <Text style={styles.familyName}> Family Name </Text>
          </View>
          <View>
            <Text style={styles.actionText}>Action</Text>
          </View>
        </View>
        {isLoader === true ? <Loader isLoading={isLoader} text={'loading'}/> : (
          <FamilyFlatlist  familyDetails={familyDetails} userDetails={userDetails}  getFamilyList={getFamilyList}/>
          )}
          <CustomSnackBar
            message={isSnackbarVisible?.message}
            status={isSnackbarVisible?.visible}
            setStatus={setIsSnackbarVisible}
            styles={[styles.snackBar, {backgroundColor: isSnackbarVisible.isFailed ? COLORS.red : '#0e9b81'}]}
            textStyle={{ color: COLORS.white, textAlign: 'left', fontSize: 13 }}
            roundness={10}
            duration={isSnackbarVisible.isFailed ? 3000 : 2000}
          />
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
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth * 0.75,
    backgroundColor: 'rgb(212, 215, 219)',
    padding: 20, 
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLORS.avatarBackground
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
  },
  snackBar: {
    alignSelf: 'center',
    bottom: normalize(50),
    alignContent: 'center',
    backgroundColor: 'white',
    zIndex: 1
},
});
