import React, { useState, useEffect } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  FlatList,
  ImageBackground,
  Text,
} from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  normalize,
  normalizeVertical,
  screenHeight,
  screenWidth,
} from '../utilities/measurement';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { FAB, Provider as PaperProvider, Portal, } from 'react-native-paper';
import { Images } from '../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetworkManager from '../services/NetworkManager';
import DocumentPicker from 'react-native-document-picker';

const DocumentScannerScreen = ({ navigation }) => {
  const [scannedImages, setScannedImages] = useState([]);
  const [cameraPermissionStatus, setCameraPermissionStatus] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [rotateDegrees, setRotateDegrees] = useState({});
  // const [isFABOpen, setIsFABOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(true);
  const rotationValue = new Animated.Value(0);
  const insets = useSafeAreaInsets();
  const [uploadStatus, setUploadStatus] = useState(null);
  const [pickedDocuments, setPickedDocuments] = useState([]);

  const handleScanner = async () => {
    // Check if camera permission is granted
    const status = await check(PERMISSIONS.ANDROID.CAMERA);
    setCameraPermissionStatus(status);

    if (status === RESULTS.GRANTED) {
      // Camera permission is already granted, start the document scanner
      const { scannedImages: newScannedImages } = await DocumentScanner.scanDocument();

      if (newScannedImages.length > 0) {
        // Append new scanned images to the existing array
        setScannedImages([...scannedImages, ...newScannedImages]);

        // Initialize the rotation degrees for new images
        const newRotateDegrees = {};
        newScannedImages.forEach((uri) => {
          newRotateDegrees[uri] = 0;
        });
        setRotateDegrees({ ...rotateDegrees, ...newRotateDegrees });
        //upload document for each scan
        // newScannedImages.forEach((imageUri) => {
        // handleUpload(imageUri);
        // });
      }
    } else if (status === RESULTS.DENIED) {
      // Camera permission is denied, request it from the user
      const requestResult = await request(PERMISSIONS.ANDROID.CAMERA);

      if (requestResult === RESULTS.GRANTED) {
        // Camera permission has been granted, start the document scanner
        const { scannedImages: newScannedImages } = await DocumentScanner.scanDocument();

        if (newScannedImages.length > 0) {
          // Append new scanned images to the existing array
          setScannedImages([...scannedImages, ...newScannedImages]);

          // Initialize the rotation degrees for new images
          const newRotateDegrees = {};
          newScannedImages.forEach((uri) => {
            newRotateDegrees[uri] = 0;
          });
          setRotateDegrees({ ...rotateDegrees, ...newRotateDegrees });
          //upload document for each scan
          // newScannedImages.forEach((imageUri) => {
          //   handleUpload(imageUri);
          // });
        }
      } else {
        // Handle the case where the user denied camera permissions
        // You can show a message to the user explaining why the camera is require
        alert('Permission to access camera was denied.');
        setSnackbarMessage('Camera permission required to scan Documents');
        setSnackbarVisible(true);

      }
    } else {
      // Handle other permission statuses if needed
    }
  };

  const toggleFullScreen = (imageUri) => {
    if (fullScreenImage === imageUri) { // Corrected comparison here
      // If the same image is already in full-screen mode, close it
      setFullScreenImage(null);
    }
    else {
      // Otherwise, set it to full-screen mode
      setFullScreenImage(imageUri);
    }
  };
  const closeFullScreen = () => {
    setFullScreenImage(null);
    // Reset the rotation degree for the closed image
    // if (fullScreenImage) {
    //   const updatedDegrees = { ...rotateDegrees };
    //   delete updatedDegrees[fullScreenImage];
    //   setRotateDegrees(updatedDegrees);
    // }
  };

  const deleteImage = (imageUri) => {
    // Remove the selected image from the scannedImages array
    const updatedImages = scannedImages.filter((uri) => uri !== imageUri);
    setScannedImages(updatedImages);
    // Close the full-screen view if the deleted image was open
    if (fullScreenImage === imageUri) {
      closeFullScreen();
    }
  };

  const rotateLeft = (imageUri) => {
    const currentDegree = rotateDegrees[imageUri] || 0;
    const newDegree = (currentDegree - 90) % 360;
    setRotateDegrees({ ...rotateDegrees, [imageUri]: newDegree });
  };

  const rotateRight = (imageUri) => {
    const currentDegree = rotateDegrees[imageUri] || 0;
    const newDegree = (currentDegree + 90) % 360;
    setRotateDegrees({ ...rotateDegrees, [imageUri]: newDegree });
  };

  const toggleFab = () => {
    setIsFabOpen(!isFabOpen);
    Animated.spring(rotationValue, {
      toValue: isFabOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'], // Rotate 45 degrees when open
  });
  useEffect(() => {
    // Call handleScanner on component load
    // handleScanner();
  }, []);

  // const handleUpload = async (imageUri) => {
  // try {
  //   const formData = new FormData();
  //   const fileName = `scanned_image.jpg`;
  //   formData.append('file', {
  //     uri: imageUri,
  //     type: 'image/jpeg',
  //     name: fileName,
  //   });
  //   formData.append('userId', '9f518520-48de-4aca-b70c-09a21431065c')
  //   console.log(formData, 'formdata-----------------------------')
  //   const response = await NetworkManager.uploadDocument(formData)
  //   console.log(response, 'response');
  //   // Handle the API response here
  //   const { data } = response;

  //   setUploadStatus(`Upload Successful. Response: ${data}`);
  // } catch (error) {
  //   console.error('Upload error:', error.response);
  //   setUploadStatus('Upload Failed');
  // }
  // };

  const handleUpload = async () => {
    console.log('before try');
    try {
      console.log('inside try');
      const docs = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true
      });
  
      // Iterate over selected documents and add them to the pickedDocuments array
      for (const doc of docs) {
        console.log('inside for')
        setPickedDocuments((prevDocuments) => [...prevDocuments, doc]);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled the upload', err);
      } else {
        console.error('An error occurred during document picking:', err);
      }
    }
  }
  const blurredNextButton = {
    opacity: scannedImages.length === 0 ? 0.5 : 1,

    // color: scannedImages.length === 0 ? 'gray' : 'white',
  };
  const handleNext = () => {
    navigation.navigate('SaveDocumentScreen');
  }

  return (
    <SafeAreaView style={{ height: screenHeight * 0.93, backgroundColor: 'rgba(4, 104, 77, 0.6)' }}>
      {fullScreenImage ? (
        <View style={{ borderWidth: 0.3, position: 'absolute', alignSelf: 'center', height: screenHeight * 0.93 }}>
          <View style={styles.fullScreenContainer}>
            <Image
              resizeMode="contain"
              style={[
                styles.fullScreenImage,
                { transform: [{ rotate: `${rotateDegrees[fullScreenImage] || 0}deg` }] },
              ]}
              source={{ uri: fullScreenImage }}
            />
          </View>
          <View style={styles.buttonContainerFullScreen}>

            <TouchableOpacity onPress={() => rotateLeft(fullScreenImage)}>
              <Icon name="rotate-left" size={24} color="#050000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => rotateRight(fullScreenImage)}>
              <Icon name="rotate-right" size={24} color="#050000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleFullScreen(fullScreenImage)}>
              {fullScreenImage === fullScreenImage ? (
                <Icon name="compress" size={24} color="#79aee7" />
              ) : (
                <Icon name="expand" size={24} color="#79aee7" />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => closeFullScreen()}>
              <Icon name="close" size={24} color="#e34077" />
            </TouchableOpacity>
          </View>
        </View>
      ) : <>
        <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top, flex: 1 }}>
          <FlatList
            data={[...scannedImages]}
            keyExtractor={(uri, index) => index.toString()}
            contentContainerStyle={styles.imageContainer}
            numColumns={2}
            // showsVerticalScrollIndicator={false}
            renderItem={({ item: uri }) => (
              <View style={{ borderWidth: 0, flex: 1, height: normalize(250), maxWidth: screenWidth * 0.45, marginLeft: screenWidth * 0.035, }}>
                <View style={styles.imageWrapper}>
                  <TouchableOpacity onPress={() => toggleFullScreen(uri)}>
                    <Image
                      resizeMode="contain"
                      style={[
                        styles.image,
                        { transform: [{ rotate: `${rotateDegrees[uri] || 0}deg` }] },
                      ]}
                      source={{ uri }}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={{ marginRight: normalize(20) }}
                    onPress={() => toggleFullScreen(uri)}
                  >
                    {fullScreenImage === uri ? (
                      <Icon name="compress" size={24} color="#79aee7" />
                    ) : (
                      <Icon name="expand" size={24} color="#79aee7" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginRight: normalize(10) }}
                    onPress={() => deleteImage(uri)}
                  >
                    <Icon name="trash" size={24} color="#e34077" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          {pickedDocuments.map((document, index) => (
            <View key={`document-${index}`}>
              {/* Display document details or a link to the document */}
              {document}
              <Text>Picked Document #{index + 1}</Text>
            </View>
          ))}
        </ImageBackground>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', gap: normalize(10), padding: normalize(5), }}>
          <TouchableOpacity style={[styles.nextButton, blurredNextButton, { right: 95, bottom: 6 }]} onPress={handleNext} disabled={scannedImages.length === 0}>
            <Text style={[styles.nextButtonText,]}>NEXT</Text>
          </TouchableOpacity>
          <View style={styles.fabContainer}>
            {isFabOpen && (
              <View style={styles.fabBackground} onTouchStart={() => setIsFabOpen(false)} />
            )}
            {isFabOpen && (
              // <Animated.View style={[styles.fabButton, { transform: [{ rotate: rotation }] }]}>
                <TouchableOpacity style={styles.fabButton} onPress={handleScanner}>
                  <Icon name="camera" size={24} color="white" />
                </TouchableOpacity>
              // </Animated.View>
            )}
            {isFabOpen && (
              // <Animated.View style={[styles.fabButton, { transform: [{ rotate: rotation }] }]}>
                <TouchableOpacity style={styles.fabButton} onPress={handleUpload}>
                  <Icon name="upload" size={24} color="white" />
                </TouchableOpacity>
              // </Animated.View>
            )}
            <TouchableOpacity style={[styles.fabToggle, { transform: [{ rotate: rotation }] }]} onPress={toggleFab} >
              <MaterialIcon name={isFabOpen ? 'close' : 'add'} size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </>
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: 'red',
    width: screenWidth - normalize(20),
    height: normalizeVertical(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  imageContainer: {
    height: screenHeight,
    width: screenWidth,
    marginVertical: normalizeVertical(20)
  },
  imageWrapper: {
    backgroundColor: '#f0f5f0',
    flex: 0.9,
  },
  image: {
    justifyContent: 'center',
    width: '100%',
    height: '90%',
    marginVertical: normalizeVertical(10),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: normalize(0),
    backgroundColor: 'lightgray',
    height: normalize(30),
  },
  permissionMessage: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fullScreenContainer: {
    backgroundColor: '#f0f5f0',
    flex: 1,
  },
  fullScreenImage: {
    flex: 1,
    width: screenWidth,
    margin: normalize(10),
  },
  closeFullScreenButton: {
    position: 'absolute',
    top: normalize(20),
    right: normalize(20),
    padding: normalize(10),
    backgroundColor: 'white',
    flex: 1,
  },

  nextButton: {
    backgroundColor: '#0e9b81',
    alignSelf: 'center',
    height: normalizeVertical(50),
    borderRadius: normalize(25),
    marginTop: 30,
    marginBottom: normalize(10)
  },

  nextButtonText: {
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    color: 'white',
    letterSpacing: 1.8,
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: normalize(15)
  },
  scanButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: normalize(60),

  },
  buttonContainerFullScreen: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    maxHeight: normalize(40),
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background color
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'flex-end',
    padding: normalize(5),
    paddingBottom: normalize(0),
    paddingTop: normalize(0),
  },
  fabBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
  },
  fabGroup: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    position: 'relative',
  },
  fabButton: {
    width: 56,
    height: 56,
    backgroundColor: '#0e9b81',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  fabToggle: {
    width: 60,
    height: 60,
    backgroundColor: 'gray',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DocumentScannerScreen;