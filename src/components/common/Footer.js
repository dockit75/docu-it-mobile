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
import { TourGuideZone, useTourGuideController } from 'rn-tourguide';
import { COLORS } from '../../utilities/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOUR_GUIDE } from '../../utilities/strings';
import { checkNotifications } from 'react-native-permissions';

const Footer = ({ props, route, screenName }) => {
    const {
        canStart,
        start,
        stop,
        eventEmitter,
        tourKey
    } = useTourGuideController();
    const navigation = useNavigation();
    const [isClicked, setIsClicked] = useState(false);
    const [userDetails, setUserDetails] = useState([]);
    const [value, setValue] = useState('');
    const dispatch = useDispatch()
    const notificationCount = useSelector(State => State.user?.notificationCount)
    const [familyInvitedList, setFamilyInvitedList] = useState([]);
    const [notificationColor, setNotificationColor] = useState(false);
    const [isInZone, setIsInZone] = useState(false);
    const [allowTour,setAllowTour] = useState(false);
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
        setInterval(() => { pendingUserInvite() }, 10000);
    }, [navigation.isFocused()]);

    // const handleEnterZone = () => {
    //     // Change the color when entering the specified zone
    //     setNotificationColor('red');
    //   };
    
    //   const handleExitZone = () => {
    //     // Reset the color when exiting the zone
    //     setNotificationColor('gray');
    //   };

    useEffect(() => {
        setInterval(() => { checkTourStatus() }, 1000);
      }, []);


      const checkTourStatus = async () => {
        try {
          const notificationStatus = await AsyncStorage.getItem('stepFourReached');
          const tourStatus = await AsyncStorage.getItem('stepFiveReached');
          const status = await AsyncStorage.getItem('allowTour');

          if (tourStatus === null &&  notificationStatus === 'true') {
            setNotificationColor(true);
          
          } else if(status === "false") {
            // console.log('else if called======================>>>>')
            setAllowTour(true)

          }else   {
            setNotificationColor(false);
            await AsyncStorage.setItem('stepFourReached', ''); // or null, depending on your preference
            await AsyncStorage.setItem('stepFiveReached', '');
          }
        } catch (error) {
          console.error('Error reading tour guide status:', error.message);
        }
      };
// console.log('setAllow',allowTour)

    const pendingUserInvite = async () => {
        let UserId = await retrieveUserDetail();
        setUserDetails(UserId);
        try {
            let response = await NetworkManager.listPendingInvites(UserId.id);
            // console.log('pendingUser ----->>>response', response.data.response);
            if (response.data.code === 200) {
                dispatch(setNotificationCount({ count: response.data.response?.length }))
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
        <View style={{ marginBottom: (!screenName) ? 0 : 20, alignItems: 'center', justifyContent: 'space-between', backgroundColor:notificationColor?'transparent':'black', padding: 5, flexDirection: 'row' }}>
            <View style={{ marginLeft: 20 }}>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={handleHome}>
                    <Icon name="home" size={40} color="gray" />
                </TouchableOpacity>
            </View>
              
            <View style={{position:'relative'}}>
            <TourGuideZone  zone={4} text={TOUR_GUIDE.notificationTour} shape={'circle'} tourKey={tourKey}  borderRadius={4}   >
                    <TouchableOpacity style={{ alignItems: 'center', flexDirection: 'row', }} onPress={allowTour ? handlePending : null}>
                        <Icon name="notifications" size={40} color={notificationColor?'black':'gray'} />
                        {notificationCount ? (<Badge style={{ position: 'absolute', backgroundColor: 'red', top: 0, right: -2 }}>{notificationCount ?? 0}</Badge>) : null}
                    </TouchableOpacity>
                   
             </TourGuideZone>
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