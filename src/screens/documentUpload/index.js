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
  Linking
} from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  normalize,
  normalizeVertical,
  screenHeight,
  screenWidth,
} from '../../utilities/measurement';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Images } from '../../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DocumentPicker from 'react-native-document-picker';
import { FAB, Portal, PaperProvider, Snackbar } from 'react-native-paper';
import { COLORS } from '../../utilities/colors';
import { retrieveUserDetail } from '../../storageManager';
import NetworkManager from '../../services/NetworkManager';
import Pdf from 'react-native-pdf';
import DrawerNavigator from '../../components/common/DrawerNavigator';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {Menu, MenuItem, MenuDivider} from 'react-native-material-menu';
import { UPLOAD_DOCUMENT } from '../../utilities/strings';
import moment from 'moment';
import PdfModal from './pdfModal';
import { PDFDocument } from 'pdf-lib';
import { DocumentListItemLoader } from './documentListItemLoader';
import { maxFileSizeLimit } from '../../services/config';
import { FlashList } from '@shopify/flash-list';
import { Dialog, LinearProgress } from '@rneui/themed';
import { setProfileCompletion } from '../../slices/UserSlices';
import { useDispatch } from 'react-redux';
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

  const [isShowUploadOptions, setIsShowUpload] = useState(false)
  const [isViewPdf, setIsViewPdf] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloadComplete, setIsDownloadComplete] = useState(false);

  const [userData, setUserData] = useState(null);

  const dispatch = useDispatch()

  useEffect(() => {
    setIsLoader(true)
    const unsubscribe = navigation.addListener('focus', async () => {
      getUploadedDocumentsList()
  });

  return unsubscribe;
  }, [])

  const getUploadedDocumentsList = async (isOpenLatest) => {
    // console.log('getUploadedDocuments', categoryInfo)
    try {
      let userData = await retrieveUserDetail()
      setUserData(userData)
      // console.log('setCombinedDocuments', userData.id, categoryInfo.categoryId)
      let categoryResult = await NetworkManager.getUploadedDocumentsByCategoryId(userData.id, categoryInfo.categoryId)
      // console.log('setCombinedDocuments', categoryResult.data)
      if(categoryResult.data?.status === 'SUCCESS' && categoryResult.data?.code === 200){
        isOpenLatest && setCombinedDocuments([])
        setCombinedDocuments(categoryResult.data.response.documentDetailsList.map(item => item = {...item, showOptions: false}))

        setIsUploading(false)
        setIsLoader(false)
        if(isOpenLatest){
          // let item = categoryResult.data.response.documentDetailsList?.sort((a, b) => b.updatedDate - a.updatedDate)[0]
          // setTimeout(() => navigation.navigate('uploadPreview', {uploadFiles: [{ ...item, fileType: 'application/pdf'}], categoryInfo, refreshData, isEditDocument: true}), 600)
        }
      } else {
        setIsLoader(false)
      }
    } catch (error) {
      setIsLoader(false)
      console.error(error); // You might send an exception to your error tracker
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
  };

  const toggleFullScreen = async (item) => {
    handleShowOption(item, false)
    navigation.navigate('uploadPreview', {uploadFiles: [{ ...item, fileType: item.documentUrl?.includes('.jpg') ? 'image/jpg' : 'application/pdf' }], categoryInfo, refreshData, isEditDocument: true })
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
        onPress: () => {}
      },
      { text: 'Ok', onPress: async () => {
        let deleteResult = await NetworkManager.documentDelete(item.documentId ?? item?.documentId)
        if(deleteResult.data?.status === 'SUCCESS' && deleteResult.data?.code === 200){
          Alert.alert(deleteResult.data?.message)
          if(docmentFilterList?.length === 0) {
            let profileStatusResult = await NetworkManager.getUserRanking(userData.id)
            if (profileStatusResult?.data.code === 200 && profileStatusResult?.data.status === 'SUCCESS') {
              dispatch(setProfileCompletion({ percentage: profileStatusResult?.data?.response?.userRanking ?? 0.0 }))
            }
          }
          const updatedDocuments = combinedDocuments.filter((doc) => ((doc.documentUrl ?? doc?.url) !== (item?.documentUrl ?? item.url)));
          setCombinedDocuments(updatedDocuments.map(prevItem => prevItem = {...prevItem, showOptions: false}));
          if (fullScreenImage && fullScreenImage.uri === item.documentUrl) {
            setFullScreenImage(null);
          }
        }
        // console.log('deleteResult ****** -->', deleteResult)
      }, style: 'destructive' }
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
    setIsShowUpload(false)
    try {
      const docs = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        allowMultiSelection: true,
        copyTo: 'documentDirectory'
      });

      const bodyFormData = new FormData();
      // bodyFormData.append('userId')
      // console.log('upload doc --->', docs)
      if(docs?.length <= 5) {

        setIsUploading(true)
        let exceedFileSizeList = docs.filter(filterItem => filterItem.size > maxFileSizeLimit)
        let docList = docs.filter(filterItem => filterItem.size < maxFileSizeLimit)
        let fileList = await Promise.all(docList.map(async item => {
          const base64Data = await ReactNativeBlobUtil.fs.readFile(item.uri, 'base64')
          // console.log('statResult ***********', docs?.length)
          let pdfDoc = await PDFDocument.load(base64Data, { ignoreEncryption: true })
          let pageCount = pdfDoc?.getPages()?.length ?? 1
          return {
            ...item,
            documentUrl: item.fileCopyUri,
            fileType: item.type, 
            fileName: item.name,
            base64: base64Data,
            pageCount
          }
        }))
        // console.log('fileList?.length', fileList?.length, docs?.length, )
        if(fileList?.length === 1){
          uploadFileList(fileList)
        } else 
        if(fileList?.length > 0) {
          // console.log('statResult ***********', fileList)
          fileList.map((item, index) => multipleUpload(item, ((fileList?.length - 1) === index), exceedFileSizeList ))
        } else {
          setIsUploading(false)
          Alert.alert('',`upload file size is too big.\nNote: maximum file size limit 5Mb.`)
        }
      } else {
        Alert.alert('','You can upload upto 5 files only.')
      }
		  // docs.map((file, index) => (bodyFormData.append('file',{ uri: file.uri , name:file.name , type: file.type, size: file.size })))
      // uploadFileList(fileList)
      // const updatedDocuments = [...combinedDocuments];
      // updatedDocuments.push(...docs);
      // setCombinedDocuments(updatedDocuments);
        // let uploadResult =  await NetworkManager.documentUpload()
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // console.log('User canceled the upload', err);
      } else {
        setIsUploading(false)
        console.error('An error occurred during document picking:', err);
      }
    }
  }

  const multipleUpload = async (fileItem, isLastItem, sizeExceedFileList) => {
    try {
      let userData = await retrieveUserDetail()
      let bodyFormData = new FormData()
      let fileName = fileItem?.name?.split('.')[0] + '_' + moment().format('MMM DD YYYY HH:MM:SS')
      let fileObj = { uri: fileItem.uri , name: fileName+'.pdf' , type: fileItem.type }
        bodyFormData.append('file',fileObj)
      let uploadResult =  await NetworkManager.documentUpload(userData.id, bodyFormData)
      if(uploadResult.status === 200){
        saveDocument(uploadResult.data, isLastItem, sizeExceedFileList)
      } else {
        console.log(`Failed to upload PDF:`)
      }
    } catch(e) {
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
        if(isLastItem && sizeExceedFileList?.length){
          if(sizeExceedFileList?.length === 1){
            setIsUploading(false)
            Alert.alert('',`upload file size is too big.\nNote: maximum file size limit 5Mb.`)
          } else {
            setIsUploading(false)
            Alert.alert('',`${sizeExceedFileList.map(item => item.name).toString()} \nupload files size are too big.\n\nNote: maximum file size limit 5Mb.`)
          }
        }
      }
    } catch(e) {
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
    navigation.navigate('uploadPreview', {uploadFiles: files, categoryInfo, refreshData})
  }

  const refreshData = (isOpenFirst) => {
    getUploadedDocumentsList(isOpenFirst)
  }

  const handleShareDocument = async (document) => {
    // Alert.alert('','working under progress')
    handleShowOption(document, false)
    setTimeout(() => (navigation.navigate('DocumentFamily', { document: document, categoryInfo: categoryInfo })), 150)
  }

  const handleViewDocument = async (document) => {
    handleShowOption(document, false)
    setIsViewPdf(document)
  }
  
  const handleDownloadDocument = async (document) => {
    handleShowOption(document, false)
    let fileName = document?.documentName?.split('.pdf')[0] ?? document.documentname.split('.pdf')[0]
    let downloadPath =
    Platform.OS === 'ios'
      ? ReactNativeBlobUtil.fs.dirs.DocumentDir + '/' + fileName
      : ReactNativeBlobUtil.fs.dirs.LegacyDownloadDir + '/' + fileName
  const android = ReactNativeBlobUtil.android;
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
        if (Platform.OS === 'ios') {
          ReactNativeBlobUtil.ios.previewDocument(path);
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
  const handleItemAction = async (action, document) => {
    switch(true) {
      case (action.itemKey === 'editDocument'):
        return await toggleFullScreen(document)
      case (action.itemKey === 'shareDocument'):
        return await handleShareDocument(document)
      case (action.itemKey === 'viewDocument'):
        return await handleViewDocument(document)
      case (action.itemKey === 'deleteDocument') :
        return await handleDeleteDocument(document)
      case (action.itemKey === 'downloadDocument') :
        return await handleDownloadDocument(document)
      case (action.itemKey === 'moveDocument') :
        return await handleDownloadDocument(document)
      default:
        return null
    }
  }

  const handleShowOption = (item, status) => {
    // console.log('handleShowOption', item)
    status ? setListExtraData(prev => prev = [{...prev, ...item, showOptions: status}]) : setListExtraData({})
    setCombinedDocuments(prev => prev.map(prevItem => prevItem = {...prevItem, showOptions: status ? (prevItem.documentId === item.documentId) : false}))
  }

  const renderItems = useCallback(({ item, index }) => {

    // const renderItems = ({ item, index }) => {
    let document = item
    if(document?.isLoading) return <DocumentListItemLoader />
    let documentNameInfo = document?.documentName ?? document?.documentname
    let name = documentNameInfo
    return <View style={styles.documentItemView}>
      {
      <View style={{alignItems:'center',justifyContent:'flex-end',flexDirection:'row', paddingTop: 3, paddingRight: 5}}>
        <MaterialCommunityIcons size={15} color={'black'} name='account' style={{marginRight:5}}/>
        <Text style={{color:'black', marginRight:5}}>
          {userData.id === document.uploadedBy ? 'Myself' : document.uploadedByName}
        </Text>
      </View>}
      <View style={styles.imageWrapper}>
        <TouchableOpacity onPress={() => handleViewDocument({ ...document})}>
          <Pdf
            page={1}
            singlePage
            trustAllCerts={false}
            source={{ uri: decodeURIComponent(document?.documentUrl ?? document?.url) }}
            onError={(error) => { 
              // console.log(error, document?.documentUrl) 
            }}
            renderActivityIndicator={() => <ActivityIndicator size="large"  />}
            style={{ width: '100%', height: '99.5%', borderTopLeftRadius: 5, borderTopRightRadius: 5, padding: 5 }}
            onLoadComplete={(numberOfPages,filePath) => { 
              // console.log(`Number of pages: ${numberOfPages}`, document?.documentUrl)
            }}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={{ flex: 0.98 }}>
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
                style={item.disable ? { backgroundColor: 'lightgray', opacity: 0.5 }: {}}
                onPress={item.disable ? null : () => handleItemAction(item, document)}>
                <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                  <MaterialCommunityIcons name={item.icon} size={28} color="black" />
                  <Text style={{fontSize: 16, color: 'black' }}>{`  ${item.label}`}</Text>
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
  let documentList = isLoader ? Array(10).fill(1).map((n, i) => n = { "categoryId": 'category_loader'+i,  isLoading: true, "documentUrl": 'category_url_loader'+i }) : combinedDocuments
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
                { fullScreenImage.documentName?.includes('.jpg') ? <Image
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
                  onLoadComplete={(numberOfPages,filePath) => {
                      // console.log(`Number of pages: ${numberOfPages}`);
                  }}
                  onPageChanged={(page,numberOfPages) => {
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
          ) : <>
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
                  <Text style={{ color: 'white', fontSize: 20 }}>No more documents uploaded.</Text>
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
                color= {COLORS.white}
                icon={isShowUploadOptions ? 'close' : 'plus'}
                actions={[
                    {
                    icon: 'camera',
                    color: COLORS.white,
                    size: 12,
                    style:{backgroundColor:  '#0e9b81', borderRadius: 30},
                    onPress: handleScanner,
                    },
                    {
                    icon: 'upload',
                    onPress: handlePickDocument,
                    color: COLORS.white,
                    size: 12,
                    style:{backgroundColor:  '#0e9b81', borderRadius: 30},
                    style:{backgroundColor:  '#0e9b81'},
                    },
                ]}
                onStateChange={ state => setIsShowUpload(state.open)}
                onPress={() => setIsShowUpload(prev => !prev)}
              />
            </>
          }


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
          <Dialog style={{ zIndex: 10, elevation: 10 }} isVisible={isUploading} >
            <LinearProgress style={{ marginVertical: 10 }} color={'#0e9b81'} />
            <Text style={{ textAlign: 'center',color:'#0e9b81' }}>Uploading...</Text>
          </Dialog> 
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

  groupFab:{
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
});

export default DocumentScannerScreen;