import React, { useState, useEffect, cloneElement, Fragment } from 'react';
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
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Popover from 'react-native-popover-view';
import { COLORS } from '../../utilities/colors';
import NetworkManager from '../../services/NetworkManager';
import { Snackbar } from 'react-native-paper';
import { retrieveUserDetail } from '../../storageManager';
import DrawerNavigator from '../../components/common/DrawerNavigator';
import CheckBox from '@react-native-community/checkbox';
import { Dialog } from '@rneui/themed';

const DocumentFamily = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const Document = route.params.document;
  const CategoryInfo = route.params.categoryInfo;
  const [categoryInfo,setCategoryInfo] = useState(CategoryInfo)
  const [document,setDocument] = useState(Document)
  const [familyDetails, setFamilyDetail] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [selectedFamily,setSelectedFamily] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentShareMembersList, setCurrentShareMembersList] = useState([])


  useEffect(() => {
    setIsLoading(true)
    getDocumentDetails()
    getFamilyList();
  }, []);

  const getFamilyList = async () => {
    let UserId = await retrieveUserDetail();
    setUserDetails(UserId);
    try {
      let response = await NetworkManager.listFamily(UserId.id);
      // console.log('response================>>>',response)
      let FamilyList = response.data.response.familyList;
      if (response.data.code === 200) {
        setFamilyDetail(FamilyList);
      //  console.log('famlyDetails--00-0--0->',familyDetails)
      }
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      // console.error('Error fetching unique id:', error.response);

    }
  };

  const getDocumentDetails = async () => {
    // console.log('getDocumentDetails==========>>.><<<<>>><///',document.documentId)
    try {
        let response = await NetworkManager.getDocumentsById(document.documentId)
        // console.log('response==>getDocumentDetails_____))____)_)_)_)))_', JSON.stringify(response.data))
        if (response.data.code === 200) {
            let memberIdArray = response.data.response.memberIds
            setCurrentShareMembersList(memberIdArray)
        }
        
    } catch (error) {
        console.error('Error in listFamilyMembers:', error);  
    }
  }
  const handleShareDocument = async () => {
    let familyMembersResult = await NetworkManager.listFamilyMembers(selectedFamily)
    const params = {
      familyId: selectedFamily,
      documentId: document.documentId,
      revokeAccess: [],
      provideAccess: familyMembersResult?.data?.response?.MemberList?.filter(filterItem => (Document.uploadedBy !== filterItem.user.id && !currentShareMembersList?.includes(filterItem.id)))?.map(item => item.id) ?? [],
      updatedBy: document.uploadedBy
    }
    // console.log('params========>>>', params, familyMembersResult?.data?.response?.MemberList)
    try {
        let response = await NetworkManager.updateDocument(params)
        // console.log('response==>handleShareDocument', response?.data)
        if (response.data.code === 200) {
            Alert.alert(
                'Success',
                'Document shared successfully',
                [
                    {
                      text: 'OK',
                      onPress: () => {
                        setSelectedFamily(false)
                        navigation.goBack()
                      }
                    },
                ],
                { cancelable: false }
            );
        }
    } catch (error) {
      Alert.alert(
        '',
        error.response.data.message,
          [
              {
                text: 'OK',
                onPress: () => {}
              },
          ],
          { cancelable: false }
      );
        console.error('Error in listFamilyMembers:', error.response.data);
    }
  }
  const filteredFamilyDetails = document.familyId ? familyDetails.filter(item => item.id === Document.familyId) : familyDetails;
  // console.error('Error in listFamilyMembers Document', Document, );
  return (
    <ImageBackground
      source={Images.REGISTRATION}
      resizeMode="cover"
      style={{ width: screenWidth, height: '100%' }}>
      <DrawerNavigator>
        <View style={styles.header}>
          <View>
            <TouchableOpacity onPress={() => navigation.navigate('DocumentScannerScreen', {document:document,categoryInfo:categoryInfo })}>
            <Icon name="arrow-left" size={25} color="black" />
            </TouchableOpacity>
          </View>
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '500',
                color: 'black',
                marginLeft:20
              }}>
              Family Name
            </Text>
          </View>
        </View>
        {selectedFamily ? <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
              <TouchableOpacity
                  style={styles.addTouchable}
                  onPress={handleShareDocument}>
                    <Icon name="share" size={25} color="white" />
                  <Text style={styles.addText}>  Share</Text>
              </TouchableOpacity>
          </View> : null
        }
        <FlatList
          data={filteredFamilyDetails}
          style={{ flex: 1 }}
          ListEmptyComponent={<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 130 }}>
            <Text style={{ color: 'white', fontSize: 20 }}>No more family added.</Text>
          </View>}
          renderItem={({ item }) => (
            <View style={styles.FlatListContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10, alignSelf: 'center' }}>
                  <Icon name="account-group" size={30} color="white" />
                  <TouchableOpacity onPress={() => {
                    setSelectedFamily(false)
                    navigation.navigate('DocumentMember', { familyItem: item, document:document, categoryInfo:categoryInfo,userDetails:userDetails })
                  }}>
                    <Text style={styles.text}>{item.name}</Text>
                  </TouchableOpacity>
                </View>
                {<CheckBox
                    tintColors={{ true: 'red', false: 'white' }}
                    value={selectedFamily === item.id}
                    onValueChange={(value) => setSelectedFamily( selectedFamily === item.id ? false : item.id)}
                />}
              </View>
            </View>
          )}
        /> 

        <Dialog overlayStyle={{ width: 120 }} isVisible={isLoading} >
            <ActivityIndicator size={'large'} color={'#0e9b81'} />
            <Text style={{ textAlign: 'center',color:'#0e9b81' }}>Loading...</Text>
        </Dialog>
      </DrawerNavigator>
    </ImageBackground>
  );
};
export default DocumentFamily;

const styles = StyleSheet.create({
  TextSettings: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginRight: normalize(15),
  },
  header: {
    // height: normalize(50),
    width: screenWidth - 25,
    marginLeft: 14,
    backgroundColor: 'rgb(212, 215, 219)',
    borderRadius: normalize(8),
    marginTop: 10,
    padding: 15,
    marginBottom: 10,
    alignItems:'center',
    justifyContent:'flex-start',
    flexDirection:'row'
  },
  addTouchable: {
    backgroundColor: COLORS.darkTransparent,
    marginTop: 5,
    borderRadius: 8,
    marginRight: 10,
    // width: 60,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  addText: {
    textAlign: 'center',
    color: COLORS.white,
    // fontSize: 16,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
    // textDecorationLine:'underline',
    borderBottomColor: 'white',
    borderBottomWidth: 2
  },
  FlatListContainer: {
    // height: normalize(50),
    backgroundColor: COLORS.darkTransparent,
    marginTop: 5,
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    // width:'75%',
    marginLeft: 14,
    justifyContent: 'space-between',
    width: screenWidth - 25,
  },
});
