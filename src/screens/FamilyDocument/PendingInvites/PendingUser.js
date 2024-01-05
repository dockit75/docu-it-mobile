import React, { useState, useEffect } from 'react'
import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator, } from 'react-native'
import { normalize, screenHeight, screenWidth } from '../../../utilities/measurement'
import { Images } from '../../../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../utilities/colors';
import DrawerNavigator from '../../../../src/components/common/DrawerNavigator';
import { useRoute } from '@react-navigation/native';
import { retrieveUserDetail } from '../../../storageManager';
import NetworkManager from '../../../services/NetworkManager';
import { FAMILY_LIST_EMPTY } from '../../../utilities/strings';
import { Dialog } from '@rneui/themed';
import CustomSnackBar from '../../../components/common/SnackBar';
import PendingFlatlist from './Components/PendingFlatlist';



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
            if (response.data.code === 200) {
                setInvitesPending(response.data.response)
                setIsLoading(false)
            }
        } catch (error) {
            
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
                {isLoading === true ?  (<Dialog overlayStyle={{ width: 120 }} isVisible={isLoading} >
                    <ActivityIndicator size={'large'} color={'#0e9b81'} />
                    <Text style={{ textAlign: 'center',color:'#0e9b81' }}>Loading...</Text>
                   </Dialog> ): (
                    <PendingFlatlist  invitesPending={invitesPending}/>
                   )}
                
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
        zIndex: 1,
        width:'90%'

    },
})
