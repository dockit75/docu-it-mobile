import { useState } from 'react';
import Pdf from 'react-native-pdf';
import { COLORS } from '../../utilities/colors';
import { MEDIA_API_URL } from '../../services/config';
import { screenHeight, screenWidth } from '../../utilities/measurement';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'

const PdfModal = ({closeModal, pdfData}) => {

  let filePath = pdfData?.documentUrl ?? pdfData?.url
    return (
        <View style={styles.centeredView} >
            <Modal
                animationType="fade"
                transparent={true}
                onRequestClose={() => closeModal(null)}>
                <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <MaterialCommunityIcons name="close" size={30} color={COLORS.header_BG} style={{ position: 'absolute', right: 20,  top: 20, zIndex: 10, backgroundColor: COLORS.gray, borderRadius: 20 }} onPress={() => closeModal(null)} />
                    <Pdf
                        source={{uri: encodeURI(filePath)}}
                        usePDFKit={true}
                        onLoadComplete={(
                            numberOfPages
                        ) => {
                        //   console.log('page inex ==>', numberOfPages)
                        }}
                        onPageChanged={(page,numberOfPages) => {
                            // console.log(`Current page: ${page}`);
                        }}
                        onError={(error) => {
                            // console.log(error);
                        }}
                        onPressLink={(uri) => {
                            // console.log(`Link pressed: ${uri}`);
                        }}
                        style={{ width: '100%', height: '100%', paddingVertical: 2, backgroundColor: COLORS.white }}
                        renderActivityIndicator={() => <ActivityIndicator size="large"  />}
                        trustAllCerts={false}
                    />
                </View>
                </View>
            </Modal>
        </View>
    )
}


const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
      backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
    //   padding: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      height: screenHeight * 0.75,
      width: screenWidth * 0.9,
      position: 'relative'
    },
    button: {
      borderRadius: 20,
      padding: 10,
      elevation: 2,
    },
    buttonOpen: {
      backgroundColor: '#F194FF',
    },
    buttonClose: {
      backgroundColor: '#2196F3',
    },
    textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalText: {
      marginBottom: 15,
      textAlign: 'center',
    },
  });

export default PdfModal
