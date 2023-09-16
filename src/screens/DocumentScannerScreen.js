// import React, { useState, useEffect } from 'react';
// import {
//   Image,
//   Keyboard,
//   KeyboardAvoidingView,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   ImageBackground,
// } from 'react-native';
// import DocumentScanner from 'react-native-document-scanner-plugin';
// // import { AntDesign } from '@expo/vector-icons'; 
// // import { Feather } from '@expo/vector-icons'; 
// import Icon from 'react-native-vector-icons/FontAwesome';
// import {
//   normalize,
//   normalizeVertical,
//   screenHeight,
//   screenWidth,
// } from '../utilities/measurement';
// import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Images } from '../assets/images/images';

// const DocumentScannerScreen = () => {
//   const [scannedImages, setScannedImages] = useState([]);
//   const [cameraPermissionStatus, setCameraPermissionStatus] = useState(null);
//   const [fullScreenImage, setFullScreenImage] = useState(null);
//   const [rotateDegrees, setRotateDegrees] = useState({});
//   const insets = useSafeAreaInsets();

//   const handleScanner = async () => {
//     // Check if camera permission is granted
//     const status = await check(PERMISSIONS.ANDROID.CAMERA);
//     setCameraPermissionStatus(status);

//     if (status === RESULTS.GRANTED) {
//       // Camera permission is already granted, start the document scanner
//       const { scannedImages: newScannedImages } = await DocumentScanner.scanDocument();

//       if (newScannedImages.length > 0) {
//         // Append new scanned images to the existing array
//         setScannedImages([...scannedImages, ...newScannedImages]);

//         // Initialize the rotation degrees for new images
//         const newRotateDegrees = {};
//         newScannedImages.forEach((uri) => {
//           newRotateDegrees[uri] = 0;
//         });
//         setRotateDegrees({ ...rotateDegrees, ...newRotateDegrees });
//       }
//     } else if (status === RESULTS.DENIED) {
//       // Camera permission is denied, request it from the user
//       const requestResult = await request(PERMISSIONS.ANDROID.CAMERA);

//       if (requestResult === RESULTS.GRANTED) {
//         // Camera permission has been granted, start the document scanner
//         const { scannedImages: newScannedImages } = await DocumentScanner.scanDocument();

//         if (newScannedImages.length > 0) {
//           // Append new scanned images to the existing array
//           setScannedImages([...scannedImages, ...newScannedImages]);

//           // Initialize the rotation degrees for new images
//           const newRotateDegrees = {};
//           newScannedImages.forEach((uri) => {
//             newRotateDegrees[uri] = 0;
//           });
//           setRotateDegrees({ ...rotateDegrees, ...newRotateDegrees });
//         }
//       } else {
//         // Handle the case where the user denied camera permissions
//         // You can show a message to the user explaining why the camera is required
//       }
//     } else {
//       // Handle other permission statuses if needed
//     }
//   };

//   const toggleFullScreen = (imageUri) => {
//     if (fullScreenImage === imageUri) { // Corrected comparison here
//       // If the same image is already in full-screen mode, close it
//       setFullScreenImage(null);
//     } else {
//       // Otherwise, set it to full-screen mode
//       setFullScreenImage(imageUri);
//     }
//   };
//   const closeFullScreen = () => {
//     setFullScreenImage(null);
//     // Reset the rotation degree for the closed image
//     // if (fullScreenImage) {
//     //   const updatedDegrees = { ...rotateDegrees };
//     //   delete updatedDegrees[fullScreenImage];
//     //   setRotateDegrees(updatedDegrees);
//     // }
//   };

//   const deleteImage = (imageUri) => {
//     // Remove the selected image from the scannedImages array
//     const updatedImages = scannedImages.filter((uri) => uri !== imageUri);
//     setScannedImages(updatedImages);
//     // Close the full-screen view if the deleted image was open
//     if (fullScreenImage === imageUri) {
//       closeFullScreen();
//     }
//   };

//   const rotateLeft = (imageUri) => {
//     const currentDegree = rotateDegrees[imageUri] || 0;
//     const newDegree = (currentDegree - 90) % 360; // Rotate left by 90 degrees
//     setRotateDegrees({ ...rotateDegrees, [imageUri]: newDegree });
//   };

