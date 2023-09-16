import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,  Dimensions, ImageBackground, Image, ScrollView,  } from 'react-native';
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
import { SafeAreaView} from 'react-native-safe-area-context'
import { TouchableHighlight } from 'react-native-gesture-handler';

const RegistrationPage = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [isLogedIn, setIsLogedIn] = useState(true);
    const formikRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('Gender'); // Initially value
    const options = ['Male', 'Female'];
    const [currentValue, setCurrentValue] = useState()
    const [uniqueId, setUniqueId] = useState('')

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const selectOption = (option) => {
        setSelectedOption(option);
        setIsOpen(false);
    };

    const isAuthenticated = useSelector((state) => state.user);
    console.log('-------------------respage -----------redux--', isAuthenticated, isLogedIn);
    const initialValues = {
        userName: '',
        phoneNo: '',
        emailId: '',
        gender: ''
    };
    const dispatch = useDispatch();

    useEffect(() => {
        (async () => {
            const id = await DeviceInfo.getUniqueId();
            setUniqueId(id);
            const data = await retrieveUserSession();
            console.log('****************regpage**********', data);
            if (!data?.phoneNo) {
                console.log('InValid');
                setIsLogedIn(false);
            } else {
                setIsLogedIn(true);
                navigation.navigate('WelcomePage', { values: phoneNo });
            }
        })();
    }, []);
    const loginValidationSchema = yup.object().shape({
        userName: yup.string().required(' Please enter your username'),
        phoneNo: yup.string().required('Please enter your phoneno').min(10, 'Phone number must be 10 digits'),
        emailId: yup.string().email('Invalid email address').matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).required('Please enter your email'),
        gender: yup.string().required('Please choose your gender'),
    });
    const deviceId = DeviceInfo.getUniqueId();

    const handleRegistration = async (values) => {
        try {
            await storeUserSession({ ...values });
            dispatch(setUser(values));
            const payload = {
                name: values.userName,
                email: values.emailId,
                gender: values.gender,
                phone: values.phoneNo,
                deviceId: uniqueId.toString() + '9'
            }
            console.log(payload, 'payload....')
            // NetworkManager.signUp(payload).then(res => {
            //     if (res.data.code === 200) {
                    navigation.navigate("OTPVerification", { userData: values })
            //     }
            // })
        } catch (error) {
            console.error('error', error);
        }
    };

    if (isLogedIn) {
        return null
    }

    const handleGender = (setFieldValue, option) => {
        setIsOpen(false)
        setFieldValue('gender', option)
    }
    return (
        <SafeAreaView style={{ flex: 1, }}>
            <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={styles.Image}>
                <ScrollView>
                    <KeyboardAvoidingView>
                        <Image source={Images.LOGO_DOCKIT} resizeMode='center' style={{ justifyContent: 'center', alignSelf: 'center' }} />
                        <Formik innerRef={formikRef} validationSchema={loginValidationSchema} initialValues={initialValues} onSubmit={(values) => handleRegistration(values)}>
                            {({ values, handleChange, handleBlur, errors, handleSubmit, touched, resetForm, isSubmitting, setFieldValue }) => (
                                <View style={styles.container}>
                                    <View>
                                        <Text style={styles.signup} >Registration</Text>
                                    </View>
                                    <View>
                                        <TextInput
                                            placeholder="Username"
                                            placeholderTextColor='white'
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
                                    },]} onBlur={handleBlur('phoneNo')}>
                                        <PhoneInput
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
                                            }}
                                            keyboardType="number-pad"
                                            onChangeText={handleChange('phoneNo')}
                                            // onBlur={handleBlur('phoneNo')}
                                            
                                        />
                                    </TouchableOpacity>

                                    <View>
                                        <TextInput
                                            placeholder="Email"
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
                                            <Text style={[styles.selectedOption, values.gender && { color: 'black' }]}>{values.gender || 'Choose Gender'}</Text>
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

                                    <TouchableOpacity style={styles.button} onPress={handleSubmit} >
                                        <Text style={styles.buttonText}>SUBMIT</Text>
                                    </TouchableOpacity>
                                    {(errors.userName && touched.userName) || (errors.phoneNo && touched.phoneNo) || (errors.emailId && touched.emailId) || (errors.gender && touched.gender) ? (<Text style={styles.errorText}>{errors.userName || errors.phoneNo || errors.emailId || errors.gender}</Text>) : null}

                                </View>

                            )}
                        </Formik>

                    </KeyboardAvoidingView>
                </ScrollView>
            </ImageBackground>

        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    Image: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    errorText: {
        marginLeft: normalize(15),
        fontWeight: '500',
        color: 'red',
        fontSize: 16,
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
        // color: 'black',
        fontWeight: '900'
    },
    button: {
        backgroundColor: '#0e9b81',
        width: screenWidth - normalize(30),
        alignSelf: 'center',
        height: normalizeVertical(50),
        borderRadius: normalize(25),
        elevation: 5,
        marginTop: normalize(40),
        marginBottom: normalize(10)
    },
    buttonText: {
        alignSelf: 'center',
        marginTop: 'auto',
        marginBottom: 'auto',
        color: 'white',
        letterSpacing: 1.8,
        fontSize: 16,
        fontWeight: '500',
    },
    signup: {
        fontSize: 30,
        color: 'white',
        fontWeight: 'bold',
        paddingBottom: 30
    },
    mobileInputView: {
        paddingLeft: normalize(10),
        width: screenWidth - normalize(30),
        height: normalizeVertical(50),
        borderRadius: normalize(5),
        backgroundColor: '#e3e3e3cc',
        marginBottom: normalize(15),
        borderWidth: normalize(1),
        borderColor: COLORS.gray,
        alignItems: FONTALIGNMENT.center,
        marginVertical: normalizeVertical(4),
    },
    phoneInputContainer: {
        backgroundColor: 'transparent',
        alignItems: FONTALIGNMENT.center,
        width: screenWidth * 0.68,
        right: 70,
    },
    phoneInputTextContainer: {
        height: screenHeight * 0.06,
        backgroundColor: 'transparent',
        right: 35,
        paddingTop: normalize(13),
        fontSize: 14
    },
    phoneInputTextStyle: {
        paddingRight: normalize(8),
        position: 'absolute',
        width: screenWidth * 0.58,
        fontSize: 15,
        fontWeight: '500',
        left: 45,
    },
    phoneCountryFlag: {
        width: 'auto',
        padding: normalize(14),
        paddingRight: 0
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
        fontSize: 16,
        fontWeight: '900',
        color: 'white'
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
