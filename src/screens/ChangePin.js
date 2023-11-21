import React, { useState, useRef } from 'react'
import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native'
import { normalize, screenHeight, screenWidth, normalizeVertical } from '../utilities/measurement'
import { Images } from '../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { COLORS } from '../utilities/colors';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import NetworkManager from '../services/NetworkManager';
import { retrieveUserDetail } from '../storageManager';
import DrawerNavigator from '../components/common/DrawerNavigator';

const CELL_COUNT = 4;

const ChangePin = ({ navigation }) => {
    const [value, setValue] = useState('');
    const [pin, setPin] = useState('');
    const refPin = useBlurOnFulfill({ value: pin, cellCount: CELL_COUNT });
    const insets = useSafeAreaInsets();
    const [enableMaskPin, setEnableMaskPin] = useState(true);
    const [error, setError] = useState(false)
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    const toggleMaskPin = () => setEnableMaskPin(f => !f);
    
    const handlePinChange = (value) => {
        if (/^\d*$/.test(value) && value.length <= CELL_COUNT) {
            setPin(value);
        }
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
                onLayout={getCellOnLayoutHandler(index)}>
                {textChild}
            </Text>
        );
    };

    const handlePressSubmit = () => {
        if (pin.length === CELL_COUNT) {
            Alert.alert(
                'Confirmation',
                'Are you sure you want to Change Pin?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'OK',
                        onPress: () => {
                            onPinChange();
                        },
                    },
                ],
                { cancelable: false }
            );
        } else {
            setError(true);
        }
    };

    const onPinChange = async (loading) => {
        let UserId = await retrieveUserDetail();
        console.log('UserId', UserId)
        const params = {
            phone: UserId.phone,
            pinNumber: pin
        }
        console.log('params', params)
        try {
            let response = await NetworkManager.changePin(params);
            console.log('response==', response)
            if (response.data.code === 200) {
                console.log('if called')
                Alert.alert(response.data.message)
                setPin('');
                navigation.navigate('LockScreen')

            }
        } catch (error) {
            Alert.alert(error.response.data.message)
        }
    };

    return (
        <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight }}>
            <DrawerNavigator>
                <View style={{ flex: 1 }}>
                    <View style={{ marginTop: 5 }}>
                        <View style={{ flexDirection: 'row', marginHorizontal: 20, justifyContent: 'flex-start' }}>
                            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ alignSelf: 'center' }}>
                                <MaterialCommunityIcons name='arrow-u-left-top' size={30} color={'white'}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.container}>
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
                                {...props}
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
                        { pin && pin.length !== CELL_COUNT  && <Text style={styles.errorMessage}>Please enter 4-digit PIN"</Text>}

                        <TouchableOpacity style={[styles.generateButton, { backgroundColor : pin.length === CELL_COUNT ?'#0e9b81':'gray'}]} onPress={handlePressSubmit}  >
                            <Text style={styles.generateButtonText}>SUBMIT</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </DrawerNavigator>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: normalize(40),
        justifyContent: 'center',
        top: '10%'
    },
    Text: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 17,
        color: 'black',
    },
    TextSettings: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 15,
        color: 'white',
        marginLeft: 100
    },
    HeaderLine: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 17,
        color: 'white',
        left: 20,
        marginTop: normalize(20)
    },
    codeFieldRoot: {
        margin: normalize(20),
        padding: normalize(5),
        width: screenWidth - normalize(100),
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
    title: {
        fontSize: normalize(18),
        fontWeight: 'bold',
        color: COLORS.white,
    },
    generateButton: {
        // backgroundColor: '#0e9b81',
        justifyContent: 'center',
        alignItems: 'center',
        width: normalize(150),
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
    errorMessage: {
        color: 'red',
        marginTop: normalizeVertical(20),
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold'
    },
})
export default ChangePin