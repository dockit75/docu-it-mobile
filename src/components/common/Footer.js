import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Image, ImageBackground, SafeAreaView } from 'react-native'
import { SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
// import {  } from 'react-native-vector-icons/Ionicons';
import { retrieveUserDetail } from '../../storageManager';
import NetworkManager from '../../services/NetworkManager';
import { Badge } from 'react-native-paper';
import { selectUser, setNotificationCount } from '../../slices/UserSlices';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'react-native-gesture-handler';
const Footer = ({ props, route, screenName }) => {
    const navigation = useNavigation();
    const [isClicked, setIsClicked] = useState(false);
    const [userDetails, setUserDetails] = useState([]);
    const [value, setValue] = useState('');
    const dispatch = useDispatch()
    const notificationCount = useSelector(State => State.user?.notificationCount)
    const [familyInvitedList, setFamilyInvitedList] = useState([]);
    const handleHome = () => {
        navigation.navigate('Dashboard')
    };
    const onSettingsClicked = () => {
        setIsClicked(!isClicked);
    }

    useEffect(() => {
        pendingUserInvite();
    }, [])

    useEffect(() => {
        setInterval(() => { pendingUserInvite()}, 10000);
    }, [navigation.isFocused()]);

    const pendingUserInvite = async () => {
        let UserId = await retrieveUserDetail();
        setUserDetails(UserId);
        try {
            let response = await NetworkManager.listPendingInvites(UserId.id);
            // console.log('pendingUser ----->>>response', response.data.response);
            if (response.data.code === 200) {
                dispatch(setNotificationCount({count: response.data.response?.length}))
            } else {
                // console.log('else called')
                alert(response.data.message)
            }
        } catch (error) {
            // console.log('error called===============>>>>')
            // console.error('Error fetching unique id:', error.response);
        }

    }

    const handlePending = () => {
        navigation.navigate('PendingUser', { familyInvitedList: familyInvitedList, userDetails: userDetails, pendingUserInvite: pendingUserInvite() })
        // console.log('userDetails props', userDetails)
    }

    return (
        <View style={{ marginBottom: (!screenName) ? 0 : 20 , alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'black', padding: 5, flexDirection: 'row', }}>
            <View style={{ marginLeft: 20 }}>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={handleHome}>
                    <Icon name="home" size={40} color="gray" />
                </TouchableOpacity>
            </View>

            <View>
                <TouchableOpacity style={{ alignItems: 'center', flexDirection: 'row', position: 'relative' }} onPress={handlePending}>
                    <Icon name="notifications" size={40} color="gray" />
                    {notificationCount ? (<Badge style={{ position: 'absolute', backgroundColor: 'red', top: 0, right: -2 }}>{notificationCount ?? 0}</Badge>) : null}
                </TouchableOpacity>
            </View>

            <View>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={onSettingsClicked}>
                    <Icon name="person" size={40} color="gray" />
                </TouchableOpacity>
            </View>
            <View style={{ marginRight: 20 }} >
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={onSettingsClicked}>
                    <Icon name="settings" size={40} color="gray" />
                </TouchableOpacity>
            </View>
        </View>
    )
}
export default Footer