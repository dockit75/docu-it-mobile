import React, { useRef, useState, useEffect, cloneElement } from 'react'
import { ScrollView, StyleSheet, ImageBackground, Text, View, Image, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native'
import { Card, Title, Paragraph, Button } from 'react-native-paper'
import { normalize, normalizeVertical, screenHeight, screenWidth } from '../../utilities/measurement';
import { COLORS } from '../../utilities/colors'
import { Images } from '../../assets/images/images'
import { useNavigation } from '@react-navigation/native'
import Dashboard from '../Dashboard'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DrawerNavigator from '../../components/common/DrawerNavigator'
import { Tab, TabView } from '@rneui/themed';
import { FONTALIGNMENT } from '../../utilities/Fonts';
import PhoneInput from "react-native-phone-number-input";
import { retrieveUserDetail } from '../../storageManager';
import NetworkManager from '../../services/NetworkManager';
import { Checkbox } from 'react-native-paper';


const FamilyInvite = ({ navigation, props }) => {
    const route = useRoute();
    const NewItem = route.params.familyItem;
    const [index, setIndex] = React.useState(0);
    const [userDetails, setUserDetails] = useState([]);
    const [phoneNo, setPhoneNo] = useState('');
    const [number, setNumber] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [familyItem, setFamilyItem] = useState(NewItem);
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [docuitUser, setDocuitUser] = useState([]);
    const [inviteEnable, setInviteEnable] = useState(false)
    const [checked, setChecked] = useState(false);
    const [filteredDocuitUser, setFilteredDocuitUser] = useState([]);
    const insets = useSafeAreaInsets();

    const phoneInput = useRef(null);
    const phoneNumberPattern = /^\d{10,15}$/;

    useEffect(() => {
        // console.log('useEffect called-----------------.....>>')
        getUser();
        RenderListDocuitUsers();
    }, []);

      
    const getUser = async () => {
        let UserId = await retrieveUserDetail();
        setUserDetails(UserId);
    }


    const RenderListDocuitUsers = async () => {
        // console.log('RenderListDocuitUsers called ====>>>')
        try {
            let response = await NetworkManager.listDocuitUsers();
            // console.log('response', response);
            let listOfDocuitUser = response.data.response
            if (response.data.code === 200) {
                setDocuitUser(listOfDocuitUser)
            }
        } catch (error) {
            // console.error('Error fetching unique id:', error.response);
        }
    }

    const isEmailValid = (email) => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailPattern.test(email);
    };
    const handleEmailChange = (text) => {
        setEmail(text);
        if (isEmailValid(text)) {
            setEmailError('');
        } else {
            setEmailError('Invalid Email');
        }
    };
    const handlePhoneNumberChange = (text) => {
        setNumber(text);
        if (phoneNumberPattern.test(text)) {
            setPhoneNumberError('');
        } else {
            setPhoneNumberError('Invalid number');
        }
    };

    const handleCheckboxChange = (itemId) => {
        const updatedSelectedItems = [...selectedItems]; // Create a copy of the array

        if (updatedSelectedItems.includes(itemId)) {
            const index = updatedSelectedItems.indexOf(itemId);
            updatedSelectedItems.splice(index, 1); // Remove the item if it's in the array
        } else {
            updatedSelectedItems.push(itemId); // Add the item if it's not in the array
        }

        setSelectedItems(updatedSelectedItems);
        // Update the state
        if (updatedSelectedItems.length === 0) {
            setInviteEnable(false)
        } else {
            setInviteEnable(true)
        }
    };

    const handleDocuitUserInvite = async () => {
        let params = {
            //  userId :  "991a9659-5b0d-4c53-b1ea-70413c1b0537",
            userIds: selectedItems,
            familyId: familyItem.family.id,
            invitedBy: userDetails.id
        }
        try {
            let response = await NetworkManager.inviteDocuitUser(params)
            if (response.data.code === 200) {
                alert(response.data.message)
            } else {
                alert(response.data.message)
            }
        } catch (error) {
            // console.error('Error fetching unique id:', error.response);
            alert(error.response.data.message)
        }
    }


    const handleInvite = async () => {
        let UserId = await retrieveUserDetail();
        setUserDetails(UserId);
        const params = {
            email: email,
            phone: number,
            familyId: familyItem.family.id,
            invitedBy: UserId.id,
        }
        // console.log('params', params)
        try {
            let response = await NetworkManager.externalInvite(params);
            // console.log('response', response);
            if (response.data.code === 200) {
                alert(response.data.message)
            } else {
                // console.log('else called')
                alert(response.data.message)
            }
        } catch (error) {
            // console.error('Error fetching unique id:', error.response);
            alert(response.data.message)
        }
    }
    const filteredDocuitUsers = docuitUser.filter(user => user.id !== userDetails.id);

    return (
        <ImageBackground
            source={Images.REGISTRATION}
            resizeMode="cover"
            style={{ width: screenWidth, height: screenHeight + insets.top }}>
            <DrawerNavigator>
            <View style={{ flexDirection: 'row', marginHorizontal: 20, justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={() => navigation.navigate('FamilyMember',{familyItem:familyItem})} style={{ alignSelf: 'center' }}>
                                <Image source={Images.ARROW} style={{ width: 28, height: 28 }} />
                            </TouchableOpacity>
                            <Text style={styles.TextSettings}>Invite User</Text>
                            <View />
                        </View>
                {/* <View> */}
                <Tab
                    value={index}
                    onChange={(e) => setIndex(e)}
                    // style={{ marginTop: 50 }}
                    indicatorStyle={{
                        backgroundColor: 'white',
                        height: 1,
                    }}
                    variant="default"
                >
                    <Tab.Item
                        title="DocultUser"
                        titleStyle={{ fontSize: 20, color: 'white',backgroundColor:'green',borderRadius:10 }}
                    // icon={{ name: 'timer', type: 'ionicon', color: 'white' }}
                    />
                    <Tab.Item
                        title="ExternalUser"
                        titleStyle={{ fontSize: 20, color: 'white',backgroundColor:'green',borderRadius:10 }}
                    // icon={{ name: 'heart', type: 'ionicon', color: 'white' }}
                    />
                </Tab>

                <TabView value={index} onChange={setIndex} animationType="spring">
                    <TabView.Item style={{ width: '100%', flex: 1 }}>
                        <View>
                            {inviteEnable && <View style={{ marginLeft: '77%' }}>
                                <TouchableOpacity style={styles.addTouchable} onPress={handleDocuitUserInvite}>
                                    <Text style={styles.addText}> INVITE</Text>
                                </TouchableOpacity>
                            </View>}
                            <FlatList
                                data={filteredDocuitUsers}
                                // style={{ flex: 1 }}
                                ListEmptyComponent={<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 130 }}>
                                    <Text style={{ color: 'white', fontSize: 20 }}>No docuitUser ....</Text>
                                </View>}
                                renderItem={({ item }) => (
                                    <View style={styles.FlatListContainer}>
                                        <View>
                                            <TouchableOpacity>
                                                <Text style={styles.text}>{item.name}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View>
                                            <Checkbox
                                                uncheckedColor='white'
                                                color='red'
                                                status={selectedItems.includes(item.id) ? 'checked' : 'unchecked'}
                                                onPress={() => handleCheckboxChange(item.id)}
                                            />
                                        </View>
                                    </View>
                                )}
                            />
                        </View>
                    </TabView.Item>


                    <TabView.Item style={{ width: '100%', alignItems: 'center' }}>
                        <View style={{ alignItems: 'center', marginTop: 30 }}>
                            <TouchableOpacity style={[styles.mobileInputView]}>
                                <PhoneInput
                                    ref={phoneInput}
                                    defaultValue={phoneNo}
                                    defaultCode="IN"
                                    onChangeFormattedText={(text) => {
                                        setPhoneNo(text)
                                    }}
                                    disableArrowIcon={true}
                                    containerStyle={styles.phoneInputContainer
                                    }
                                    textContainerStyle={styles.phoneInputTextContainer}
                                    textInputStyle={styles.phoneInputTextStyle}
                                    textInputProps={{
                                        maxLength: 15,
                                        placeholder: 'Phone Number',
                                        placeholderTextColor: 'black'
                                    }}
                                    flagButtonStyle={{ right: 0.5, paddingBottom: 2 }}
                                    keyboardType="number-pad"
                                    onChangeText={handlePhoneNumberChange}
                                />
                            </TouchableOpacity>
                            <TextInput
                                placeholder="Email"
                                placeholderTextColor='black'
                                onChangeText={handleEmailChange}
                                // onBlur={handleBlur('emailId')}
                                value={email}
                                style={styles.input}
                                keyboardType="email-address"
                            />
                            <Text style={styles.errorText}>{emailError}</Text>
                            <Text style={styles.errorText}>{phoneNumberError}</Text>
                            <TouchableOpacity style={styles.button} onPress={handleInvite}>
                                <Text style={styles.buttonText}>INVITE</Text>
                            </TouchableOpacity>
                        </View>

                    </TabView.Item>
                </TabView>
                {/* </View> */}
            </DrawerNavigator>
        </ImageBackground>
    )
}
export default FamilyInvite;

