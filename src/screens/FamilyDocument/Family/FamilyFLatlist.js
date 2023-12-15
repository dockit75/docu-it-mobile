import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Modal,
    ImageBackground,
    StyleSheet,
    TextInput,
    FlatList,
    Keyboard,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { normalize, screenHeight, screenWidth } from '../../../utilities/measurement';
import { Images } from '../../../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Popover from 'react-native-popover-view';
import { COLORS } from '../../../utilities/colors';
import NetworkManager from '../../../services/NetworkManager';
import { Snackbar } from 'react-native-paper';
import { retrieveUserDetail } from '../../../storageManager';
import DrawerNavigator from '../../../components/common/DrawerNavigator';
import { Dialog, LinearProgress } from '@rneui/themed';
import { FAMILY_LIST_EMPTY } from '../../../utilities/strings';
import CustomSnackBar from '../../../components/common/SnackBar';
import FamilyModal from '../components/FamilyModal';
import Loader from '../../../components/common/Loader';
import { useNavigation } from '@react-navigation/native';

const FamilyFlatlist = (props) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [familyDetails, setFamilyDetail] = useState(props.familyDetails);
    const [userDetails, setUserDetails] = useState(props.userDetails);
    const [currentItemId, setCurrentItemId] = useState([]);
    const [editFamilyCall, setEditFamilyCall] = useState(false);
    const [isLoader, setIsLoader] = useState(true);
    const [previousCurrentItemId, SetPreviousCurrentItemId] = useState([])
    const [isSnackbarVisible, setIsSnackbarVisible] = useState(false)
    console.log('navigation====>>', props, familyDetails,)
    const showModal = (item) => {
        setCurrentItemId(item);
        SetPreviousCurrentItemId(item)
        setEditFamilyCall(true);
        setIsModalVisible(true);
        console.log('show modal modal called')
    };

    const handleFamilyDelete = async (item) => {
        const params = {
            familyId: item.id,
            adminId: userDetails.id
        }

        Alert.alert(
            'Are you want to delete the family?',
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
                            let response = await NetworkManager.deleteFamily(params);
                            if (response.data.code === 200) {
                                // Alert.alert(response.data.message)
                                setTimeout(() => setIsSnackbarVisible({ message: response.data.message, visible: true }), 1000)
                                const updatedFamilyDetails = familyDetails.filter((family) => family.id !== item.id);
                                setFamilyDetail(updatedFamilyDetails);
                            }
                        } catch (error) {
                            setTimeout(() => setIsSnackbarVisible({ message: error.response.data.message, visible: true, isFailed: true }), 1000)
                        }
                    }, style: 'destructive'
                }
            ]
        )
    }

    return (
        <View style={{ flex: 1 }}>
            {isModalVisible === true && <FamilyModal isModalVisible={isModalVisible} editFamilyCall={editFamilyCall} userDetails={userDetails}  currentItemId={currentItemId} getFamilyList={props.getFamilyList}/>}
            <FlatList
                data={familyDetails}
                style={{ flex: 1 }}
                ListEmptyComponent={<View style={styles.listEmptyComponent}>
                    <Icon name='account-group' size={80} color={'white'} />
                    <Text style={{ color: 'white', fontSize: 20 }}>{FAMILY_LIST_EMPTY.familyEmpty}</Text>
                </View>}
                renderItem={({ item }) => (
                    <View style={styles.FlatListContainer}>
                        <View style={styles.innerContainer}>
                            <View style={styles.iconContainer}>
                                <Icon name="account-group" size={25} color="white" />
                            </View>
                            <View>
                                <TouchableOpacity onPress={() => navigation.navigate('FamilyMember', { familyItem: item })}>
                                    <Text style={styles.text}>{item.name}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {item.createdBy === userDetails.id ?
                            <View style={styles.iconView}>
                                <TouchableOpacity
                                    onPress={() => showModal(item)}
                                    style={{ marginRight: 20 }}>
                                    <Icon name="square-edit-outline" size={20} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleFamilyDelete(item)}
                                    style={{ marginRight: 20 }}>
                                    <Icon name="delete" size={20} color="white" />
                                </TouchableOpacity>
                            </View> : null}
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
export default FamilyFlatlist;

const styles = StyleSheet.create({

    FlatListContainer: {
        height: normalize(50),
        backgroundColor: COLORS.darkTransparent,
        marginTop: 5,
        borderRadius: 8,
        padding: 10,
        flexDirection: 'row',
        // width:'75%',
        marginLeft: 14,
        justifyContent: 'space-between',
        width: screenWidth - 25,
    },
    familyName: {
        fontSize: 20,
        fontWeight: '500',
        color: 'black',
        marginLeft: 20,
    },
    actionText: {
        fontSize: 20,
        fontWeight: '500',
        color: 'black',
        marginRight: 30,
    },
    listEmptyComponent: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 130
    },
    iconView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    innerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    iconContainer: {
        height: 37,
        width: 37,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        textAlign: 'center',
        marginTop: 6,
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },
    textInputHeader: {
        color: 'black',
        fontSize: 18,
        fontWeight: '500',
        marginVertical: 10,
    },
    errorMessage: {
        color: 'red',
        fontSize: 15,
        marginVertical: 5,
        marginBottom: 10
    },
    snackBar: {
        alignSelf: 'center',
        bottom: normalize(50),
        alignContent: 'center',
        backgroundColor: 'white',
        zIndex: 1
    },
    text: {
        textAlign: 'center',
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 30,
        // textDecorationLine:'underline',
        borderBottomColor: 'white',
        borderBottomWidth: 2
    },
});
