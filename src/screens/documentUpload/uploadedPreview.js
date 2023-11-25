import Pdf from 'react-native-pdf';
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
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import {
  normalize,
  normalizeVertical,
  screenHeight,
  screenWidth,
} from '../../utilities/measurement';
import { PDFDocument } from 'pdf-lib';
import { COLORS } from '../../utilities/colors';
import { Images } from '../../assets/images/images';
import Icon from 'react-native-vector-icons/FontAwesome';
import { retrieveUserDetail } from '../../storageManager';
import NetworkManager from '../../services/NetworkManager';
import React, { useState, useEffect, useRef } from 'react';
import { DraggableGrid } from 'react-native-draggable-grid';
import { convertPdfUrlToBase64 } from '../../utilities/Utils';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_BUTTON_NAMES, UPLOAD_DOCUMENT } from '../../utilities/strings';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DocumentItemLoader } from './documentItemLoader';
import DrawerNavigator from '../../components/common/DrawerNavigator';

const UploadedPreview = ({ navigation, route }) => {

  // navigation params
  const uploadFiles = route.params?.uploadFiles ?? {}
  const categoryInfo = route.params?.categoryInfo ?? null
  const refreshData = route.params?.refreshData ?? {}
  const isEditDocument = route.params?.isEditDocument ?? false

  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [rotateDegrees, setRotateDegrees] = useState({});
  const [isDocumentProcessing, setIsDocumentProcessing] = useState(false);
  const rotationValue = new Animated.Value(0);
  const insets = useSafeAreaInsets();
  const [combinedDocuments, setCombinedDocuments] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [documentPageList, setDocumentPageList] = useState([]);

  // ref
  let pdfDocumentInfo = useRef()

  useEffect(() => {
    getCategoryList()
    getPDFDocumentInfo()
  }, [])
  
  const getCategoryList = async () => {
    try {
      let userData = await retrieveUserDetail()
      // console.log('CategoryScreen --->', userData.id)
      let categoryResult = await NetworkManager.listCategoriesByUser(userData.id)
      if(categoryResult.data?.status === 'SUCCESS' && categoryResult.data?.code === 200){
          setCategoryList(categoryResult.data.response.categoryDetails)
      }
    } catch (error) {
      console.error('getCategoryList', error); // You might send an exception to your error tracker
    }
  }

  const getPDFDocumentInfo = async () => {
    if (uploadFiles[0]?.fileType === 'application/pdf'){
      setIsDocumentProcessing(true)
      // let base64 = uploadFiles?.[0]?.base64 ? uploadFiles?.[0]?.base64 :  await convertPdfUrlToBase64(uploadFiles[0].documentUrl)
      // let pdfDoc = await PDFDocument.load(base64, { ignoreEncryption: true })
      // pdfDocumentInfo.current  = pdfDoc
      let pageList = Array(uploadFiles[0]?.pageCount).fill(1).map((n, pageIndex) => n = { pageIndex, ...uploadFiles[0], key: `page_${pageIndex}`, fileName: `page_${pageIndex+1}` })
      // console.log('getPDFDocumentInfo --->', uploadFiles[0].documentUrl)
      // let pageList = pdfDoc.getPages().map((page, pageIndex) => { return { pageIndex, ...uploadFiles[0], key: `page_${pageIndex}`, fileName: `page_${pageIndex+1}` } })
      setDocumentPageList(pageList)
      setIsDocumentProcessing(false)
    } else {
      setDocumentPageList(uploadFiles.map(item => item = { ...item, key: item.fileName }))
    }
    setCombinedDocuments(uploadFiles)
  }

  const formatScannedImages = (images) => {
    return images.map((uri) => ({
      documentUrl: uri,
      fileType: 'image/jpg', // You can change the type as needed
      fileName: uri.split('/').pop(),
      key: uri.split('/').pop()
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
        Alert.alert('', 'Permission to access camera was denied.');

      }
    } else {
      // Handle other permission statuses 
      Alert.alert('', 'Permission to access camera was denied.');
    }
  };

  const toggleFullScreen = (imageUri) => {
    // console.log('toggleFullScreen -->', imageUri)
    if (fullScreenImage === imageUri) { 
      // If the same image is already in full-screen mode, close it
      setFullScreenImage(null);
    } else {
      // Otherwise, set it to full-screen mode
      setFullScreenImage(imageUri);
    }
  };

  const closeFullScreen = () => {
    setFullScreenImage(null);
  };

  const deleteItem = (item) => {
    
    Alert.alert(
      'Are you want to delete the family?',
      '',
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {}
      },
      { text: 'Ok', onPress: async () => {
        try {
          const updatedDocuments = combinedDocuments.filter((doc) => doc.documentUrl !== item.documentUrl);
          // console.log('deleteItem ----->', updatedDocuments?.length)
          // setCombinedDocuments(updatedDocuments);
          setDocumentPageList(prev => prev.filter((doc) => doc.documentUrl !== item.documentUrl))
          if (fullScreenImage && fullScreenImage.documentUrl === item.documentUrl) {
            setFullScreenImage(null);
          }
        } catch (error) {
          // console.error('Error fetching unique id:', error.response);
          Alert.alert(error)
        }
      }, style: 'destructive' }
    ]
    )
  }

  const uploadFileList = async (files) => {
    setDocumentPageList(prev => [...prev, ...files])
  }

  const renderItems = ( {item: document, index} ) => {
    if(isDocumentProcessing) return <DocumentItemLoader />
    return <View style={{ borderWidth: 0, height: normalize(200), width: screenWidth * 0.42, margin: 15,  backgroundColor: 'lightgray', borderRadius: 5 }}>
      <View style={styles.imageWrapper}>
        <TouchableOpacity style={{ borderRadius: 5 }} onPress={() => toggleFullScreen(document)}>
          <Pdf
            singlePage
            trustAllCerts={false}
            page={document?.pageIndex + 1}
            onLoadComplete={(numberOfPages,filePath) => {
                // console.log(`Number of pages: ${numberOfPages}`);
            }}
            onError={(error) => {
              // console.log(error)
            }}
            style={{ width: '100%', height: '100%', padding: 5 }}
            renderActivityIndicator={() => <ActivityIndicator size="large"  />}
            source={{ uri: decodeURIComponent(document?.documentUrl ?? document?.url), cache: true }}
          />
        </TouchableOpacity>
      </View>
      <View style={[styles.buttonContainer,document?.fileType !== 'image/jpg' && { justifyContent: 'flex-start' }]}>
        <Text style={{ marginHorizontal: 10, color: COLORS.avatarBackground }}>{UPLOAD_DOCUMENT.pageNumberAppendText}<Text style={{ fontWeight: 'bold' }}>{document?.pageIndex + 1}</Text></Text>
      </View>
    </View>
  }

  const handleSave = async () => {
    // let documentData = uploadFiles[0]?.fileType === 'application/pdf' ? documentPageList : { ...documentPageList, pageCount: documentPageList?.length}
    navigation.navigate('uploadFinished',{documentPage:  documentPageList, categoryInfo, refreshData, isEditDocument})
  }

  const renderDragItem = (item, index) => {
    let document = item
    if(document?.isAddNew) return <TouchableOpacity onPress={handleScanner} style={{ borderWidth: 3, flex: 1, height: normalize(200), width: screenWidth * 0.43, backgroundColor: COLORS.backdrop, borderColor: COLORS.warnText, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: index > 1 ? 40 : 0 }} >
        <Text style={{ color: COLORS.warnLight }}>{UPLOAD_DOCUMENT.addNewPageText[0]}<MaterialCommunityIcons name="camera-plus-outline" size={24} color={COLORS.warnLight} />{UPLOAD_DOCUMENT.addNewPageText[1]}</Text>
      </TouchableOpacity>
    return (
        <View style={{ borderWidth: 0,flex: 1, height: normalize(200), width: screenWidth * 0.42, marginTop: 0,  backgroundColor: 'lightgray', borderRadius: 5, marginTop: index > 1 ? 40 : 0 }}>
          <View style={styles.imageWrapper}>
            <Image
              resizeMode={'cover'}
              style={ styles.image }
              source={{ uri: document?.documentUrl }}
            />
          </View>
          <View style={[styles.buttonContainer,{ justifyContent: 'space-between' }]}>
            <Text style={{ marginHorizontal: 10 }}>Page No: <Text style={{ fontWeight: 'bold' }}>{index + 1}</Text></Text>
            <TouchableOpacity style={{ marginRight: normalize(10), marginTop: normalize(0) }} onPress={() => deleteItem(document)}>
              <Icon name="trash" size={24} color="#e34077" />
            </TouchableOpacity>
          </View>
        </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
        {fullScreenImage ? (
        <View style={{ borderWidth: 0.3, position: 'absolute', alignSelf: 'center', height: screenHeight * 0.93, paddingTop: insets.top }}>
          <View style={styles.fullScreenContainer}>
            {fullScreenImage.documentUrl?.includes('.pdf') ? 
              <Pdf
                singlePage
                trustAllCerts={false}
                page={fullScreenImage?.pageIndex + 1}
                onLoadComplete={(numberOfPages,filePath) => {
                    // console.log(`Number of pages: ${numberOfPages}`);
                }}
                onError={(error) => {
                  // console.log(error)
                }}
                style={{ width: screenWidth, height: 'auto', padding: 5, flex: 1 }}
                renderActivityIndicator={() => <ActivityIndicator size="large"  />}
                source={{ uri: decodeURIComponent(fullScreenImage?.documentUrl) }}
              />
            :
            <Image
              resizeMode="contain"
              style={[
                styles.fullScreenImage,
                // { transform: [{ rotate: `${rotateDegrees[fullScreenImage] || 0}deg` }] },
              ]}
              source={{ uri: fullScreenImage.documentUrl }}
            />}
          </View>
          <View style={styles.buttonContainerFullScreen}>
            {/* <TouchableOpacity onPress={() => { 
              // console.log(fullScreenImage)
            }}>
              <Icon name="share-alt" size={24} color="#050000" />
            </TouchableOpacity> */}
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
      ) : <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight }}>
          <DrawerNavigator>
            <View style={styles.wrapper}>
              <TouchableOpacity hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }} style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start', alignSelf: 'flex-start', paddingHorizontal: 15, paddingBottom: 10 }} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="arrow-u-left-top" size={24} color={COLORS.white}  />
                {/* <Text style={{ fontSize: 14, fontWeight: '700', alignItems: 'center', paddingLeft: 10, color: COLORS.white }}>{UPLOAD_DOCUMENT.back}</Text> */}
              </TouchableOpacity>
              {
                (uploadFiles[0]?.fileType !== 'application/pdf') ? 
                  <ScrollView style={{ paddingBottom: 20 }}>
                    <DraggableGrid
                      numColumns={2}
                      renderItem={renderDragItem}
                      data={[...documentPageList, { isAddNew: true, key: 'addNew' }]}
                      // itemHeight={normalize(200)}
                      onDragRelease={(data) => {
                        // console.log('onDragRelease', data)
                        setDocumentPageList(data.filter(filterItem => filterItem.key !== 'addNew'));// need reset the props data sort after drag release
                      }}
                      onItemPress={(item) => setFullScreenImage(item)}
                      style={{ height: '100%', marginBottom: 20 }}
                    />
                  </ScrollView>
                : 
                  <FlatList
                    data={ isDocumentProcessing ? Array(10).fill(1).map((n, i) => n = { "categoryId": 'category_loader'+i,  isLoading: true }) : documentPageList}
                    keyExtractor={(document, index) => `${document.fileName}`}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    numColumns={2}
                    renderItem={renderItems}
                    // ItemSeparatorComponent={() => <View style={{ width: 10, backgroundColor: 'red', height: 220 }} />}
                  />
              }
              
              <View style={{ backgroundColor: 'lightgray', alignItems: 'center', flexDirection: 'row-reverse', padding: 10, justifyContent: 'space-between' }}>
                <TouchableOpacity style={{ width: 150, height: 50, backgroundColor: '#17826b', padding: 10, borderRadius: 10, alignItems: 'center' }} onPress={handleSave}>
                  <Text style={{ fontSize: 22, fontWeight: '500', alignItems: 'center', color: COLORS.white }}>{APP_BUTTON_NAMES.next}</Text>
                </TouchableOpacity>
              </View>
            </View>
        {/* <Popover
          isVisible={isChangeNameOpen}
          onRequestClose={() => {
            setIsChangeNameOpen(false);
          }}
          popoverStyle={styles.popover}>
          <View style={styles.modalContent}>
              <Text
                style={{
                  color: 'black',
                  fontSize: 18,
                  fontWeight: '500',
                  marginVertical: 10,
                }}>
                Change Document Name
              </Text>

            <TextInput
              ref={documentNameInputRef}
              value={documentName}
              style={styles.input}
              onChangeText={text => setDocumentName(text)}
            />
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={() => {
                  navigation.setParams('uploadFiles', [{...uploadFiles, documentName}])
                  setIsChangeNameOpen(false)
                }}
                style={styles.saveButton}>
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 6,
                    fontSize: 16,
                    color: 'white',
                    fontWeight: '500',
                  }}>
                  Rename
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsChangeNameOpen(false)}
                style={styles.cancelButton}>
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 6,
                    fontSize: 16,
                    color: 'white',
                    fontWeight: '500',
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Popover> */}
        </DrawerNavigator>
        </ImageBackground>
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
    flex: 0.92,
    height: '90%',
    borderRadius: 5
  },
  image: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: '90%',
    height: '92%',
    marginVertical: normalizeVertical(5),
    // backgroundColor: 'red'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: normalize(6),
    backgroundColor: 'lightgray',
    height: normalize(28),
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

  nextButton: {
    backgroundColor: '#0e9b81',
    alignSelf: 'center',
    height: normalizeVertical(50),
    borderRadius: normalize(25),
    marginTop: 30,
    marginBottom: normalize(10),

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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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

  groupFab:{
    backgroundColor: COLORS.gray,
    borderRadius: 30
   // color: COLORS.red
 },

 popover: {
  width: normalize(290),
  height: normalize(180),
  backgroundColor: 'rgb(212, 215, 219)',
  borderRadius: 8,
},
modalContent: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
text: {
  textAlign: 'center',
  color: COLORS.white,
  fontSize: 18,
  fontWeight: 'bold',
  marginLeft: 30,
},

input: {
  height: 40,
  width: screenWidth * 0.7,
  borderWidth: 1,
  marginBottom: 18,
  padding: 8,
  fontSize: 18,
  fontWeight: '500',
},
saveButton: {
  backgroundColor: '#0e9b81',
  width: normalize(90),
  height: normalize(34),
  borderRadius: 20,
  color: 'white',
},
cancelButton: {
  backgroundColor: 'red',
  width: normalize(90),
  height: normalize(34),
  marginLeft: 10,
  borderRadius: 20,
},
rowItem: {
  height: 100,
  width: 100,
  alignItems: "center",
  justifyContent: "center",
},
text: {
  color: "white",
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
},

wrapper:{
  width:'100%',
  height: '100%',
  flex: 1,
  justifyContent:'center',
  paddingTop: 10
},
});

export default UploadedPreview;