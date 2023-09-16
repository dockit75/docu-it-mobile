import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ImageBackground, Image, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../slices/UserSlices';
import { retrieveCurrentScreen, retrieveUserSession, storeCurrentScreen, storeUserSession } from '../storageManager';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell, } from 'react-native-confirmation-code-field';
import { normalize, normalizeVertical, screenHeight, screenWidth } from '../utilities/measurement';
import { Images } from '../assets/images/images';
import NetworkManager from '../services/NetworkManager';
import DeviceInfo from 'react-native-device-info';
import { Snackbar } from 'react-native-paper';
import { COLORS } from '../utilities/colors';
import { useSafeAreaInsets} from 'react-native-safe-area-context';
import RegistrationPage from './RegistrationPage';

const CELL_COUNT = 4;

const LockScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  // const isForgotPin = route?.params?.userData;
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
  const [phone, setPhone] = useState('')// Track if in "Forgot PIN" mode
  const insets = useSafeAreaInsets();
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await retrieveUserSession();
        console.log(data, 'data...,,,????')
        // const id = await DeviceInfo.getUniqueId();
        setUniqueId(data.deviceId);
        setPhone(data.phone)
        setIsAuthenticated(data.isAuthenticated === true);
        // handlePinEntry(data);
      } catch (error) {
        console.error('Error in useEffect:', error);
      }
    })();
  }, []);
  console.log(phone, uniqueId, '....>>>>>>>')

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
        console.log(isForgotPin,'....>>>>')
        if (isForgotPin) {
          // const data = await retrieveUserSession();
          // const phone = data.phoneNo

          const payload = {
            phone: phone,
            verifyPin: value,
          };
          // console.log(payload, 'payload....')
          // console.log(phone, '........')
          // Call the verifyPin API here
          const verifyPinResponse = await NetworkManager.verifyPin(payload);

          if (verifyPinResponse.data.code === 200) {
            // If verification is successful, navigate to the destination screen
            navigation.navigate('PinGenerationScreen',{fromForget: true});
            setValue('')
            setIsForgotPin(false)
          } else {
            setSnackbarMessage('Invalid PIN. Please try again.');
            setSnackbarVisible(true);
          }
        } else {
          // Call the login API here
          const loginResponse = await NetworkManager.login({
            deviceId: uniqueId,
            password: value,
          });

          if (loginResponse.data.code === 200) {
            // If login is successful, navigate to the dashboard screen
            navigation.navigate('Dashboard',{userData:value});
            setValue('')
          } else {
            setSnackbarMessage('Invalid credentials. Please try again.');
            setSnackbarVisible(true);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setSnackbarMessage('Invalid PIN');
        setSnackbarVisible(true);
      }
    } else {
      setSnackbarMessage('Please enter a 4-digit PIN.');
      setSnackbarVisible(true);
    }
  };

  const handleForgetPin = async () => {
    try {
      setIsForgotPin(true)
      NetworkManager.forgotPin(phone).then(res => {
        console.log(res,'res......')
        if (res.data.code === 200) {
          console.log(res.data.message, 'OTP Send  Success')
          setSnackbarMessage('A PIN reset link has been sent to your registered mobile/email id');
          setSnackbarVisible(true);
        }
      })

    } catch {
      console.log(error, 'error')
    }
  }

  const handleSignUp = () => {
        navigation.navigate('RegistrationPage') 
  } 



  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{width: screenWidth , height: screenHeight + insets.top,}}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Image source={Images.LOGO_DOCKIT} resizeMode='center' style={{ justifyContent: 'center', alignSelf: 'center' }} />
          <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold', padding: 10 }}>{isForgotPin ? 'Enter OTP' : 'Enter PIN'}</Text>
          <CodeField
            ref={ref}
            {...props}
            value={value}
            onChangeText={(text) => {
              setValue(text)
              setError(false)
            }}
            cellCount={CELL_COUNT}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={renderCell}
          />
          {error ? <Text style={{ color: 'red', fontSize: 16, fontWeight: 'bold', letterSpacing: 1.5, marginTop: 20 }}>{error}</Text> : null}
          <TouchableOpacity onPress={toggleMask}>
            {enableMask ? (
              <Image

                source={Images.EYEOpen} // Replace with the path to your open eye image
                style={styles.toggle}
              />
            ) : (
              <Image
                source={Images.EYEClose} // Replace with the path to your closed eye image
                style={styles.toggle}
              />
            )}
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={isForgotPin ? handleVerifyPin : handlePinEntry} style={styles.button}>
            <Text style={styles.buttonText}>{isForgotPin ? 'VERIFY' : 'UNLOCK'}</Text>
          </TouchableOpacity> */}

          <TouchableOpacity onPress={handlePinEntry} style={styles.button}>
            <Text style={styles.buttonText}>{isForgotPin ? 'VERIFY' : 'UNLOCK'}</Text>
          </TouchableOpacity>
        </View>
        {!isForgotPin && (
          // <View style={{ justifyContent: 'center', alignSelf: 'center', marginTop: normalize(20), flexDirection: 'row' }}>
          //   <TouchableOpacity onPress={() => setIsForgotPin(true)}>
          //     <Text style={{ fontSize: 16, color: 'white', }}>Forget PIN</Text>
          //   </TouchableOpacity>
          // </View>
          <View style={{ justifyContent: 'center', alignSelf: 'flex-end', marginRight: normalize(30), marginTop: normalize(10), flexDirection: 'row' }}>
            <Text style={{ color: 'black' }}>Didn't have an accounct?  </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={{ color: 'black', fontWeight: 'bold' }}>Sign UP</Text>
            </TouchableOpacity>
            <Text style={{ color: 'black' }}> / </Text>
            <TouchableOpacity onPress={handleForgetPin}>
              <Text style={{ color: 'black', fontWeight: 'bold', }} >Forget PIN?</Text>
            </TouchableOpacity>
            {/* <Text onPress={() => navigation.navigate('DocumentScannerScreen')}> hello</Text> */}
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
  // ...existing styles

  codeFieldRoot: {
    margin: normalize(20),
    padding: normalize(5),
    // borderColor: 'black',
    // borderWidth: 2,
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
    // lineHeight: normalize(55),
    fontSize: 30,
    fontWeight: '500',
    textAlign: 'center',
    marginLeft: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#e3e3e3cc',
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
    backgroundColor: COLORS.redIcon,
    color: 'white',
  }
});

export default LockScreen;
