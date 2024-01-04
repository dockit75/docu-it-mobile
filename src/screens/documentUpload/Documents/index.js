import React, { useState, useEffect, Fragment, useCallback } from 'react';
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
  Platform,
  Alert,
  ActivityIndicator,
  Linking,
  TextInput,
  Modal
} from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  normalize,
  normalizeVertical,
  screenHeight,
  screenWidth,
} from '../../../utilities/measurement';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Images } from '../../../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DocumentPicker from 'react-native-document-picker';
import { FAB, Portal, PaperProvider, Snackbar } from 'react-native-paper';
import { COLORS } from '../../../utilities/colors';
import { retrieveUserDetail } from '../../../storageManager';
import NetworkManager from '../../../services/NetworkManager';
import Pdf from 'react-native-pdf';
import DrawerNavigator from '../../../components/common/DrawerNavigator';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Menu, MenuItem, MenuDivider } from 'react-native-material-menu';
import { UPLOAD_DOCUMENT } from '../../../utilities/strings';
import moment from 'moment';
import PdfModal from './components/pdfModal';
import { PDFDocument } from 'pdf-lib';
import { DocumentListItemLoader } from '../documentListItemLoader';
import { maxFileSizeLimit } from '../../../services/config';
import { FlashList } from '@shopify/flash-list';
import { Dialog, LinearProgress } from '@rneui/themed';
import { setProfileCompletion } from '../../../slices/UserSlices';
import { useDispatch } from 'react-redux';
import Popover from 'react-native-popover-view';
import CustomSnackBar from '../../../components/common/SnackBar';
// import PDFLib, { PDFDocument, PDFPage } from 'react-native-pdf-lib';
import RNFS from 'react-native-fs';
// import Share from 'react-native-share';
// import RNFetchBlob from 'rn-fetch-blob';


