import React, { cloneElement, Fragment, useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator } from 'react-native-paper';
import { normalize, normalizeVertical, screenHeight, screenWidth } from '../../../utilities/measurement';
import { Images } from '../../../assets/images/images';
import { COLORS } from '../../../utilities/colors';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch } from 'react-redux';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { TOUR_GUIDE } from '../../../utilities/strings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { retrieveUserDetail } from '../../../storageManager';
import NetworkManager from '../../../services/NetworkManager';
import { setProfileCompletion } from '../../../slices/UserSlices';
import {
    TourGuideProvider, // Main provider
    TourGuideZone, // Main wrapper of highlight component
    TourGuideZoneByPosition, // Component to use mask on overlay (ie, position absolute)
    useTourGuideController, // hook to start, etc.
} from 'rn-tourguide'
import { all } from 'axios';

const tileList = [{
    icon: 'ICON_PERSONAL_DOCS',
    title: 'My Documents',
    path: 'CategoryScreen'
},
{
    icon: 'ICON_FAMILY_MGMT',
    title: 'My Family',
    path: 'FamilyDocument'
}]

const Tile = ({ }) => {
    // hooks
    const iconProps = { size: 40, color: '#888' }

    const {
        canStart, // a boolean indicate if you can start tour guide
        start, // a function to start the tourguide
        stop, // a function  to stopping it
        eventEmitter, // an object for listening some events
        tourKey
    } = useTourGuideController()
    const navigation = useNavigation();
    const dispatch = useDispatch('dashboard')
    // state
    const [activityData, setactivityData] = useState([]);
    const [allowTour, setAllowTour] = useState()
    let [stepCount, setStepCount] = useState(0);
    const [zoneIndex, setZoneIndex] = useState(null);
    useEffect(() => {
        // console.log('useEffect one called')
        const checkTourStatus = async () => {
            try {
                const tourStatus = await AsyncStorage.getItem('allowTour');
                const tourSkipped = await AsyncStorage.getItem('tourSkipped');
                console.log('tourSkipped', tourSkipped, tourStatus)
                if (tourStatus === 'false') {
                    // Tour has been skipped, set allowTour to false
                    // console.log('ifCalled===>>>>>')
                    setAllowTour(false);
                } else {

                    // console.log('else called')
                    // Tour has not been skipped, use the status from AsyncStorage
                    setAllowTour(true);
                }
            } catch (error) {
                console.error('Error reading tour guide status:', error.message);
            }

        };

        checkTourStatus();
    }, []);

    // console.log('setAllowTour======>>>>>', allowTour)

    useEffect(() => {
        // Delay the execution of this block by 5000 milliseconds (5 seconds)
        if (canStart && allowTour) {
            start();
        }

        // Clear the timeout when the component is unmounted or the dependency values change
    }, [canStart, allowTour]);

    const handleOnStart = () => console.log('start called')

    const handleOnStop = async () => {
        console.log('stop');

        try {
            // Set a flag indicating that the tour has been skipped
            await AsyncStorage.setItem('tourSkipped', 'true');

            // Store state in local storage
            await AsyncStorage.setItem('tourGuideStatus', 'stopped');
            await AsyncStorage.setItem('allowTour', 'false');

            // Set allowTour state to false
            setAllowTour(false);
        } catch (error) {
            console.error('Error storing tour guide status:', error.message);
        }
    };





    const handleOnStepChange = () => {
        // Increment stepCount
        stepCount++;

        // Check if stepCount is 4, then update local storage
        console.log('stepCount', stepCount)
        if (stepCount === 4) {
            try {
                console.log('try called', stepCount);
                // Store true in local storage
                AsyncStorage.setItem('stepFourReached', 'true');
            } catch (error) {
                console.error('Error storing step four status:', error.message);
            }
        } else if (stepCount === 5) {
            try {
                console.log('try called five called', stepCount);
                // Store true in local storage
                AsyncStorage.setItem('stepFiveReached', 'true');
            } catch (error) {
                console.error('Error storing step four status:', error.message);
            }
        }
    }

    console.log('step count=====>>', stepCount)


    useEffect(() => {
        console.log('handle start called', allowTour)
        eventEmitter.on('start', handleOnStart);
        eventEmitter.on('stop', handleOnStop);
        eventEmitter.on('stepChange', handleOnStepChange);

        return () => {
            eventEmitter.off('start', handleOnStart);
            eventEmitter.off('stop', handleOnStop);
            eventEmitter.off('stepChange', handleOnStepChange);
        };
    }, [eventEmitter]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            getUserRanking()
        });

        const getUserRanking = async () => {
            let userDetails = await retrieveUserDetail();
            let profileStatusResult = await NetworkManager.getUserRanking(userDetails.id)
            if (profileStatusResult?.data.code === 200 && profileStatusResult?.data.status === 'SUCCESS') {
                dispatch(setProfileCompletion({ percentage: profileStatusResult?.data?.response?.userRanking ?? 0.0 }))
            }
        }

        // const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
        return () => {
            unsubscribe
            // backHandler.remove()
        }
    }, []);

    const formatScannedImages = (images) => {
        return images.map((uri) => ({
            documentUrl: uri,
            fileType: 'image/jpg', // You can change the type as needed
            fileName: uri.split('/').pop()
        }));
    };

    const handleScanner = async () => {
        // Check if camera permission is granted
        console.log('called')
        const status = await check(PERMISSIONS.ANDROID.CAMERA);
        if (status === RESULTS.GRANTED) {
            // Camera permission is already granted, start the document scanner
            const { scannedImages: newScannedImages } = await DocumentScanner.scanDocument({
                croppedImageQuality: 50
            });
            if (newScannedImages.length > 0) {
                const formattedScannedImages = formatScannedImages(newScannedImages);
                uploadFileList(formattedScannedImages)
            }
        } else if (status === RESULTS.DENIED) {
            // Camera permission is denied, request it from the user
            const requestResult = await request(PERMISSIONS.ANDROID.CAMERA);
            if (requestResult === RESULTS.GRANTED) {
                // Camera permission has been granted, start the document scanner
                const { scannedImages: newScannedImages } = await DocumentScanner.scanDocument({
                    croppedImageQuality: 50
                });
                if (newScannedImages.length > 0) {
                    const formattedScannedImages = formatScannedImages(newScannedImages);
                    uploadFileList(formattedScannedImages)

                }
            } else {
                // Handle the case where the user denied camera permissions
                // You can show a message to the user explaining why the camera is require
                alert('Permission to access camera was denied.');

            }
        } else {
            // Handle other permission statuses 
            alert('Permission to access camera was denied.');
        }
    };


    const uploadFileList = async (files) => {
        navigation.navigate('uploadPreview', { uploadFiles: files, categoryInfo: null, refreshData: false })
    }

   

    const handlePress = (path, isCameraIconPress) => isCameraIconPress ? handleScanner() : navigation.navigate(path)
    const renderTile = (item, index) => {
        const zoneNumber = index === 0 ? 3 : 2;
        const text = index === 0 ? TOUR_GUIDE.documentTour : TOUR_GUIDE.familyTour;
        return <TourGuideZone
            key={index}
            zone={zoneNumber}
            text={text}
            borderRadius={16}
            // bottom={30}
            // shape={'circle'}
            verticalOffset={0.5}
            wrapperStyle={{ backgroundColor: 'red' }}
            tooltipStyle={{ backgroundColor: 'red' }}
            backdropColor={'red'}
            tourKey={tourKey}
        >
            <TouchableOpacity onPress={() => allowTour === false ? handlePress(item.path) : null}>
                <Card style={styles.cardContainer}>
                    <Image source={Images[item.icon]} style={styles.Images} resizeMode="center" />
                    <Card.Content>
                        <Paragraph style={styles.imageText}>{item.title}</Paragraph>
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        </TourGuideZone>
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flexDirection: 'column', alignItems: 'center', height: screenHeight * 0.4, alignSelf: 'center', justifyContent: 'space-evenly' }}>
                <View style={styles.cardView}>
                    {tileList.map(renderTile)}
                </View>
                <View >
                    <TourGuideZone
                        zone={1}
                        text={TOUR_GUIDE.cameraTour}
                        // borderRadius={16}
                        shape={'circle'}
                        tourKey={tourKey}
                    >
                        <TouchableOpacity
                            style={styles.fabButton}
                            onPress={() => handlePress('CategoryScreen', true)}>
                            <MaterialIcon name="camera-alt" size={40} color="white" style={{ padding: 2 }} />
                        </TouchableOpacity>
                    </TourGuideZone>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    cardView: {
        flexDirection: 'row',
        alignContent: 'space-around',
        flexWrap: 'wrap'
    },
    cardContainer: {
        width: normalize(145),
        height: normalize(90),
        backgroundColor: '#042533',
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    Images: {
        width: normalize(35),
        height: normalize(35),
        alignSelf: 'center',
        marginTop: normalize(15),
    },
    imageText: {
        fontWeight: 'bold',
        fontSize: 12,
        color: COLORS.white,
        textAlign: 'center',
        letterSpacing: 0.6,
        marginTop: normalize(15),
    },
    fabButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
        borderWidth: 1,
        borderColor: COLORS.white
    },
});


export default Tile
