import React from 'react'
import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { normalize, screenHeight, screenWidth } from '../utilities/measurement'
import { Images } from '../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';// You can use another icon library if you prefer
import { COLORS } from '../utilities/colors';



const Settings = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    return (
        <SafeAreaView>
            <View>
                <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top }}>
                    <View style={{ marginTop: 60, }}>
                        <View style={{ flexDirection: 'row', marginHorizontal: 20, justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={{ alignSelf: 'center' }}>
                                <Image source={Images.ARROW} style={{ width: 28, height: 28 }} />
                            </TouchableOpacity>
                            <Text style={styles.TextSettings}>Settings</Text>
                            <View/>
                        </View>
                    </View>
                    <Text style={styles.HeaderLine}>Help & Support</Text>

                    <View style={styles.ViewContainer}>
                        <TouchableOpacity style={{ flexDirection: 'row', marginHorizontal: 20, justifyContent: 'space-between' }}>
                            <Text style={styles.Text}>Terms & Conditions</Text>
                            <Image source={Images.ARROWRIGHT} resizeMode='center' style={{ width: 20, height: 20, marginVertical: 20, }} />
                        </TouchableOpacity>
                        <View style={{borderBottomWidth: 0.5, borderBottomColor:COLORS.lightGray}}/>
                        <TouchableOpacity style={{ flexDirection: 'row', marginHorizontal: 20, justifyContent: 'space-between' }}>
                            <Text style={styles.Text}>Privacy Policy</Text>
                            <Image source={Images.ARROWRIGHT} resizeMode='center' style={{ width: 20, height: 20, marginVertical: 20 }} />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    ViewContainer: {
        width: screenWidth - normalize(40),
        height: normalize(108),
        backgroundColor: 'rgb(242, 245, 249)',
        borderColor: 'red',
        alignSelf: 'center',
        borderRadius: 10,
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
        marginRight: normalize(15)
    },
    HeaderLine: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 17,
        color: 'white',
        left: 20,
        marginTop: normalize(20)
    }
})
export default Settings