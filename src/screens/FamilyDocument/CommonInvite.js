import React, { useRef, useState, useEffect, cloneElement } from 'react'
import { ScrollView, StyleSheet, ImageBackground, Text, View, Image, TouchableOpacity, FlatList, TextInput, Alert, PermissionsAndroid, ActivityIndicator } from 'react-native'
import { Card, Title, Paragraph, Button } from 'react-native-paper'
import { normalize, normalizeVertical, screenHeight, screenWidth } from '../../utilities/measurement';
import { COLORS } from '../../utilities/colors'
import { Images } from '../../assets/images/images'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import Dashboard from '../Dashboard'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DrawerNavigator from '../../components/common/DrawerNavigator'
import { Dialog, Tab, TabView } from '@rneui/themed';
import { FONTALIGNMENT } from '../../utilities/Fonts';
import PhoneInput from "react-native-phone-number-input";
import { retrieveUserDetail } from '../../storageManager';
import NetworkManager from '../../services/NetworkManager';
// import { Checkbox } from 'react-native-paper';
import Contacts from 'react-native-contacts';
import CheckBox from '@react-native-community/checkbox';
import { FlashList } from '@shopify/flash-list'


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
    const insets = useSafeAreaInsets();

    useEffect(() => {
        setIsLoader(true)
        // console.log('familyMember', familyMember)
        // console.log('contacts====>>>', myContacts)
        // console.log('newArray', arrayCombined)
        getUser();
        filterContacts();
        setTimeout(() => setIsLoader(false), 1000)
    }, []);

    const getUser = async () => {
        let UserId = await retrieveUserDetail();
        setUserDetails(UserId);
        // console.log('userDetails', userDetails)
        // console.log('familyItem', familyItem)
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
        setSelectedItems(updatedSelectedItems);
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
                Alert.alert(
                    'Success',
                    response.data.message,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setChecked(false)
                                navigation.navigate('FamilyMember',{familyItem:familyItem})
                            },
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                // console.log('else called')
            }
        } catch (error) {
            // console.error('Error fetching unique id:', error.response);
            alert(error.response.data.message)
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
        // console.log('filterd-Contacts---', filtered?.length)
        setFilteredContacts(filtered);
    };
    // console.log('filteredContacts', isLoader)
    return (
        <ImageBackground
            source={Images.REGISTRATION}
            resizeMode="cover"
            style={{ width: screenWidth, height: '100%' }}>
            <DrawerNavigator>
                <View style={{ flexDirection: 'row', marginHorizontal: 20, justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => navigation.navigate('FamilyMember', { familyItem: familyItem })} style={{ alignSelf: 'center' }}>
                        <Image source={Images.ARROW} style={{ width: 28, height: 28 }} />
                    </TouchableOpacity>
                    <Text style={styles.TextSettings}>Invite User</Text>
                    <View />
                    </View>

                    {inviteEnable ? <View >
                        <TouchableOpacity style={styles.addTouchable} onPress={handleInviteUser}>
                            <Text style={styles.addText}> INVITE</Text>
                        </TouchableOpacity>
                    </View> : <View />}
                </View>
                <View>
                </View>

                <Dialog overlayStyle={{ width: 120, zIndex: 111 }} isVisible={isLoader} >
                    <ActivityIndicator size={'large'} color={'#0e9b81'} />
                    <Text style={{ textAlign: 'center',color:'#0e9b81' }}>Loading...</Text>
                </Dialog>
                <FlashList
                    data={filteredContacts.slice().sort((a, b) => a.name.localeCompare(b.name))}
                    extraData={selectedItems}
                    ListEmptyComponent={<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 130 }}>
                    <Text style={{ color: 'white', fontSize: 20 }}>No Contacts....</Text>
                  </View>}
                    renderItem={({ item, index }) => (
                        <View style={styles.FlatListContainer}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ backgroundColor: 'gray', alignItems: "center", justifyContent: 'center', height: 40, width: 40, borderRadius: 25 }}>
                                    <Text style={styles.iconText}>{item?.name[0] ?? ''}</Text>
                                </View>
                                <View style={{ marginLeft: 20 }}>
                                    <Text style={styles.text}>{item?.name ?? ''}</Text>
                                    <Text style={{ color: 'white' }}>{item?.phoneNumber ?? ''}</Text>
                                </View>
                            </View>
                            <View>
                                <CheckBox
                                    tintColors={{ true: 'red', false: 'white' }}
                                    onCheckColor="white"
                                    onTintColor="green"
                                    offFillColor="white"
                                    offTintColor="white"
                                    onAnimationType="fill"
                                    value={selectedItems.includes(item?.phoneNumber?.length > 10 ? item.phoneNumber.substr(item.phoneNumber.length - 10, item.phoneNumber.length) : item?.phoneNumber ?? '')}
                                    onValueChange={() => handleCheckboxChange(item?.phoneNumber?.length > 10 ? item.phoneNumber.substr(item.phoneNumber.length - 10, item.phoneNumber.length) : item?.phoneNumber ?? '')}
                                />

                            </View>
                        </View>
                    )}
                    // ItemSeparatorComponent={props => <View style={{ backgroundColor: COLORS.coolLight, height: 2, width: screenWidth }} />}
                    estimatedItemSize={45}
                />
                {/* <FlatList
                    data={filteredContacts.slice().sort((a, b) => a.name.localeCompare(b.name))}
                    style={{ flex: 1 }}
                    renderItem={({ item }) => (
                        <View style={styles.FlatListContainer}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ backgroundColor: 'gray', alignItems: "center", justifyContent: 'center', height: 40, width: 40, borderRadius: 25 }}>
                                    <Text style={styles.iconText}>{item.name[0]}</Text>
                                </View>
                                <View style={{ marginLeft: 20 }}>
                                    <Text style={styles.text}>{item.name}</Text>
                                    <Text style={{ color: 'white' }}>{item.phoneNumber}</Text>
                                </View>
                            </View>
                            <View>
                                <CheckBox
                                    tintColors={{ true: 'red', false: 'white' }}
                                    onCheckColor="white"
                                    onTintColor="green"
                                    offFillColor="white"
                                    offTintColor="white"
                                    onAnimationType="fill"
                                    value={selectedItems.includes(item.phoneNumber)}
                                    onValueChange={() => handleCheckboxChange(item.phoneNumber)}
                                />

                            </View>
                        </View>
                    )}
                /> */}
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
        marginLeft: normalize(15)
    },
    text: {
        color: COLORS.white,
        fontSize: 18,
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
        marginLeft: 14,
        width: screenWidth - 25,
        justifyContent: 'space-between'
    },
    addTouchable: {
        backgroundColor: COLORS.darkTransparent,
        // marginTop: 5,
        borderRadius: 8,
        // marginRight: 20,
        width: 80,
        padding: 5,
    },
    addText: {
        textAlign: 'center',
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
})