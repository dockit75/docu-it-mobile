import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { retrieveUserSession } from '../storageManager';
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


const CELL_COUNT = 4;
const LockScreen = ({ navigation, route }) => {
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

  useEffect(() => {
    (async () => {
      try {
        const data = await retrieveUserSession();
        console.log(data, 'data...')
        setUniqueId(data.deviceId);
        setPhone(data.phone)
        setIsAuthenticated(data.isAuthenticated === true);
        // handlePinEntry(data);
      } catch (error) {
        console.error('Error in useEffect:', error);
      }
    })();
  }, []);

  useEffect(() => {
    if (value.length === 4) {
      handlePinEntry()
    }
  }, [value]);

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
        console.log(isForgotPin)
        if (isForgotPin) {
          setLoading(true); // Start loading
          const payload = {
            phone: phone,
            verifyPin: value,
          };
          const verifyPinResponse = await NetworkManager.verifyPin(payload);
          if (verifyPinResponse.data.code === 200) {
            // If verification is successful, navigate to the destination screen
            navigation.navigate('PinGenerationScreen', { fromForget: true });
            setValue('');
            setIsForgotPin(false);
          } else {
            setSnackbarMessage('Invalid PIN. Please try again.');
            setSnackbarVisible(true);
          }
        } else {
          setLoading(true); // Start loading
          // Call the login API here
          const loginResponse = await NetworkManager.login({
            deviceId: uniqueId,
            password: value,
          });
          if (loginResponse.data.code === 200) {
            // If login is successful, navigate to the dashboard screen
            navigation.navigate('Dashboard', { userData: value });
            setValue('');
          } else {
            setSnackbarMessage('Invalid credentials. Please try again.');
            setSnackbarVisible(true);
          }
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

  const handleSendOtp = async () => {
    try {
      setIsForgotPin(true);
      setValue('')
      setLoading(true); // Start loading
      NetworkManager.forgotPin(phone).then(res => {
        console.log(res, 'res......')
        if (res.data.code === 200) {
          console.log(res.data.message, 'OTP Send  Success')
          setSnackbarMessage('A PIN reset link has been sent to your registered mobile/email id');
          setSnackbarVisible(true);
        }
      })
    } catch (error) {
      console.log(error, 'error')
    } finally {
      setLoading(false); // Stop loading
    }
  }
  const handleForgetPin = () => {
    setIsSendOtp(true)
  }

  // const handleSignUp = () => {
  //   if (isAuthenticated === false) {
  //     navigation.navigate('RegistrationPage')
  //   } else {
  //     setSnackbarMessage('Cant able to login more than 1 account');
  //     setSnackbarVisible(true);
  //   }
  // }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top, }}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Image source={Images.LOGO_DOCKIT} resizeMode='center' style={{ justifyContent: 'center', alignSelf: 'center' }} />
          <View style={{ flexDirection: 'row', marginLeft: normalize(20) }}>
            <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold', padding: 10 }}>{isForgotPin ? 'Enter OTP' : 'Enter PIN'}</Text>
            <TouchableOpacity onPress={toggleMask} style={{ padding: 10 }}>
              {enableMask ? (
                <Icon name='eye' size={24} color="white" />
              ) : (
                <Icon name="eye-slash" size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {isSendOtp ? <PhoneInput
              // ref={phoneInput}
              // defaultValue={values.phoneNo}
              defaultCode="IN"
              onChangeFormattedText={(text) => {
                // setPhoneNo(text)
              }}
              disableArrowIcon={true}
              containerStyle={styles.phoneInputContainer
              }
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
            /> : <CodeField
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
            />}
          </View>
          <TouchableOpacity onPress={handlePinEntry} style={styles.button} disabled={loading}>
            {loading ? (
              <ActivityIndicator color='white' />
            ) : (
              <Text style={styles.buttonText}>{isSendOtp && isForgotPin ? 'VERIFY' : isSendOtp ? 'SEND OTP' : 'CONTINUE'}</Text>
            )}
          </TouchableOpacity>
        </View>
        {!isForgotPin && (
          <View style={{ justifyContent: 'center', alignSelf: 'flex-end', marginRight: normalize(30), marginTop: normalize(10), flexDirection: 'row' }}>
            <TouchableOpacity onPress={handleForgetPin}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Forget PIN</Text>
            </TouchableOpacity>
            {/* <Text onPress={() => navigation.navigate('RegistrationPage')}> regi</Text> */}
          </View>
        )}
      </ImageBackground>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
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
    marginTop: 40
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
  }
});


export default LockScreen;