const styles = StyleSheet.create({
    text: {
        textAlign: 'center',
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 30,
    },
    FlatListContainer: {
        height: normalize(50),
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
    errorText: {
        marginLeft: normalize(15),
        fontWeight: 'bold',
        color: 'red',
        fontSize: 17,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: normalize(5),
        marginBottom: 15,
        width: screenWidth - normalize(30),
        height: normalizeVertical(50),
        alignSelf: 'center',
        backgroundColor: '#e3e3e3cc',
        letterSpacing: 1.5,
        paddingHorizontal: normalizeVertical(20),
        marginVertical: normalizeVertical(4),
        fontWeight: '600',
        fontSize: 15
    },
    button: {
        backgroundColor: '#0e9b81',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        width: screenWidth - normalize(30),
        alignSelf: 'center',
        height: normalizeVertical(50),
        borderRadius: normalize(25),
        elevation: 20,
        // marginTop: 30,
        marginBottom: normalize(10)
    },
    buttonText: {
        alignSelf: 'center',
        marginTop: 'auto',
        marginBottom: 'auto',
        color: 'white',
        letterSpacing: 1.8,
        fontSize: 18,
        fontWeight: '800',
    },
    signup: {
        fontSize: 30,
        color: 'white',
        fontWeight: 'bold',
        marginVertical: normalize(40),
        alignSelf: 'center',
    },
    mobileInputView: {
        paddingLeft: normalize(10),
        width: screenWidth - normalize(30),
        height: normalizeVertical(50),
        borderRadius: normalize(5),
        backgroundColor: '#e3e3e3cc',
        marginBottom: normalize(15),
        borderColor: COLORS.gray,
        alignItems: FONTALIGNMENT.center,
        marginVertical: normalizeVertical(4),
    },
    phoneInputContainer: {
        backgroundColor: 'transparent',
        right: 30,
    },
    phoneInputTextContainer: {
        backgroundColor: 'transparent',
        right: 35,
        paddingTop: normalize(12),
    },
    phoneInputTextStyle: {
        paddingRight: normalize(8),
        position: 'absolute',
        width: screenWidth * 0.58,
        fontSize: 15,
        fontWeight: '600',
        left: 45,
        color: 'black'
    },
    phoneCountryFlag: {
        width: 'auto',
        padding: normalize(14),
        paddingRight: 10
    },
    errorPhoneNo: {
        right: 80,
        fontWeight: 'bold',
        color: 'red',
        fontSize: 15,
    },
    mobileInputView: {
        paddingLeft: normalize(10),
        width: screenWidth - normalize(30),
        height: normalizeVertical(50),
        borderRadius: normalize(5),
        backgroundColor: '#e3e3e3cc',
        marginBottom: normalize(15),
        borderColor: COLORS.gray,
        alignItems: FONTALIGNMENT.center,
        marginVertical: normalizeVertical(4),
    },
    addTouchable: {
        backgroundColor: COLORS.darkTransparent,
        marginTop: 5,
        borderRadius: 8,
        marginRight: 20,
        width: 80,
        padding: 5,
    },
    addText: {
        textAlign: 'center',
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    TextSettings: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 15,
        color: 'white',
        marginRight: normalize(15)
    },
})