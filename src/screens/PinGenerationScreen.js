import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image, ScrollView, ActivityIndicator } from 'react-native';
import { normalize, normalizeVertical, screenHeight, screenWidth } from '../utilities/measurement';
import { retrieveUserSession } from '../storageManager';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
    MaskSymbol,
    isLastFilledCell,
} from 'react-native-confirmation-code-field';
import NetworkManager from '../services/NetworkManager';
import { Images } from '../assets/images/images';
import { COLORS } from '../utilities/colors';
import { Snackbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

const CELL_COUNT = 4;
const PinGenerationScreen = ({ navigation, route }) => {
    const fromForget = route?.params?.fromForget;
    console.log(fromForget, 'route,.....')
    const [pin, setPin] = useState('');
    const [confirmedPin, setConfirmedPin] = useState('');
    const [error, setError] = useState(false)
    const [value, setValue] = useState('');
    const [enableMask, setEnableMask] = useState(true);
    const [changePin, SetChangePin] = useState(false)
    const ref = useBlurOnFulfill({ ...value, cellCount: CELL_COUNT });
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [phone, setPhone] = useState('')
    const [gender, setGender] = useState('')
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const insets = useSafeAreaInsets();
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    const toggleMask = () => setEnableMask(f => !f);
    const renderCellConfirmPin = ({ index, symbol, isFocused }) => {
        let textChild = null;

        useEffect(() => {
            (async () => {
                const data = await retrieveUserSession();
                console.log(data, '-----PinGenerationScreen')
                setPhone(data.phone)
                setName(data.name)
            })();
        }, []);

        useEffect(() => {
            if (/^\d{4}$/.test(pin) && pin === confirmedPin) {
                handleGeneratePin()
            }
        }, [pin])

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
    const handlePinChange = (value) => {
        if (/^\d*$/.test(value) && value.length <= CELL_COUNT) {
            setPin(value);
        }
    };

    const handleConfirmedPinChange = (value) => {
        if (/^\d*$/.test(value) && value.length <= CELL_COUNT) {
            setConfirmedPin(value);
        }
    };

    const handleGeneratePin = async () => {
        try {
            if (/^\d{4}$/.test(pin) && pin === confirmedPin) {
                if (!fromForget) {
                    setLoading(true)
                    const payload = {
                        phone: phone,
                        pinNumber: pin,
                    };
                    console.log(payload, 'payload')
                    console.log('fromOTPSCreen');
                    // Assuming NetworkManager.pinGeneration returns a promise
                    const res = await NetworkManager.pinGeneration(payload);
                    if (res.data.code === 200) {
                        navigation.navigate('LockScreen', { isForgotPin: false });
                    } else {
                        // Handle other response codes or errors here
                        console.log('Error response:', res);
                    }
                } else {
                    setLoading(true)
                    const payload = {
                        phone: phone,
                        pinNumber: pin,
                    };
                    console.log('fromforgetSCreen');
                    // Assuming NetworkManager.changePin returns a promise
                    const res = await NetworkManager.changePin(payload);
                    if (res.data.code === 200) {
                        // PIN generation successful, navigate to the LockScreen
                        navigation.navigate('LockScreen');
                    } else {
                        // Handle other response codes or errors here
                        console.log('Error response:', res);
                        setError('PIN generation failed');
                    }
                }
            } else if (pin.length === 0) {
                // Empty value, show snackbar message
                setSnackbarMessage('Please enter a 4-digit PIN');
                setSnackbarVisible(true);
            } else {
                // Invalid PINs, show snackbar message
                setSnackbarMessage('Invalid PIN. Please try again.');
                setSnackbarVisible(true);
            }
        } catch (error) {
            console.error('error', error);
            setError('An error occurred while generating the PIN');
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const renderCell = ({ index, symbol, isFocused }) => {
        let textChild = null;

        if (symbol) {
            textChild = (
                <MaskSymbol
                    maskSymbol='•'
                    isLastFilledCell={isLastFilledCell({ index, value })}>
                    {symbol}
                </MaskSymbol>
            );
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
    return (
        <SafeAreaView style={styles.root}>
            {/* <ScrollView> */}
            <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top }}>
                <Image source={Images.LOGO_DOCKIT} resizeMode='center' style={{ width: 100, height: 100, marginTop: normalize(60), alignSelf: 'center' }} />
                <View style={styles.container}>
                    <View>
                        <View>
                            {/* <Text style={styles.title}>{changePin? 'Enter PIN' : 'Enter New PIN'}</Text> */}
                            <Text style={styles.title}>Enter PIN</Text>

                            <CodeField
                                secureTextEntry={true}
                                value={pin}
                                onChangeText={(text) => {
                                    handlePinChange(text)
                                    setError(false)
                                }}
                                cellCount={CELL_COUNT}
                                rootStyle={styles.codeFieldRoot}
                                keyboardType="number-pad"
                                textContentType="oneTimeCode"
                                renderCell={renderCell}
                            />
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={styles.conform}> Conform PIN</Text>
                            <TouchableOpacity onPress={toggleMask} style={styles.title}>
                                {enableMask ? (
                                    <Icon name='eye' size={24} color="white"  />
                                ) : (
                                    <Icon name="eye-slash" size={24} color="white" />
                                )}
                            </TouchableOpacity>
                            </View>
                            <CodeField
                                ref={ref}
                                {...props}
                                value={confirmedPin}
                                onChangeText={(text) => {
                                    handleConfirmedPinChange(text)
                                    setError(false)
                                }}
                                cellCount={CELL_COUNT}
                                rootStyle={styles.codeFieldRoot}
                                keyboardType="number-pad"
                                textContentType="oneTimeCode"
                                renderCell={renderCellConfirmPin}
                            />
                        
                    </View>
                    <TouchableOpacity style={styles.generateButton} onPress={handleGeneratePin} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color='white' />
                        ) : (
                            <Text style={styles.generateButtonText}>GENERATE PIN</Text>
                        )
                        }
                    </TouchableOpacity>
                    {error ? <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', letterSpacing: 1.5, marginTop: 20, }}>{error}</Text> : null}
                </View>
            </ImageBackground>
            {/* </ScrollView> */}
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
        fontSize: normalize(18),
        fontWeight: 'bold',
        marginTop: normalize(20),
        color: COLORS.white,
        alignSelf: 'center',
        paddingVertical: normalize(10),
        marginLeft: 20
    },
    conform: {
        fontSize: normalize(18),
        fontWeight: 'bold',
        marginTop: normalize(20),
        color: COLORS.white,
        alignSelf: 'center',
        // paddingVertical: normalize(10),
        marginLeft: normalize(45),
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
    // toggle: {
    //     width: normalize(30),
    //     height: normalize(30),
    //     marginBottom: 20,
    //     marginTop: 10,
    //     alignSelf: 'center'
    // },
    focusCell: {
        borderColor: '#000',
    },
    subtitle: {
        fontSize: normalize(18),
        fontWeight: 'bold',
        marginTop: normalize(20),
        color: COLORS.white
    },
    generateButton: {
        backgroundColor: '#0e9b81',
        justifyContent: 'center',
        alignItems: 'center',
        width: screenWidth - normalize(40),
        alignSelf: 'center',
        height: normalizeVertical(50),
        borderRadius: normalize(60),
        elevation: 20,
        marginVertical: normalize(30)
    },
    generateButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    container: {
        alignItems: 'center',
        marginVertical: normalize(40)
    },
    Snackbar: {
        backgroundColor: 'rgb(195,0,0)',
        color: 'white',
    }
});

export default PinGenerationScreen;