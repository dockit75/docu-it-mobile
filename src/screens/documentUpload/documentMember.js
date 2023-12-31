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
import CheckBox from '@react-native-community/checkbox';

const DocumentMember = ({ navigation, props }) => {
    const route = useRoute();
    const NewItem = route.params.familyItem;
    const Document = route.params.document;
    const [document, setDocument] = useState(Document)
    const CategoryInfo = route.params.categoryInfo;
    const [categoryInfo, setCategoryInfo] = useState(CategoryInfo)
    const UserDetails = route.params.userDetails
    const [familyItem, setFamilyItem] = useState(NewItem);
    const [familyMember, setFamilyMember] = useState([])
    const [userDetails, setUserDetails] = useState(UserDetails);
    const [selectedItems, setSelectedItems] = useState([]);
    const [shareItems, setShareItems] = useState(false)
    const [checked, setChecked] = useState(false);
    const [uncheckedItems, setUncheckedItems] = useState([]);
    const [memberId, setMemberId] = useState([]);
    let [addMembers, setAddMembers] = useState([]);
    let [revokeMembers, setRevokeMembers] = useState([]);
    const [memberData, setMembersData] = useState([]);



    let myData = [
        {
            id: 0,
            name: 'sasi',
            date: '2023-09-13T14:08:06.285+00:00',
            imageUri: 'https://placebear.com/g/200/200',
        },
        {
            id: 1,
            name: 'sathish',
            date: '2023-09-12T14:08:06.285+00:00',
            imageUri: 'https://via.placeholder.com/300.png/09f/fff',
        },
        {
            id: 2,
            name: 'hari',
            date: '2023-09-11T14:08:06.285+00:00',
            imageUri: 'https://source.unsplash.com/user/c_v_r/1900×800',
        },
        {
            id: 3,
            name: 'ravi',
            date: '2023-09-11T14:08:06.285+00:00',
            imageUri: 'https://source.unsplash.com/user/c_v_r/1900×800',
        },
        {
            id: 4,
            name: 'vicky',
            date: '2023-09-11T14:08:06.285+00:00',
            imageUri: 'https://source.unsplash.com/user/c_v_r/1900×800',
        },
    ];

    let mymembers = [
        {
            id: 2,
            name: 'hari',
            date: '2023-09-11T14:08:06.285+00:00',
            imageUri: 'https://source.unsplash.com/user/c_v_r/1900×800',
        },
        {
            id: 3,
            name: 'sat',
            date: '2023-09-11T14:08:06.285+00:00',
            imageUri: 'https://source.unsplash.com/user/c_v_r/1900×800',
        },
    ]

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            setFamilyItem(NewItem);
            listFamilyMembers(NewItem);
            getUser();
            getDocumentDetails();
            // console.log('document=====>.', document, categoryInfo, familyItem, userDetails)
            setShareItems(false);
            // const memberId = document.sharememberid;
            // const memberIdArray = memberId ? [memberId] : [];
            // console.log('Member ID Array:', memberIdArray);
         

        });
        return unsubscribe;
    }, []);

    const getUser = async () => {
        let UserId = await retrieveUserDetail();
        setUserDetails(UserId);
    }

    const listFamilyMembers = async (family) => {
        // console.log('family id------>>', family)
        try {
            let userData = await retrieveUserDetail()
            let response = await NetworkManager.listFamilyMembers(family.id)
            // console.log('response==>listFamilyMembers', response.data?.response.MemberList, response.data?.response.MemberList?.length)
            if (response.data.code === 200) {
                let memberList = response.data.response.MemberList.filter(filterItem => filterItem.user.id !== userData.id)
                setFamilyMember(memberList)
            }
        } catch (error) {
        }
    }


    const getDocumentDetails = async () => {
        // console.log('getDocumentDetails==========>>.><<<<>>><///',document.documentId)
        try {
            let response = await NetworkManager.getDocumentsById(document.documentId)
            // console.log('response==>getDocumentDetails_____))____)_)_)_)))_', JSON.stringify(response.data))
            if (response.data.code === 200) {
                let memberIdArray = response.data.response.memberIds
                setAddMembers(memberIdArray)
                setMembersData(memberIdArray)
            }
            
        } catch (error) {
            console.error('Error in listFamilyMembers:', error);  
        }
    }
    // const handleCheckboxChange = (itemId) => {
    //     const updatedSelectedItems = [...selectedItems]; // Create a copy of the array
    //     if (updatedSelectedItems.includes(itemId)) {
    //         const index = updatedSelectedItems.indexOf(itemId);
    //         updatedSelectedItems.splice(index, 1); // Remove the item if it's in the array
    //     } else {
    //         updatedSelectedItems.push(itemId); // Add the item if it's not in the array
    //     }
    //     setSelectedItems(updatedSelectedItems);
    //     if (updatedSelectedItems.length === 0) {
    //         setShareItems(false)
    //     } else {
    //         setShareItems(true)
    //     }
    // };

    const handleCheckboxChange = (itemId) => { 
        if (addMembers.includes(`${itemId}`) ){
            setAddMembers(prev=>prev.filter(filterItem => filterItem != itemId))
            let value = memberData.filter((itm) => itm.id != `${itemId}`);
            if(value.includes(`${itemId}`)){
                setRevokeMembers((prevRevokeMembers) => [...prevRevokeMembers, `${itemId}`]);
            }
        } else {
            addMembers = [...addMembers,`${itemId}`]
            setAddMembers(addMembers)
            setRevokeMembers(prev=>prev.filter(filterItem => filterItem != itemId))
        }

    };

    const handleShareDocument = async () => {
        const commonIds = addMembers.filter(id => memberData.includes(id));
        // Filter out common IDs from both arrays
        let uniqueAddMembers = addMembers.filter(id => !commonIds.includes(id));
           const params = {
            familyId: familyItem.id,
            documentId: document.documentId,
            // categoryId: categoryInfo.categoryId,
            revokeAccess: revokeMembers,
            provideAccess: uniqueAddMembers,
            // documentName: document.documentName,
            updatedBy: document.uploadedBy
        }
        // console.log('params========>>>', params)
        try {
            let response = await NetworkManager.updateDocument(params)
            if (response.data.code === 200) {
                Alert.alert(
                    'Success',
                    'Document shared successfully',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setChecked(false)
                                navigation.pop(2)
                            },
                        },
                    ],
                    { cancelable: false }
                );
            }
        } catch (error) {
            console.error('Error in listFamilyMembers:', error);
        }
    }

    return (
        <ImageBackground
            source={Images.REGISTRATION}
            resizeMode="cover"
            style={{ width: screenWidth, height: '100%' }}>
            <DrawerNavigator>
                <View style={styles.header}>
                    <View>
                        <TouchableOpacity onPress={() => navigation.navigate('DocumentFamily', { document: document, categoryInfo: categoryInfo, familyItem: familyItem })}>
                            <Icon name="arrow-left" size={25} color="black" />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: '500',
                                color: 'black',
                                marginLeft: 20,
                            }}>
                            {familyItem.name} Member's
                        </Text>
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
                <FlatList
                    data={familyMember}
                    style={{ flex: 1 }}
                    ListEmptyComponent={<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 130 }}>
                        <Text style={{ color: 'white', fontSize: 20 }}>No family members....</Text>
                    </View>}
                    renderItem={({ item }) => (
                        <View style={styles.FlatListContainer}>
                            <View>
                                <Text style={styles.text}>
                                    {item.user.name}
                                </Text>
                            </View>
                            {/* {userDetails.id === document.uploadedBy ? ( */}
                                <CheckBox
                                    tintColors={{ true: 'red', false: 'white' }}
                                    onCheckColor="white"
                                    onTintColor="green"
                                    offFillColor="white"
                                    offTintColor="white"
                                    onAnimationType="fill"
                                    value={addMembers.includes(`${item.id}`)}
                                    // value={selectedItems.includes(item.id)}
                                    onValueChange={() => handleCheckboxChange(item.id)}
                                />
                                {/* ) : null} */}
                        </View>
                    )}
                />
            </DrawerNavigator>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    addTouchable: {
        backgroundColor: COLORS.darkTransparent,
        marginTop: 5,
        borderRadius: 8,
        marginRight: 20,
        width: 90,
        padding: 5,
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row'
    },
    addText: {
        textAlign: 'center',
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginRight:8
    },

    text: {
        // textAlign: 'center',
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 20,
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
    header: {
        // height: normalize(50),
        width: screenWidth - 25,
        marginLeft: 14,
        backgroundColor: 'rgb(212, 215, 219)',
        borderRadius: normalize(8),
        marginTop: 10,
        padding: 15,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row'
    },
});

export default DocumentMember;
