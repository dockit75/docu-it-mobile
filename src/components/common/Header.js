import { HEADER, TOUR_GUIDE } from '../../utilities/strings';
import React, { useState, useRef, Fragment, useEffect, useMemo } from 'react';
import { Text, View, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { normalize, screenWidth } from '../../utilities/measurement';
import { Images } from '../../assets/images/images';
import Drawer from 'react-native-drawer';
import DrawerContent from './DrawerContent';
import { Menu, MenuItem, MenuDivider } from 'react-native-material-menu';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import DocumentScanner from 'react-native-document-scanner-plugin';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Dialog, LinearProgress } from '@rneui/themed';
import { COLORS } from '../../utilities/colors';
import { useDispatch, useSelector } from 'react-redux';
import { setProfileCompletion } from '../../slices/UserSlices';
import { ProgressBar } from 'react-native-paper';
import { TourGuideZone, useTourGuideController } from 'rn-tourguide';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Header = props => {
  const {
    canStart,
    start,
    stop,
    eventEmitter,
    tourKey
  } = useTourGuideController();
  const [open, setOpen] = useState();
  const insets = useSafeAreaInsets()
  const [visible, setVisible] = useState(false);
  const [isShowProfileStatusInfo, setIsShowProfileStatusInfo] = useState(false);
  const [allowTour, setAllowTour] = useState()
  const navigation = useNavigation();
  const dispatch = useDispatch()
  const profileCompletion = useSelector(State => State.user?.profileCompletion)

  // useEffect(() => {
  // console.log('profileCompletion ******', profileCompletion)
  //   if(!profileCompletion){
  //     dispatch(setProfileCompletion({percentage: 0.8}))
  //   }
  // }, [])
  // console.log('profileCompletion', props)
  const handleHome = () => {
    navigation.navigate('Dashboard')
  };
  const handleHelp = () => {
    navigation.navigate('Settings')
  };
  const handleUploadDocuments = (head) => {
    // navigation.navigate('CategoryScreen')
    handleScanner()
    hideMenu()
  };

  useEffect(() => {
   
    setInterval(() => { checkTourStatus() }, 1000);
  }, []);

  const checkTourStatus = async () => {
    try {
      const tourStatus = await AsyncStorage.getItem('allowTour');
      const tourSkipped = await AsyncStorage.getItem('tourSkipped');
      // console.log('tourSkipped', tourSkipped, tourStatus)
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

  // console.log('setALlowtoure====>>>>>',allowTour)

  const formatScannedImages = (images) => {
    return images.map((uri) => ({
      documentUrl: uri,
      fileType: 'image/jpg', // You can change the type as needed
      fileName: uri.split('/').pop()
    }));
  };

  const handleScanner = async () => {
    // Check if camera permission is granted
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
        setSnackbarMessage('Camera permission required to scan Documents');
        setSnackbarVisible(true);

      }
    } else {
      // Handle other permission statuses 
      alert('Permission to access camera was denied.');
      setSnackbarMessage('Camera permission required to scan Documents');
      setSnackbarVisible(true);
    }
  };

  const memoRenderProfileStatus = () => {
    return (
      <LinearProgress
        style={{ width: 100, backgroundColor: COLORS.lightGray, borderWidth: 0.4, borderColor: COLORS.avatarBackground, height: 5, borderRadius: 5 }}
        value={progress / 100}
        color={progress > 70 ? '#7CFC00' : (progress > 30 && progress < 70) ? 'yellow' : 'red'}
        animation={false}
      />
    )
  }
  const uploadFileList = async (files) => {
    navigation.navigate('uploadPreview', { uploadFiles: files, categoryInfo: null, refreshData: false })
  }

  const hideMenu = () => setVisible(false);

  const showMenu = () => setVisible(true);
  let drawerRef = useRef();
  const openControlPanel = () => {
    // console.log('open called');
    drawerRef.current.open();
  };
  let progress = profileCompletion ?? 0
  // console.log('progress', progress)
  const memoizedRenderChatsHeader = useMemo(memoRenderProfileStatus, [progress])
  return (
    <View style={{ position: 'relative' }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderColor: 'black',
          borderBottomWidth: 1,
          marginTop: 40,
          paddingHorizontal: 10,
          paddingBottom: 10
          //   backgroundColor: 'green',
        }}>
          <View>
          <TouchableOpacity onPress={allowTour === false ? props.leftAction : null}>
        <TourGuideZone zone={5} text={TOUR_GUIDE.menuTour} shape={'circle'} tourKey={tourKey}  
         borderRadius={4} // Set a borderRadius that fits the shape of your icon
        //  textTopOffset={20}

        >
            <MaterialCommunityIcons name="menu" size={30} color="white" />
        </TourGuideZone>
          </TouchableOpacity>
          </View>
        <Image
          source={require('../../assets/images/logo_dockit.png')}
          resizeMode="center"
          style={styles.logoImage}
        />
        <View style={{ position: 'absolute', right: 50, alignSelf: 'center', justifyContent: 'space-between', top: 5 }} onTouchEnd={() => setIsShowProfileStatusInfo(true)}>
          <Text style={{ fontSize: normalize(11), color: COLORS.white, marginBottom: 3 }}>{`Profile Status (${progress}%)`}</Text>
          {memoizedRenderChatsHeader}
          {/* <View style={{ width: `${100 * progress}%`, backgroundColor: progress <= 0.3 ? 'red' : (progress < 0.5 && progress < 0.7) ? 'orange' : 'green', height: 100 }} /> */}
          {/* <ProgressBar progress={progress} color={progress <= 0.3 ? 'red' : (progress < 0.5 && progress < 0.7) ? 'orange' : 'green'} /> */}
        </View>
        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', marginTop: 5 }} onPress={allowTour === false ? showMenu : null}>
          <MaterialCommunityIcons name="dots-vertical" size={22} color="white" />
        </TouchableOpacity>
      </View>
      <Dialog overlayStyle={{ width: screenWidth * 0.85 }} isVisible={isShowProfileStatusInfo} >
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: COLORS.brandBlue, justifyContent: 'space-between' }}>{HEADER.profileStatusTitle}</Text>
            <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', marginTop: 5 }} onPress={() => setIsShowProfileStatusInfo(false)}>
              <MaterialCommunityIcons name="close" size={25} color="black" />
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 5 }}>
            {/* <Text style={{ fontSize: normalize(11), color: COLORS.lightBlack, marginBottom: 5 }}>{HEADER.profileStatusDescriptionText}</Text> */}
            {HEADER.profileStatusDescriptionList.map(item => <Text>{item}</Text>)}
          </View>
        </View>
      </Dialog>
      <View style={{ position: 'absolute', right: 5, bottom: 0 }}>
        <Menu
          style={{ width: 60, height: 150 }}
          visible={visible}
          onRequestClose={hideMenu}>
          <MenuItem
            textStyle={{
              fontSize: 15,
              color: 'black',
              justifyContent: 'space-between',
            }}
            onPress={handleHome}>
            {/* <Image
              source={require('../../assets/images/homeBlack.png')}
              resizeMode="center"
              style={{ height: 25, width: 25, }}
            />
            <Text style={{ margin: 5 }}>Home</Text> */}
            <Icon name="home" size={30} color="black" />
          </MenuItem>
          <MenuItem textStyle={{ color: 'black' }} onPress={handleUploadDocuments}>
            {/* <Image
              source={require('../../assets/images/blackCameraIcon.png')}
              resizeMode="center"
              style={{ height: 25, width: 25 }}
            />
            <Text style={{ marginLeft: 2 }}>{" "}Camera</Text> */}
            <Icon name="camera" size={25} color="black" />
          </MenuItem>
          <MenuItem
            textStyle={{ fontSize: 17, color: 'black' }}
            onPress={handleHelp}>
            {/* <Image
              source={require('../../assets/images/blackCameraIcon.png')}
              resizeMode="center"
              style={{ height: 25, width: 25 }}
            />
            <Text style={{ marginLeft: 2 }}>{" "}Camera</Text> */}
            <Icon name="question-circle" size={30} color="black" />
          </MenuItem>
        </Menu>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  Image: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    //   marginRight: normalize(10),
  },
  hamburgerMenu: {
    width: 38,
    height: 38,
    margin: 10,
  },
  logoImage: {
    width: 30,
    height: 30,
    alignSelf: 'center',
    //   marginRight: normalize(10),
  },
});
