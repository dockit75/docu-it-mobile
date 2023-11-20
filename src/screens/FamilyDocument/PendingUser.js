import React, { useState, useEffect } from 'react'
import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native'
import { normalize, screenHeight, screenWidth } from '../../utilities/measurement'
import { Images } from '../../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { COLORS } from '../../utilities/colors';
import DrawerNavigator from '../../components/common/DrawerNavigator';
import { useRoute } from '@react-navigation/native';
import { retrieveUserDetail } from '../../storageManager';
import NetworkManager from '../../services/NetworkManager';



const PendingUser = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const familyInvitedLists = route.params.familyInvitedList;
    const userDetails = route.params.userDetails;
    const pendingUserInvite = route.params.pendingUserInvite;
    const [invitesPending, setInvitesPending] = useState(familyInvitedLists)
    const [userAcount, setUserAccount] = useState(userDetails)
    const myData = [
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
    ];

      
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
        getPendingUserInvite();
    });

    return unsubscribe;
  }, []);

    const getPendingUserInvite = async () => {
        let UserId = await retrieveUserDetail();
        try {
            let response = await NetworkManager.listPendingInvites(UserId.id);
            // console.log('pendingUser ----->>>response', response.data.response);
            if (response.data.code === 200) {
                setInvitesPending(response.data.response)
            }
        } catch (error) {
            // console.log('error called===============>>>>')
            // console.error('Error fetching unique id:', error.response);
        }

    }
    // useEffect(() => {
    //     setInvitesPending(familyInvitedLists);
    //     setUserAccount(userDetails)
    //     console.log('setInvitesPending', userAcount)

    // }, [familyInvitedLists, userDetails]);

    // const onDeclinePressed = async (item, type) => {
    //     // console.log('deniedPressed', item)
    //     const params = {
    //         userId: userAcount.id,
    //         familyId: item.family.id,
    //         inviteStatus: 'rejected'
    //     }
    //     try {
    //         let response = await NetworkManager.acceptInvite(params)
    //         // console.log('response', response)
    //         if (response.data.code === 200) {
    //             alert(response.data.message)
    //             setInvitesPending(prevInvites => prevInvites.filter(invite => invite !== item));
    //         } else {
    //             alert(response.data.message)
    //         }
    //     } catch (error) {
    //         alert('Something went Wroung ')
    //     }
    // }
    const handleInvite = async (item, type) => {
        const params = {
            userId: userAcount.id,
            familyId: item.family.id,
            inviteStatus: type
        }
        try {
            let response = await NetworkManager.acceptInvite(params)
            if (response.data.code === 200) {
                alert(response.data.message)
                setInvitesPending(prevInvites => prevInvites.filter(invite => invite !== item));
            } else {
                alert(response.data.message)
            }
        } catch (error) {
            // console.error('Error fetching unique id:', error.response);
            alert('Something went Wroung ')
        }
    }

    return (
        <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: '100%' }}>
            <DrawerNavigator>

                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start', marginVertical: 10 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={{ marginLeft: 20 , alignContent: 'center' }}>
                        <Image source={Images.ARROW} style={{ width: 22, height: 22 }} />
                    </TouchableOpacity>
                    <Text
                        style={{
                            fontSize: 22,
                            color: 'white',
                            fontWeight: 'bold',
                            // textTransform: 'uppercase',
                            // marginTop: 20,
                            // marginBottom: 10,
                            // marginRight: 80,
                            textAlign:'center',
                            marginLeft: 20
                            // flex:0.95
                        }}>
                        Pending Invites
                    </Text>
                </View>

                <FlatList
                    data={invitesPending.slice().reverse()}
                    style={{ flex: 1 }}
                    ListEmptyComponent={<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 130 }}>
                        <Text style={{ color: 'white', fontSize: 20 }}>No recent Invites....</Text>
                    </View>}
                    renderItem={({ item }) => (
                        <View style={styles.FlatListContainer}>
                            <View>
                                <Text style={{ fontSize: 14, color: "white", marginLeft: 10, }}><Text style={{ fontSize: 17, fontWeight: 'bold' }}>{item.invitedBy.name}</Text>{" "}inviting you to  {'\n'} join <Text style={{ fontSize: 17, fontWeight: 'bold', color: 'yellow' }}>{item.family.name}</Text> famiy</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '25%' }}>
                                <TouchableOpacity onPress={() => handleInvite(item, 'Accepted')} style={styles.iconTouchable}>
                                    <Icon name="check" size={24} color="#50C878" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleInvite(item, 'rejected')} style={styles.iconTouchable}>
                                    <Icon name="remove" size={24} color="red" />
                                </TouchableOpacity>
                            </View>

                        </View>
                    )}
                />

            </DrawerNavigator>
        </ImageBackground>
    )
}
export default PendingUser
const styles = StyleSheet.create({
    text: {
        textAlign: 'center',
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    FlatListContainer: {
        // height: normalize(70),
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
    iconTouchable: {
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
        width: 35,
        height: 35,
        // margin:5,
        // padding:20
    }
})
