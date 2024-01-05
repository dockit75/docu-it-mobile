import React, { useRef, useState, useEffect, cloneElement, useMemo } from 'react'
import { ScrollView, StyleSheet, ImageBackground, Text, View, Image, TouchableOpacity, FlatList, TextInput, Alert, PermissionsAndroid, ActivityIndicator, Platform } from 'react-native'
import { Card, Title, Paragraph, Button } from 'react-native-paper'
import { normalize, normalizeVertical, screenHeight, screenWidth } from '../../../utilities/measurement';
import { COLORS } from '../../../utilities/colors'
import { Images } from '../../../assets/images/images'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import Dashboard from '../../Dashboard'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DrawerNavigator from '../../../components/common/DrawerNavigator'
import { Dialog, SearchBar, Tab, TabView } from '@rneui/themed';
import { FONTALIGNMENT } from '../../../utilities/Fonts';
import PhoneInput from "react-native-phone-number-input";
import { retrieveUserDetail } from '../../../storageManager';
import NetworkManager from '../../../services/NetworkManager';
import Contacts from 'react-native-contacts';
import CheckBox from '@react-native-community/checkbox';
import { FlashList } from '@shopify/flash-list'
import { FAMILY_LIST_EMPTY } from '../../../utilities/strings';
import CustomSnackBar from '../../../components/common/SnackBar';
import Loader from '../../../components/common/Loader';


