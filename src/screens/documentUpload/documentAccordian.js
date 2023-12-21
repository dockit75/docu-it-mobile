import React, { useState, useEffect, cloneElement, Fragment, useRef } from 'react';
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
    ScrollView
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
import { Dialog,LinearProgress } from '@rneui/themed';
import { FAMILY_LIST_EMPTY } from '../../utilities/strings';
import { addContact } from 'react-native-contacts';
import CustomSnackBar from '../../components/common/SnackBar';

const DocumentAccordian = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const Document = route.params.document;
    const CategoryInfo = route.params.categoryInfo;
    const isSaveDocumentFlow = route.params.isSaveDocumentFlow;
    const [categoryInfo, setCategoryInfo] = useState(CategoryInfo)
    const [document, setDocument] = useState(Document)
    const [familyDetails, setFamilyDetail] = useState([]);
    // const [familyMember, setFamilyMember] = useState([]);
    const [userDetails, setUserDetails] = useState([]);
    // const [selectedFamily, setSelectedFamily] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    // const [currentShareMembersList, setCurrentShareMembersList] = useState([]);
    // const [selectedFamilyId, setSelectedFamilyId] = useState(null);
    // const [selectedFamilyIndex, setSelectedFamilyIndex] = useState(null);
    // const [showFamilyMembers, setShowFamilyMembers] = useState(false);
    const [selectedFamilyIds, setSelectedFamilyIds] = useState([]);
    let [addMembers,setAddMembers] = useState([]);
    const [openedIndices, setOpenedIndices] = useState([]);
    let [revokeMembers, setRevokeMembers] = useState([]);
    const [memberData, setMembersData] = useState([]);
    const [isProcessing,setIsProcessing] = useState(false);
    const [familyData,setFamilyData] = useState([]);
    const [isSnackbarVisible, setIsSnackbarVisible] = useState(false)

    const isMounted = useRef(true);

    useEffect(() => {
        getUserDetails()
        getFamilyWithMember();
        getDocumentDetails();
        // console.log('document',document,categoryInfo)
    }, []);
    const getUserDetails = async() => {
        let UserId = await retrieveUserDetail();
        setUserDetails(UserId)
    }



 const getFamilyWithMember = async () =>{
    let UserId = await retrieveUserDetail();
        try {
            let response = await NetworkManager.getFamilyWithMembers(UserId.id);
            // console.log('getFamilyWithMember================>>>', response)
            let FamilyList = response.data.response.familyListWithMembers;
            // console.log('FamilyList',FamilyList)
            if (response.data.code === 200) {
                setFamilyDetail(FamilyList);
                
            }
        } catch (error) {
           

        }
 }

 const getDocumentDetails = async () => {
    // console.log('getDocumentDetails==========>>.><<<<>>><///',document.documentId)
    try {
        let response = await NetworkManager.getDocumentsById(document.documentId ?? Document.id,)
        // console.log('response==>getDocumentDetails_____))____)_)_)_)))_',(response.data))
        if (response.data.code === 200) {
            let memberIdArray = response.data.response.memberIds
            setAddMembers(memberIdArray)
            setMembersData(memberIdArray)
            setFamilyData([...new Set(response.data.response.sharedDetails.map(item => item.member.family.id))])
            setSelectedFamilyIds([...new Set(response.data.response.sharedDetails.map(item => item.member.family.id))])
            setIsLoading(false)
        }
    } catch (error) {
        console.error('Error in listFamilyMembers:', error);  
        setIsLoading(false)
    }
  }


 const handleShareDocument = async () => {
    setIsProcessing(true)
    const uniqueFamilyIds = [...new Set(selectedFamilyIds)];
    const uniqueAddMembers = [...new Set(addMembers)]; 
    const uniqueRevokembers = [...new Set(revokeMembers)]; 
    const params = {
        familyId:uniqueFamilyIds,
        documentId: document.documentId ?? Document.id,
        categoryId: categoryInfo.categoryId,
        revokeAccess: uniqueRevokembers,
        provideAccess: uniqueAddMembers,
        documentName: document.documentName,
        updatedBy: document.uploadedBy ?? Document.updatedBy
    }
    console.log('params========>>>', params)
    try {
        let response = await NetworkManager.updateDocument(params)
        // console.log('handleShareDocument--->>',response)
        if (response.data.code === 200) {
            setIsProcessing(false)
            setIsSnackbarVisible({ message: 'Document shared successfully', visible: true})
            if (isSaveDocumentFlow) {
                setTimeout(() => navigation.pop(3), 1500); // Adjust the delay (1000 milliseconds = 1 second)
            } else {
                setTimeout(() => navigation.goBack(), 1500); // Adjust the delay
            }
        }
    } catch (error) {
        console.error('Error in listFamilyMembers:', error);
        setIsProcessing(false)
        setIsSnackbarVisible({ message: error.response.data.message, visible: true})
      
    }
}
       
 const handleSelectFamily = (item, index) => {
    const indexOfItem = openedIndices.indexOf(index);

    const newOpenedIndices = [...openedIndices];
    if (indexOfItem !== -1) {
        newOpenedIndices.splice(indexOfItem, 1);
    } else {
        newOpenedIndices.push(index);
    }

    setOpenedIndices(newOpenedIndices);
};


    const handleShareCheckBox = (memberId,familyId,familyDetail,isPressedFamily,isCheckWholeFamily) => {
       if(isPressedFamily){
           let memberIds = familyDetail.membersList.map(item => item.id)
    
           if(selectedFamilyIds.includes(familyId) && isCheckWholeFamily){
               let updatedFamilyIds = selectedFamilyIds.filter(familyItem => familyItem != familyId )
               let updatedMemberIds = addMembers.filter(memberItem => !memberIds.includes(memberItem) )
            //   
               setAddMembers(updatedMemberIds)
               let value = familyData.filter((itm) => itm.id != `${familyId}`);
               if (value.includes(`${familyId}`)) {
                setSelectedFamilyIds(selectedFamilyIds)
               setRevokeMembers((prevRevokeMembers) => [...prevRevokeMembers, ...memberIds])
            //    setSelectedFamilyIds(familyId)
               }

           }else{
            let updatedFamilyIds = [...selectedFamilyIds,familyId]
            let updatedMemberIds = [...addMembers,...memberIds]
            setSelectedFamilyIds(updatedFamilyIds)
            setAddMembers(updatedMemberIds)
            setRevokeMembers((prevRevokeMembers) => prevRevokeMembers.filter(memberItem => !memberIds.includes(memberItem)))
            // let updatedFamilyIds = isCheckWholeFamily ? [familyId] : [...selectedFamilyIds, familyId];
            // let updatedMemberIds = isCheckWholeFamily ? memberIds : [...addMembers, ...memberIds];
            // setSelectedFamilyIds(updatedFamilyIds);
            // setAddMembers(updatedMemberIds);
            // setRevokeMembers((prevRevokeMembers) => prevRevokeMembers.filter(memberItem => !memberIds.includes(memberItem)));
           }
       }else{
        if (addMembers.includes(`${memberId}`)) {
            setAddMembers(prev => prev.filter(filterItem => filterItem != memberId))
            let value = memberData.filter((itm) => itm.id != `${memberId}`);
            if (value.includes(`${memberId}`)) {
                setRevokeMembers((prevRevokeMembers) => [...prevRevokeMembers, `${memberId}`]);
            }
            if (value.length === 0 && selectedFamilyIds.includes(familyId)) {
                setSelectedFamilyIds(prev => prev.filter(selectedFamilyId => selectedFamilyId !== familyId));
                // setRevokeMembers(prev => prev.filter(filterItem => filterItem != memberId))

            }
        } else {
            addMembers = [...addMembers, `${memberId}`]
            setAddMembers(addMembers)
            setRevokeMembers(prev => prev.filter(filterItem => filterItem != memberId))
            if (!selectedFamilyIds.includes(familyId)) {
                setSelectedFamilyIds(prev => [...prev, familyId]);
                setRevokeMembers(prev => prev.filter(filterItem => filterItem != memberId))
            }
        }
       }
    }

    const FamilyAccordionHeader = ({ item, index,openedIndices }) => {
      
        let membersList = item.membersList.filter(filterItem => filterItem.user.id !== userDetails.id )
        let membersCount = membersList?.length 
        // console.log('membersList',membersList,addMembers,item.name)
        let isCheckWholeFamily =membersList.length && membersList.every(memberItem => addMembers.includes(memberItem.id))
        const isOpen = openedIndices.includes(index);
        let uncheckBoxColor = membersCount ? COLORS.white : COLORS.lightNeutral
        return (
            <View>
                <View style={styles.FlatListContainer}>
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start' }}>
                                <Icon name="account-group" size={25} color="white" />
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white', marginLeft: 10 }}>{item.name}</Text>
                            </View>
                          <View style={{alignItems:'center',justifyContent:'space-between',flexDirection:'row'}}>
                            <CheckBox
                                style={{ marginRight:5,width:20,height:20 }}
                                tintColors={{ true: COLORS.red, false: uncheckBoxColor }}
                                onCheckColor={COLORS.white}
                                onTintColor="green"
                                offFillColor={COLORS.white}
                                offTintColor={COLORS.white}
                                onAnimationType="fill"
                                value={isCheckWholeFamily}
                                disabled={membersCount === 0}
                                boxType='square'
                                onValueChange={() =>membersCount ? handleShareCheckBox(null,item.id,item,true,isCheckWholeFamily):null}
                            />
                            <TouchableOpacity onPress={() =>membersCount? handleSelectFamily(item, index):null}>
                                <Icon
                                    name={openedIndices.includes(index) ? 'chevron-up' : 'chevron-down'}
                                    size={25}
                                    color= {membersCount ? COLORS.white : COLORS.backdrop}
                                />
                            </TouchableOpacity>
                         </View>
                    </View>
                   
            {isOpen && (
                    <ScrollView style={{ marginVertical: 10 }}>
                        {item.membersList.filter(filterItem => filterItem.user.id !== userDetails.id ).map((member) => (
                            <View key={member.id} style={styles.scrollViewContainer}>
                                <View style={{ alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row' }}>
                                    <Icon name="account" size={25} color={COLORS.white} />
                                    <Text style={{ fontSize: 16, color: COLORS.white, marginLeft: 10 }}>{member.user.name}</Text>
                                </View>
                                <View>
                                <CheckBox
                                    boxType='square'
                                    tintColors={{ true: COLORS.red, false: COLORS.white }}
                                    onCheckColor={COLORS.white}
                                    onTintColor="green"
                                    offFillColor={COLORS.white}
                                    offTintColor={COLORS.white}
                                    onAnimationType="fill"
                                    style={{ marginRight: 20,width:20,height:20 }}
                                    value={addMembers.includes(member.id)}
                                    onValueChange={() => handleShareCheckBox(member.id,item.id,item,false)}
                                />
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}
 
                </View>
            </View>
        );
    };

    return (
        <ImageBackground
            source={Images.REGISTRATION}
            resizeMode="cover"
            style={{ width: screenWidth, height: '100%' }}>
            <DrawerNavigator>
                <View style={{ flex: 1 }}>
                    <View style={styles.header}>
                        <View>
                            <TouchableOpacity
                                onPress={() => (isSaveDocumentFlow ? navigation.pop(3) : navigation.navigate('DocumentScannerScreen', { document: document, categoryInfo: categoryInfo }))}>
                                <Icon name="arrow-left" size={25} color="black" />
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={styles.documentName}>{document.documentName}</Text>
                        </View>
                    </View>
                    {addMembers?.toString() !== memberData?.toString() &&
                    <View style={{ alignItems: 'flex-end' }}>
                            <TouchableOpacity
                                style={styles.addTouchable}
                                onPress={handleShareDocument}>
                                <Icon name="share" size={25} color="white" />
                                <Text style={styles.addText}>  Share</Text>
                            </TouchableOpacity>
                        </View>}
                        {isLoading === true ? (<Dialog overlayStyle={{ width: 120 }} isVisible={isLoading} >
                        <ActivityIndicator size={'large'} color={'#0e9b81'} />
                        <Text style={{ textAlign: 'center', color: '#0e9b81' }}>Loading...</Text>
                    </Dialog>) : (
                    <FlatList
                        data={familyDetails}
                        renderItem={({ item, index }) => (
                            <FamilyAccordionHeader item={item} index={index} openedIndices={openedIndices}/>
                        )}
                        keyExtractor={(item) => item.id}
                    />
                    )} 
                    
                </View>
                {isProcessing && <Dialog style={{ zIndex: 10, elevation: 10 }} isVisible={isProcessing} >
          <LinearProgress style={{ marginVertical: 10 }} color={'#0e9b81'} />
          <Text style={{ textAlign: 'center', color: '#0e9b81' }}>Processing...</Text>
        </Dialog>}
               <CustomSnackBar
                    message={isSnackbarVisible?.message}
                    status={isSnackbarVisible?.visible}
                    setStatus={setIsSnackbarVisible}
                    styles={[styles.snackBar, {backgroundColor: isSnackbarVisible.isFailed ? COLORS.red : '#0e9b81'}]}
                    textStyle={{ color: COLORS.white, textAlign: 'left', fontSize: 13 }}
                    roundness={10}
                    duration={isSnackbarVisible.isFailed ? 3000 : 2000}
                 />
            </DrawerNavigator>
        </ImageBackground>
    );
};
export default DocumentAccordian;

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
        padding: 10,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row'
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
        // flexDirection: 'row',
        // width:'75%',
        marginLeft: 14,
        // justifyContent: 'space-between',
        width: screenWidth - 25,
    },
    scrollViewContainer : {
        // height: normalize(50),
        backgroundColor: COLORS.darkTransparent,
        marginTop: 5,
        borderRadius: 8,
        padding: 10,
        flexDirection: 'row',
        // width:'75%',
        marginRight: 14,
        justifyContent: 'space-between',
        width: screenWidth * 0.865,
    },
    documentName: {
        fontSize: 14,
        fontWeight: '500',
        color: 'black',
        marginLeft: 10
    },
    familyHeader: {
        fontSize: 20,
        fontWeight: '500',
        color: 'white',
        marginLeft: 10,
        textAlign: 'center'
    },
    listEmptyComponent: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 130
    },
    innerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1
    }, iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        alignSelf: 'center'
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
