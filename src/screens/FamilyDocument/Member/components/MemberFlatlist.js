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
import { normalize, screenWidth, screenHeight } from '../../../../utilities/measurement';
import { COLORS } from '../../../../utilities/colors';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NetworkManager from '../../../../services/NetworkManager';
import { useFocusEffect } from '@react-navigation/native';
import { color } from '@rneui/base';
import { retrieveUserDetail } from '../../../../storageManager';
import Contacts from 'react-native-contacts';
import { Dialog } from '@rneui/themed';
import { FAMILY_LIST_EMPTY } from '../../../../utilities/strings';
import { processAddressBookContacts } from '../../../utilities/Utils';
import CustomSnackBar from '../../../../components/common/SnackBar';
import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions';


const MemberFlatlist =(props) => {
    const route = useRoute();
    const [familyItem, setFamilyItem] = useState(props.familyItem);
    const [myContacts, setMyContacts] = useState([]);
    const [newContactsArray, setNewcontactsArray] = useState([])
    const [familyMember, setFamilyMember] = useState([])
    const [userDetails, setUserDetails] = useState([])
    const insets = useSafeAreaInsets();
    const [isLoader, setIsLoader] = useState(true);
    const [iconEnabled, setIconEnabled] = useState(false)
    const [arrayCombined, setArrayCombined] = useState([])
    const [myContactsUpdated, setMyContactsUpdated] = useState(false);
    const [newExterNalInvites, setNewExternalInvites] = useState([]);
    const [isSnackbarVisible, setIsSnackbarVisible] = useState(false)




    useEffect(() => {
            getUser();
            setArrayCombined(props.arrayCombined)
    }, [props.arrayCombined]);
 
    const getUser = async () => {
        let UserId = await retrieveUserDetail();
        setUserDetails(UserId);
    }



    const handleInviteUser = async (item) => {
        const params = {
            phoneNumbers: [item.user?.phone ?? item.phone],
            familyId: familyItem.id,
            invitedBy: userDetails.id
        }
        try {
            let response = await NetworkManager.inviteUser(params)
            if (response.data.code === 200) {
                setIsSnackbarVisible({ message: response.data.message, visible: true })

                setIconEnabled(true)
            }
        } catch (error) {
            setIsSnackbarVisible({ message: error.response.data.message, visible: true })

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
                    onPress: () => { }
                },
                {
                    text: 'Ok', onPress: async () => {
                        try {
                            let response = await NetworkManager.removeFamilyMembers(params)
                            if (response.data.code === 200) {
                                setIsSnackbarVisible({ message: response.data.message, visible: true })
                                const updatedCombinedArray = arrayCombined.filter(
                                    arrayItem => arrayItem !== item
                                );
                                setArrayCombined(updatedCombinedArray)
                            } else {
                            }
                        } catch (error) {
                            setIsSnackbarVisible({ message: error.response.data.message, visible: true })
                        }
                    }, style: 'destructive'
                }
            ]
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={arrayCombined}
                style={{ flex: 1 }}
                ListEmptyComponent={<View style={styles.listEmptyComponent}>
                    <Icon name='account' size={80} color={'white'} />
                    <Text style={{ color: 'white', fontSize: 20 }}>{FAMILY_LIST_EMPTY.memberEmpty}</Text>
                </View>}
                renderItem={({ item }) => (
                    <View style={styles.FlatListContainer}>
                        {typeof item === 'object' ? ( // Check if item is an object (family member)
                            <View style={{ width: '70%' }}>
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
                            {(item.inviteStatus === 'Accepted' && userDetails.id === familyItem.createdBy) ? (
                                <View>
                                    <TouchableOpacity style={{ marginRight: 20 }} onPress={() => handleFamilyMemberDelete(item)}>
                                        <Icon name="delete" size={25} color="white" />
                                    </TouchableOpacity>
                                </View>) : null}

                        </View>
                    </View>
                )}
            />
            <CustomSnackBar
                message={isSnackbarVisible?.message}
                status={isSnackbarVisible?.visible}
                setStatus={setIsSnackbarVisible}
                styles={[styles.snackBar, { backgroundColor: isSnackbarVisible.isFailed ? COLORS.red : '#0e9b81' }]}
                textStyle={{ color: COLORS.white, textAlign: 'left', fontSize: 13 }}
                roundness={10}
                duration={isSnackbarVisible.isFailed ? 3000 : 2000}
            />
        </View>

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
        // height: normalize(50),
        backgroundColor: COLORS.darkTransparent,
        marginTop: 5,
        borderRadius: 8,
        padding: 10,
        flexDirection: 'row',
        // width:'75%',
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
    familyItemName: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 30
    },
    memberText: {
        fontSize: 20,
        fontWeight: '500',
        color: 'black',
        marginLeft: 10,
    },
    actionText: {
        fontSize: 20,
        fontWeight: '500',
        color: 'black',
    },
    listEmptyComponent: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100
    },
    iconView: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    container: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginLeft: 20
    },
    innerContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    snackBar: {
        alignSelf: 'center',
        bottom: normalize(50),
        alignContent: 'center',
        backgroundColor: 'white',
        zIndex: 1,
        width: '90%'
    },

});

export default MemberFlatlist;
