import React, { useState, useEffect } from 'react'
import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator, } from 'react-native'
import { normalize, screenHeight, screenWidth } from '../../utilities/measurement'
import { Images } from '../../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../utilities/colors';
import DrawerNavigator from '../../components/common/DrawerNavigator';
import { useRoute } from '@react-navigation/native';
import { retrieveUserDetail } from '../../storageManager';
import NetworkManager from '../../services/NetworkManager';
import { FAMILY_LIST_EMPTY } from '../../utilities/strings';
import { Dialog } from '@rneui/themed';
import CustomSnackBar from '../../components/common/SnackBar';
import Loader from '../../components/common/Loader';


const PendingUser = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const familyInvitedLists = route.params.familyInvitedList;
    const userDetails = route.params.userDetails;
    const pendingUserInvite = route.params.pendingUserInvite;
    const [invitesPending, setInvitesPending] = useState(familyInvitedLists)
    const [userAcount, setUserAccount] = useState(userDetails)
    const [isLoading, setIsLoading] = useState(true);
    const [isSnackbarVisible, setIsSnackbarVisible] = useState(false)
    
 
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
                setIsLoading(false)
            }
        } catch (error) {
            // console.log('error called===============>>>>')
            // console.error('Error fetching unique id:', error.response);
        }

    }
   
    const handleInvite = async (item, type) => {
        let UserId = await retrieveUserDetail();
        const params = {
            userId: UserId.id,
            familyId: item.family.id,
            inviteStatus: type
        }
        // console.log('params',params)
        try {
            let response = await NetworkManager.acceptInvite(params)
            // console.log("response",response)
            if (response.data.code === 200) {
                setIsSnackbarVisible({ message: response.data.message, visible: true})
                setInvitesPending(prevInvites => prevInvites.filter(invite => invite !== item));
               
            } else {
                setIsSnackbarVisible({ message: response.data.message, visible: true})
            }
        } catch (error) {
            // console.error('Error fetching unique id:', error.response);
            setIsSnackbarVisible({ message: 'Something went Wrong ', visible: true})
        }
    }

    return (
        <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: '100%' }}>
            <DrawerNavigator>
                <View style={{flex:1}}>
                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start', marginVertical: 10 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={{ marginLeft: 20 , alignContent: 'center' }}>
                    <MaterialCommunityIcons name='arrow-u-left-top' size={30} color={'white'}/>
                    </TouchableOpacity>
                    <Text style={styles.pendingText}> Pending Invites</Text>
                </View>
                
                {isLoading === true ? <Loader isLoading={isLoading} text={'loading'}/>  : (
                <FlatList
                    data={invitesPending.slice().reverse()}
                    style={{ flex: 1 }}
                    ListEmptyComponent={<View style={styles.listEmptyComponent}>
                        <MaterialCommunityIcons name='account-multiple-remove-outline' size={60} color={'white'}/>
                        <Text style={{ color: 'white', fontSize: 20,textAlign:'center' }}>{FAMILY_LIST_EMPTY.pendingEmpty}</Text>
                    </View>}
                    renderItem={({ item }) => (
                        <View style={styles.FlatListContainer}>
                            <View style={{alignItems:'center',flexDirection:'row',justifyContent:'space-between'}}>
                            <View style={{width:'70%'}}>
                                <Text style={{ fontSize: 14, color: "white", marginLeft: 10, }}>
                                    <Text style={{ fontSize: 17, fontWeight: 'bold' }}>{item.invitedBy.name}</Text>
                                    {" "}inviting you to  {'\n'} join 
                                    <Text style={{ fontSize: 17, fontWeight: 'bold', color: 'yellow' }}>{" "}{item.family.name}</Text>{" family"}</Text>
                            </View>
                            <View style={styles.buttons}>
                                <TouchableOpacity onPress={() => handleInvite(item, 'Accepted')} style={styles.iconTouchable}>
                                    <Icon name="check" size={24} color="#50C878" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleInvite(item, 'rejected')} style={styles.iconTouchable}>
                                    <Icon name="remove" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                            </View>
                        </View>
                    )}
                />)}
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
        backgroundColor: COLORS.darkTransparent,
        marginTop: 5,
        borderRadius: 8,
        padding: 15,
        // flexDirection: 'row',
        marginLeft: 14,
        // justifyContent: 'space-between',
        width: screenWidth - 25,
    },
    iconTouchable: {
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
        width: 35,
        height: 35,
    },
    pendingText:{
        fontSize: 22,
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 20
    },
    listEmptyComponent:{ 
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 130 
    },
    buttons:{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        width: '25%' 
    },
    snackBar: {
        alignSelf: 'center',
        bottom: normalize(50),
        alignContent: 'center',
        backgroundColor: 'white',
        zIndex: 1

    },
})
