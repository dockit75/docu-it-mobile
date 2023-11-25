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
  Alert,
  FlatList
} from 'react-native';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { COLORS } from '../../utilities/colors';
import React, { useState, useEffect } from 'react';
import { Images } from '../../assets/images/images';
import { createPdf } from 'react-native-images-to-pdf';
import { Dialog, LinearProgress } from '@rneui/themed';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { retrieveUserDetail } from '../../storageManager';
import { ScrollView } from 'react-native-gesture-handler';
import NetworkManager from '../../services/NetworkManager';
import { setProfileCompletion } from '../../slices/UserSlices';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { screenHeight, screenWidth } from '../../utilities/measurement';
import { APP_BUTTON_NAMES, UPLOAD_DOCUMENT } from '../../utilities/strings';
import { validatePathConfig } from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';
import DrawerNavigator from '../../components/common/DrawerNavigator';

const UploadConfirmation = ({ navigation, route }) => {

  // navigation params
  const categoryInfo = route.params?.categoryInfo ?? false
  const refreshData = route.params?.refreshData ?? false
  const documentInfo = route.params?.documentPage ?? {}
  const isEditDocument = route.params?.isEditDocument ?? false

  // hooks
  const dispatch = useDispatch()
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
    if (isEditDocument) {
      getDocumentInfo()
    }
  }, [])

  const getDocumentInfo = async () => {
    try {
      let userData = await retrieveUserDetail()
      let getDocumentResult = await NetworkManager.getDocumentsById(documentInfo?.[0]?.documentId)
      if (getDocumentResult.data?.status === 'SUCCESS' && getDocumentResult.data?.code === 200) {
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
      if (categoryResult.data?.status === 'SUCCESS' && categoryResult.data?.code === 200) {
        setCategoryList(categoryResult.data.response.categoryDetails)
        if (!categoryInfo) {
          // setCategoryData(categoryResult.data.response.categoryDetails[0])
          let documentName = `${userData.name}_${'Draft'}_Doc_${moment().valueOf()}`
          setDocumentName(documentInfo?.[0]?.documentName?.split('.pdf')[0] ?? documentName)
        }
      }
    } catch (error) {
      console.error(error); // You might send an exception to your error tracker
    }
  }

  const handleUpdate = async (document) => {
    console.log('edit called')
    try {
      setIsLoading(true)
      let params = {
        "documentId": documentInfo[0].documentId,
        "categoryId": categoryData.categoryId?.toString(),
        "documentName": documentName + '.pdf',
      }
      // console.log('handleUpdate params-->',  params)
      const udpateResult = await NetworkManager.updateDocument(params)
      console.log('udpateResult',udpateResult)
      if (udpateResult?.data.code === 200 && udpateResult?.data.status === 'SUCCESS') {
        let userData = await retrieveUserDetail()
        let profileStatusResult = await NetworkManager.getUserRanking(userData.id)
        console.log('profileStatusResult===>>>',profileStatusResult)
        if (profileStatusResult?.data.code === 200 && profileStatusResult?.data.status === 'SUCCESS') {
          dispatch(setProfileCompletion({ percentage: profileStatusResult?.data?.response?.userRanking ?? 0.0 }))
        }
        setIsLoading(false)
        console.log('here called============>>')
        navigation.pop(2)
        refreshData && refreshData()
      }
    } catch (e) {
      setIsLoading(false)
      console.log('handleSave --->', e.response.data)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    // console.log('document=====>',documentInfo, documentInfo?.[0]?.type === 'application/pdf')
    if (documentInfo?.[0]?.type === 'application/pdf') {
      let userData = await retrieveUserDetail()
      let bodyFormData = new FormData()
      let fileObj = { uri: documentInfo[0].documentUrl, name: documentName + '.pdf', type: 'application/pdf' }
      bodyFormData.append('file', fileObj)
      let uploadResult = await NetworkManager.documentUpload(userData.id, bodyFormData)
      // console.log('handleSave uploadResult-->',  uploadResult)
      if (uploadResult.status === 200) {
        saveDocument(uploadResult.data, fileObj.uri, documentInfo[0].pageCount)
      } else {
        // console.log(`Failed to upload PDF:`)
      }
    } else {
      const { dirs } = ReactNativeBlobUtil.fs
      let filePath = Platform.OS == 'ios' ? '' : 'file://' + dirs.DownloadDir + '/' + documentName + '.pdf'
      // console.log('handleSave uploadResult-->',  filePath, documentInfo)
      createPdf({
        pages: documentInfo.map(item => ({ imagePath: item.documentUrl })),
        outputPath: filePath
      })
        .then(async path => {
          // console.log('handleSave uploadResult-->',  path)
          let uploadFilePath = Platform.OS == 'ios' ? filePath : 'file://' + filePath
          let userData = await retrieveUserDetail()
          let bodyFormData = new FormData()
          let fileObj = { uri: uploadFilePath, name: documentName + '.pdf', type: 'application/pdf' }
          bodyFormData.append('file', fileObj)
          // console.log('handleSave uploadResult-->',  uploadFilePath)
          let uploadResult = await NetworkManager.documentUpload(userData.id, bodyFormData)
          // console.log('handleSave uploadResult-->',  uploadResult)
          if (uploadResult.status === 200) {
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
    console.log()
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
      console.log('handleSave params-->', params)
      const saveResult = await NetworkManager.saveDocument(params)
      console.log('handleSave saveResult-->============>>>>>', saveResult?.data)
      if (saveResult?.data.code === 200 && saveResult?.data.status === 'SUCCESS') {
        let profileStatusResult = await NetworkManager.getUserRanking(userData.id)
        if (profileStatusResult?.data.code === 200 && profileStatusResult?.data.status === 'SUCCESS') {
          dispatch(setProfileCompletion({ percentage: profileStatusResult?.data?.response?.userRanking ?? 0.0 }))
        }
        setIsLoading(false)
        // navigation.pop(2)
  
        Alert.alert(
          'Confirmation',
          'Document saved sucessfully,\nAre you sure you want to share document ?',
          [
            {
              text: 'No',
              onPress: () => {
                navigation.pop(2)
              },
            },
            {
              text: 'Yes',
              onPress: () => {
                let documentObj = {
                  "familyId": null,
                  "familyName": null,
                  "shareCreatedDate": null,
                  "shareDocumentId": null,
                  "shareId": null,
                  "shareMemberId": null,
                  "sharedBy":null,
                  "sharedUpdatedDate": null,
                  "uploadedByName": userData?.name ?? '',
                  ...params.documentDetails[0],
                  ...params,
                  ...saveResult?.data.response,
                  ...saveResult?.data.response?.[0]
                }
                navigation.navigate('DocumentFamily', { document: documentObj, categoryInfo: categoryData, isSaveDocumentFlow: true })
                refreshData && refreshData()
              },
            },
          ],
          { cancelable: false }
        );
        
      }
    } catch (e) {
      setIsLoading(false)
      console.log('handleSave --->', e)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={[styles.imageBackground]}>
        <DrawerNavigator>
        <View style={{ flex: 1 }}>
          <View style={{ height: screenHeight * 0.075 }}>
            <TouchableOpacity hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }} style={styles.headerView} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-u-left-top" size={24} color={COLORS.white} />
              {/* <Text style={styles.headerViewText}>{UPLOAD_DOCUMENT.back}</Text> */}
            </TouchableOpacity>
          </View>
          <View style={styles.contentView}>
            <View>
              {!isEditDocument ? <View style={{ position: 'relative', marginBottom: 5 }}>
                <Text style={styles.categoryTitle}>{UPLOAD_DOCUMENT.changeDocumentTitle}<Text style={{ color: COLORS.red }}>{' *'}</Text></Text>
                <TextInput
                  value={documentName}
                  style={[styles.input, { marginHorizontal: 20, marginTop: 10, borderColor: COLORS.transparentWhite, borderRadius: 5, width: screenWidth * 0.88, color: COLORS.transparentWhite }]}
                  onChangeText={text => setDocumentName(text)}
                />
                {!documentName?.length ?<Text style={{ marginHorizontal: 20, color: COLORS.red }}>{UPLOAD_DOCUMENT.documentNameError}</Text> : null}
              </View> : null}
              <View>
                <Text style={{ color: COLORS.white, marginHorizontal: 20, textTransform: 'uppercase', fontWeight: 'bold' }}>{UPLOAD_DOCUMENT.categoryTitle}<Text style={{ color: COLORS.red }}>{' *'}</Text></Text>
                {/* <ScrollView style={{ marginHorizontal: 20, marginTop: 10, maxHeight: 180 }} contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {categoryList.map((item, index) => (<TouchableOpacity onPress={() => setCategoryData(item)}><Text style={{ opacity: (categoryData?.categoryId === item.categoryId) ? 1 : 0.7, color: (categoryData?.categoryId === item.categoryId) ? COLORS.warnLight : COLORS.transparentWhite, marginHorizontal: 10, padding: 5, borderWidth: 1, borderColor: (categoryData?.categoryId === item.categoryId) ? COLORS.warnLight : COLORS.transparentWhite, borderRadius: 20, paddingHorizontal: 10, marginBottom: 10 }}>{item.categoryName}</Text></TouchableOpacity>))}
                </ScrollView> */}
                {(!categoryData && categoryList?.length) ?<Text style={{ marginHorizontal: 20, color: COLORS.red }}>{UPLOAD_DOCUMENT.categorySelectError}</Text> : null}
                <FlatList
                  data={categoryList}
                  contentContainerStyle={{ marginHorizontal: 10 }}
                  renderItem={({ item }) => (
                    <View style={{ backgroundColor: COLORS.darkTransparent, padding:5, margin: 5 ,borderRadius:8,marginLeft:10}}>
                      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                      <Text style={{color:'white',marginLeft:10}}>
                        {item.categoryName}
                      </Text>
                      <CheckBox
                        tintColors={{ true: 'red', false: 'white' }}
                        onCheckColor="white"
                        onTintColor="green"
                        offFillColor="white"
                        offTintColor="white"
                        onAnimationType="fill"
                        value={item.categoryId === categoryData?.categoryId}
                        onValueChange={() => setCategoryData(item)}
                      />
                       </View>
                    </View>
                  )}
                />

              </View>
            </View>
            <View style={styles.buttonView}>
              <TouchableOpacity disabled={!(categoryData && documentName?.length)} style={[styles.button, !(categoryData && documentName?.length) && {backgroundColor: 'gray'}]} onPress={isEditDocument ? handleUpdate : handleSave} >
                <Text style={styles.buttonText}>{isEditDocument ? APP_BUTTON_NAMES.update : APP_BUTTON_NAMES.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Dialog style={{ zIndex: 10, elevation: 10 }} isVisible={isLoading} >
          <LinearProgress style={{ marginVertical: 10 }} color={'#0e9b81'} />
          <Text style={{ textAlign: 'center', color: '#0e9b81' }}>Processing...</Text>
        </Dialog>
        </DrawerNavigator>
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
  buttonView: { backgroundColor: 'lightgray', alignItems: 'center', flexDirection: 'row-reverse', padding: 15, justifyContent: 'space-between', paddingTop: 8 },
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
  FlatListContainer: {
    backgroundColor: COLORS.darkTransparent,
    marginTop: 5,
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    marginLeft: 14,
    justifyContent: 'space-between',
    width: screenWidth - 25,
  },
});

export default UploadConfirmation;