//   const rotateRight = (imageUri) => {
//     const currentDegree = rotateDegrees[imageUri] || 0;
//     const newDegree = (currentDegree + 90) % 360; // Rotate right by 90 degrees
//     setRotateDegrees({ ...rotateDegrees, [imageUri]: newDegree });
//   };

//   useEffect(() => {
//     // Call handleScanner on component load
//     // handleScanner();
//   }, []);

//   const handleUpload = () => {
//     // Implement your upload logic here
//     // You can open a file picker or use a library like react-native-document-picker
//   };

//   return (
//     <SafeAreaView style={{height:screenHeight*0.93,}}>
     
      
//       {fullScreenImage ? (

//         <View style={{ borderWidth: 1, position: 'absolute', alignSelf: 'center', height: screenHeight*0.93 }}>
//           <View style={styles.fullScreenContainer}>
//             {/* <TouchableOpacity style={styles.closeFullScreenButton} onPress={() => closeFullScreen()}>
//                   {/* <Text style={{ color: 'red' }}>close</Text> 
//                   <Icon name="close" size={24} color="red" />
//                 </TouchableOpacity> */}
//             <Image
//               resizeMode="contain"
//               style={[
//                 styles.fullScreenImage,
//                 { transform: [{ rotate: `${rotateDegrees[fullScreenImage] || 0}deg` }] },
//               ]}
//               source={{ uri: fullScreenImage }}
//             />
//           </View>
//           <View style={styles.buttonContainerFullScreen}>

//             <TouchableOpacity onPress={() => rotateLeft(fullScreenImage)}>
//               <Icon name="rotate-left" size={24} color="#050000" />
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => rotateRight(fullScreenImage)}>
//               <Icon name="rotate-right" size={24} color="#050000" />
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => toggleFullScreen(fullScreenImage)}>
//               {fullScreenImage === fullScreenImage ? (
//                 <Icon name="compress" size={24} color="#050000" />
//               ) : (
//                 <Icon name="expand" size={24} color="#050000" />
//               )}
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => closeFullScreen()}>
//               {/* <Text style={{ color: 'red' }}>close</Text> */}
//               <Icon name="close" size={24} color="red" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       ) : <>
//         <ScrollView contentContainerStyle={{ paddingBottom: normalizeVertical(20), }} style={{}}> 
        
//           <KeyboardAvoidingView onTouchStart={Keyboard.dismiss}>
//           <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{flex:1}}>
//               <View style={styles.imageContainer}>
//                 {scannedImages.map((uri, index) => (
//                   <View key={index} style={{ borderWidth: 0.5 }}>
//                     <View style={styles.imageWrapper}>
//                       <TouchableOpacity onPress={() => toggleFullScreen(uri)}>
//                         <Image
//                           resizeMode="contain"
//                           style={[
//                             styles.image,
//                             { transform: [{ rotate: `${rotateDegrees[uri] || 0}deg` }] },
//                           ]}
//                           source={{ uri }}
//                         />
//                       </TouchableOpacity>
//                     </View>
//                     <View style={styles.buttonContainer}>
//                       {/* <TouchableOpacity onPress={() => rotateLeft(uri)}>
//                       <Icon name="rotate-left" size={24} color="black" />
//                     </TouchableOpacity>
//                     <TouchableOpacity onPress={() => rotateRight(uri)}>
//                       <Icon name="rotate-right" size={24} color="black" />
//                     </TouchableOpacity> */}
//                       <TouchableOpacity style={{ marginRight: normalize(20) }} onPress={() => toggleFullScreen(uri)}>
//                         {fullScreenImage === uri ? (
//                           <Icon name="compress" size={24} color="black" />
//                         ) : (
//                           <Icon name="expand" size={24} color="black" />
//                         )}
//                       </TouchableOpacity>
//                       <TouchableOpacity style={{ marginRight: normalize(10) }} onPress={() => deleteImage(uri)}>
//                         <Icon name="trash" size={24} color="red" />
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 ))}

//               </View>
            
// </ImageBackground>

//           </KeyboardAvoidingView>

