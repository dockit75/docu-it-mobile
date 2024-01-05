import { COLORS } from '../../utilities/colors';
import React, { Fragment, useEffect, useState } from 'react';
import { Images } from '../../assets/images/images'
import { Card, Paragraph } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { normalize, screenHeight, screenWidth } from '../../utilities/measurement'
import {Text, View , SafeAreaView, Image, TouchableOpacity, ImageBackground, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native'
import NetworkManager from '../../services/NetworkManager';
import { retrieveUserDetail } from '../../storageManager';
import DrawerNavigator from '../../components/common/DrawerNavigator';
import { CategoryItemLoader } from './categoryLoader';
import { Dialog } from '@rneui/themed';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const CategoryScreen = ({navigation, route}) => {

    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(true)
    const [categoryList, setCategoryList] = useState(Array(0).fill(1).map((n, i) => n = { "categoryId": 'category_loader'+i,  isLoading: true }))

    useEffect(() => {
        setIsLoading(true)
        const unsubscribe = navigation.addListener('focus', async () => {
            getCategoryList()
        });
    
        return unsubscribe;
      }, []);

    const getCategoryList = async () => {
        try {
            let userData = await retrieveUserDetail()
            let categoryResult = await NetworkManager.listCategoriesByUser(userData.id)
            if(categoryResult.data?.status === 'SUCCESS' && categoryResult.data?.code === 200){
                setCategoryList(categoryResult.data.response.categoryDetails)
                setIsLoading(false)
            } else {
                setIsLoading(false)
            }
          } catch (error) {
            setIsLoading(false)
            console.error(error); // You might send an exception to your error tracker
          }
    }

    const handleUploadDocument = async (categoryInfo) => {
        navigation.navigate('DocumentScannerScreen', { title: categoryInfo.categoryName, categoryInfo })
    };

    const renderItems = ({item, index}) => {
        return <TouchableOpacity key={item.categoryId} onPress={() => handleUploadDocument(item)}>
            <Card style={styles.cardContainer}>
                <Image source={Images.ICON_ASSETS} style={styles.viewDocumentImage} resizeMode='center' />
                <Text style={styles.imageText}>{item.categoryName}{` (${item.fileCount})`}</Text>
            </Card>
        </TouchableOpacity>
    }

    return (
        <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top, flex: 1 }}>
						<DrawerNavigator navigation={navigation}>
							<FlatList
								nestedScrollEnabled
                                scrollEnabled={!isLoading}
								data={['categoryList']}
								keyExtractor={(item) => item.toString()}
								renderItem = {() => 
                                    <Fragment>
                                    <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginHorizontal: 10, marginTop: 10 }} onPress={() => navigation.goBack()}>
                                      <MaterialCommunityIcons name='arrow-u-left-top' color={'white'} size={32} />
                                    </TouchableOpacity>
                                        <FlatList
                                            nestedScrollEnabled
                                            scrollEnabled={!isLoading}
                                            numColumns={2}
                                            data={categoryList}
                                            extraData={categoryList}
                                            renderItem={renderItems}
                                            keyExtractor={(item) => item?.categoryId}
                                        />
                                    </Fragment>
								}
							/>
            </DrawerNavigator>

                <Dialog overlayStyle={{ width: 120 }} isVisible={isLoading} >
                    <ActivityIndicator size={'large'} color={'#0e9b81'} />
                    <Text style={{ textAlign: 'center',color:'#0e9b81' }}>Loading...</Text>
                </Dialog>
        </ImageBackground>
    );
  }

  const styles = StyleSheet.create({
    cardContainer: {
        width: screenWidth * 0.42,
        height: normalize(110),
        backgroundColor: '#042533',
        margin: 15,
        padding: 0
    },
    viewDocumentImage: {
        width: normalize(46),
        height: normalize(45),
        alignSelf: 'center',
        marginTop: normalize(15)
    },
    imageText: {
        fontWeight: 'bold',
        fontSize: 12,
        color: COLORS.white,
        textAlign: 'center',
        letterSpacing: 0.6,
        marginTop: normalize(15),
    },
})
  export default CategoryScreen
  