import React, {useState, useRef, Fragment, useEffect} from 'react';
import {Text, View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {normalize} from '../../utilities/measurement';
import {Images} from '../../assets/images/images';
import Drawer from 'react-native-drawer';
import DrawerContent from './DrawerContent';
import {Menu, MenuItem, MenuDivider} from 'react-native-material-menu';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import DocumentScanner from 'react-native-document-scanner-plugin';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { LinearProgress } from '@rneui/themed';
import { COLORS } from '../../utilities/colors';
import { useDispatch, useSelector } from 'react-redux';
import { setProfileCompletion } from '../../slices/UserSlices';
import { ProgressBar } from 'react-native-paper';

const Header = props => {
  const [open, setOpen] = useState();
  const insets = useSafeAreaInsets()
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch()
  const profileCompletion = useSelector(State => State.user?.profileCompletion)

  // useEffect(() => {
  //   console.log('profileCompletion ******', profileCompletion)
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



const uploadFileList = async (files) => {
    navigation.navigate('uploadPreview', {uploadFiles: files, categoryInfo: null, refreshData: false})
}

  const hideMenu = () => setVisible(false);

  const showMenu = () => setVisible(true);
  let drawerRef = useRef();
  const openControlPanel = () => {
    // console.log('open called');
    drawerRef.current.open();
  };
  let progress = profileCompletion ?? 0.4
  return (
    <View style={{ position: 'relative' }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderColor: 'black',
          borderBottomWidth: 1,
          marginTop: normalize(insets.top),
          paddingHorizontal: 10,
          paddingBottom: 10
          //   backgroundColor: 'green',
        }}>
        <TouchableOpacity onPress={props.leftAction}>
          <MaterialCommunityIcons name="menu" size={30} color="white" />
        </TouchableOpacity>
        <Image
            source={require('../../assets/images/logo_dockit.png')}
            resizeMode="center"
            style={styles.logoImage}
          />
          <View style={{ position: 'absolute', right: 50, alignSelf: 'center', justifyContent: 'space-between', top: 5 }}>
            <Text style={{ fontSize: normalize(12), color: COLORS.white, marginBottom: 3 }}>Profile Status</Text>
            <LinearProgress
              style={{ width: 100, backgroundColor: COLORS.lightGray, borderWidth: 0.4, borderColor: COLORS.avatarBackground, height: 5, borderRadius: 5 }}
              value={progress}
              color={progress <= 0.3 ? 'red' : (progress <= 0.5 && progress <= 0.7) ? 'yellow' : '#7CFC00'}
              // variant="determinate"
              animation={false}
            />
            {/* <View style={{ width: `${100 * progress}%`, backgroundColor: progress <= 0.3 ? 'red' : (progress < 0.5 && progress < 0.7) ? 'orange' : 'green', height: 100 }} /> */}
            {/* <ProgressBar progress={progress} color={progress <= 0.3 ? 'red' : (progress < 0.5 && progress < 0.7) ? 'orange' : 'green'} /> */}
          </View>
            <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', marginTop: 5 }} onPress={showMenu}>
              <MaterialCommunityIcons name="dots-vertical" size={22} color="white" />
            </TouchableOpacity>
      </View>
      
      <View style={{ position: 'absolute', right: 5, bottom: 0 }}>
        <Menu
          style={{width: 60, height: 150}}
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
          <MenuItem textStyle={{color: 'black'}} onPress={handleUploadDocuments}>
            {/* <Image
              source={require('../../assets/images/blackCameraIcon.png')}
              resizeMode="center"
              style={{ height: 25, width: 25 }}
            />
            <Text style={{ marginLeft: 2 }}>{" "}Camera</Text> */}
            <Icon name="camera" size={25} color="black" />
          </MenuItem>
          <MenuItem
            textStyle={{fontSize: 17, color: 'black'}}
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
