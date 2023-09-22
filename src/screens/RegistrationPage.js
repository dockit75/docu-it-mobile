import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image, ScrollView, ActivityIndicator, } from 'react-native';
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

const RegistrationPage = ({ navigation }) => {
    const [phoneNo, setPhoneNo] = useState('');
    const [isLogedIn, setIsLogedIn] = useState(true);
    const formikRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(); // Initially value
    const options = ['Male', 'Female'];
    const [uniqueId, setUniqueId] = useState('')
    const insets = useSafeAreaInsets();
    const phoneInput = useRef(null);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const selectOption = (option) => {
        setSelectedOption(option);
        setIsOpen(false);
    };

    const isAuthenticated = useSelector((state) => state.user);
    // console.log('--respage ---redux--', isAuthenticated );
    const initialValues = {
        userName: '',
        phoneNo: '',
        emailId: '',
        gender: ''
    };

    const cleanTextFields = () => {
        phoneInput.current.setState({ number: '' })
    };

    useEffect(() => {
        (async () => {
            const id = await DeviceInfo.getUniqueId();
            setUniqueId(id);
            const data = await retrieveUserSession();
            console.log('****regpage***', data);
            // if (!data?.phoneNo) {
            //     console.log('InValid');
            //     setIsLogedIn(false);
            // } else {
            //     setIsLogedIn(true);
            //     navigation.navigate('LockScreen', { values: phoneNo });
            // }
        })();
    }, []);

    useEffect(() => {
        handleRegistration()
    }, [])

    const loginValidationSchema = yup.object().shape({
        userName: yup.string().required(' Please enter your username'),
        phoneNo: yup.string().required('Please enter your phonenumber').min(10, 'Phone number must be 10 digits'),
        emailId: yup.string().email('Invalid email address').required('Please enter your email'),
        gender: yup.string().required('Please choose your gender'),
    });
    const deviceId = DeviceInfo.getUniqueId();
    const handleRegistration = async (values, { resetForm }) => {
        try {
            setIsLoading(true); // Show the loader
            dispatch(setUser(values));
            const payload = {
                name: values.userName,
                email: values.emailId,
                gender: values.gender,
                phone: values.phoneNo,
                deviceId: uniqueId.toString() + 'h5p'
            }
            await storeUserSession({ ...payload, isAuthenticated: true });
            NetworkManager.signUp(payload).then(res => {
                if (res.data.code === 200) {

                    navigation.navigate("OTPVerification", { userData: values })
                    cleanTextFields();
                    resetForm();
                }
            }).catch(error => {
                console.error('error', error.response);
            })
        } catch (error) {
            console.error('error', error);
        } finally {
            setIsLoading(false); // Hide the loader when done
        }
    };

    // if (isLogedIn) {
    //     return null
    // }

    const handleGender = (setFieldValue, option) => {
        setIsOpen(false)
        setFieldValue('gender', option)
    }

    const handleLogin = (resetForm) => {
        navigation.navigate('LockScreen',{signInParam: false})
        resetForm();
        cleanTextFields();
    }

    return (
        <ScrollView>
            <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top, }}>
                <Image source={Images.LOGO_DOCKIT} resizeMode='center' style={{ width: 100, height: 100, marginTop: normalize(60), alignSelf: 'center' }} />
                <Text style={styles.signup} >Registration</Text>
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
                                        placeholderTextColor: 'black'
                                    }}
                                    // codeTextStyle={{fontSize: 17}}
                                    flagButtonStyle={{ right: 0.5, paddingBottom: 2 }}
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
                                        <Image source={Images.DROPDOWN_UP} style={styles.icon} />
                                    ) : (
                                        <Image source={Images.DROPDOWN} style={styles.icon} />
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
                            <TouchableOpacity style={styles.button} onPress={() => handleSubmit(values, resetForm)} disabled={isLoading}>
                                {isLoading ? (
                                    <ActivityIndicator color='white' /> // Show loader while loading
                                ) : (
                                    <Text style={styles.buttonText}>SUBMIT</Text>
                                )}
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', marginBottom: normalize(20) }}>
                                <Text style={{ color: 'black' }}>Already have an accound?</Text>
                                <TouchableOpacity onPress={() => handleLogin(resetForm)}>
                                    <Text style={{ color: 'black', fontWeight: 'bold', borderBottomWidth: 0 }}> LOGIN</Text>
                                </TouchableOpacity>
                            </View>
                            {(errors.userName && touched.userName) || (errors.phoneNo && touched.phoneNo) || (errors.emailId && touched.emailId) || (errors.gender && touched.gender) ? (<Text style={styles.errorText}>{errors.userName || errors.phoneNo || errors.emailId || errors.gender}</Text>) : null}
                        </View>
                    )}
                </Formik>
            </ImageBackground>
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
        fontSize: 15
    },
    button: {
        // backgroundColor: '#0e9b81',
        // width: screenWidth - normalize(30),
        // alignSelf: 'center',
        // height: normalizeVertical(50),
        // borderRadius: normalize(25),
        // elevation: 5,
        // marginTop: normalize(30),
        // marginBottom: normalize(10)
        backgroundColor: '#0e9b81',
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
        // borderWidth: normalize(1),
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
        fontSize: 15,
        fontWeight: '600',
        left: 45,
        color: 'black'
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
        marginVertical: normalize(5)
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