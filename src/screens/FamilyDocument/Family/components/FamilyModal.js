import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ImageBackground,
  StyleSheet,
  TextInput,
  FlatList,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  normalize,
  screenHeight,
  screenWidth,
} from '../../../../utilities/measurement';
import { Images } from '../../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Popover from 'react-native-popover-view';
import { COLORS } from '../../../../utilities/colors';
import NetworkManager from '../../../../services/NetworkManager';
import CustomSnackBar from '../../../../components/common/SnackBar';
import Loader from '../../../../components/common/Loader';

const FamilyModal = ({ isVisible, editCall,userId, currentId, cancelModal,getFamilyList}) => {
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState();
  const [newFamilyName, setNewFamilyName] = useState('');
  const [familyDetails, setFamilyDetail] = useState([]);
  const [userDetails, setUserDetails] = useState(userId);
  const [currentItemId, setCurrentItemId] = useState(currentId);
  const [editFamilyCall, setEditFamilyCall] = useState(editCall);
  const [isNameValid, setIsNameValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoader, setIsLoader] = useState(true);
  const [isNameEdited, setIsNameEdited] = useState(false);
  const [previousCurrentItemId, SetPreviousCurrentItemId] = useState([]);
  const [savePressed, setSavePressed] = useState(false);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log('visible', isVisible)

  useEffect(() => {

    setTimeout(
      () =>
      setIsModalVisible(isVisible),
      500,
    );
  }, []);


  const editFamilyName = async () => {
    setIsModalVisible(null)
    setIsLoading(true);
    try {
      let params = {
        name: newFamilyName,
        familyId: currentItemId.id,
        adminId: userDetails.id,
      };
      let editFamilyRes = await NetworkManager.editFamily(params);
      if (editFamilyRes.data.code === 200) {
        setTimeout(
          () =>
          setIsLoading(false),
          500,
        );
        Keyboard.dismiss();
        setErrorMessage('');
        getFamilyList()
        setIsSnackbarVisible({
              message: editFamilyRes.data.message,
              visible: true,
            })
        
      } else {
        Keyboard.dismiss();
        setErrorMessage('');
        setTimeout(
          () =>
            setIsSnackbarVisible({
              message: editFamilyRes.data.message,
              visible: true,
              isFailed: true,
            }),
          1000,
        );
      }

      setCurrentItemId([]);
    } catch (error) {
      setIsLoading(false);
      setCurrentItemId([]);
      Keyboard.dismiss();
      setErrorMessage('');
      setIsSnackbarVisible({
            message: error.response.data.message,
            visible: true,
            isFailed: true,
          })
        
    }
    setTimeout(
      () =>
        cancelModal(),
      500,
    );
  };

  const handleSaveFamily = async () => {
   setIsModalVisible(null)
    setIsLoading(true);
    setEditFamilyCall(false);
    let params = {
      name: newFamilyName,
      adminId: userDetails.id,
    };
    console.log('params',params)
    try {
      let res = await NetworkManager.addFamily(params);
      if (res.data.code === 200) {
        setTimeout(
          () =>
          setIsLoading(false),
          500,
        );
        Keyboard.dismiss();
        setNewFamilyName('');
        setErrorMessage('');
        getFamilyList()
        setIsSnackbarVisible({ message: res.data.message, visible: true })
      } else {
        Keyboard.dismiss();
        setNewFamilyName('');
        setErrorMessage('');
        setTimeout(
          () =>
            setIsSnackbarVisible({
              message: res.data.message,
              visible: true,
              isFailed: true,
            }),
          500,
        );
      }
    } catch (error) {
      Keyboard.dismiss();
      setIsLoading(false);
      setNewFamilyName('');
      setErrorMessage('');
      setIsSnackbarVisible({
            message: error.response.data.message,
            visible: true,
            isFailed: true,
          })
    }
    setTimeout(
      () =>
        cancelModal(),
      500,
    );
    //
  };

  
  
  const handleFamily = () => {
    if (isNameValid) {
      if (editFamilyCall && currentItemId.name != previousCurrentItemId.name) {
        editFamilyName()
      } else if (!editFamilyCall) {
        handleSaveFamily()
      } else {
        null;
      }
    }
  };

  return (
    <View >
      <Modal
        animationType={'fade'}
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          Keyboard.dismiss();
          setTimeout(() => setIsModalVisible(false), 1000);
          setNewFamilyName('');
          setCurrentItemId([]);
        }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.modalContent}>
            {editFamilyCall ? (
              <Text style={styles.textInputHeader}> Change Family Name </Text>
            ) : (
              <Text style={styles.textInputHeader}> Enter Family Name </Text>
            )}
            <TextInput
              value={editFamilyCall ? currentItemId.name : newFamilyName}
              onChangeText={text => {
                if (text?.trim().length > 0) {
                  const alphabetRegex = /^[A-Za-z_ ]+$/;
                  if (setEditFamilyCall) {
                    // Handle edit mode (update currentItemId.name)
                    setCurrentItemId(prevState => ({ ...prevState, name: text }));
                    setNewFamilyName(text);
                  } else {
                    // Handle non-edit mode (update newFamilyName)
                    setNewFamilyName(text);
                  }
                  const isValid = alphabetRegex.test(text);
                  setIsNameValid(isValid);

                  // Set the error message if the input is not valid
                  if (!isValid) {
                    setErrorMessage('Name must contain only alphabets.');
                  } else {
                    setErrorMessage('');
                  }
                } else {
                  editFamilyCall && setCurrentItemId([]);
                  setNewFamilyName('');
                }
              }}
              style={styles.input}
            />
            {errorMessage !== '' && (
              <Text style={styles.errorMessage}> {errorMessage} </Text>
            )}
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={cancelModal} style={styles.cancelButton}>
                <Text style={styles.buttonText}> Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={
                  isNameValid &&
                    ((!editFamilyCall && newFamilyName?.length) ||
                      (editFamilyCall &&
                        currentItemId.name !== previousCurrentItemId.name))
                    ? handleFamily
                    : null
                }
                style={[
                  styles.saveButton,
                  {
                    backgroundColor:
                      isNameValid &&
                        ((!editFamilyCall && newFamilyName?.length) ||
                          (editFamilyCall &&
                            currentItemId.name !== previousCurrentItemId.name))
                        ? '#0e9b81' // Background color when conditions are true
                        : 'gray', // Background color when conditions are false
                  },
                ]}>
                <Text style={styles.buttonText}> Save </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomSnackBar
            message={isSnackbarVisible?.message}
            status={isSnackbarVisible?.visible}
            setStatus={setIsSnackbarVisible}
            styles={[styles.snackBar, {backgroundColor: isSnackbarVisible.isFailed ? COLORS.red : '#0e9b81'}]}
            textStyle={{ color: COLORS.white, textAlign: 'left', fontSize: 13 }}
            roundness={10}
            duration={isSnackbarVisible.isFailed ? 3000 : 2000}
          />
     {isLoading && <Loader isLoading={isLoading} text={'Processing'}/>}
    </View>
  );
};
export default FamilyModal;

