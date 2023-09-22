import React from 'react'
import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { normalize, screenHeight, screenWidth } from '../utilities/measurement'
import { Images } from '../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utilities/colors';

const Profile = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    return (
        <SafeAreaView>
            <View>
                <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top }}>
                    <View style={{ marginTop: 60, }}>
                        <View style={{ flexDirection: 'row', marginHorizontal: 20, justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={{ alignSelf: 'center' }}>
                                <Image source={Images.ARROW} style={{ width: 26, height: 26 }} />
                            </TouchableOpacity>
                            <Text style={styles.TextProfile}>Profile</Text>
                            <View/>
                        </View>
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
    TextProfile: {
        fontSize: 22,
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
export default Profile