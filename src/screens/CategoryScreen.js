import React from 'react'
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, ImageBackground } from 'react-native'
import { Card, Title, Paragraph, Button } from 'react-native-paper'
import { normalize, screenHeight, screenWidth } from '../utilities/measurement'
import { COLORS } from '../utilities/colors'
import { Images } from '../assets/images/images'
import { Dashboard_CARD_TEXT } from '../utilities/strings'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
// import { useNavigation } from '@react-navigation/native'

const CategoryScreen = ({ navigation }) => {
    // const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const handleUploadDocument = async (head) => {
        navigation.navigate('DocumentScannerScreen',{title:head})
    };
    return (
        <ScrollView>
            <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top, flex: 1 }}>
                <View style={styles.cardView}>
                    <TouchableOpacity onPress={() => handleUploadDocument('Life Insurance')}>
                        <Card style={styles.cardContainer}>
                            <Image source={Images.ICON_PERSONAL_DOCS} style={styles.Images} resizeMode='center' />
                            <Card.Content>
                                <Paragraph style={styles.imageText}>Life Insurance</Paragraph>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleUploadDocument('Health Insurance')}>
                        <Card style={styles.cardContainer} >
                            <Image source={Images.ICON_FAMILY_MGMT} style={styles.Images} resizeMode='center' />
                            <Card.Content >
                                <Paragraph style={styles.imageText}>Health Document</Paragraph>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                </View>
                <View style={styles.cardView}>
                    <TouchableOpacity onPress={() => handleUploadDocument('Assets')}>
                        <Card style={styles.cardContainer}>
                            <Image source={Images.ICON_ASSETS} style={styles.viewDocumentImage} resizeMode='center' />
                            <Card.Content >
                                <Paragraph style={styles.imageText}>Assets</Paragraph>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                    {/* <View style={{ marginRight: 15 }} /> */}
                    <TouchableOpacity onPress={() => handleUploadDocument('Car Insurance')}>
                        <Card style={styles.cardContainer}>
                            <Image source={Images.ICON_AUTO_DOC} style={styles.Images} resizeMode='center' />
                            <Card.Content >
                                <Paragraph style={styles.imageText}>Car Insurance</Paragraph>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                </View>

                <View style={styles.cardView}>
                    <TouchableOpacity onPress={() => handleUploadDocument('Life Insurance')}>
                        <Card style={styles.cardContainer}>
                            <Image source={Images.ICON_LIFE_INSURANCE} style={styles.Images} resizeMode='center' />
                            <Card.Content >
                                <Paragraph style={styles.imageText}>Life Insurance</Paragraph>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                    {/* <View style={{ marginRight: 15 }} /> */}
                    <TouchableOpacity onPress={() => handleUploadDocument('Health Insurance')}>
                        <Card style={styles.cardContainer}>
                            <Image source={Images.ICON_HEALTH_INSURANCE} style={styles.Images} resizeMode='center' />
                            <Card.Content >
                                <Paragraph style={styles.imageText}>Health Insurance</Paragraph>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
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

export default CategoryScreen