const styles = StyleSheet.create({
  TextSettings: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginRight: normalize(15),
  },
  header: {
    width: screenWidth - 25,
    marginLeft: 14,
    backgroundColor: 'rgb(212, 215, 219)',
    borderRadius: normalize(8),
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 10,
  },
  addTouchable: {
    backgroundColor: COLORS.darkTransparent,
    marginTop: 5,
    borderRadius: 25,
    marginRight: 20,
    padding: 5,
  },
  addText: {
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  cancelButton: {
    backgroundColor: 'red',
    width: normalize(90),
    height: normalize(34),
    marginRight: 10,
    borderRadius: 20,
  },
  popover: {
    width: normalize(290),
    height: normalize(180),
    backgroundColor: 'rgb(212, 215, 219)',
    borderRadius: 8,
  },
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth * 0.75,
    backgroundColor: 'rgb(212, 215, 219)',
    padding: 20,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLORS.avatarBackground,
  },
  text: {
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 30,
    // textDecorationLine:'underline',
    borderBottomColor: 'white',
    borderBottomWidth: 2,
  },
  FlatListContainer: {
    height: normalize(50),
    backgroundColor: COLORS.darkTransparent,
    marginTop: 5,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    // width:'75%',
    marginLeft: 14,
    justifyContent: 'space-between',
    width: screenWidth - 25,
  },
  familyName: {
    fontSize: 20,
    fontWeight: '500',
    color: 'black',
    marginLeft: 20,
  },
  actionText: {
    fontSize: 20,
    fontWeight: '500',
    color: 'black',
    marginRight: 30,
  },
  listEmptyComponent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 130,
  },
  iconView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    height: 37,
    width: 37,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  textInputHeader: {
    color: 'black',
    fontSize: 18,
    fontWeight: '500',
    marginVertical: 10,
  },
  errorMessage: {
    color: 'red',
    fontSize: 15,
    marginVertical: 5,
    marginBottom: 10,
  },
  snackBar: {
    alignSelf: 'center',
    alignContent: 'center',
    backgroundColor: 'white',
    zIndex: 1,
    top:normalize(600),
    width:'90%'
  },
});