//         </ScrollView>
//         <View style={{ gap: normalizeVertical(20),  bottom:60, right: 0, position: 'absolute' }}>
//         {cameraPermissionStatus === RESULTS.DENIED && (
//           <Text style={styles.permissionMessage}>
//             Camera permission is required to use the document scanner. Please grant permission in settings.
//           </Text>
//         )}
//         <View style={{ gap: normalizeVertical(20), alignSelf: 'flex-end', bottom: 0, marginRight: normalize(20), }}>
//           <View style={styles.scanButtonContainer}>
//             {/* <Text style={styles.buttonText}>Scan</Text> */}
//             <TouchableOpacity style={styles.button} onPress={handleScanner}>
//               <Icon name="camera" size={24} color="black" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.scanButtonContainer}>
//             {/* <Text style={styles.buttonText}>Upload</Text> */}
//             <TouchableOpacity style={styles.button} onPress={handleUpload}>
//               <Icon name="upload" size={24} color="black" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//       </>

//       }
      
      
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   logoutButton: {
//     backgroundColor: 'red',
//     width: screenWidth - normalize(20),
//     height: normalizeVertical(40),
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   container: {
//     // flex: 1,
//     // justifyContent: 'center',
//     // alignItems: 'center',
//     // paddingHorizontal: normalize(20),
//   },
//   imageContainer: {
//     gap: normalize(10),
//     flex: 1,
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: normalize(20),
//     alignSelf: 'center',
//     justifyContent: 'center',

//   },
//   imageWrapper: {
//     borderTopLeftRadius:8,
//     borderTopRightRadius:8,
//     // gap:normalizeVertical(15),
//     // margin: normalize(10),
//     // borderColor: 'blac+k',
//     // borderWidth: 2,
//     width: screenWidth - 0.58 * screenWidth,
//     height: normalize(170),
//     backgroundColor: '#dcfacd',
//   },
//   image: {
//     // flex:1,
//     // padding:normalize(10),
//     alignSelf: 'center',
//     width: normalize(100),
//     height: normalize(150),
//     margin: normalizeVertical(10),
//   },
//   permissionMessage: {
//     color: 'red',
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   fullScreenContainer: {
//     // position: 'absolute',
//     // top: 0,
//     // left: 0,
//     // right: 0,
//     // bottom: 0,
//     backgroundColor: '#dcfacd',
//     // alignItems: 'center',
//     // justifyContent: 'center',
//     // borderColor: 'green',
//     // borderRadius: 2,
//     // height: screenHeight*0.5,
//     flex: 1,
//   },
//   fullScreenImage: {
//     flex: 1,
//     width: screenWidth,
//     // height: screenHeight - 0.1 * screenHeight,
//     margin: normalize(10),
//     // height: screenHeight*0.5,
//   },
//   closeFullScreenButton: {
//     // alignSelf: 'flex-end',
//     // // position: 'absolute',
//     // top: normalize(20),
//     // right: normalize(20),
//     // // padding: normalize(10),
//     // // backgroundColor: 'white',
//     position: 'absolute',
//     top: normalize(20),
//     right: normalize(20),
//     padding: normalize(10),
//     backgroundColor: 'white',
//     flex: 1,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     marginTop: normalize(0),
//     // borderColor: 'black',
//     // borderWidth: 0.5,
//     backgroundColor: '#0e9b81',
//     height: normalize(30),
//     borderBottomLeftRadius:8,
//     borderBottomRightRadius:8,
//   },
//   button: {
//     borderWidth: 1,
//     borderRadius: 15,
//     padding: normalize(15),
//     backgroundColor: 'white'
//   },
//   scanButtonContainer: {
//     flexDirection: 'row',
//     // borderWidth: 1,
//     justifyContent: 'space-between',
//     alignSelf: 'center',
//     width: normalize(60),

//   },
//   buttonText: {
//     color: 'black',
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginTop: 15,
//   },
//   buttonContainerFullScreen: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     alignItems: 'center',
//     // marginTop: normalize(0),
//     // borderColor: 'black',
//     // borderWidth: 0.5,
//     backgroundColor: '#0e9b81',
//     maxHeight: normalize(40),
//     // position:'relative'
//   }
// });

// export default DocumentScannerScreen;