const DocumentScannerScreen = ({ navigation, route }) => {

  // navigation params
  const categoryInfo = route.params?.categoryInfo ?? {}

  const [scannedImages, setScannedImages] = useState([]);
  const [cameraPermissionStatus, setCameraPermissionStatus] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [rotateDegrees, setRotateDegrees] = useState({});
  const [isFabOpen, setIsFabOpen] = useState(false);
  const rotationValue = new Animated.Value(0);
  const insets = useSafeAreaInsets();
  const [combinedDocuments, setCombinedDocuments] = useState([]);
  const [categoryList, setCategoryList] = useState([])
  const [isLoader, setIsLoader] = useState(true);
  const [listExtraData, setListExtraData] = useState({})
  const [isModalVisible, setIsModalVisible] = useState(null);
  const [isShowUploadOptions, setIsShowUpload] = useState(false)
  const [isViewPdf, setIsViewPdf] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloadComplete, setIsDownloadComplete] = useState(false);
  const [selectedName, setSelectedName] = useState('')
  const [selectedDocument, setSelectedDocument] = useState('')
  const [prevSelectedName, SetPrevSelectedName] = useState('')
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false)

  const [userData, setUserData] = useState(null);

  const dispatch = useDispatch()

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {

      setTimeout(() => setIsLoader(true), 1000)
      getUploadedDocumentsList()
    });

    return unsubscribe;
  }, [])

  const getUploadedDocumentsList = async (isOpenLatest) => {
    console.log('getUploadedDocuments=====Called', categoryInfo)
    try {
      let userData = await retrieveUserDetail()
      setUserData(userData)
      // console.log('setCombinedDocuments', userData.id, categoryInfo.categoryId)
      let categoryResult = await NetworkManager.getUploadedDocumentsByCategoryId(userData.id, categoryInfo.categoryId)
      // console.log('setCombinedDocuments', categoryResult.data)
      if (categoryResult.data?.status === 'SUCCESS' && categoryResult.data?.code === 200) {
        isOpenLatest && setCombinedDocuments([])
        setCombinedDocuments(categoryResult.data.response.documentDetailsList.map(item => item = { ...item, showOptions: false }))

        setIsUploading(false)
        setTimeout(() => setIsLoader(false), 1000)
        if (isOpenLatest) {
          // let item = categoryResult.data.response.documentDetailsList?.sort((a, b) => b.updatedDate - a.updatedDate)[0]
          // setTimeout(() => navigation.navigate('uploadPreview', {uploadFiles: [{ ...item, fileType: 'application/pdf'}], categoryInfo, refreshData, isEditDocument: true}), 600)
        }
      } else {
        setTimeout(() => setIsLoader(false), 1000)
      }
    } catch (error) {
      console.error(error); // You might send an exception to your error tracker
    } finally {
      setTimeout(() => setIsLoader(false), 1000)
    }
  }

  const formatScannedImages = (images) => {
    return images.map((uri) => ({
      documentUrl: uri,
      fileType: 'image/jpg', // You can change the type as needed
      fileName: uri.split('/').pop()
    }));
  };

  const handleScanner = async () => {

    setIsShowUpload(false)
    if (Platform.OS === 'ios') {
      const status = await check(PERMISSIONS.IOS.CAMERA);
      setCameraPermissionStatus(status);

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
        const requestResult = await request(PERMISSIONS.IOS.CAMERA);

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

    } else {
      // Check if camera permission is granted
      const status = await check(PERMISSIONS.ANDROID.CAMERA);
      setCameraPermissionStatus(status);

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
    }
  };

  const toggleFullScreen = async (item) => {
    handleShowOption(item, false)
    navigation.navigate('uploadPreview', { uploadFiles: [{ ...item, fileType: item.documentUrl?.includes('.jpg') ? 'image/jpg' : 'application/pdf' }], categoryInfo, refreshData, isEditDocument: true })
  };
  const closeFullScreen = () => {
    setFullScreenImage(null);
  };

  const handleDeleteDocument = async (item) => {
    handleShowOption(item, false)
    let userData = await retrieveUserDetail()
    const docmentFilterList = combinedDocuments.filter((doc) => ((doc.documentUrl ?? doc?.url) !== (item?.documentUrl ?? item.url))).filter(item => item.uploadedBy === userData.id);
    // Alert.alert(deleteResult.data?.message)
    Alert.alert(
      'Are you want to delete the document?',
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
              let deleteResult = await NetworkManager.documentDelete(item.documentId ?? item?.documentId)
              if (deleteResult.data?.status === 'SUCCESS' && deleteResult.data?.code === 200) {
                // Alert.alert(deleteResult.data?.message)
                setIsSnackbarVisible({ message: deleteResult.data?.message, visible: true })
                getUploadedDocumentsList();
                if (docmentFilterList?.length === 0) {
                  let profileStatusResult = await NetworkManager.getUserRanking(userData.id)
                  if (profileStatusResult?.data.code === 200 && profileStatusResult?.data.status === 'SUCCESS') {
                    dispatch(setProfileCompletion({ percentage: profileStatusResult?.data?.response?.userRanking ?? 0.0 }))
                  }
                }
                const updatedDocuments = combinedDocuments.filter((doc) => ((doc.documentUrl ?? doc?.url) !== (item?.documentUrl ?? item.url)));
                setCombinedDocuments(updatedDocuments.map(prevItem => prevItem = { ...prevItem, showOptions: false }));
                if (fullScreenImage && fullScreenImage.uri === item.documentUrl) {
                  setFullScreenImage(null);
                }
              } else {
                setIsSnackbarVisible({ message: deleteResult.data?.message, visible: true, isFailed: true })
              }
            } catch (error) {
              setIsSnackbarVisible({ message: error?.response?.data.message, visible: true, isFailed: true })
            }
            // console.log('deleteResult ****** -->', deleteResult)
          }, style: 'destructive'
        }
      ]
    )

  }

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


 
 
