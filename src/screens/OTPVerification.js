import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { normalize, normalizeVertical, screenHeight, screenWidth } from '../utilities/measurement';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { COLORS } from '../utilities/colors';
import { Images } from '../assets/images/images';
import PhoneInput from 'react-native-phone-number-input';
import { FONTALIGNMENT } from '../utilities/Fonts';
import NetworkManager from '../services/NetworkManager';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { retrieveUserSession} from '../storageManager';
import { Snackbar } from 'react-native-paper';

  const CELL_COUNT = 5;
  const OTPVerification = ({ route, navigation }) => {
  const userData = route?.params?.userData;
  const [verificationMethod, setVerificationMethod] = useState('email');
  const [error, setError] = useState(false)
  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({ ...value, cellCount: CELL_COUNT });
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const [loading,setLoading] = useState(false)
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Get the unique device ID when the component mounts
    const fetchUniqueId = async () => {
      const data = await retrieveUserSession();
              console.log('****regpage***', data);
    };
    fetchUniqueId();
  }, []);

  useEffect(() => {
    if (value.trim().length === 5) {
      handleSubmit()
    }
  },[value]);

  const handleSubmit = async () => {
    try {
      if (value.trim().length === 0) {
        // Empty value, show a specific message
        setSnackbarMessage('Please enter the OTP');
        setSnackbarVisible(true);
      } else if (value.length <= 5) {
        let payload = {};
        if (verificationMethod === 'email') {
          setLoading(true)
          payload = {
            email: userData.emailId,
            code: value
          };
        } else {
          setLoading(true)
          payload = {
            phone: userData?.phoneNo,
            code: value
          };
        }
        const res = await NetworkManager.verifyEmail(payload, verificationMethod);
  
        if (res.status === 200) {
          setValue('');
          navigation.navigate("PinGenerationScreen");
        } else {
          // Handle other HTTP status codes or error responses here
          setSnackbarMessage('Invalid OTP. Please try again.');
          setSnackbarVisible(true);
        }
      } else {
        // Invalid OTP, show a specific message
        setSnackbarMessage('Invalid OTP. Please try again.');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('error', error);
      // You can customize the error message here if needed
      setSnackbarMessage('Invalid PIN');
      setSnackbarVisible(true);
    }finally {
      setLoading(false); // Stop loading
    }
  };
  
  const handleResentCode = () => {
    try {
      payload = {
        email: userData?.emailId,
        code: value
      }
      NetworkManager.emailResendOtp(userData?.emailId)
    } catch (error) {
      console.error('error', error);
    }
  }

  const handleToggleMethod = () => {
    setVerificationMethod(verificationMethod === 'email' ? 'Phone Number' : 'email')
    setError(false)
    setValue('')
  }

  return (
    <SafeAreaView style={styles.root}>
      <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top }}>
        <KeyboardAvoidingView>
          <Image source={Images.LOGO_DOCKIT} resizeMode='center' style={{ justifyContent: 'center', alignSelf: 'center' }} />
          <View style={styles.container}>
            {verificationMethod === 'Phone Number' ? (
              <View style={styles.mobileInputView}>
                <PhoneInput
                  defaultCode="IN"
                  disableArrowIcon={true}
                  disabled={true}
                  // layout='second'
                  defaultValue={userData?.phoneNo}
                  containerStyle={styles.phoneInputContainer}
                  textContainerStyle={styles.phoneInputTextContainer}
                  textInputStyle={styles.phoneInputTextStyle}
                  codeTextStyle={{ fontSize: 18 }}
                //  flagButtonStyle={{right: 0.5}}
                />
              </View>
            ) : (
              <View style={styles.emailId}>
                <Text style={{ fontSize: 18, color: 'black', fontWeight: '500', letterSpacing: 1 }}>{userData?.emailId}</Text>
              </View>
            )}
            <View style={styles.otpContainer}>
              <CodeField
                ref={ref}
                {...props}
                value={value}
                onChangeText={(text) => {
                  setValue(text)
                  setError(false)
                }}
                cellCount={CELL_COUNT}
                rootStyle={styles.codeFieldRoot}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                renderCell={({ index, symbol, isFocused }) => (
                  <Text
                    key={index}
                    style={[styles.cell, isFocused && styles.focusCell]}
                    onLayout={getCellOnLayoutHandler(index)}>
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </Text>
                )}
              />
            </View>
            <View style={{ flexDirection: 'row', alignSelf: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'white', }}>Didn't get the code?</Text>
              <TouchableOpacity onPress={handleResentCode}><Text style={{ color: 'white', fontWeight: 'bold', borderBottomWidth: 0 }}> Resend Code</Text></TouchableOpacity>
            </View>
            <View style={{ marginVertical: normalize(20) }}>
              {/* {error ? <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', letterSpacing: 1.5, }}>{error}</Text> : null} */}
            </View>
           
              <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
               {loading ? (
                       <ActivityIndicator color='white' />
               ) : (
                <Text style={styles.buttonText}>
                {`VERIFY ${verificationMethod === '' ? '' : ''}`}
              </Text>
               )             
               }
              </TouchableOpacity>
        
            <View >
              <TouchableOpacity onPress={handleToggleMethod}>
                <Text style={styles.buttonText1}>
                  {`Verify with ${verificationMethod === 'email' ? 'Phone Number' : 'email'}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </KeyboardAvoidingView>
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
  root: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: normalize(20),
  },
  signupScreen: {
    marginVertical: normalize(10),
    fontWeight: 'bold',
    justifyContent: 'center',
    color: 'white'
  },
  signupText: {
    marginVertical: normalize(10),
    fontWeight: 'bold',
    color: COLORS.white,
    borderBottomColor: 'white',
    borderBottomWidth: 1,
  },
  codeFieldRoot: {
    padding: normalize(5),
  },
  cell: {
    width: normalize(40),
    height: normalize(40),
    fontSize: 20,
    borderWidth: 1,
    textAlign: 'center',
    borderRadius: 10,
    alignSelf: 'center',
    paddingVertical: normalize(7),
    color: 'black',
    backgroundColor: '#e3e3e3cc'
  },
  focusCell: {
    borderColor: COLORS.white,
    textAlign: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  phoneNumbertext: {
    fontSize: 18,
    marginStart: 10,
    marginVertical: normalize(10),
    color: COLORS.black,
    fontWeight: 'bold'
  },
  phoneNumberContainer: {
    width: screenWidth - normalize(30),
    height: normalizeVertical(50),
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 5
  },
  otpContainer: {
    borderRadius: normalize(5),
    marginBottom: 15,
    width: screenWidth - normalize(40),
    height: normalizeVertical(50),
    paddingHorizontal: normalize(35),
    marginVertical: normalizeVertical(50),
  },
  textInput: {
    fontSize: 18,
    marginStart: 10
  },
  button: {
    backgroundColor: '#0e9b81',
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth - normalize(30),
    height: normalizeVertical(50),
    borderRadius: normalize(60),
    elevation: 20,
    marginVertical: normalize(30),
  },
  changeOptionButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    color: 'white',
    letterSpacing: 1.8,
    fontSize: 18,
    fontWeight: '800',
  },
  buttonText1: {
    alignSelf: 'center',
    color: 'black',
    letterSpacing: 1,
    fontSize: 18,
    fontWeight: 'bold',
    borderBottomWidth: 0.5,
    borderBottomColor: 'black',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: normalize(20)
  },
  mobileInputView: {
    paddingLeft: normalize(50),
    width: screenWidth - normalize(60),
    height: normalizeVertical(50),
    borderRadius: normalize(50),
    backgroundColor: '#e3e3e3cc',
    borderWidth: normalize(1),
    alignItems: FONTALIGNMENT.center,
  },
  emailId: {
    justifyContent: 'center',
    width: screenWidth - normalize(50),
    height: normalizeVertical(50),
    borderRadius: normalize(50),
    backgroundColor: '#e3e3e3cc',
    alignItems: FONTALIGNMENT.center,
  },
  phoneInputContainer: {
    backgroundColor: 'transparent',
    width: screenWidth * 0.65,
  },
  phoneInputTextContainer: {
    height: screenHeight * 0.06,
    backgroundColor: 'transparent',
    right: 35,
    paddingTop: normalize(12),
  },
  phoneInputTextStyle: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: '500',
    left: 48,
    color: 'black',
    letterSpacing: 0.5
  },
  phoneCountryFlag: {
    width: 'auto',
    padding: normalize(14),
    paddingRight: 0
  },
  Snackbar: {
    backgroundColor: 'rgb(195,0,0)',
    color: 'white',
  }
});

export default OTPVerification;