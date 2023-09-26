import React, { useState } from 'react'
import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, TextInput, Modal, Button } from 'react-native'
import { normalize, screenHeight, screenWidth } from '../utilities/measurement'
import { Images } from '../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Table, Row } from 'react-native-table-component';
import Icon from 'react-native-vector-icons/Ionicons';
import Popover from 'react-native-popover-view';
import { COLORS } from '../utilities/colors';

const FamilyDoct = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [tableData, setTableData] = useState([
        ['1', 'Selva', false], // Edit mode is initially set to false
        ['2', 'Selva', false],
        // Add more rows as needed
    ]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedRow, setEditedRow] = useState(null);
    const [editedData, setEditedData] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newFamilyName, setNewFamilyName] = useState('');

    const handleEditClick = (rowIndex) => {
        if (rowIndex === 'add') {
            setIsAdding(true);
        } else {
            setIsEditing(true);
            setEditedRow(rowIndex);
            setEditedData(tableData[rowIndex][1]);
        }
    };



    const handleSaveRow = () => {
        if (editedRow !== null) {
            const updatedTableData = [...tableData];
            updatedTableData[editedRow][1] = editedData;
            setTableData(updatedTableData);
            setIsEditing(false);
            setEditedRow(null);
            setEditedData('');
        } else if (newFamilyName.trim() !== '') {
            const updatedTableData = [...tableData];
            updatedTableData.push([String(updatedTableData.length + 1), newFamilyName, false]);
            setTableData(updatedTableData);
            setIsAdding(false);
            setNewFamilyName('');
        }
    };

    const renderEditIcon = (rowIndex) => {
        if (rowIndex === 'add') {
            return (
                <TouchableOpacity onPress={() => handleEditClick(rowIndex)} style={{justifyContent: 'center', width: 60, height: 30, alignSelf: 'flex-end', marginRight: 15,  backgroundColor: 'white', borderRadius: 20, marginVertical: 10}}>
                    {/* <Icon name="add" size={25} color="blue"  /> */}
                    <Text style={{ textAlign: 'center', color: 'black', fontSize: 14, fontWeight: '500'}}>Add</Text>
                </TouchableOpacity>
            );
        }

        if (isEditing && editedRow === rowIndex) {
            return (
                <TouchableOpacity onPress={handleSaveRow} style={{alignSelf: 'center', marginVertical: 6.5}}>
                    <Icon name="checkmark-circle" size={25} color="green" />
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity onPress={() => handleEditClick(rowIndex)} style={{alignSelf: 'center', marginVertical: 6.5}}>
                    <Icon name="create" size={25} color="blue" />
                </TouchableOpacity>
            );
        }
    };


    return (
        <SafeAreaView>
            <View>
                <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top }}>
                    <View style={{ marginTop: 60, }}>
                        <View style={{ flexDirection: 'row', marginHorizontal: 20, justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={{ alignSelf: 'center' }}>
                                <Image source={Images.ARROW} style={{ width: 28, height: 28 }} />
                            </TouchableOpacity>
                            <Text style={styles.TextSettings}>Family</Text>
                            <View />
                        </View>
                    </View>
                    {/* <Text style={{ textAlign: 'right', color: 'white', fontSize: 16, fontWeight: 'bold' }}>Add</Text> */}
                    <Row data={['', '', renderEditIcon('add')]} />
                    <View style={{width: screenWidth - 25, marginLeft: 14}}>
                    <Table borderStyle={{borderColor: COLORS.gray, borderWidth: 1}}>
                        <Row data={['S/N', 'Family Name', 'Action']} style={styles.head} textStyle={styles.headText} />
                        {tableData.map((rowData, index) => (
                            <Row
                                key={index}
                                data={[
                                    rowData[0], // Serial Number
                                    isEditing && editedRow === index ? (
                                        <TextInput
                                            value={editedData}
                                            onChangeText={(text) => setEditedData(text)}
                                        />
                                    ) : (
                                        rowData[1]
                                    ),
                                    renderEditIcon(index),
                                ]}
                                textStyle={styles.text}
                                style={styles.row}
                            />
                        ))}
                        
                    </Table>
                    </View>
                    <Popover
            isVisible={isAdding}
            onRequestClose={() => setIsAdding(false)}
            popoverStyle={styles.popover}
          >
            <View style={styles.modalContent}>
              <Text>Enter Family Name:</Text>
              <TextInput
                value={newFamilyName}
                onChangeText={(text) => setNewFamilyName(text)}
                style={styles.input}
              />
              <View style={{flexDirection: 'row'}}>
              <TouchableOpacity onPress={handleSaveRow}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsAdding(false)}>
                {/* <Text style={styles.cancelButton}>Cancel</Text> */}
              </TouchableOpacity>
              </View>
            </View>
          </Popover>

                </ImageBackground>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({

    head: {
        height: 40,
        backgroundColor: '#f1f8ff',
        // borderWidth: 0.5, 
        borderColor: COLORS.gray
    },
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    saveButton: {
        backgroundColor: '#0e9b81',
        width: screenWidth - normalize(310),
        height: normalize(24),
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        // marginHorizontal: 10,
        borderRadius: 20,
    },
    cancelButton: {
        backgroundColor: 'red',
        width: screenWidth - normalize(330),
        height: normalize(22),
        fontSize: 16,
        textAlign: 'center'
    },
    popover: {
        width: normalize(250),
        height: normalize(100),
    },
    input: {
        height: 40,
        width: 240,
        borderColor: 'gray',
        borderWidth: 0.5,
        marginBottom: 10,
        padding: 8,
    },
    headText: {
        margin: 6,
        fontWeight: '500',
        textAlign: 'center',
        color: 'black',
        fontSize: 15
    },
    text: {
        margin: 10,
        textAlign: 'center',
        color: COLORS.black
    },
    row: {
        height: 40,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
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
export default FamilyDoct