const handlePickDocument = async () => {
  setIsShowUpload(false);
  try {
    const docs = await DocumentPicker.pick({
      type: [DocumentPicker.types.pdf],
      allowMultiSelection: true,
      copyTo: 'documentDirectory',
    });

    const bodyFormData = new FormData();
    console.log('upload doc --->', docs);

    if (docs?.length <= 5) {
      setIsUploading(true);
      let exceedFileSizeList = docs.filter((filterItem) => filterItem.size > maxFileSizeLimit);
      console.log('exceedFileSizeList---->>>', exceedFileSizeList);
      let docList = docs.filter((filterItem) => filterItem.size < maxFileSizeLimit);
      console.log('docList---->>>', docList);

      let fileList = await Promise.all(
        docList.map(async (item) => {
          try {
            const base64Data = Platform.OS === 'ios' ? await readFileAsBase64(item.uri) : await ReactNativeBlobUtil.fs.readFile(item.uri, 'base64');
            console.log('base64',base64Data)
            let pdfDoc = await PDFDocument.load(base64Data, { ignoreEncryption: true })
            let pageCount = pdfDoc?.getPages()?.length ?? 1;
            console.log('page',pageCount)

            return {
              ...item,
              documentUrl: item.fileCopyUri,
              fileType: item.type,
              fileName: item.name,
              base64: base64Data,
              pageCount,
            };
          } catch (error) {
            console.error('Error loading PDF document:', error);
            return null;
          }
        })
      );

      // Remove null items (failed to load)
      fileList = fileList.filter((item) => item !== null);

      if (fileList.length === 1) {
        console.log('fileList========>>>>>>>>', fileList);
        uploadFileList(fileList);
      } else if (fileList.length > 0) {
        fileList.forEach((item, index) => multipleUpload(item, fileList.length - 1 === index, exceedFileSizeList));
      } else {
        setIsUploading(false);
        Alert.alert('', `Upload file size is too big.\nNote: maximum file size limit 5MB.`);
      }
    } else {
      Alert.alert('', 'You can upload up to 5 files only.');
    }
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      // User canceled the upload
    } else {
      setIsUploading(false);
      console.error('An error occurred during document picking:', err);
    }
  }
};

