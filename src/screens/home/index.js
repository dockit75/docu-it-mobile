import React ,{useEffect, useRef}from 'react'
import { ScrollView, StyleSheet,ImageBackground, Text, View, Image, TouchableOpacity ,SafeAreaView} from 'react-native'
import { Card, Title, Paragraph, Button } from 'react-native-paper'
import { normalize, screenWidth,screenHeight } from '../../utilities/measurement'
import { COLORS } from '../../utilities/colors'
import { Images } from '../../assets/images/images'
import Dashboard from '../Dashboard'
import {  useSafeAreaInsets } from 'react-native-safe-area-context';
import DrawerNavigator from '../../components/common/DrawerNavigator'
import Tile from './components/Tile'
import RecentActivity from './components/RecentActivity'


const Home = ({navigation,props}) => {
    const insets = useSafeAreaInsets();

    useEffect(() => {
        
    }, [])

    return (
        <ImageBackground
        source={Images.REGISTRATION}
        resizeMode="cover"
        style={{ width: screenWidth, height: '100%' }}>
          <DrawerNavigator navigation={navigation}>
            <SafeAreaView style={{flex:1,alignItems:'center',flexDirection:'column',justifyContent:'space-between'}}>
            <Tile/>
            <RecentActivity/>
            </SafeAreaView>
          </DrawerNavigator>    
      </ImageBackground>
            
    )
}

const styles = StyleSheet.create({
    cardView: {
        flexDirection: 'row',
        marginVertical: normalize(20),
        justifyContent: 'space-evenly',
    },
    cardContainer: {
        width: normalize(145),
        height: normalize(110),
        backgroundColor: '#042533',
        margin:10
    },
    Images: {
        width: normalize(35),
        height: normalize(35),
        alignSelf: 'center',
        marginTop: normalize(25)
    },
    viewDocumentImage: {
        width: normalize(46),
        height: normalize(45),
        alignSelf: 'center',
        marginTop: normalize(15)
    },
    imageText: {
        fontWeight: 'bold',
        fontSize: 14,
        color: COLORS.white,
        textAlign: 'center',
        letterSpacing: 0.6,
        marginTop: normalize(15),
    }
})

export default Home