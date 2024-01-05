import React, { useRef, useState, useEffect, cloneElement } from 'react';
import {
  ScrollView,
  StyleSheet,
  ImageBackground,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  PermissionsAndroid,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { normalize, screenWidth, screenHeight } from '../../../utilities/measurement';
import { COLORS } from '../../../utilities/colors';
import { Images } from '../../../assets/images/images';
import { useNavigation } from '@react-navigation/native';
import Dashboard from '../../Dashboard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DrawerNavigator from '../../../components/common/DrawerNavigator';
import NetworkManager from '../../../services/NetworkManager';
import { useFocusEffect } from '@react-navigation/native';
import { color } from '@rneui/base';
import { retrieveUserDetail } from '../../../storageManager';
import Contacts from 'react-native-contacts';
import { Dialog } from '@rneui/themed';
import { FAMILY_LIST_EMPTY } from '../../../utilities/strings';
import { processAddressBookContacts } from '../../../utilities/Utils';
import CustomSnackBar from '../../../components/common/SnackBar';
import {check, PERMISSIONS, RESULTS,request} from 'react-native-permissions';
import MemberFlatlist from './components/MemberFlatlist';
import Loader from '../../../../src/components/common/Loader'


const FamilyMember = ({ navigation, props }) => {
  const route = useRoute();
  const NewItem = route.params.familyItem;
  const [familyItem, setFamilyItem] = useState(NewItem);
  const [myContacts, setMyContacts] = useState([]);
  const [newContactsArray,setNewcontactsArray] = useState([])
  const [familyMember, setFamilyMember] = useState([])
  const [userDetails, setUserDetails] = useState([])
  const insets = useSafeAreaInsets();
  const [isLoader, setIsLoader] = useState(true);
  const [iconEnabled, setIconEnabled] = useState(false)
  const [arrayCombined, setArrayCombined] = useState([])
  const [myContactsUpdated, setMyContactsUpdated] = useState(false);
  const [newExterNalInvites,setNewExternalInvites] = useState([]);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false)


  const checkContactPermission = async () => {
    if(Platform.OS === 'ios'){
      let status = await check(PERMISSIONS.IOS.CONTACTS);
      if(status === RESULTS.GRANTED){
       loadContacts();
      }else if(status === RESULTS.DENIED){
        let reqContacts = await request(PERMISSIONS.IOS.CONTACTS);
        if(reqContacts === RESULTS.GRANTED){
          loadContacts();
        }else{
          setIsSnackbarVisible({ message:'Permission to access contacts was denied. You can update it in your device settings.', visible: true})
        }
      }else if(status === RESULTS.UNAVAILABLE){
        setIsSnackbarVisible({ message:'This feature is not available (on this device / in this context)', visible: true})

      }else{
        setIsSnackbarVisible({ message:'Permission to access contacts was denied. You can update it in your device settings.', visible: true})
      }
  } else {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts Permission',
          message: 'This app needs access to your contacts.',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        loadContacts();
      }else {
        setIsSnackbarVisible({ message:'Permission to access contacts was denied. You can update it in your device settings.', visible: true})
      }
    } catch (err) {
      console.warn(err);
    }
  }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      setFamilyItem(NewItem);
      getUser();
      checkContactPermission();
      listFamilyMembers(NewItem);
    });

    return unsubscribe;
  }, [myContacts]);

  useEffect(() => {
    // Add a check to ensure myContacts is not empty and myContactsUpdated is set to true
    getUpdateMemberList();
  }, [myContacts, familyMember, myContactsUpdated]);

   const getUpdateMemberList = async () =>{
    let userData = await retrieveUserDetail()
         
    if (myContacts.length > 0 && myContactsUpdated) {
      const updatedExternalInvite = mapPhoneNumbersToDisplayNames(myContacts);
      let updatedCombinedArray = userData.id === familyItem.createdBy ? [...familyMember, ...updatedExternalInvite] : familyMember.filter(filterItem => filterItem.inviteStatus ===  "Accepted") ;
      setArrayCombined(updatedCombinedArray);
    }
   }
  

  const requestContactPermissionAgain = async (isPressedAdd) => {
    if(Platform.OS === 'ios'){
      let status = await check(PERMISSIONS.IOS.CONTACTS);
      console.log('status,',status)
      if(status === RESULTS.GRANTED){
        isPressedAdd ?  navigation.navigate('CommonInvite', { familyItem: familyItem, familyMember: familyMember,arrayCombined : arrayCombined,myContacts:myContacts }) : loadContacts();
      }else if(status === RESULTS.DENIED){
        let reqContacts = await request(PERMISSIONS.IOS.CONTACTS);
        if(reqContacts === RESULTS.GRANTED){
          loadContacts();
        }else{
          setIsSnackbarVisible({ message:'Permission to access contacts was denied. You can update it in your device settings.', visible: true})
        }
      }else if(status === RESULTS.UNAVAILABLE){
        setIsSnackbarVisible({ message:'This feature is not available (on this device / in this context)', visible: true})

      }else{
        setIsSnackbarVisible({ message:'Permission to access contacts was denied. You can update it in your device settings.', visible: true})
      }
    }else{
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts Permission',
          message: 'This app needs access to your contacts.',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        isPressedAdd ?  navigation.navigate('CommonInvite', { familyItem: familyItem, familyMember: familyMember,arrayCombined : arrayCombined,myContacts:myContacts }) : loadContacts();
      }else {
        setIsSnackbarVisible({ message:'Permission to access contacts was denied. You can update it in your device settings.', visible: true})
      }
    } catch (err) {
      console.warn(err);
    }
  }
  };


  const loadContacts = () => {
    Contacts.getAll()
      .then((contacts) => {
        const processedContacts = processAddressBookContacts(contacts)
        setMyContacts((prevContacts) => [...prevContacts, ...processedContacts]);
        setMyContactsUpdated(true);
      })
      .catch((e) => {
        setIsSnackbarVisible({ message:'Permission to access contacts was denied', visible: true})
        console.warn('Permission to access contacts was denied');
      });
  };


  const getUser = async () => {
    let UserId = await retrieveUserDetail();
    setUserDetails(UserId);
  }

 

  const mapPhoneNumbersToDisplayNames = (externalInvites) => {
    const phoneToDisplayNameMap = {};
    myContacts.forEach((contact) => {
      if (contact?.name?.length > 0) {
        const normalizedPhoneNumber = contact.phoneNumber?.length > 10 ? contact.phoneNumber.substr(contact.phoneNumber.length - 10, contact.phoneNumber.length) : contact?.phoneNumber ?? '';
        phoneToDisplayNameMap[normalizedPhoneNumber] = contact.name; 
      }
    });
    const updatedExternalInvites = newExterNalInvites.map((phone) => ({
      displayName: phoneToDisplayNameMap[phone] || phone ,
      phone: phone,
      inviteStatus: 'Invited'
    }));
    return updatedExternalInvites;
  };

  const listFamilyMembers = async (family) => {
    try {

      let userData = await retrieveUserDetail()
      let response = await NetworkManager.listFamilyMembers(family.id)
        if (response.data.code === 200) {
          let memberList = response.data.response.MemberList.filter(filterItem => filterItem.user.id !== userData.id)
          let externalInvite = response.data.response.ExternalInvites
          setNewExternalInvites(externalInvite)
          const updatedExternalInvite = mapPhoneNumbersToDisplayNames(externalInvite);
          let updatedCombinedArray = userData.id === familyItem.createdBy ? [...memberList, ...updatedExternalInvite] :  memberList.filter(filterItem => filterItem.inviteStatus ===  "Accepted") ;
          setArrayCombined( updatedCombinedArray)
          setFamilyMember(memberList)
          setIsLoader(false)
        } else {
          setIsLoader(false)
        }
    } catch (error) {
      setIsLoader(false)
    }
  }

  

  return (
    <ImageBackground
      source={Images.REGISTRATION}
      resizeMode="cover"
      style={{ width: screenWidth, height: '100%' }}>
      <DrawerNavigator>
        <View style={{flex:1}}> 
        <View style={styles.container}>
         <View style={styles.innerContainer}>
         <TouchableOpacity onPress={() => navigation.navigate('FamilyDocument')} >
            <Icon name='arrow-u-left-top' color={'white'} size={32} />
          </TouchableOpacity>
          <Text
            style={styles.familyItemName}>
            {familyItem.name}
          </Text>
         </View>
          
          <View style={{ alignItems: 'flex-end' }}>
          {userDetails.id === familyItem.createdBy ? <TouchableOpacity
            style={styles.addTouchable}
            onPress={()=>requestContactPermissionAgain(true)}>
            <Icon name='plus' size={30} color={'white'}/>
          </TouchableOpacity>: null}
        </View>
        </View>
        
        <View style={styles.header}>
          <View>
            <Text  style={styles.memberText}> Member Name </Text>
          </View>
          {userDetails.id === familyItem.createdBy ? <View>
            <Text style={styles.actionText}> Action </Text>
          </View> : null}
        </View>

        {isLoader === true ?( <Loader isLoading={isLoader} text={'loading'}/> ) : (
       <MemberFlatlist arrayCombined={arrayCombined} familyItem={familyItem} />
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

const styles = StyleSheet.create({
  addTouchable: {
    backgroundColor: COLORS.darkTransparent,
    marginTop: 5,
    borderRadius: 25,
    marginRight: 20,
    padding: 5,
  },
  addText: {
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  text: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  FlatListContainer: {
    backgroundColor: COLORS.darkTransparent,
    marginTop: 5,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    marginLeft: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: screenWidth - 25,
  },
  header: {
    height: 'auto',
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
  familyItemName:{
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginLeft:30
  },
  memberText:{
    fontSize: 20,
    fontWeight: '500',
    color: 'black',
    marginLeft: 10,
  },
  actionText:{
    fontSize: 20,
    fontWeight: '500',
    color: 'black',
  },
  listEmptyComponent:{ 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 100 
  },
  iconView:{ 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  container:{ 
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent:'space-between',
    marginTop:10,
    marginLeft:20 
  },
  innerContainer:{
    alignItems:'center',
    flexDirection:'row',
    justifyContent:'flex-start'
  },
  snackBar: {
    alignSelf: 'center',
    bottom: normalize(50),
    alignContent: 'center',
    backgroundColor: 'white',
    zIndex: 1,
    width:'90%'
},
  
});

export default FamilyMember;