const readFileAsBase64 = async (filePath) => {
  try {
    const fileContent = await RNFS.readFile(filePath, 'base64');
    return fileContent;
  } catch (error) {
    console.error('Error reading file as base64:', error);
    throw error;
  }
};


  const multipleUpload = async (fileItem, isLastItem, sizeExceedFileList) => {
    try {
      let userData = await retrieveUserDetail()
      let bodyFormData = new FormData()
      let fileName = fileItem?.name?.split('.')[0] + '_' + moment().format('MMM DD YYYY HH:MM:SS')
      let fileObj = { uri: fileItem.uri, name: fileName + '.pdf', type: fileItem.type }
      bodyFormData.append('file', fileObj)
      let uploadResult = await NetworkManager.documentUpload(userData.id, bodyFormData)
      if (uploadResult.status === 200) {
        saveDocument(uploadResult.data, isLastItem, sizeExceedFileList)
      } else {
        console.log(`Failed to upload PDF:`)
      }
    } catch (e) {
      // console.log('handleSave --->', e)
    }
  }

  const saveDocument = async (document, isLastItem, sizeExceedFileList) => {
    try {
      let userData = await retrieveUserDetail()
      let params = {
        "documentDetails": [{
          "documentName": document.fileName,
          "documentUrl": document.documentUrl,
          "documentSize": document.size,
          "documentType": document.fileType,
          "pageCount": document.pageCount
        }],
        "categoryId": categoryInfo.categoryId?.toString(),
        "familyId": '',
        "uploadedBy": userData.id?.toString(),
        "sharedMembers": []
      }
      const saveResult = await NetworkManager.saveDocument(params)
      if (saveResult?.data.code === 200 && saveResult?.data.status === 'SUCCESS') {

        (isLastItem && sizeExceedFileList?.length === 0) && refreshData(true)
        if (isLastItem && sizeExceedFileList?.length) {
          if (sizeExceedFileList?.length === 1) {
            setIsUploading(false)
            Alert.alert('', `upload file size is too big.\nNote: maximum file size limit 5Mb.`)
          } else {
            setIsUploading(false)
            Alert.alert('', `${sizeExceedFileList.map(item => item.name).toString()} \nupload files size are too big.\n\nNote: maximum file size limit 5Mb.`)
          }
        }
      }
    } catch (e) {
      console.log('handleSave --->', e)
    }
  }
  const blurredNextButton = {
    opacity: combinedDocuments.length === 0 ? 0.5 : 1,
  };
  const handleNext = () => {
    // navigation.navigate('SaveDocumentScreen');
  }

  const uploadFileList = async (files) => {
    setIsUploading(false)
    navigation.navigate('uploadPreview', { uploadFiles: files, categoryInfo, refreshData })
  }

  const refreshData = (isOpenFirst) => {
    getUploadedDocumentsList(isOpenFirst)
  }

  const handleShareDocument = async (document) => {
    // Alert.alert('','working under progress')
    handleShowOption(document, false)
    setTimeout(() => (navigation.navigate('DocumentAccordian', { document: document, categoryInfo: categoryInfo })), 150)
  }

  const handleViewDocument = async (document,isMenuPressed) => {
    console.log('document',document)
    handleShowOption(document, false,isMenuPressed)
    setTimeout(()=>  setIsViewPdf(document),isMenuPressed? 500 : 0)
  }

  const handleDownloadDocument = async (document) => {
    handleShowOption(document, false)
    let fileName = document?.documentName?.split('.pdf')[0] ?? document.documentname.split('.pdf')[0]
    let downloadPath =
      Platform.OS === 'ios'
        ? ReactNativeBlobUtil.fs.dirs.DocumentDir + '/' + fileName
        : ReactNativeBlobUtil.fs.dirs.LegacyDownloadDir + '/' + fileName
    const android = ReactNativeBlobUtil.android;
    console.log('downloadPath',downloadPath)
    await ReactNativeBlobUtil.config({
      appendExt: 'pdf',
      addAndroidDownloads: {
        useDownloadManager: true,
        title: fileName,
        description: document.categoryname + fileName,
        mime: "application/pdf",
        mediaScannable: true,
        notification: true,
        path: downloadPath,
      },
    })
      .fetch("GET", document?.documentUrl ?? document?.url)
      .then(async (res) => {
        const base64Image = await res.base64();
        console.log('base64Image',base64Image)
        if (Platform.OS === 'ios') {
          await RNFS.writeFile(downloadPath, base64Image, 'base64');
          await RNFS.downloadFile({
            fromUrl: document.documentUrl, // Replace with the actual URL
            toFile: downloadPath,
          }).promise;
        } else {
          // console.log('base64Image', base64Image, res.base64(), ReactNativeBlobUtil.fs.dirs)
          try {
            ReactNativeBlobUtil.fs.writeFile(downloadPath, base64Image, 'base64')
              .then(res => {

              })
          } catch (error) {
            console.log('Error:', error);
          } finally {
            setIsDownloadComplete(true)
          }
        }
      });
  }


  const handleDownloadDocumentIOs = async (document) => {
    handleShowOption(document, false);
  
    const fileName = document?.documentName?.split('.pdf')[0] ?? document.documentname.split('.pdf')[0];
    const downloadPath =
      Platform.OS === 'ios'
        ? RNFS.DocumentDirectoryPath + '/' + fileName + '.pdf'
        : RNFS.DownloadDirectoryPath + '/' + fileName + '.pdf';

        console.log('downloadPath',downloadPath)
  
    try {
      const downloadResult = await RNFS.downloadFile({
        fromUrl: document?.documentUrl ?? document?.url,
        toFile: downloadPath,
      }).promise;
      setTimeout(() =>   ReactNativeBlobUtil.ios.previewDocument(downloadPath), 500)
      if (downloadResult.statusCode === 200) {
        setIsDownloadComplete(true);
      } else {
        setIsDownloadComplete(false);
      }
    } catch (error) {
      console.error('Error during download:', error);
      setIsDownloadComplete(false);
    }
  };
  const handleItemAction = async (action, document) => {
    switch (true) {
      case (action.itemKey === 'editDocument'):
        return await toggleFullScreen(document)
      case (action.itemKey === 'shareDocument'):
        return await handleShareDocument(document)
      case (action.itemKey === 'viewDocument'):
        return await handleViewDocument(document,true)
      case (action.itemKey === 'deleteDocument'):
        return await handleDeleteDocument(document)
      case (action.itemKey === 'downloadDocument'):
        return Platform.OS ==='android'? await handleDownloadDocument(document) : await handleDownloadDocumentIOs(document) 
      case (action.itemKey === 'moveDocument'):
        return await toggleFullScreen(document)
      default:
        return null
    }
  }

  const handleShowOption = (item, status,isMenuPressed) => {
    // console.log('handleShowOption', item)
    status ? setListExtraData(prev => prev = [{ ...prev, ...item, showOptions: status }]) : setListExtraData({})
    if(isMenuPressed){
      setCombinedDocuments(prev => prev.map(prevItem => prevItem = { ...prevItem, showOptions: false }))
    }else{
    setCombinedDocuments(prev => prev.map(prevItem => prevItem = { ...prevItem, showOptions: status ? (prevItem.documentId === item.documentId) : false }))
    }
  }


  const handleSelectedName = (document) => {

    console.log('document', document)
    setSelectedName(document.documentName)
    setSelectedDocument(document.documentId)
    setIsModalVisible(true)
    SetPrevSelectedName(document.documentName)
  }

  const cancelModal = () => {
    setIsModalVisible(false)
    setSelectedName(null)
    setSelectedDocument(null)
  }

  const handleSaveName = async () => {
    console.log('document===>>', selectedDocument, selectedName, categoryInfo)
    setIsModalVisible(false)
    let userData = await retrieveUserDetail()
    try {
      let params = {
        "documentId": selectedDocument,
        "categoryId": categoryInfo.categoryId,
        "documentName": selectedName.endsWith('.pdf') ? selectedName : `${selectedName}.pdf`,
        "updatedBy": userData.id,
        "revokeAccess": [],
        "provideAccess": [],
        "familyId": [],
      }
      // console.log('handleUpdate params-->',  params)
      const udpateResult = await NetworkManager.updateDocument(params)
      // console.log('udpateResult------>>>>++++++++++++++++++++',udpateResult)
      if (udpateResult.data.code === 200) {
        // Alert.alert(udpateResult.data.message)
        setTimeout(() => setIsSnackbarVisible({ message: udpateResult.data?.message, visible: true }), 1000)
        setSelectedDocument(null)
        setSelectedName(null)
        getUploadedDocumentsList();
      } else {
        setIsSnackbarVisible({ message: udpateResult.data?.message, visible: true, isFailed: true })
      }

    } catch (error) {
      console.log('error --->', error.response.data)
    }

  }

  console.log('setSelectedName==========>>>', selectedName, prevSelectedName)

  const renderItems = useCallback(({ item, index }) => {

    // const renderItems = ({ item, index }) => {

    let document = item
    // console.log('document',document)
    if (document?.isLoading) return <DocumentListItemLoader />
    let documentNameInfo = document?.documentName ?? document?.documentname
    let name = documentNameInfo
    return <View style={styles.documentItemView}>
      {
        <View style={{ alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row', paddingTop: 3, paddingRight: 5 }}>
          <MaterialCommunityIcons size={15} color={'black'} name='account' style={{ marginRight: 5 }} />
          <Text style={{ color: 'black', marginRight: 5 }}>
            {userData.id === document.uploadedBy ? 'Myself' : document.uploadedByName}
          </Text>
        </View>}
      <View style={styles.imageWrapper}>
        <TouchableOpacity onPress={() => handleViewDocument({ ...document })}>
          <Pdf
            page={1}
            singlePage
            trustAllCerts={false}
            source={{ uri: decodeURIComponent(document?.documentUrl ?? document?.url) }}
            onError={(error) => {
              // console.log(error, document?.documentUrl) 
            }}
            renderActivityIndicator={() => <ActivityIndicator size="large" />}
            style={{ width: '100%', height: '99.5%', borderTopLeftRadius: 5, borderTopRightRadius: 5, padding: 5 }}
            onLoadComplete={(numberOfPages, filePath) => {
              // console.log(`Number of pages: ${numberOfPages}`, document?.documentUrl)
            }}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={{ flex: 0.98 }} disabled={!(userData.id === document.uploadedBy)} onPress={(userData.id === document.uploadedBy) ? () => handleSelectedName(document) : null}>
          <Text numberOfLines={2} style={{ color: COLORS.black, fontSize: 12 }} >{name}</Text>
        </TouchableOpacity>
        <Menu
          style={{ position: 'absolute' }}
          animationDuration={10}
          visible={listExtraData?.length ? document.documentId === listExtraData[0].documentId : false}
          anchor={
            <TouchableOpacity style={{ marginRight: normalize(0), marginTop: normalize(0) }} onPress={() => handleShowOption(document, true)}>
              <MaterialCommunityIcons name="dots-vertical" size={24} color={COLORS.black} />
              {/* <Text style={{ color: COLORS.black, fontSize: 10 }} >{'More'}</Text> */}
            </TouchableOpacity>
          }
          onRequestClose={() => handleShowOption(document, false)}>
          {
            UPLOAD_DOCUMENT.listItemAction.filter(filterItem => ((userData.id === document.uploadedBy) || (filterItem.itemKey === 'viewDocument' || filterItem.itemKey === 'downloadDocument'))).map(item =>
              <MenuItem
                key={item.itemKey}
                style={item.disable ? { backgroundColor: 'lightgray', opacity: 0.5 } : {}}
                onPress={item.disable ? null : () => handleItemAction(item, document)}>
                <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                  <MaterialCommunityIcons name={item.icon} size={28} color="black" />
                  <Text style={{ fontSize: 16, color: 'black' }}>{`  ${item.label}`}</Text>
                </View>
              </MenuItem>
            )
          }
             

        </Menu>
      </View>
    </View>
    // }
  }, [listExtraData, userData, documentList])

  const keyExtractor = useCallback((item, index) => index?.toString() + item?.documentId?.toString(), [])
  // let documentList = isLoader ? Array(10).fill(1).map((n, i) => n = { "categoryId": 'category_loader'+i,  isLoading: true, "documentUrl": 'category_url_loader'+i }) : combinedDocuments
  let documentList = combinedDocuments
  // console.log('categpry ---->', fullScreenImage)
  return (
    <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight, flex: 1 }}>
      <DrawerNavigator navigation={navigation}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* <View style={{ margin: 10 }}> */}
          <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginHorizontal: 10, marginTop: 10 }} onPress={() => navigation.navigate('CategoryScreen')}>
            <MaterialCommunityIcons name='arrow-u-left-top' color={'white'} size={32} />
            {/* <Text style={{ color: 'white', fontSize: 15, marginLeft: 5, fontWeight: 'bold' }}>Back</Text> */}
          </TouchableOpacity>
          {/* </View> */}
          {fullScreenImage ? (
            <View style={{ borderWidth: 0.3, position: 'absolute', alignSelf: 'center', height: '100%' }}>
              <View style={styles.fullScreenContainer}>
                {fullScreenImage.documentName?.includes('.jpg') ? <Image
                  resizeMode="contain"
                  style={[
                    styles.fullScreenImage,
                    // { transform: [{ rotate: `${rotateDegrees[fullScreenImage] || 0}deg` }] },
                  ]}
                  source={{ uri: fullScreenImage?.documentUrl }}
                />
                  :
                  <Pdf
                    horizontal
                    source={{ uri: fullScreenImage?.documentUrl }}
                    onLoadComplete={(numberOfPages, filePath) => {
                      // console.log(`Number of pages: ${numberOfPages}`);
                    }}
                    onPageChanged={(page, numberOfPages) => {
                      // console.log(`Current page: ${page}`);
                    }}
                    onError={(error) => {
                      // console.log(error);
                    }}
                    onPressLink={(uri) => {
                      // console.log(`Link pressed: ${uri}`);
                    }}
                    singlePage
                    trustAllCerts={false}
                    style={styles.fullScreenImage}
                  />
                }
              </View>
              <View style={styles.buttonContainerFullScreen}>

                {/* { (fullScreenImage.documentName?.includes('.jpg')) ? <Fragment>
                    <TouchableOpacity onPress={() => rotateLeft(fullScreenImage)}>
                      <Icon name="rotate-left" size={24} color="#050000" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => rotateRight(fullScreenImage)}>
                      <Icon name="rotate-right" size={24} color="#050000" />
                    </TouchableOpacity>
                  </Fragment>
                  : */}
                <TouchableOpacity onPress={() => {
                  // console.log(fullScreenImage)
                }
                }>
                  <Icon name="share-alt" size={24} color="#050000" />
                </TouchableOpacity>
                {/* } */}
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
          ) : isLoader ? (<Dialog overlayStyle={{ width: 120 }} isVisible={isLoader} >
            <ActivityIndicator size={'large'} color={'#0e9b81'} />
            <Text style={{ textAlign: 'center', color: '#0e9b81' }}>Loading...</Text>
          </Dialog>) : (<>
            {/* <FlatList
                data={documentList}
                keyExtractor={keyExtractor}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ marginTop: 10, paddingBottom: 20 }}
                renderItem={renderItems}
                extraData={listExtraData}
              /> */}
            <FlashList
              numColumns={2}
              data={documentList}
              extraData={documentList.filter(item => item.showOptions === true)?.[0] ?? documentList}
              ListEmptyComponent={<View style={{ alignItems: 'center', justifyContent: 'center', height: screenHeight * 0.75 }}>
                <Text style={{ color: 'white', fontSize: 20 }}>No Documents Uploaded.</Text>
              </View>}
              keyExtractor={keyExtractor}
              renderItem={renderItems}
              // ItemSeparatorComponent={props => <View style={{ backgroundColor: COLORS.coolLight, height: 2, width: screenWidth }} />}
              estimatedItemSize={200}
            />
            {isViewPdf ? <PdfModal pdfData={isViewPdf} closeModal={setIsViewPdf} /> : null}
            <FAB.Group
              open={isShowUploadOptions}
              style={styles.fab}
              fabStyle={styles.groupFab}
              visible={!isLoader}
              backdropColor={COLORS.transparent}
              color={COLORS.white}
              icon={isShowUploadOptions ? 'close' : 'plus'}
              actions={[
                {
                  icon: 'camera',
                  color: COLORS.white,
                  size: 12,
                  style: { backgroundColor: '#0e9b81', borderRadius: 30 },
                  onPress: handleScanner,
                },
                {
                  icon: 'upload',
                  onPress: handlePickDocument,
                  color: COLORS.white,
                  size: 12,
                  style: { backgroundColor: '#0e9b81', borderRadius: 30 },
                  style: { backgroundColor: '#0e9b81' },
                },
              ]}
              onStateChange={state => setIsShowUpload(state.open)}
              onPress={() => setIsShowUpload(prev => !prev)}
            />
          </>)
          }
          {/* <Popover
          isVisible={isModalVisible}
          onRequestClose={() => {
            // Keyboard.dismiss()
            setTimeout(() => setIsModalVisible(false), 1000)
            // setNewFamilyName('');
            // setCurrentItemId([])
          }}
          popoverStyle={styles.popover}>
             <View style={styles.modalContent}>
             <Text style={styles.textInputHeader}> Change Document Name </Text>
             <TextInput
             numberOfLines={2}
              // value={selectedName.toString().replace('.pdf', '')}
              value={selectedName ? selectedName.replace('.pdf', '') : ''}
              onChangeText={(text) => setSelectedName(text)}
              style={styles.input}
            />
             <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={cancelModal}
                style={styles.cancelButton}>
                <Text style={styles.buttonText}> Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
               onPress={handleSaveName}
                style={styles.saveButton}>
                <Text style={styles.buttonText}> Save </Text>
              </TouchableOpacity>
            </View>
            </View>
          </Popover> */}

          <Modal
            animationType={'fade'}
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => {
              Keyboard.dismiss()
              setTimeout(() => setIsModalVisible(false), 1000)
              setSelectedName('')
            }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={styles.modalContent}>
                <Text style={styles.textInputHeader}> Change Document Name </Text>
                <TextInput
                  autoFocus
                  numberOfLines={2}
                  // value={selectedName.toString().replace('.pdf', '')}
                  value={selectedName ? selectedName.replace('.pdf', '') : ''}
                  onChangeText={(text) => text.trim().length ? setSelectedName(text) : setSelectedName('')}
                  style={styles.input}
                />
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    onPress={cancelModal}
                    style={styles.cancelButton}>
                    <Text style={styles.buttonText}> Cancel</Text>{console.log('name text -->', selectedName)}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={selectedName?.length && (selectedName && selectedName.replace('.pdf', '')) != (prevSelectedName && prevSelectedName.replace('.pdf', '')) ? handleSaveName : null}
                    style={[styles.saveButton, { backgroundColor: (selectedName && selectedName.replace('.pdf', '')) != (prevSelectedName && prevSelectedName.replace('.pdf', '')) ? '#0e9b81' : 'gray' }]}>
                    <Text style={styles.buttonText}> Save </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Snackbar
            elevation={5}
            style={[styles.snackBar]}
            visible={isDownloadComplete}
            onDismiss={() => {
              setIsDownloadComplete(false)
            }}
            theme={{ roundness: normalize(100), backgroundColor: 'red' }}
            duration={500}
          >
            <Text style={{ fontFamily: 'System', textAlign: 'center', color: COLORS.dodgerBlue, fontSize: normalize(12) }}> {`File Download Successfully!`} </Text>
          </Snackbar>
          {isUploading === true ? <Dialog style={{ zIndex: 10, elevation: 10 }} isVisible={isUploading} >
            <LinearProgress style={{ marginVertical: 10 }} color={'#0e9b81'} />
            <Text style={{ textAlign: 'center', color: '#0e9b81' }}>Uploading...</Text>
          </Dialog> : null}

          <CustomSnackBar
            message={isSnackbarVisible?.message}
            status={isSnackbarVisible?.visible}
            setStatus={setIsSnackbarVisible}
            styles={[styles.snackBar, { backgroundColor: isSnackbarVisible.isFailed ? COLORS.red : '#0e9b81' }]}
            textStyle={{ color: COLORS.white, textAlign: 'left', fontSize: 13 }}
            roundness={10}
            duration={isSnackbarVisible.isFailed ? 3000 : 2000}
          />
        </SafeAreaView>
      </DrawerNavigator>
    </ImageBackground>
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
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5
  },
  image: {
    width: '100%',
    height: '92.5%',
    paddingVertical: 10,
    marginTop: 8,
    paddingBottom: 0
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop: normalize(6),
    // backgroundColor: 'red',
    // height: normalize(30),
    paddingHorizontal: 8,
    alignContent: 'center',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    position: 'relative'
    // flex: 0.08
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

  groupFab: {
    backgroundColor: COLORS.gray,
    borderRadius: 30
    // color: COLORS.red
  },
  documentItemView: {
    borderWidth: 0,
    flex: 1,
    height: normalize(200),
    maxWidth: screenWidth * 0.42,
    margin: 15,
    backgroundColor: 'lightgray',
    borderRadius: 5,
    justifyContent: 'space-between',
    paddingBottom: 10
  },
  snackBar: {
    width: normalize(200),
    alignSelf: 'center',
    bottom: normalize(50),
    opacity: 0.85,
    alignContent: 'center',
    backgroundColor: 'white',
    position: 'absolute',
  },
  popover: {
    width: normalize(290),
    height: normalize(180),
    backgroundColor: 'rgb(212, 215, 219)',
    borderRadius: 8,
  },
  modalContent: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth * 0.75,
    backgroundColor: 'rgb(212, 215, 219)',
    borderRadius: 8,
    padding: 15,
    borderWidth: 0.5,
    borderColor: COLORS.avatarBackground
  },
  textInputHeader: {
    color: 'black',
    fontSize: 18,
    fontWeight: '500',
    marginVertical: 10,
  },
  input: {
    height: 40,
    width: 235,
    borderWidth: 1,
    marginBottom: 18,
    padding: 8,
    fontSize: 18,
    fontWeight: '500',
  },
  saveButton: {
    width: normalize(90),
    height: normalize(34),
    borderRadius: 20,
    color: 'white',
    backgroundColor: '#0e9b81'
  },
  cancelButton: {
    backgroundColor: 'red',
    width: normalize(90),
    height: normalize(34),
    marginRight: 10,
    borderRadius: 20,
  },
  buttonText: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  snackBar: {
    alignSelf: 'center',
    bottom: normalize(50),
    alignContent: 'center',
    backgroundColor: 'white',
    zIndex: 1,
    width:'90%'
  },
});

export default DocumentScannerScreen;