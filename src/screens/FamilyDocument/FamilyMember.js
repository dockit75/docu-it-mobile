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
  ActivityIndicator
} from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { normalize, screenWidth, screenHeight } from '../../utilities/measurement';
import { COLORS } from '../../utilities/colors';
import { Images } from '../../assets/images/images';
import { useNavigation } from '@react-navigation/native';
import Dashboard from '../Dashboard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DrawerNavigator from '../../components/common/DrawerNavigator';
import NetworkManager from '../../services/NetworkManager';
import { useFocusEffect } from '@react-navigation/native';
import { color } from '@rneui/base';
import { retrieveUserDetail } from '../../storageManager';
import Contacts from 'react-native-contacts';
import { Dialog } from '@rneui/themed';
import { FAMILY_LIST_EMPTY } from '../../utilities/strings';

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
  const [newExterNalInvites,setNewExternalInvites] = useState([])


  const checkContactPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts Permission',
          message: 'This app needs access to your contacts.',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // console.log('Contacts permission granted');
        loadContacts();
      }else {
        // console.log('Contacts permission denied');
        alert('Permission to access contacts was denied. You can update it in your device settings.');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    // console.log('useEffect called...')
    const unsubscribe = navigation.addListener('focus', async () => {
      setFamilyItem(NewItem);
      getUser();
      checkContactPermission();
      listFamilyMembers(NewItem);
    //  console.log('familyItem',familyItem)
    });
    // console.log('myContacts===>', myContacts);

    return unsubscribe;
  }, [myContacts]);

  useEffect(() => {
    // Add a check to ensure myContacts is not empty and myContactsUpdated is set to true
    if (myContacts.length > 0 && myContactsUpdated) {
      const updatedExternalInvite = mapPhoneNumbersToDisplayNames(myContacts);
      let updatedCombinedArray = [...familyMember, ...updatedExternalInvite];
      setArrayCombined(updatedCombinedArray);
    }
  }, [myContacts, familyMember, myContactsUpdated]);


  

  const requestContactPermissionAgain = async (isPressedAdd) => {
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
        Alert.alert('Permission to access contacts was denied. You can update it in your device settings.');
      }
    } catch (err) {
      console.warn(err);
    }
  };


  const loadContacts = () => {
    Contacts.getAll()
      .then((contacts) => {
        contacts.sort(
          (a, b) =>
            a.givenName.toLowerCase() > b.givenName.toLowerCase(),)
            let contactList = contacts.map(contact =>{
                      if (contact.phoneNumbers.length > 0) {
                            return {
                              name : contact.givenName,
                              phoneNumber : contact.phoneNumbers[0].number.replace(/\D/g, '')
                            }
                      }
                    })
        setMyContacts((prevContacts) => [...prevContacts, ...contactList]);
        setMyContactsUpdated(true);
      })
      .catch((e) => {
        alert('Permission to access contacts was denied');
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
        // Normalize the phone number to match the format in externalInvite
        const normalizedPhoneNumber = contact.phoneNumber?.length > 10 ? contact.phoneNumber.substr(contact.phoneNumber.length - 10, contact.phoneNumber.length) : contact?.phoneNumber ?? '';
        phoneToDisplayNameMap[normalizedPhoneNumber] = contact.name; 
      }
    });
    // Map display names from myContacts to externalInvites based on common phone numbers
    const updatedExternalInvites = newExterNalInvites.map((phone) => ({
      displayName: phoneToDisplayNameMap[phone] || phone ,
      phone: phone,
      inviteStatus: 'Invited'
    }));
    return updatedExternalInvites;
  };

  const listFamilyMembers = async (family) => {
    try {

      // setIsLoader(true)
      let userData = await retrieveUserDetail()
      let response = await NetworkManager.listFamilyMembers(family.id)
        if (response.data.code === 200) {
          let memberList = response.data.response.MemberList.filter(filterItem => filterItem.user.id !== userData.id)
          let externalInvite = response.data.response.ExternalInvites
          setNewExternalInvites(externalInvite)
          const updatedExternalInvite = mapPhoneNumbersToDisplayNames(externalInvite);
          let updatedCombinedArray = [...memberList, ...updatedExternalInvite];
          setArrayCombined(updatedCombinedArray)
          setFamilyMember(memberList)
          setIsLoader(false)
        } else {
          setIsLoader(false)
        }
    } catch (error) {
      setIsLoader(false)
    }
  }

  const handleInviteUser = async (item) => {
    const params = {
      phoneNumbers: [item.user?.phone ?? item.phone],
      familyId: familyItem.id,
      invitedBy: userDetails.id
    }
    // console.log('handleInviteUser ====== Params', params)
    try {
      let response = await NetworkManager.inviteUser(params)
      if (response.data.code === 200) {
        alert(response.data.message)
        setIconEnabled(true)
      } 
    } catch (error) {
      alert(error.response.data.message)
    }

  }

  const handleFamilyMemberDelete = async (item) => {
    const params = {
      memberIds: [item.id]
    }
    Alert.alert(
      'Are you want to delete the member?',
      '',
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {}
      },
      { text: 'Ok', onPress: async () => {
        try {
          let response = await NetworkManager.removeFamilyMembers(params)
          if (response.data.code === 200) {
            Alert.alert(response.data.message)
            const updatedCombinedArray = arrayCombined.filter(
              arrayItem => arrayItem !== item
            );     
            setArrayCombined(updatedCombinedArray)
          } else {
          }
        } catch (error) {
          Alert.alert(error.response.data.message)
        }
      }, style: 'destructive' }
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
          <View>
            <Text style={styles.actionText}> Action </Text>
          </View>
        </View>

        {isLoader === true ?(<Dialog overlayStyle={{ width: 120 }} isVisible={isLoader} >
          <ActivityIndicator size={'large'} color={'#0e9b81'} />
          <Text style={{ textAlign: 'center',color:'#0e9b81' }}>Loading...</Text>
        </Dialog> ) : (
        <FlatList
          data={arrayCombined}
          style={{ flex: 1 }}
          ListEmptyComponent={<View style={styles.listEmptyComponent}>
            <Icon name='account' size={80} color={'white'}/>
            <Text style={{ color: 'white', fontSize: 20 }}>{FAMILY_LIST_EMPTY.memberEmpty}</Text>
          </View>}
          renderItem={({ item }) => (
            <View style={styles.FlatListContainer}>
              {typeof item === 'object' ? ( // Check if item is an object (family member)
                <View>
                  <Text style={styles.text}>
                  {item.user ? item.user.name : ''} {item.displayName ? `(${item.displayName})` : ''}
                  </Text>
                </View>
              ) : ( // Otherwise, it's a phone number
                <View>
                  <Text style={styles.text}>{item.phone}</Text>
                </View>
              )}
              <View style={styles.iconView}>
                {item.inviteStatus === 'Invited' ? (
                  <View>
                    <TouchableOpacity onPress={() => handleInviteUser(item)} style={{ marginRight: 20 }}>
                      {iconEnabled ? <Icon name="account-plus" size={28} color="white" /> : <Icon name="account-multiple-plus" size={28} color="white" />}
                    </TouchableOpacity>
                  </View>) : null}
                {(item.inviteStatus === 'Accepted' && userDetails.id === familyItem.createdBy ) ? (
                  <View>
                    <TouchableOpacity style={{ marginRight: 20 }} onPress={() => handleFamilyMemberDelete(item)}>
                      <Icon name="delete" size={25} color="white" />
                    </TouchableOpacity>
                  </View>) : null}

              </View>
            </View>
          )}
        />
        )}
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
    height: normalize(50),
    backgroundColor: COLORS.darkTransparent,
    marginTop: 5,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    // width:'75%',
    marginLeft: 14,
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
    textTransform: 'uppercase',
    marginLeft:30
  },
  memberText:{
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
  }
  
});

export default FamilyMember;