const CommonInvite = ({ navigation, props }) => {
    const route = useRoute();
    const isFocused = useIsFocused();
    const NewItem = route.params.familyItem;
    const NewFamilyMember = route.params.familyMember
    const newContacts = route.params.myContacts
    const newArrays = route.params.arrayCombined
    const [myContacts, setMyContacts] = useState(newContacts);
    const [arrayCombined, setArrayCombined] = useState(newArrays)
    const [familyMember, setFamilyMember] = useState(NewFamilyMember)
    const [userDetails, setUserDetails] = useState([]);
    const [familyItem, setFamilyItem] = useState(NewItem);
    const [selectedItems, setSelectedItems] = useState([]);
    const [inviteEnable, setInviteEnable] = useState(false)
    const [isLoader, setIsLoader] = useState(true);
    const [checked, setChecked] = useState(false);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [isSnackbarVisible, setIsSnackbarVisible] = useState(false)
    const [search, setSearch] = useState('');
    const [searchData, setSearchData] = useState([]);
    const insets = useSafeAreaInsets();

    // ref
    let inputRef = useRef()

    useEffect(() => {
        setIsLoader(true)
        getUser();
        filterContacts();
        setTimeout(() => setIsLoader(false), 2000)
    }, []);

    useEffect(() => {
        if(!isLoader) {
            if (search?.length) {
                let searchTextReg = new RegExp(search.toLowerCase())
                let updateFilterContacts = filteredContacts.filter(filterItem => {
                    let contactName = filterItem.name + filterItem.middleName + filterItem.lastName
                    return searchTextReg.test(contactName.toLowerCase()) || searchTextReg.test(filterItem.phoneNumber)
                })
                setSearchData(updateFilterContacts.slice().sort((a, b) => a.name.localeCompare(b.name)))
                setSelectedItems(prev => prev = [ ...prev.filter(filterItem => !filterItem?.isFilterItem), ...filteredContacts.map(filterItem => filterItem = { ...filterItem, isFilterItem: true }) ])
            } else {
                filterContacts();
                setSelectedItems(prev => prev = [ ...prev.filter(filterItem => !filterItem?.isFilterItem) ])
            }
        }
    }, [search])

    const getUser = async () => {
        let UserId = await retrieveUserDetail();
        setUserDetails(UserId);
    }

    const uniquePhoneNumbers = new Set();
    const filteredMyContacts = myContacts?.filter(contactItem => {
        const phoneNumber = contactItem?.phoneNumber;
        if (!uniquePhoneNumbers.has(phoneNumber)) {
            uniquePhoneNumbers.add(phoneNumber);
            return true;
        }
        return false;
    });

    const handleCheckboxChange = (itemId) => {
        const updatedSelectedItems = [...selectedItems]; // Create a copy of the array
        if (updatedSelectedItems.includes(itemId)) {
            const index = updatedSelectedItems.indexOf(itemId);
            updatedSelectedItems.splice(index, 1); // Remove the item if it's in the array
        } else {
            updatedSelectedItems.push(itemId); // Add the item if it's not in the array
        }
        setSelectedItems(updatedSelectedItems.filter(filterItem => !filterItem?.isFilterItem));
        if (updatedSelectedItems.length === 0) {
            setInviteEnable(false)
        } else {
            setInviteEnable(true)
        }
    };

    const handleInviteUser = async () => {
        const params = {
            phoneNumbers: selectedItems,
            familyId: familyItem.id,
            invitedBy: userDetails.id
        }
        // console.log('handleInviteUser ====== Params', params)
        try {
            let response = await NetworkManager.inviteUser(params)
            // console.log('handleInviteUser==>response', response)
            if (response.data.code === 200) {
                setIsSnackbarVisible({ message: response.data.message, visible: true})
                setTimeout(() =>  navigation.navigate('FamilyMember',{familyItem:familyItem}),1000)
            } 
        } catch (error) {
            console.error('Error fetching unique id:', error.response);
           setIsSnackbarVisible({ message: error?.response?.data?.message ?? 'Something went Wrong', visible: true })

        }
        setSelectedItems([]);

    }

    const filterContacts = () => {
        // Extract all phone numbers from arrayCombined
        const commonPhoneNumbers = arrayCombined
            .map(item => item.phone && item.phone)
            .concat(arrayCombined.map(item => item.user && item.user.phone && item.user.phone.replace(/\D/g, '')))
            .filter(Boolean);

        // Filter myContacts based on common phone numbers
        const filtered = filteredMyContacts.filter(contact => {
                if (contact?.phoneNumber?.length > 0) {
                    const contactPhoneNumber = (contact.phoneNumber?.length > 10) ? contact.phoneNumber.substr(contact.phoneNumber.length - 10, contact.phoneNumber.length) : contact?.phoneNumber
                    return !commonPhoneNumbers.includes(contactPhoneNumber);
                }
                return contact !== undefined; // Include contacts without phone numbers
            });
        setFilteredContacts(filtered);
    };


    /**
     * Render the header of the invite list
     */
    const renderChatsHeader = () => {

        return (
        <View>
            <View style={styles.messageSearchBarContainer} onTouchStart={() => inputRef.current?.focus()}>
                <SearchBar
                    placeholder='Search'
                    onChangeText={setSearch}
                    clearIcon={search === '' ? false : undefined}
                    value={search ?? ''}
                    ref={(search) => { inputRef.current = search }}
                    platform={Platform.OS === 'android' ? 'default' : 'default'}
                    containerStyle={styles.messageSearchBar}
                    inputContainerStyle={{ padding: 0, backgroundColor: COLORS.coolLight, borderRadius: 10, height: 40, alignItems: 'center' }}
                    cancelButtonProps={{ color: COLORS.brandBlue }}
                />
            </View>
        </View>
        )
    }

    const memoizedRenderChatsHeader = useMemo(renderChatsHeader, [search])
    
    return (
        <ImageBackground
            source={Images.REGISTRATION}
            resizeMode="cover"
            style={{ width: screenWidth, height: '100%' }}>
            <DrawerNavigator>
                <View style={{flex:1}}>
                <View style={styles.container}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: screenWidth * 0.73 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('FamilyMember', { familyItem: familyItem })} style={{ alignSelf: 'center' }}>
                        <MaterialCommunityIcons name='arrow-u-left-top' color={'white'} size={32} />
                    </TouchableOpacity>
                    <Text style={styles.TextSettings}>Invite User</Text>
                    <View style={{ width: 10, height: 10 }} />
                    </View>

                    {inviteEnable ? <View >
                        <TouchableOpacity style={styles.addTouchable} onPress={handleInviteUser}>
                            <Text style={styles.addText}> INVITE</Text>
                        </TouchableOpacity>
                    </View> : <View />}
                </View>
                <View>
                    {memoizedRenderChatsHeader}
                </View>
                {isLoader === true && <Loader isLoading={isLoader} text={'loading'}/> }
                <FlashList
                    data={search?.length ? searchData : filteredContacts.slice().sort((a, b) => a.name.localeCompare(b.name))}
                    extraData={selectedItems}
                    ListEmptyComponent={<View style={styles.listEmptyComponent}>
                        <Icon name='phone-slash' size={60} color={'white'}/>
                    <Text style={{ color: 'white', fontSize: 20 ,marginTop:10}}>{FAMILY_LIST_EMPTY.contactEmpty}</Text>
                  </View>}
                    renderItem={({ item, index }) => (
                        <View style={styles.FlatListContainer}>
                            <View style={{ flexDirection: 'row',  flex: 0.9 }}>
                                <View style={styles.letterContainer}>
                                    <Text style={styles.iconText}>{item?.name[0] ?? ''}</Text>
                                </View>
                                <View style={{ marginLeft: 20 }}>
                                    <Text numberOfLines={1} style={styles.text}>{item?.name ?? ''}{`${(item?.middleName?.length) ? ` ${item?.middleName} ` : ' '}`}{((item?.lastName?.length && (item?.middleName !== item?.lastName))) ? item?.lastName : ''}</Text>
                                    <Text style={{ color: 'white' }}>{item?.phoneNumber ?? ''}</Text>
                                </View>
                            </View>
                            <View>
                              <CheckBox 
                                 boxType='square'
                                 style={{ marginRight:5,width:20,height:20 }}
                                 tintColors={{ true: COLORS.red, false: COLORS.gray }}
                                 onCheckColor={COLORS.white}
                                 onTintColor="green"
                                 offFillColor={COLORS.white}
                                 offTintColor={COLORS.white}
                                 onAnimationType="fill"
                                value={selectedItems.includes(item?.phoneNumber?.length > 10 ? item.phoneNumber.substr(item.phoneNumber.length - 10, item.phoneNumber.length) : item?.phoneNumber ?? '')}
                                onValueChange={() => handleCheckboxChange(item?.phoneNumber?.length > 10 ? item.phoneNumber.substr(item.phoneNumber.length - 10, item.phoneNumber.length) : item?.phoneNumber ?? '')}
                                />
                                </View>
                            </View>
                    )}
                    estimatedItemSize={45}
                />
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
    )
}
export default CommonInvite;

