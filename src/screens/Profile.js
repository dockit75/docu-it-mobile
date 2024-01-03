import React, { Fragment, useEffect, useState } from 'react'
import { Image, ImageBackground, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback, FlatList,ActivityIndicator } from 'react-native'
import { normalize, normalizeVertical, screenHeight, screenWidth } from '../utilities/measurement'
import { Images } from '../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utilities/colors';
import UserAvatar from 'react-native-user-avatar';
import { retrieveUserDetail, storeUserDetail, storeUserSession } from '../storageManager';
import { KeyboardAvoidingView } from 'react-native';
import { APP_BUTTON_NAMES, LOGIN, PROFILE_SCREEN } from '../utilities/strings';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DocumentPicker from 'react-native-document-picker';
import { PermissionsAndroid } from 'react-native';
import NetworkManager from '../services/NetworkManager';
import { Snackbar } from 'react-native-paper';
import { Skeleton } from '@rneui/themed';
import DrawerNavigator from '../components/common/DrawerNavigator';
import { Dialog } from '@rneui/themed';
import CustomSnackBar from '../components/common/SnackBar';


const Profile = ({ navigation }) => {
    // hooks
    const insets = useSafeAreaInsets();

    // state 
    const [profileData, setProfileData] = useState(null)
    const [userData, setUserData] = useState(null)
    const [isOpen, setIsOpen] = useState(false);
    const [isValueChange, setIsValueChange] = useState(false)
    const [isSnackbarVisible, setIsSnackbarVisible] = useState(false)
    const [isProfileUpdate, setIsProfileUpdate] = useState(false)
    const [isImageUpload, setIsImageUpload] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [inputError, setInputError] = useState(false); 
    const [loader, setLoader] = useState(true);
    const [isNameValid, setIsNameValid] = useState(true);

    const options = LOGIN.genderOptions;
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
          fetchProfile();
        });
        return unsubscribe;
      }, []);

      useEffect(() => {
        setIsValueChange(checkChangesMade())
        setInterval(() => { setLoader(false)}, 1000);
      }, [profileData])
    
    
      const checkChangesMade = () => {
        const updatedValues = {
          name: profileData?.name?.trim(),
          gender: profileData?.gender?.trim(),
          imageUrl: profileData?.imageUrl ?? ''
        }
        const defaultValues = {
          name: userData?.name?.trim() ?? '',
          gender: userData?.gender?.trim() ?? '',
          imageUrl: userData?.imageUrl ?? '',
        }
        const isEqual = JSON.stringify(updatedValues) === JSON.stringify(defaultValues)
        if ((userData?.name && !profileData['name']?.trim()) || isEqual) { // return false if user emptied thier name or no field values have changed
          return false
        }
        return true
      }
    const fetchProfile = async () => {
      setIsLoading(true)
      let userData = await retrieveUserDetail()
        setUserData(userData)
        setProfileData(userData)
        setIsLoading(false)
        setIsImageUpload(false)
    }
    const toggleDropdown = () => setIsOpen(!isOpen)

    const requestExternalWritePermission = async () => {
        if (Platform.OS === 'android') {
          try {
            const granted = await PermissionsAndroid.request(
                Platform.Version >= 33 ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              {
                title: 'External Storage Write Permission',
                message: 'App needs write permission'
              }
            )
            // If WRITE_EXTERNAL_STORAGE Permission is granted
            return granted === PermissionsAndroid.RESULTS.GRANTED
          } catch (err) {
            console.warn(err)
            alert('Write permission err', err)
          }
          return false
        } else return true
      }
  
   const uploadProfileImage = async (type) => {
    const isStoragePermitted = await requestExternalWritePermission()
    if(isStoragePermitted){
        try {
            const docs = await DocumentPicker.pick({
                type: [DocumentPicker.types.images]
              });
              setIsImageUpload(true)
              let bodyFormData = new FormData()
              let fileObj = { uri: docs[0].uri , name: docs[0].name , type: docs[0].type }
                bodyFormData.append('file',fileObj)
                // console.log('handleSave uploadResult-->',  fileObj)
              let uploadResult =  await NetworkManager.documentUpload(userData.id, bodyFormData)
              // console.log('handleSave uploadResult-->',  uploadResult.data)
              if(uploadResult.status === 200){
                // setProfileData(prev => prev = { ...prev, imageUrl: uploadResult.data.documentUrl })
                handleUpdate(uploadResult.data.documentUrl)
              } else {
                setIsImageUpload(false)
                // console.log(`Failed to upload PDF:`)
              }
            // console.log('docs --->', docs)
        } catch (err) {
          if (DocumentPicker.isCancel(err)) {
            // console.log('User canceled the upload', err);
          } else {
            setIsImageUpload(false)
            console.error('An error occurred during document picking:', err);
          }
        }
    }
  }

  const handleUpdate = async (imageUrl) => {
    // console.log('handleUpdate uploadResult-->',  imageUrl)
    Keyboard.dismiss()
    setIsLoading(true)
    let params = { 
        // ...profileData,
        name: profileData?.name,
        gender: profileData?.gender,
        imageUrl: imageUrl ? imageUrl : profileData.imageUrl ?? null,
        userId: userData.id
    }
      
    let profileResult = await NetworkManager.updateProfile(params)

    if (profileResult.data.code === 200) {
      let updateData = {
        ...userData,
        name: profileResult.data.response.userDetails?.name,
        gender: profileResult.data.response.userDetails?.gender,
        imageUrl: profileResult.data.response.userDetails.imageUrl
      }
      setUserData(updateData)
      setProfileData(updateData)
      await storeUserSession(updateData)
      await storeUserDetail(updateData)
      !imageUrl && setIsSnackbarVisible(true)
      imageUrl && setIsProfileUpdate(true)
      setIsLoading(false)
      setIsImageUpload(false)
    } else {
      alert(profileResult.data.message)
      setIsSnackbarVisible({ message:profileResult.data.message, visible: true})
      setIsImageUpload(false)
      setIsProfileUpdate(true)
      setIsSnackbarVisible(true)
    }
  }
  const handleInputChange = (value, item) => {
    const alphabetRegex = /^[A-Za-z_ ]+$/;
    const isValid = alphabetRegex.test(value.trim());
    
    setIsNameValid(isValid);
  
    if (value.trim().length <= 50 && isValid) {
      setProfileData((prev) => ({ ...prev, [item.id]: value.trim() }));
      setInputError(false); // Clear error if within limit and matches the regex pattern
    } else {
      setInputError(true); // Set error if exceeded limit or doesn't match the regex pattern
    }
  };
  

    const mapInputs = ({item, index}) => {
        return (

          item.id === 'gender' ?
          <Fragment key={item.id}>
              <Text style={[{ fontSize: normalize(14), textTransform: 'uppercase', color: COLORS.black, paddingRight: 20, fontWeight: '500' }, index && { marginTop: normalize(22) }]}>{`${item.id}   `}{(item.isEdit) && <Icon size={20} name='pencil' color={COLORS.warnLight} style={{ paddingLeft: 20 }} />}</Text>
              <View style={{ zIndex: 1, }}>
                <TouchableOpacity style={[styles.dropdownContainer]}
                    onPress={() => toggleDropdown()}
                >
                    <Text style={[styles.selectedOption, { color: 'black',  }]}>{profileData?.gender ?? 'Choose Gender'}</Text>
                    {isOpen ? (
                        <Icon name="chevron-up" size={30} color="black"  />
                    ) : (
                        <Icon name="chevron-down" size={30} color="black"  />
                    )
                    }
                </TouchableOpacity>
                {isOpen && (
                    <View style={styles.optionsContainer}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={styles.optionItem}
                                onPress={() => {
                                    setProfileData(prev => prev = { ...prev, gender: option })
                                    setIsOpen(false)
                                }}                                                    
                            >
                                <Text style={styles.text} >
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
          </Fragment>
          :
          <React.Fragment key={item.id}>
            <Text style={[{ fontSize: normalize(14), textTransform: 'uppercase', color: COLORS.black, paddingRight: 20, fontWeight: '500' }, index && { marginTop: normalize(22) }]}>{`${item.id}   `}{(item.isEdit) && <Icon size={20} name='pencil' color={COLORS.warnLight} style={{ paddingLeft: 20 }} />}</Text>
            {item.isEdit ? 
              <TextInput
                editable={item.isEdit}
                placeholder={item.placeHolder}
                placeholderTextColor={COLORS.warnLight}
                value={profileData?.[item.itemKeyName]}
                style={[{ borderColor: item.isEdit ? COLORS.warnLight :COLORS.gray, borderWidth: normalize(1), borderRadius: normalize(8), marginTop: normalize(8), color: COLORS.black, height: normalize(48), paddingHorizontal: 10 }]}
                // onChangeText={(value) => setProfileData(prev => prev = { ...prev, [item.id]: value })}
                onChangeText={(value) => handleInputChange(value, item)}
                maxLength={51}
              /> 
              :
              <TextInput
                editable={item.isEdit}
                placeholder={item.placeHolder}
                placeholderTextColor={COLORS.warnLight}
                value={profileData?.[item.itemKeyName]}
                style={[{ borderColor: item.isEdit ? COLORS.warnLight :COLORS.gray, borderWidth: normalize(1), borderRadius: normalize(8), marginTop: normalize(8), color: COLORS.black, height: normalize(48), paddingHorizontal: 10 }]}
                // onChangeText={(value) => setProfileData(prev => prev = { ...prev, [item.id]: value })}
                onChangeText={(value) => handleInputChange(value, item)}
              />
            }
          </React.Fragment>
        )
    }

    const SnackBar = ({status, setStatus, message, styles}) => <CustomSnackBar
      elevation={5}
      style={styles}
      visible={status}
      onDismiss={() => {
        setStatus(false)
      }}
      theme={{ roundness: normalize(100), backgroundColor: 'red' }}
      duration={500}
    >
      <Text style={{ fontFamily: 'System', textAlign: 'center', color: COLORS.dodgerBlue, fontSize: normalize(12) }}> {message} </Text>
    </CustomSnackBar>


    let buttonEnable = (!isLoading && isValueChange)
    return (
            <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: '100%' }}>
                <DrawerNavigator>
                <View style={{ flex: 1 }}>
                {loader === true ?  (<Dialog overlayStyle={{ width: 120 }} isVisible={loader} >
                    <ActivityIndicator size={'large'} color={'#0e9b81'} />
                    <Text style={{ textAlign: 'center',color:'#0e9b81' }}>Loading...</Text>
                   </Dialog> ): (
                    <View  style={{ flex: 1}}  >
                <View style={styles.editProfileHeader} >
                    <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={{ alignSelf: 'center' }}>
                        <Image source={Images.ARROW} style={{ width: 26, height: 26 }} />
                    </TouchableOpacity>
                    <Text style={styles.editProfile}>{'Profile'}</Text>
                    <TouchableOpacity disabled={true}>
                        <Text style={[styles.done, { color: COLORS.transparent }]}>
                            {'Done'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableWithoutFeedback onPress={() => {
                  setIsOpen(false)
                  Keyboard.dismiss()
                }}>
                <KeyboardAvoidingView >
                  <ScrollView keyboardShouldPersistTaps={'always'} contentContainerStyle={{ flexGrow: 1, height: '100%' }} style={{ paddingHorizontal: normalize(32), height: '100%' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <TouchableOpacity style={{ position: 'relative' }} onPress={() => uploadProfileImage()}>
                          <UserAvatar
                            size={80}
                            name={profileData?.name?.charAt(0) ?? ''}
                            bgColor="#e0ffff"
                            textColor="black"
                            textStyle={{ fontWeight: 'bold' }}
                            style={{ marginVertical: 20, borderWidth: 0.5, borderColor: COLORS.dodgerBlue }}
                            src={profileData?.imageUrl ?? null}
                            component={isImageUpload ? <Skeleton circle animation="wave" style={{ marginTop: 4, height: '94%', width: '98.5%' }}  /> : null}
                          />
                          <View style={{ position: 'absolute', bottom: 20, right: -2, border: 1, backgroundColor: COLORS.dodgerBlue, borderRadius: 20, borderWidth: 2, borderColor: COLORS.warnLight }}>
                            <Icon name="pencil" size={14} color={COLORS.white} style={{ padding: 2 }} />
                          </View>
                        </TouchableOpacity>
                      </View>
                      {/* <ScrollView
                        renderItem={mapInputs}
                        data={PROFILE_SCREEN.fields}
                        removeClippedSubviews={false}
                        keyExtractor={(item) => item.id}
                        CellRendererComponent={({children}) => children}
                        ListFooterComponent={() => 
                          <TouchableOpacity style={{ backgroundColor: (buttonEnable) ? '#17826b' : COLORS.gray, alignItems: 'center', alignSelf: 'center', width: 120, height: 40, alignContent: 'center', justifyContent: 'center', marginTop: 30, borderRadius: 20 }} disabled={isLoading || !isValueChange} onPress={() => handleUpdate()}>
                            <Text style={[styles.done, { color: (buttonEnable) ? COLORS.warnLight : COLORS.backdrop }, !buttonEnable && { opacity: 0.5 }]}>
                              {'Done'}
                            </Text>
                          </TouchableOpacity>
                        }
                      /> */}
                      {PROFILE_SCREEN.fields.map((item, index)=>mapInputs({item, index}))}
                      {inputError && <Text style={{ color: 'red' }}>Max length exceeded (50 characters) and Name must contain only alphabets.</Text>}
                      <TouchableOpacity style={{ backgroundColor: (buttonEnable) && isNameValid ? '#17826b' : COLORS.gray, alignItems: 'center', alignSelf: 'center', width: 120, height: 40, alignContent: 'center', justifyContent: 'center', marginTop: 30, borderRadius: 20, flexDirection: 'row' }} disabled={isLoading || !isValueChange} onPress={() => handleUpdate()}>
                            { isLoading && <ActivityIndicator size={'small'} color={COLORS.avatarBackground} />}
                            <Text style={[styles.done, { color: (buttonEnable) && isNameValid  ? COLORS.warnLight : COLORS.backdrop }, !buttonEnable && { opacity: 0.5, marginLeft: isLoading ? 10 : 0 }]}>
                              {APP_BUTTON_NAMES.done}
                            </Text>
                          </TouchableOpacity>
                  </ScrollView>
                  <CustomSnackBar
                    message={'Profile Updated Successfully!'}
                    status={isSnackbarVisible}
                    setStatus={setIsSnackbarVisible}
                    styles={styles.snackBar}
                  />
                  <CustomSnackBar
                    message={'Profile Photo Updated Successfully!'}
                    status={isProfileUpdate}
                    setStatus={setIsProfileUpdate}
                    styles={[styles.snackBar, {width: screenWidth * 0.75}]}
                  />
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
              </View>
              )}
              </View>
              </DrawerNavigator>
            </ImageBackground>
    )
}

const styles = StyleSheet.create({
    ViewContainer: {
        width: screenWidth - normalize(40),
        height: normalize(108),
        backgroundColor: 'rgb(242, 245, 249)',
        borderColor: 'red',
        alignSelf: 'center',
        borderRadius: 10,
    },
    Text: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 17,
        color: 'black',
    },
    TextProfile: {
        fontSize: 22,
        fontWeight: 'bold',
        marginVertical: 15,
        color: 'white',
        marginLeft: normalize(15)
    },
    HeaderLine: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 17,
        color: 'white',
        left: 20,
        marginTop: normalize(20)
    },
    editProfileHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: normalize(10),
      alignItems: 'center',
      paddingHorizontal: normalize(22)
    },
    
  editProfile: {
    textAlign: 'center',
    color: COLORS.warnLight,
    fontWeight: '600',
    fontSize: 16,
  },

  dropdownContainer: {
    borderWidth: 1,
    borderColor: COLORS.warnLight,
    borderRadius: normalize(5),
    height: normalizeVertical(50),
    paddingHorizontal: normalizeVertical(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: normalize(5),
    position: 'relative'
},
optionsContainer: {
    borderWidth: 0.1,
    borderRadius: 5,
    backgroundColor: '#3C3C43CC',
    marginTop: normalize(10),
    width: screenWidth - normalize(30),
    position: 'absolute',
    top: 0,
    zIndex: 111
},
optionItem: {
    padding: 15,
    borderBottomWidth: 0.2,
},
text: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
},
selectedOption: {
    fontSize: 15,
    // fontWeight: '500',
    color: 'black',
},
snackBar: {
  width: normalize(200),
  alignSelf: 'center',
  bottom: normalize(55),
  opacity: 0.85,
  alignContent: 'center',
  backgroundColor: 'white',
  zIndex: 1,
  width:'90%'
},
})
export default Profile