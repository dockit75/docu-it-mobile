import React from 'react'
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import { Card, Title, Paragraph, Button } from 'react-native-paper'
import { normalize, screenWidth } from '../utilities/measurement'
import { COLORS } from '../utilities/colors'
import { Images } from '../assets/images/images'
import { Dashboard_CARD_TEXT } from '../utilities/strings'
import { useNavigation } from '@react-navigation/native'

const Dashboard = () => {
    const navigation = useNavigation();

    const handleUploadDocument = async () => {
        navigation.navigate('CategoryScreen')
    };
    const handleFamilyDocument = () => {
        navigation.navigate('FamilyDoct')
    }
    return (
        <ScrollView>
            <View style={styles.cardView}>
            <TouchableOpacity onPress={handleUploadDocument}>
                <Card style={styles.cardContainer}>
                    <Image source={Images.ICON_PERSONAL_DOCS} style={styles.Images} resizeMode='center' />
                    <Card.Content>
                        <Paragraph style={styles.imageText}>Docu Mgmt</Paragraph>
                    </Card.Content>                   
                </Card>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleFamilyDocument}>
                    <Card style={styles.cardContainer} >
                        <Image source={Images.ICON_FAMILY_MGMT} style={styles.Images} resizeMode='center' />
                        <Card.Content >
                            <Paragraph style={styles.imageText}>Family Mgmt</Paragraph>
                        </Card.Content>
                    </Card>
                </TouchableOpacity>
            </View>
            <View style={styles.cardView}>
            {/* <Card style={styles.cardContainer}>
                    <Image source={Images.ICON_ASSETS} style={styles.viewDocumentImage} resizeMode='center' />
                    <Card.Content >
                        <Paragraph style={styles.imageText}>View Document</Paragraph>
                    </Card.Content>
                </Card>     */}

                {/* <View style={{ marginRight: 15 }} /> */}
                {/* <Card style={styles.cardContainer}>
                <Image source={Images.ICON_AUTO_DOC} style={styles.Images} resizeMode='center'/>
                <Card.Content style={{top:45}}>
                <Paragraph style={styles.imageText}>{Dashboard_CARD_TEXT.autoDocument}</Paragraph>
                </Card.Content> 
            </Card> */}
            </View>

            {/* <View style={styles.cardView}>
            <Card style={styles.cardContainer}>
                <Image source={Images.ICON_LIFE_INSURANCE} style={styles.Images} resizeMode='center'/>
                <Card.Content style={{top:45}}>
                <Paragraph style={styles.imageText}>{Dashboard_CARD_TEXT.lifeInsurance}</Paragraph>
                </Card.Content>                    
                 </Card>
            <View style={{ marginRight: 15 }} />
            
            <Card style={styles.cardContainer}>
                <Image source={Images.ICON_HEALTH_INSURANCE} style={styles.Images} resizeMode='center'/>
                <Card.Content style={{top:45}}>
                <Paragraph style={styles.imageText}>{Dashboard_CARD_TEXT.healthInsurance}</Paragraph>
                </Card.Content> 
            </Card>
        </View> */}
        </ScrollView>
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

export default Dashboard