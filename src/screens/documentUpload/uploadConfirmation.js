import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  ImageBackground,
  Text,
  Platform,
  TextInput,
  Linking,
} from 'react-native';
import moment from 'moment';
import { COLORS } from '../../utilities/colors';
import React, { useState, useEffect } from 'react';
import { Images } from '../../assets/images/images';
import { createPdf } from 'react-native-images-to-pdf';
import { Dialog, LinearProgress } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { retrieveUserDetail } from '../../storageManager';
import { ScrollView } from 'react-native-gesture-handler';
import NetworkManager from '../../services/NetworkManager';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { screenHeight, screenWidth } from '../../utilities/measurement';
import { APP_BUTTON_NAMES, UPLOAD_DOCUMENT } from '../../utilities/strings';

const UploadConfirmation = ({ navigation, route }) => {

  // navigation params
  const categoryInfo = route.params?.categoryInfo ?? false
  const refreshData = route.params?.refreshData ?? false
  const documentInfo = route.params?.documentPage ?? {}
  const isEditDocument = route.params?.isEditDocument ?? false

  // hooks
  const insets = useSafeAreaInsets();
// console.log('categoryInfo *******', categoryInfo)
  // state
  const [isLoading, setIsLoading] = useState(false)
  const [categoryList, setCategoryList] = useState([])
  const [documentData, setDocumentData] = useState(null)
  const [categoryData, setCategoryData] = useState(categoryInfo || null);
  const [documentName, setDocumentName] = useState(documentInfo?.[0]?.documentName?.split('.pdf')[0] ?? `Doc ${moment().format('MMM DD YYYY HH:MM')}`);

  useEffect(() => {
    getCategoryList()
    if(isEditDocument){
      getDocumentInfo()
    }
  }, [])

  const getDocumentInfo = async () => {
    try {
      let userData = await retrieveUserDetail()
      let getDocumentResult = await NetworkManager.getDocumentsById(documentInfo?.[0]?.documentId)
      if(getDocumentResult.data?.status === 'SUCCESS' && getDocumentResult.data?.code === 200){
        setDocumentData(getDocumentResult.data.response)
      }
    } catch (error) {
      console.error(error); // You might send an exception to your error tracker
    }
  }

  const getCategoryList = async () => {
    let userData = await retrieveUserDetail() 
    let documentName = `${userData.name}_${'Draft'}_Doc_${moment().valueOf()}`
    setDocumentName(documentInfo?.[0]?.documentName?.split('.pdf')[0] ?? documentName)
    try {
      let userData = await retrieveUserDetail()
      let categoryResult = await NetworkManager.listCategoriesByUser(userData.id)
      if(categoryResult.data?.status === 'SUCCESS' && categoryResult.data?.code === 200){
        setCategoryList(categoryResult.data.response.categoryDetails)
        if(!categoryInfo){
          setCategoryData(categoryResult.data.response.categoryDetails[0])
          let documentName = `${userData.name}_${'Draft'}_Doc_${moment().valueOf()}`
          setDocumentName(documentInfo?.[0]?.documentName?.split('.pdf')[0] ?? documentName)
        }
      }
    } catch (error) {
      console.error(error); // You might send an exception to your error tracker
    }
  }

  const handleUpdate = async (document) => {
    try {
      setIsLoading(true)
      let params = {
        "documentId":documentInfo[0].documentId,
        "categoryId": categoryData.categoryId?.toString(),
        "documentName": documentName + '.pdf',
      }
      // console.log('handleUpdate params-->',  params)
      const udpateResult = await NetworkManager.updateDocument(params)
      if (udpateResult?.data.code === 200 && udpateResult?.data.status === 'SUCCESS') {
        setIsLoading(false)
        navigation.pop(2)
        refreshData && refreshData()
      }
    } catch(e) {
      setIsLoading(false)
      console.log('handleSave --->', e.response.data)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    // console.log('document=====>',documentInfo, documentInfo?.[0]?.type === 'application/pdf')
    if(documentInfo?.[0]?.type === 'application/pdf'){
      let userData = await retrieveUserDetail()
        let bodyFormData = new FormData()
        let fileObj = { uri: documentInfo[0].documentUrl , name: documentName+'.pdf' , type: 'application/pdf' }
          bodyFormData.append('file',fileObj)
        let uploadResult =  await NetworkManager.documentUpload(userData.id, bodyFormData)
        // console.log('handleSave uploadResult-->',  uploadResult)
        if(uploadResult.status === 200){
          saveDocument(uploadResult.data, fileObj.uri, documentInfo[0].pageCount)
        } else {
          // console.log(`Failed to upload PDF:`)
        }
    }else{
      const { dirs } = ReactNativeBlobUtil.fs
      let filePath = Platform.OS == 'ios' ? '' : 'file://' + dirs.DownloadDir+'/'+documentName+'.pdf'
      // console.log('handleSave uploadResult-->',  filePath, documentInfo)
      createPdf({
        pages: documentInfo.map(item => ({ imagePath: item.documentUrl })),
        outputPath: filePath
      })
      .then(async path => {
        // console.log('handleSave uploadResult-->',  path)
        let uploadFilePath =   Platform.OS == 'ios' ? filePath : 'file://' + filePath
        let userData = await retrieveUserDetail()
        let bodyFormData = new FormData()
        let fileObj = { uri: uploadFilePath , name: documentName+'.pdf' , type: 'application/pdf' }
          bodyFormData.append('file',fileObj)
          // console.log('handleSave uploadResult-->',  uploadFilePath)
        let uploadResult =  await NetworkManager.documentUpload(userData.id, bodyFormData)
        // console.log('handleSave uploadResult-->',  uploadResult)
        if(uploadResult.status === 200){
          saveDocument(uploadResult.data, uploadFilePath, documentInfo.length)
        } else {
          // console.log(`Failed to upload PDF:`)
        }
      })
      .catch(error => {
        setIsLoading(false)
        console.log(`Failed to create PDF: ${error.response}`)
      });
    }
   
  }

  const saveDocument = async (document, path, pageCount) => {
    try {
      setIsLoading(true)
      let userData = await retrieveUserDetail()
      let params = {
        "documentDetails": [{
            "documentName": document.fileName,
            "documentUrl": document.documentUrl,
            "documentSize": document.size,
            "documentType": document.fileType,
            "pageCount": pageCount
          }],
        "categoryId": categoryData.categoryId?.toString(),
        "familyId": '',
        "uploadedBy": userData.id?.toString(),
        "sharedMembers": []
      }
      console.log('handleSave params-->',  params)
      const saveResult = await NetworkManager.saveDocument(params)
      console.log('handleSave saveResult-->',  saveResult?.data)
      if (saveResult?.data.code === 200 && saveResult?.data.status === 'SUCCESS') {
        setIsLoading(false)
        navigation.pop(2)
        refreshData && refreshData()
      }
    } catch(e) {
      setIsLoading(false)
      // console.log('handleSave --->', e)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={[styles.imageBackground, { paddingTop: insets.top }]}>
        <View style={styles.wrapper}>
          <View style={{ height: screenHeight * 0.075 }}>
            <TouchableOpacity hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}  style={styles.headerView} onPress={() => navigation.goBack()}>
              <Icon name="long-arrow-left" size={24} color={COLORS.white}  />
              <Text style={styles.headerViewText}>{UPLOAD_DOCUMENT.back}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contentView}>
            <View>
              <View>
                <Text style={styles.categoryTitle}>{UPLOAD_DOCUMENT.changeDocumentTitle}</Text>
                <TextInput
                  value={documentName}
                  style={[styles.input, {marginHorizontal: 20, marginTop: 10, borderColor: COLORS.transparentWhite, borderRadius: 5, width: screenWidth * 0.88, color: COLORS.transparentWhite }]}
                  onChangeText={text => setDocumentName(text)}
                />
              </View>
              <View>
                <Text style={{ color: COLORS.white, marginHorizontal: 20, textTransform: 'uppercase', fontWeight: 'bold' }}>{UPLOAD_DOCUMENT.categoryTitle}</Text>
                <ScrollView style={{ marginHorizontal: 20, marginTop: 10, maxHeight: 180 }} contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap"}}>
                  {categoryList.map((item, index) => (<TouchableOpacity onPress={() => setCategoryData(item)}><Text style={{  opacity: (categoryData?.categoryId === item.categoryId) ? 1 : 0.7, color: (categoryData?.categoryId === item.categoryId) ? COLORS.warnLight : COLORS.transparentWhite, marginHorizontal: 10, padding: 5, borderWidth: 1, borderColor: (categoryData?.categoryId === item.categoryId) ? COLORS.warnLight : COLORS.transparentWhite, borderRadius: 20, paddingHorizontal: 10, marginBottom: 10 }}>{item.categoryName}</Text></TouchableOpacity> ))}
                </ScrollView>
              </View>
            </View>
            <View style={styles.buttonView}>
              <TouchableOpacity style={styles.button} onPress={isEditDocument ? handleUpdate : handleSave} >
                  <Text style={styles.buttonText}>{isEditDocument ? APP_BUTTON_NAMES.update : APP_BUTTON_NAMES.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View> 
        
        <Dialog style={{ zIndex: 10, elevation: 10 }} isVisible={isLoading} >
          <LinearProgress style={{ marginVertical: 10 }} color={'#0e9b81'} />
          <Text style={{ textAlign: 'center',color:'#0e9b81' }}>Processing...</Text>
        </Dialog> 
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentView: { paddingTop: 10, justifyContent: 'space-between', height: '92.5%' },
  buttonText: { fontSize: 22, fontWeight: '500', alignItems: 'center', color: COLORS.white },
  imageBackground: { width: screenWidth, height: screenHeight, flex: 1, justifyContent: 'space-between' },
  categoryTitle: { color: COLORS.white, marginHorizontal: 20, textTransform: 'uppercase', fontWeight: 'bold' },
  headerViewText: { fontSize: 14, fontWeight: '700', alignItems: 'center', paddingLeft: 10, color: COLORS.white },
  button: { width: 150, height: 50, backgroundColor: '#17826b', padding: 10, borderRadius: 10, alignItems: 'center' },
  buttonView: { backgroundColor: 'lightgray', alignItems: 'center', flexDirection: 'row-reverse', padding: 10, justifyContent: 'space-between' },
  headerView: { alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start', alignSelf: 'flex-start', padding: 15, paddingHorizontal: 15 },
  input: {
    height: 40,
    width: screenWidth * 0.7,
    borderWidth: 1,
    marginBottom: 18,
    padding: 8,
    fontSize: 18,
    fontWeight: '500',
  },
});

export default UploadConfirmation;