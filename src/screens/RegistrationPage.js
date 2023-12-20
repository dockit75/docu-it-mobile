import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image, ScrollView, ActivityIndicator, TouchableWithoutFeedback, Platform, } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import { normalize, normalizeVertical, screenHeight, screenWidth } from '../utilities/measurement';
import DeviceInfo from 'react-native-device-info';
import { retrieveUserSession, storeUserSession } from '../storageManager';
import { useDispatch, useSelector } from 'react-redux';
import { Images } from '../assets/images/images';
import PhoneInput from "react-native-phone-number-input";
import { FONTALIGNMENT } from "../utilities/Fonts";
import { COLORS } from "../utilities/colors";
import NetworkManager from '../services/NetworkManager';
import { setUser } from '../slices/UserSlices';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Snackbar } from 'react-native-paper';
import SplashScreen from 'react-native-splash-screen';
import SmsRetriever from 'react-native-sms-retriever';
import CheckBox from '@react-native-community/checkbox';
import { APP_BUTTON_NAMES, LOGIN } from '../utilities/strings';
const RegistrationPage = ({ navigation }) => {
    const [phoneNo, setPhoneNo] = useState('');
    const [isLogedIn, setIsLogedIn] = useState(true);
    const formikRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(); // Initially value
    const options = LOGIN.genderOptions;
    const [uniqueId, setUniqueId] = useState('')
    const insets = useSafeAreaInsets();
    const phoneInput = useRef(null);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [checked, setChecked] = useState(false)
    const [initialValues, setInitialValue] = useState({
        userName: '',
        phoneNo: '',
        emailId: '',
        gender: ''
    })
    const scrollRef = useRef()

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (isOpen) {
            scrollRef.current.scrollToEnd()
        }
    }, [isOpen])

    const selectOption = (option) => {
        setSelectedOption(option);
        setIsOpen(false);
    };

    const isAuthenticated = useSelector((state) => state.user);

    const cleanTextFields = () => {
        phoneInput.current.setState({ number: '' })
    };

    useEffect(() => {
        (async () => {
            const id = await DeviceInfo.getUniqueId();
            setUniqueId(id);
            const data = await retrieveUserSession();
        })();
        SplashScreen.hide()
    }, []);

    useEffect(() => {
        handleRegistration()
        Platform.OS === 'android' && getPhoneNumbers()
    }, [])

    const getPhoneNumbers = async () => {
        try {
            const phoneNumber = await SmsRetriever.requestPhoneNumber();
            setInitialValue(prev => prev = { ...prev, phoneNo: phoneNumber?.substr(phoneNumber.length - 10, phoneNumber.length) })
            initialValues.phoneNo = phoneNumber?.substr(phoneNumber.length - 10, phoneNumber.length)
            phoneInput.current.setState({ number: phoneNumber?.substr(phoneNumber.length - 10, phoneNumber.length) })
        } catch (error) {
            // console.log('getPhoneNumbers *******',error);
        }
    }

    const loginValidationSchema = yup.object().shape({
        userName: yup.string().required(' Please enter your name'),
        phoneNo: yup.string().required('Please enter your phonenumber').min(10, 'Phone number must be 10 digits'),
        emailId: yup.string().email('Invalid email address').required('Please enter your email'),
        gender: yup.string().required('Please choose your gender'),
    });
    const deviceId = DeviceInfo.getUniqueId();
    const handleRegistration = async (values, { resetForm }) => {
        try {
            setIsLoading(true);
            const payload = {
                name: values.userName,
                email: values.emailId,
                gender: values.gender,
                phone: values.phoneNo,
                deviceId: uniqueId.toString() + 'h5p'
            }
            NetworkManager.signUp(payload).then(async res => {
                if (res.data.code === 200) {
                    dispatch(setUser(values));
                    await storeUserSession({ ...payload, isAuthenticated: true });
                    navigation.navigate("OTPVerification", { userData: values })
                    cleanTextFields();
                    resetForm();
                    setIsLoading(false);
                }
            }).catch(error => {
                setIsLoading(false);
                console.error('error ------', error.response.data);
                if (error?.response?.data?.message) {
                    setSnackbarMessage(error.response.data.message);
                    setSnackbarVisible(true);
                }
            })
        } catch (error) {
            setIsLoading(false);
            console.error('error', error.response);
        }
    };

    const handleGender = (setFieldValue, option) => {
        setIsOpen(false)
        setFieldValue('gender', option)
    }

    const handleLogin = (resetForm) => {
        navigation.navigate('LockScreen', { signInParam: false })
        resetForm();
        cleanTextFields();
    }

    return (
        <ScrollView ref={scrollRef}>
            <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
                <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top, }}>
                    <Image source={Images.LOGO_DOCKIT} resizeMode='center' style={{ width: 100, height: 100, marginTop: normalize(60), alignSelf: 'center' }} />
                    <Text style={styles.signup} >{LOGIN.title}</Text>
                    <Formik innerRef={formikRef} validationSchema={loginValidationSchema} initialValues={initialValues} onSubmit={(values, resetForm) => { handleRegistration(values, resetForm) }}>
                        {({ values, handleChange, handleBlur, errors, handleSubmit, touched, resetForm, isSubmitting, setFieldValue }) => (
                            <View style={styles.container}>
                                <View>
                                    <TextInput
                                        placeholder="Name"
                                        placeholderTextColor='black'
                                        onChangeText={handleChange('userName')}
                                        onBlur={handleBlur('userName')}
                                        value={values.userName}
                                        style={[styles.input, errors.userName &&
                                            touched?.userName && {
                                            borderColor: '#ff00009c',
                                            borderWidth: 2
                                        },]}
                                        onFocus={() => setIsOpen(false)}
                                    />
                                </View>
                                <TouchableOpacity style={[styles.mobileInputView,
                                errors.phoneNo &&
                                touched?.phoneNo && {
                                    borderColor: '#ff00009c',
                                    borderWidth: 2
                                },]}>
                                    <PhoneInput
                                        ref={phoneInput}
                                        defaultValue={values.phoneNo}
                                        defaultCode="IN"
                                        onChangeFormattedText={(text) => {
                                            setPhoneNo(text)
                                        }}
                                        disableArrowIcon={true}
                                        containerStyle={styles.phoneInputContainer
                                        }
                                        textContainerStyle={styles.phoneInputTextContainer}
                                        textInputStyle={styles.phoneInputTextStyle}
                                        textInputProps={{
                                            maxLength: 15,
                                            placeholder: 'Phone Number',
                                            placeholderTextColor: 'black',
                                            onFocus: () => setIsOpen(false)
                                        }}
                                        flagButtonStyle={{ right: 0.5, paddingBottom: 2 }}
                                        codeTextStyle={{ height: normalize(18), marginBottom: 0 }}
                                        keyboardType="number-pad"
                                        onChangeText={handleChange('phoneNo')}
                                        onBlur={handleBlur('phoneNo')}
                                    />
                                </TouchableOpacity>
                                <View>
                                    <TextInput
                                        placeholder="Email"
                                        placeholderTextColor='black'
                                        onChangeText={handleChange('emailId')}
                                        onBlur={handleBlur('emailId')}
                                        value={values.emailId}
                                        style={[styles.input, errors.emailId &&
                                            touched?.emailId && {
                                            borderColor: '#ff00009c',
                                            borderWidth: 2,
                                        },]}
                                        keyboardType="email-address"
                                        onFocus={() => setIsOpen(false)}
                                    />
                                </View>
                                <View>
                                    <TouchableOpacity style={[styles.dropdownContainer,
                                    errors.gender && touched?.gender && {
                                        borderColor: '#ff00009c',
                                        borderWidth: 1.5
                                    }]}
                                        onBlur={handleBlur('gender')}
                                        onPress={toggleDropdown}>
                                        <Text style={[styles.selectedOption, values.gender && { color: 'black', fontWeight: '600' }]}>{values.gender || 'Choose Gender'}</Text>
                                        {isOpen ? (
                                            <Icon name="chevron-up" size={30} color="black" style={styles.icon} />
                                        ) : (
                                            <Icon name="chevron-down" size={30} color="black" style={styles.icon} />
                                        )
                                        }
                                    </TouchableOpacity>
                                    {isOpen && (
                                        <View style={styles.optionsContainer}>
                                            {options.map((option) => (
                                                <TouchableOpacity
                                                    key={option}
                                                    style={styles.optionItem}
                                                    onPress={() => handleGender(setFieldValue, option)}                                                    >
                                                    <Text style={styles.text} >
                                                        {option}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                                <View style={{  flexDirection: 'row', justifyContent: 'flex-start',  marginTop:10, width: screenWidth, paddingHorizontal: 20, alignItems: 'center',zIndex:-1 }}>
                                    <View>
                                        <CheckBox 
                                            boxType='square'
                                            tintColors={{ true: COLORS.brandBlue, false: COLORS.lightGray }}
                                            onCheckColor="green"
                                            onTintColor="green"
                                            onAnimationType="fill"
                                            value={checked}
                                            onValueChange={() => setChecked(!checked)}
                                            size={10}
                                            style={{width:20,height:20}}
                                        />
                                        </View>
                                        <View style={{flexDirection:'row',alignItems:'center', marginLeft:5}} >
                                            <Text style={{ fontSize: 12, color: COLORS.black }}>{LOGIN.termsAndCondtion[0]}</Text>
                                            <TouchableOpacity>
                                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: 'black',borderBottomColor:'black',borderBottomWidth:2}}>{LOGIN.termsAndCondtion[1]}</Text>
                                            </TouchableOpacity>
                                            <Text style={{ fontSize: 12, color: COLORS.black }}> &</Text>
                                            <TouchableOpacity>
                                            <Text  style={{ fontSize: 13, fontWeight: 'bold', color: 'black',borderBottomColor:'black',borderBottomWidth:2 }}>{LOGIN.termsAndCondtion[3]}</Text>
                                            </TouchableOpacity>
                                        </View>
                                </View>
                                <TouchableOpacity style={[styles.button, isOpen && { zIndex: -1 },{backgroundColor:checked ? '#0e9b81': 'gray',}]} onPress={() => checked ? handleSubmit(values, resetForm):null} disabled={isLoading}>
                                    {isLoading ? (
                                        <ActivityIndicator color='white' /> // Show loader while loading
                                    ) : (
                                        <Text style={styles.buttonText}>{APP_BUTTON_NAMES.submit}</Text>
                                    )}
                                </TouchableOpacity>
                                <View style={{ flexDirection: 'row', marginBottom: normalize(20),zIndex: -1, }}>
                                    <Text style={{ color: 'black' }}>{LOGIN.alreadyHaveAccount}</Text>
                                    <TouchableOpacity onPress={() => handleLogin(resetForm)}>
                                        <Text style={{ color: 'black', fontWeight: 'bold', borderBottomWidth: 0 }}>{LOGIN.signIn}</Text>
                                    </TouchableOpacity>
                                </View>
                                {(errors.userName && touched.userName) || (errors.phoneNo && touched.phoneNo) || (errors.emailId && touched.emailId) || (errors.gender && touched.gender) ? (<Text style={styles.errorText}>{errors.userName || errors.phoneNo || errors.emailId || errors.gender}</Text>) : null}
                            </View>
                        )}
                    </Formik>
                    <Snackbar
                        visible={snackbarVisible}
                        onDismiss={() => setSnackbarVisible(false)}
                        duration={3000}
                        style={[styles.Snackbar, snackbarMessage === 'A PIN reset link has been sent to your registered mobile/email id' && { backgroundColor: '#0e9b81' }]}
                    >
                        {snackbarMessage}
                    </Snackbar>
                </ImageBackground>
            </TouchableWithoutFeedback>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    errorText: {
        marginLeft: normalize(15),
        fontWeight: '500',
        color: 'red',
        fontSize: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: normalize(5),
        marginBottom: 15,
        width: screenWidth - normalize(30),
        height: normalizeVertical(50),
        alignSelf: 'center',
        backgroundColor: '#e3e3e3cc',
        letterSpacing: 1.5,
        paddingHorizontal: normalizeVertical(20),
        marginVertical: normalizeVertical(4),
        fontWeight: '600',
        fontSize: 15,
        color:'black'
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        width: screenWidth - normalize(30),
        alignSelf: 'center',
        height: normalizeVertical(50),
        borderRadius: normalize(25),
        elevation: 20,
        marginTop: 30,
        marginBottom: normalize(10)
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
    signup: {
        fontSize: 30,
        color: 'white',
        fontWeight: 'bold',
        marginVertical: normalize(40),
        alignSelf: 'center',
    },
    mobileInputView: {
        paddingLeft: normalize(10),
        width: screenWidth - normalize(30),
        height: normalizeVertical(50),
        borderRadius: normalize(5),
        backgroundColor: '#e3e3e3cc',
        marginBottom: normalize(15),
        borderColor: COLORS.gray,
        alignItems: FONTALIGNMENT.center,
        marginVertical: normalizeVertical(4),
    },
    phoneInputContainer: {
        backgroundColor: 'transparent',
        right: 30,
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
        left: 50,
        color: 'black',
        top: 12
    },
    phoneCountryFlag: {
        width: 'auto',
        padding: normalize(14),
        paddingRight: 10
    },
    errorPhoneNo: {
        right: 80,
        fontWeight: 'bold',
        color: 'red',
        fontSize: 15,
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: normalize(5),
        width: screenWidth - normalize(30),
        height: normalizeVertical(50),
        alignSelf: 'center',
        backgroundColor: '#e3e3e3cc',
        letterSpacing: 1.5,
        paddingHorizontal: normalizeVertical(20),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: normalize(5),
        // position: 'relative'
    },
    selectedOption: {
        fontSize: 15,
        fontWeight: '600',
        color: 'black'
    },
    optionsContainer: {
        borderWidth: 0.1,
        borderRadius: 5,
        backgroundColor: '#3C3C43CC',
        marginTop: normalize(10),
        width: screenWidth - normalize(30),
        position: 'absolute',
        top: 0
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
    icon: {
        width: 28,
        height: 28,
    }
});

export default RegistrationPage;