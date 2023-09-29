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
    const phoneNo = route?.params?.phone;
    const [pin, setPin] = useState('');
    const [confirmedPin, setConfirmedPin] = useState('');
    const [error, setError] = useState(false)
    const [value, setValue] = useState('');
    const [enableMask, setEnableMask] = useState(true);
    const [enableMaskPin, setEnableMaskPin] = useState(true);
    const [changePin, SetChangePin] = useState(false)
    const ref = useBlurOnFulfill({ value: confirmedPin, cellCount: CELL_COUNT });
    const refPin = useBlurOnFulfill({ value: pin, cellCount: CELL_COUNT });
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [phone, setPhone] = useState('')
    const [gender, setGender] = useState('')
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const insets = useSafeAreaInsets();
    const [propsPin, getCellOnLayoutHandlerPin] = useClearByFocusCell({
        value: pin,
        setValue: setPin,
    });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value: confirmedPin,
        setValue: setConfirmedPin,
    });
    useEffect(() => {
        (async () => {
            const data = await retrieveUserSession();
            setPhone(data.phone)
            setName(data.name)
        })();
    }, []);

    useEffect(() => {
        if (/^\d{4}$/.test(pin) && /^\d{4}$/.test(confirmedPin)) {
            handleGeneratePin()
        }
    }, [confirmedPin])



    const toggleMask = () => setEnableMask(f => !f);
    const toggleMaskPin = () => setEnableMaskPin(f => !f);
    const renderCellConfirmPin = ({ index, symbol, isFocused }) => {
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

    const renderCell = ({ index, symbol, isFocused }) => {
        let textChild = null;

        if (symbol) {
            textChild = enableMaskPin ? '•' : symbol;
        } else if (isFocused) {
            textChild = <Cursor />;
        }

        return (
            <Text
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}
                onLayout={getCellOnLayoutHandlerPin(index)}>
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
            if (pin.length === 0) {
                // Empty value, show snackbar message
                setSnackbarMessage('Please enter PIN');
                setSnackbarVisible(true);
            } else if (pin.length < 4) {
                setSnackbarMessage('Please enter a 4-digit PIN');
                setSnackbarVisible(true);
            } else if (/^\d{4}$/.test(pin) && pin === confirmedPin) {
                if (!fromForget) {
                    setLoading(true)
                    const payload = {
                        phone: phone,
                        pinNumber: pin,
                    };
                    // Assuming NetworkManager.pinGeneration returns a promise
                    const res = await NetworkManager.pinGeneration(payload);
                    if (res.data.code === 200) {
                        navigation.navigate('LockScreen', { signInParam: true });
                    } else {
                        // Handle other response codes or errors here
                        console.log('Error response:', res);
                    }
                } else {
                    setLoading(true)
                    const payload = {
                        phone: phoneNo,
                        pinNumber: pin,
                    };
                    // Assuming NetworkManager.changePin returns a promise
                    const res = await NetworkManager.changePin(payload);
                    if (res.data.code === 200) {
                        // PIN generation successful, navigate to the LockScreen
                        navigation.navigate('LockScreen', { signInParam: true });
                    } else {
                        // Handle other response codes or errors here
                        console.log('Error response:', res);
                        setError('PIN generation failed');
                    }
                }
            } else {
                // Invalid PINs, show snackbar message
                setSnackbarMessage("Pin doesn't match.");
                setSnackbarVisible(true);
            }
        } catch (error) {
            console.error('error', error);
            // setError('An error occurred while generating the PIN');
            setSnackbarMessage('An error occurred while generating the PIN');
            setSnackbarVisible(true);
        } finally {
            setLoading(false); // Stop loading
        }
    };


    return (
        <SafeAreaView style={styles.root}>
            <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top }}>
                <Image source={Images.LOGO_DOCKIT} resizeMode='center' style={{ width: 100, height: 100, marginTop: normalize(60), alignSelf: 'center' }} />
                <View style={styles.container}>
                    <View style={{ gap: normalizeVertical(20) }}>
                        <View>
                            <View style={{ flexDirection: 'row', marginVertical: normalizeVertical(20), justifyContent: 'space-between', }}>
                                <View />
                                <Text style={styles.title}>Enter PIN</Text>
                                <TouchableOpacity onPress={toggleMaskPin} style={{ alignSelf: 'center' }}>
                                    {enableMaskPin ? (
                                        <Icon name='eye' size={24} color="white" />
                                    ) : (
                                        <Icon name="eye-slash" size={24} color="white" />
                                    )}
                                </TouchableOpacity>
                            </View>

                            <CodeField
                                ref={refPin}
                                {...propsPin}
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
                        <View>
                            <View style={{ flexDirection: 'row', marginVertical: normalizeVertical(20), justifyContent: 'space-between', }}>
                                <View />
                                <Text style={styles.title}> Confirm PIN</Text>
                                <TouchableOpacity onPress={toggleMask} style={{ alignSelf: 'center' }}>
                                    {enableMask ? (
                                        <Icon name='eye' size={24} color="white" />
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
        color: COLORS.white,
    },
    conform: {
        fontSize: normalize(18),
        fontWeight: 'bold',
        marginTop: normalize(20),
        color: COLORS.white,
        alignSelf: 'center',
        paddingVertical: normalize(10),
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