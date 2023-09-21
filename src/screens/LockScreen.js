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
import { retrieveUserSession, storeUserSession } from '../storageManager';
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
  const [isAuthenticated, setIsAuthenticated] = useState('');
  const [enableMask, setEnableMask] = useState(true);
  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const deviceId = DeviceInfo.getUniqueId();
  const [uniqueId, setUniqueId] = useState('');
  const [error, setError] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isForgotPin, setIsForgotPin] = useState('');
  const [isSendOtp, setIsSendOtp] = useState(false);
  const [phone, setPhone] = useState(''); // Track if in "Forgot PIN" mode
  const [loading, setLoading] = useState(false); // Track loading state
  const insets = useSafeAreaInsets();
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const phoneInput = useRef(null);
  const [screen, setScreen] = useState(SCREENS.lockScreen);
  // console.log(signInParam,'signinparam')

  useEffect(() => {
    (async () => {
      try {
        const data = await retrieveUserSession();
        // console.log(data, 'data...')
        setUniqueId(data.deviceId);
        setPhone(data.phone)
        // setIsAuthenticated(data.isAuthenticated === true);
        // handlePinEntry(data);
      } catch (error) {
        console.error('Error in useEffect:', error);
      }
    })();
  }, []);

  useEffect(() => {
    if (value.length === 4) {
      // handlePinEntry()
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

    if (value.length === 4) {
      try {
        // console.log(isForgotPin)

        setLoading(true); // Start loading
        const payload = {
          phone: phone,
          verifyPin: value,
        };
        const verifyPinResponse = await NetworkManager.verifyPin(payload);
        if (verifyPinResponse.data.code === 200) {
          // If verification is successful, navigate to the destination screen
          navigation.navigate('PinGenerationScreen', { fromForget: true, phone: phone });
          setValue('');
          // setIsForgotPin(false);
          setScreen(SCREENS.lockScreen);
        } else {
          setSnackbarMessage('Invalid PIN. Please try again.');
          setSnackbarVisible(true);
        }
      } catch (error) {
        console.error('Error:', error);
        setSnackbarMessage('Invalid PIN. Please try again. ');
        setSnackbarVisible(true);
      } finally {
        setLoading(false); // Stop loading
      }
    } else {
      setSnackbarMessage('Please enter a 4-digit PIN.');
      setSnackbarVisible(true);
    }
  };

  const handlelockpin = async () => {
    if (value.length === 4 && phone.length >= 10) {
      // console.log(phone.length, '-------lenght')
      try {

        setLoading(true); // Start loading
        // Call the login API here
        const payload = {
          phoneNumber: phone,
          password: value,
        }
        // console.log('lock screen payload', payload)
        const loginResponse = await NetworkManager.login(payload);
        // console.log(loginResponse.data.response.userDetails, '----------')
        const token = loginResponse.data.response.token
        await storeUserSession({ ...loginResponse.data.response.userDetails, token })
        if (loginResponse.data.code === 200) {
          // If login is successful, navigate to the dashboard screen
          navigation.navigate('Dashboard', { userData: value });
          setValue('');
        } else {
          setSnackbarMessage('Invalid credentials. Please try again.');
          setSnackbarVisible(true);
        }

      } catch (error) {
        console.error('Error:', error);
        setSnackbarMessage('Invalid PIN. Please try again. ');
        setSnackbarVisible(true);
      } finally {
        setLoading(false); // Stop loading
      }
    } else {
      if (phone.length < 10) {
        setSnackbarMessage('Please enter a 10 digit phone number.');
        setSnackbarVisible(true);
      }
      else {
        setSnackbarMessage('Please enter a 4-digit PIN.');
        setSnackbarVisible(true);
      }
    }
  }
  const handleSendOtp = async () => {
    if (phone.length >= 10) {
      try {
        setValue('')
        setLoading(true);
        // setIsSendOtp(false)
        // console.log(phone, 'phone.............')
        // NetworkManager.forgotPin(phone).then(res => {
        const res = await NetworkManager.forgotPin(phone)
        // console.log(res, 'res......')
        if (res.data.code === 200) {
          // setLoading(true);
          // console.log(res.data.message, 'OTP Send  Success')
          setSnackbarMessage('A PIN reset link has been sent to your registered mobile/email id');
          setSnackbarVisible(true);
          // setIsSendOtp(true)
          // setIsForgotPin(true);
          setScreen(SCREENS.verifyOTP);
        } else {
          // console.log('else', res)
          setSnackbarMessage('Phone number not found');
          setSnackbarVisible(true);
          // setLoading(false);
        }
        // })
      } catch (error) {
        console.log(error, 'error')
        setSnackbarMessage('Phone number not found');
        setSnackbarVisible(true);
      } finally {
        setLoading(false); // Stop loading
      }
    }
    else {
      setSnackbarMessage('Enter valid phone number');
      setSnackbarVisible(true);
    }
  }
  const buttonFunction = async () => {
    if (screen === SCREENS.lockScreen) {
      // console.log('lockscreen to dash board');
      handlelockpin();
    } else if (screen === SCREENS.forgetPin) {
      // console.log('otp to verfy screen')
      handleSendOtp();
    } else if (screen === SCREENS.verifyOTP) {
      // console.log('verypin screen to pingeneration');
      handlePinEntry();
    }

  }
  const handleForgetPin = () => {
    setScreen(SCREENS.forgetPin)
  }
  const handleSighUP = () => {
    navigation.navigate('RegistrationPage')
  }
  // console.log(isSendOtp, 'issetotp')
  // const handleSignUp = () => {
  //   if (isAuthenticated === false) {
  //     navigation.navigate('RegistrationPage')
  //   } else {
  //     setSnackbarMessage('Cant able to login more than 1 account');
  //     setSnackbarVisible(true);
  //   }
  // }
  // console.log(BUTTON[screen], screen, signInParam, 'screen button')

  return (
    <SafeAreaView style={{flex:1}}>
      <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top, }}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Image source={Images.LOGO_DOCKIT} resizeMode='center' style={{ marginTop: normalizeVertical(50), width: normalize(150), height: normalize(150), justifyContent: 'center', alignSelf: 'center' }} />
          {(signInParam && screen === SCREENS.lockScreen) || screen === SCREENS.forgetPin ? <View style={{ justifyContent: 'center', flexDirection: 'column', }}>
            {signInParam && screen !== SCREENS.forgetPin ? <Text style={{ ...styles.signup, height: normalizeVertical(50), marginBottom: normalizeVertical(30) }} >Login</Text> : null}
            {(screen === SCREENS.forgetPin) ? <Text style={{ fontSize: 15, color: 'white', fontWeight: '400', alignSelf: 'flex-start', marginTop: normalizeVertical(50), height: normalizeVertical(30), }}>Enter Your Registered Phone Number :</Text> : null}
            <TouchableOpacity style={[styles.mobileInputView,
              // errors.phoneNo &&
              // touched?.phoneNo && {
              //     borderColor: '#ff00009c',
              //     borderWidth: 2
              // },
            ]}>

              <PhoneInput
                ref={phoneInput}
                defaultValue={phone}
                defaultCode="IN"
                onChangeFormattedText={(text) => {
                  const formattedPhoneNumberWithoutCountryCode = text.replace(/^(\+\d{1,2})/, '');
                  setPhone(formattedPhoneNumberWithoutCountryCode)
                }}
                disableArrowIcon={true}
                containerStyle={styles.phoneInputContainer}
                textContainerStyle={styles.phoneInputTextContainer}
                textInputStyle={styles.phoneInputTextStyle}
                textInputProps={{
                  maxLength: 15,
                  placeholder: 'Phone Number',
                  placeholderTextColor: 'black'
                }}
                // codeTextStyle={{fontSize: 17}}
                flagButtonStyle={{ right: 0.5, paddingBottom: 2 }}
                keyboardType="number-pad"
              // onChangeText={handleChange('phoneNo')}
              // onBlur={handleBlur('phoneNo')}
              />
            </TouchableOpacity>
          </View> : null}

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
              // setError(false)
            }}
            cellCount={CELL_COUNT}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={renderCell}
          /> : null}

          <TouchableOpacity onPress={buttonFunction} style={styles.button} disabled={loading}>
            {loading ? (
              <ActivityIndicator color='white' />
            ) : (
              <Text style={styles.buttonText}>{(signInParam && screen === SCREENS.lockScreen) ? 'LOGIN' : BUTTON[screen]}</Text>
            )}
          </TouchableOpacity>
        </View>
        {screen === SCREENS.lockScreen ? (
          <View style={{ justifyContent: 'center', alignSelf: 'flex-end', marginRight: normalize(20), marginTop: normalize(10), flexDirection: 'row' }}>
            {signInParam ? <>
              <Text style={{ color: 'black' }}> Don't have account?    </Text>
              <TouchableOpacity onPress={handleSighUP}>
                <Text style={{ color: 'white', fontWeight: 'bold', marginRight: normalize(8) }}>SIGN UP</Text>
              </TouchableOpacity>
              <Text style={{ color: 'white' }}>/</Text>
            </> : null}
            <TouchableOpacity onPress={handleForgetPin}>
              <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: normalize(8) }}>FORGET PIN</Text>
            </TouchableOpacity>
            {/* <Text onPress={() => navigation.navigate('RegistrationPage')}>i</Text> */}
          </View>
        ) : null}
        
      </ImageBackground>
      <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.Snackbar}
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
  cell: {
    width: normalize(40),
    height: normalize(40),
    fontSize: 30,
    fontWeight: '500',
    textAlign: 'center',
    marginLeft: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#e3e3e3cc',
    paddingVertical: 2
  },
  toggle: {
    width: normalize(30),
    height: normalize(30),
    marginBottom: 20,
    marginTop: 10,
  },
  focusCell: {
    borderColor: '#000',
  },
  Snackbar: {
    backgroundColor: 'rgb(195,0,0)',
    // color: 'white',
  },
  phoneInputContainer: {
    backgroundColor: 'transparent',
    right: 10,
  },
  phoneInputTextContainer: {
    backgroundColor: 'transparent',
    right: 35,
    paddingTop: normalize(12),
  },
  phoneInputTextStyle: {
    paddingRight: normalize(8),
    position: 'absolute',
    width: screenWidth * 0.58,
    fontSize: 16,
    fontWeight: '600',
    left: 45,
    color: 'black',
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
    // marginBottom: normalize(15),
    // borderWidth: normalize(1),
    borderColor: COLORS.gray,
    // alignItems: FONTALIGNMENT.center,
    // marginTop: normalize(30),
    marginBottom: normalize(0)
  },
  signup: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    // marginVertical: normalize(0),
    alignSelf: 'center',
  },
});


export default LockScreen;