const styles = StyleSheet.create({

    TextSettings: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 15,
        color: 'white',
        marginLeft: normalize(45),
        textAlign: 'center'
    },
    text: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    iconText: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    FlatListContainer: {
        height: normalize(50),
        backgroundColor: COLORS.darkTransparent,
        marginTop: 5,
        borderRadius: 8,
        padding: 8,
        flexDirection: 'row',
        marginLeft: 12,
        width: screenWidth - 25,
        justifyContent: 'space-between'
    },
    addTouchable: {
        backgroundColor: COLORS.darkTransparent,
        borderRadius: 8,
        width: 80,
        padding: 5,
    },
    addText: {
        textAlign: 'center',
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    container:{ 
        flexDirection: 'row', 
        marginHorizontal: 20, 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },
    listEmptyComponent:{ 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginTop: 130 
      },
      letterContainer:{ 
        backgroundColor: 'gray', 
        alignItems: "center", 
        justifyContent: 'center', 
        height: 40, width: 40, 
        borderRadius: 25 
    },
    messageSearchBarContainer: {
        height: normalizeVertical(30),
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: normalize(12),
        marginLeft: 6,
    },
    messageSearchBar: {
      fontSize: 16,
      fontWeight: '400',
      fontFamily: 'System',
      flex: 0.99,
      backgroundColor: COLORS.transparent,
      borderBottomColor: COLORS.transparent,
      borderTopColor: COLORS.transparent,
      borderRadius: 18
    },
    snackBar: {
        alignSelf: 'center',
        bottom: normalize(50),
        alignContent: 'center',
        backgroundColor: 'white',
        zIndex: 1,
        width:'90%'
    },
})