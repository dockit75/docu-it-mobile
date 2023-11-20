import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { retrieveUserSession, storeUserDetail, storeUserSession } from '../storageManager';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {
  normalize,
  normalizeVertical,
  screenHeight,
  screenWidth,
} from '../utilities/measurement';
import { Images } from '../assets/images/images';
import NetworkManager from '../services/NetworkManager';
import DeviceInfo from 'react-native-device-info';
import { Snackbar } from 'react-native-paper';
import { COLORS } from '../utilities/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import PhoneInput from "react-native-phone-number-input";
import { white } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import SplashScreen from 'react-native-splash-screen';


const CELL_COUNT = 4;
const SCREENS = {
  lockScreen: 'lockScreen',
  forgetPin: 'forgetPin',
  verifyOTP: 'verifyOTP',
}
const TITLE = {
  lockScreen: 'Enter PIN',
  forgetPin: 'Enter Phone Number',
  verifyOTP: 'Enter OTP',
}
const BUTTON = {
  lockScreen: 'CONTINUE',
  forgetPin: 'SEND OTP',
  verifyOTP: 'VERIFY',
}
const LockScreen = ({ navigation, route }) => {
  const signInParam = route?.params?.signInParam;
  const [enableMask, setEnableMask] = useState(true);
  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [isPhoneExist, setIsPhoneExist] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const phoneInput = useRef(null);
  const [screen, setScreen] = useState(SCREENS.lockScreen);


  useEffect(() => {
    // (async () => {
    //   try {
    //     const data = await retrieveUserSession();
    //     setPhone(data?.phone);
    //     setIsPhoneExist(true);
    //   } catch (error) {
    //     console.error('Error in useEffect:', error);
    //   }
    // })();
      const unsubscribe = navigation.addListener('focus', async () => {
        getUserData();
   
      });
  
      SplashScreen.hide()
      return unsubscribe;
  }, []);

  const getUserData = async () => {
    try {
      const data = await retrieveUserSession();
      setPhone(data?.phone);
      setIsPhoneExist(true);
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }

  useEffect(() => {
    if (value.length === 4) {
      buttonFunction()
    }
  }, [value]);

  const cleanTextFields = () => {
    phoneInput.current.setState({ number: '' })
  };

  const toggleMask = () => setEnableMask(f => !f);

  const renderCell = ({ index, symbol, isFocused }) => {
    let textChild = null;

    if (symbol) {
      textChild = enableMask ? '•' : symbol;
    } else if (isFocused) {
      textChild = <Cursor />;
    }

    return (
      <Text
        key={index}
        style={[styles.cell, isFocused && styles.focusCell]}
        onLayout={getCellOnLayoutHandler(index)}>
        {textChild}
      </Text>
    );
  };


  const handlePinEntry = async () => {
    if (phone?.length >= 10) {
      if (value.length === 4) {
        try {
          setLoading(true);
          const payload = {
            phone: phone,
            verifyPin: value,
          };
          const verifyPinResponse = await NetworkManager.verifyPin(payload);
          if (verifyPinResponse.data.code === 200) {
            // If verification is successful, navigate to the destination screen
            navigation.navigate('PinGenerationScreen', { fromForget: true, phone: phone });
            setValue('');
            setScreen(SCREENS.lockScreen);
          } else {
            setSnackbarMessage('Invalid credentials. Please try again.');
            setSnackbarVisible(true);
          }
        } catch (error) {
          console.error('Error:', error);
          setSnackbarMessage('Invalid PIN. Please try again. ');
          setSnackbarVisible(true);
        } finally {
          setLoading(false);
        }
      } else {
        setSnackbarMessage('Please enter a 4-digit PIN.');
        setSnackbarVisible(true);
      }
    } else {
      setSnackbarMessage('Please enter a 10 digit phone number.');
      setSnackbarVisible(true);
    }
  };

  const handlelockpin = async () => {
    if (phone?.length >= 10) {
      if (value?.length === 4) {

        try {

          setLoading(true);
          const payload = {
            phoneNumber: phone,
            password: value,
          }

          const loginResponse = await NetworkManager.login(payload);

          const token = loginResponse.data.response.token
          await storeUserSession({ ...loginResponse.data.response.userDetails, token, isAuthenticated: true })
          await storeUserDetail({ ...loginResponse.data.response.userDetails, token, isAuthenticated: true })
          if (loginResponse.data.code === 200) {
            navigation.navigate('Dashboard', { userData: value });
            setValue('');
          } else {
            setValue('')
            setSnackbarMessage('Invalid credentials. Please try again.');
            setSnackbarVisible(true);
          }

        } catch (error) {
          console.error('Error:', error);
          setSnackbarMessage('Invalid PIN. Please try again. ');
          setSnackbarVisible(true);
          setValue('')
        } finally {
          setLoading(false);
        }
      } else {
        setSnackbarMessage('Please enter a 4-digit PIN.');
        setSnackbarVisible(true);
      }
    }
    else {
      setSnackbarMessage('Please enter a 10 digit phone number.');
      setSnackbarVisible(true);
    }
  }

  const handleSendOtp = async () => {
    if (phone.length >= 10) {
      try {
        setValue('')
        setLoading(true);
        const res = await NetworkManager.forgotPin(phone)
        if (res.data.code === 200) {
          setSnackbarMessage('A PIN reset link has been sent to your registered mobile/email id');
          setSnackbarVisible(true);
          setScreen(SCREENS.verifyOTP);
        } else {
          setSnackbarMessage('Phone number not Registered');
          setSnackbarVisible(true);
        }
      } catch (error) {
        // console.log(error, 'error')
        setSnackbarMessage('Phone number not Registered');
        setSnackbarVisible(true);
      } finally {
        setLoading(false);
      }
    }
    else {
      setSnackbarMessage('Enter valid phone number');
      setSnackbarVisible(true);
    }
  }
  const buttonFunction = async () => {
    if (screen === SCREENS.lockScreen) {
      handlelockpin();
    } else if (screen === SCREENS.forgetPin) {
      handleSendOtp();
    } else if (screen === SCREENS.verifyOTP) {
      handlePinEntry();
    }

  }
  const handleForgetPin = () => {
    setScreen(SCREENS.forgetPin)
  }
  const handleSighUP = () => {
    navigation.navigate('RegistrationPage')
    cleanTextFields();
  }
  const handleCancel = () => {
    setScreen(SCREENS.lockScreen)
    cleanTextFields();
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top, }}>
        <View style={{ alignSelf: 'center' }}>
          <Image source={Images.LOGO_DOCKIT} resizeMode='center' style={{ marginTop: normalizeVertical(50), width: normalize(150), height: normalize(150), justifyContent: 'center', alignSelf: 'center' }} />
          {(!signInParam && screen === SCREENS.lockScreen) || screen === SCREENS.forgetPin ? <View style={{ justifyContent: 'center', flexDirection: 'column', }}>
            {screen !== SCREENS.forgetPin ? <Text style={[styles.signup, { height: normalizeVertical(50), marginBottom: normalizeVertical(30) }]} >Login</Text> : null}
            {(screen === SCREENS.forgetPin) ? <Text style={{ fontSize: 15, color: 'white', fontWeight: '400', alignSelf: 'flex-start', marginTop: normalizeVertical(50), height: normalizeVertical(30), }}>Enter Your Registered Phone Number :</Text> : null}
            <TouchableOpacity style={[styles.mobileInputView,
            ]}>

              <PhoneInput
                key={isPhoneExist}
                ref={phoneInput}
                defaultValue={phone}
                defaultCode="IN"
                onChangeText={(text) => {
                  setPhone(text);
                }}
                disableArrowIcon={true}
                containerStyle={styles.phoneInputContainer}
                textContainerStyle={styles.phoneInputTextContainer}
                textInputStyle={styles.phoneInputTextStyle}
                textInputProps={{
                  maxLength: 15,
                  placeholder: 'Phone Number',
                  placeholderTextColor: 'black',
                  autoComplete: 'tel'
                }}
                flagButtonStyle={{ right: 0.5, paddingBottom: 0 }}
                codeTextStyle={{ height: normalize(18), marginBottom: 3 }}
                keyboardType="phone-pad"
              />
            </TouchableOpacity>
          </View> : null}
          <View style={{ justifyContent: 'center', alignSelf: 'center' }} >
            {screen !== SCREENS.forgetPin ? <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: normalize(40), }}>
              <View />
              <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold', padding: 10, }}>{TITLE[screen]}</Text>
              <TouchableOpacity onPress={toggleMask} style={{ padding: 10, }}>
                {enableMask ? (
                  <Icon name='eye' size={24} color="white" />
                ) : (
                  <Icon name="eye-slash" size={24} color="white" />
                )}
              </TouchableOpacity>
            </View>
              : null}
            {screen !== SCREENS.forgetPin ? <CodeField
              ref={ref}
              {...props}
              value={value}
              onChangeText={(text) => {
                setValue(text)
              }}
              cellCount={CELL_COUNT}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={renderCell}
              rootStyle={styles.codeFieldRoot}
            /> : null}
          </View>
          <TouchableOpacity onPress={buttonFunction} style={styles.button} disabled={loading}>
            {loading ? (
              <ActivityIndicator color='white' />
            ) : (
              <Text style={styles.buttonText}>{(signInParam && screen === SCREENS.lockScreen) ? 'LOGIN' : BUTTON[screen]}</Text>
            )}
          </TouchableOpacity>
          {screen === SCREENS.forgetPin ? <TouchableOpacity onPress={handleCancel} style={{ alignSelf: 'flex-end', marginRight: normalize(10), marginTop: normalize(10) }}><Text style={{ fontWeight: 'bold', color: 'white', }} >CANCEL</Text></TouchableOpacity> : null}
        </View>
        {!signInParam && screen === SCREENS.lockScreen ? (
          <View>
            <View>

              <View style={{ alignSelf: 'flex-end', marginRight: normalize(20), marginTop: normalize(10) }}>
                <TouchableOpacity onPress={handleForgetPin}>
                  <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: normalize(8) }}>FORGET PIN</Text>
                </TouchableOpacity>
              </View>

            </View>
            <View style={{ justifyContent: 'center', alignSelf: 'center', flexDirection: 'row', paddingTop: normalizeVertical(50), }}>
              <Text style={{ color: 'black' }}> Don't have an account? </Text>
              <TouchableOpacity onPress={handleSighUP}>
                <Text style={{ color: 'black', fontWeight: 'bold', }}>SIGN UP</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

      </ImageBackground>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[styles.Snackbar, snackbarMessage === 'A PIN reset link has been sent to your registered mobile/email id' && { backgroundColor: '#0e9b81' }]}
      >
        {snackbarMessage}
      </Snackbar>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  codeFieldRoot: {
    margin: normalize(20),
    padding: normalize(5),
    width: screenWidth - normalize(100),
  },
  lable: {
    width: screenWidth - normalize(20),
    alignSelf: 'center',
    color: 'black',
    letterSpacing: 1.8,
    fontSize: 20,
    marginTop: normalize(10),
    marginLeft: normalize(10),
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#0e9b81',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    width: screenWidth - normalize(30),
    alignSelf: 'center',
    height: normalizeVertical(50),
    borderRadius: normalize(25),
    elevation: 20,
    marginTop: normalize(40)
  },
  buttonText: {
    alignSelf: 'center',
    color: 'white',
    letterSpacing: 1.5,
    fontSize: 18,
    fontWeight: '800',
  },
  otpContainer: {
    paddingBottom: normalize(50),
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
  },
  root: {
    padding: 20,
    minHeight: 300
  },
  title: {
    textAlign: 'center',
    fontSize: 30
  },
  fieldRow: {
    marginTop: 20,
    flexDirection: 'row',
    marginLeft: 8,
  },
  codeFieldRoot: {
    width: screenWidth - normalize(160),
  },
  cell: {
    width: normalize(40),
    height: normalize(40),
    fontSize: normalize(30),
    textAlign: 'center',
    borderRadius: normalize(6),
    borderWidth: normalize(1),
    borderColor: 'black',
    backgroundColor: '#e3e3e3cc',
  },
  focusCell: {
    borderColor: COLORS.white,
    textAlign: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  Snackbar: {
    backgroundColor: 'rgb(195,0,0)',
  },
  phoneInputContainer: {
    backgroundColor: 'transparent',
    right: 10,
  },
  phoneInputTextContainer: {
    backgroundColor: 'transparent',
    right: 35,
    // paddingTop: normalize(12),
  },
  phoneInputTextStyle: {
    paddingRight: normalize(8),
    position: 'absolute',
    width: screenWidth * 0.58,
    fontSize: 16,
    fontWeight: '600',
    left: 45,
    color: 'black',
    marginTop: 10
  },
  phoneCountryFlag: {
    width: 'auto',
    padding: normalize(14),
    paddingRight: 10
  },
  mobileInputView: {
    paddingLeft: normalize(10),
    width: screenWidth - normalize(30),
    height: normalizeVertical(50),
    borderRadius: normalize(5),
    backgroundColor: '#e3e3e3cc',
    borderColor: COLORS.gray,
    marginBottom: normalize(0),
  },
  signup: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});


export default LockScreen;
