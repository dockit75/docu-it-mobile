import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
  Button,
  ScrollView,
} from 'react-native';
import { normalize, screenHeight, screenWidth } from '../utilities/measurement';
import { Images } from '../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Table, Row } from 'react-native-table-component';
import Icon from 'react-native-vector-icons/Ionicons';
import Popover from 'react-native-popover-view';
import { COLORS } from '../utilities/colors';
import NetworkManager from '../services/NetworkManager';
import { retrieveUserSession } from '../storageManager';
import { Snackbar } from 'react-native-paper';

const FamilyDoct = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [tableData, setTableData] = useState([
    ['2', 'Murali Sir', false], // Edit mode is initially set to false
    ['2', 'Rajesh Bro', false],
    ['2', 'Guna Bro', false],
    ['2', 'Vignesh Bro', false],
    ['2', 'Selva', false],
    ['2', 'Rex', false],
    ['1', 'Mani', false],
    // Add more rows as needed
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRow, setEditedRow] = useState(null);
  const [editedData, setEditedData] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [name, setName] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState(false)

  // useEffect(() => {
  //   const sortedTableData = [...tableData].sort((a, b) => a[1].localeCompare(b[1]));
  //   setTableData(sortedTableData);
  // }, [tableData]);

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
      if (editedData.trim() === '') {
        setError('Edited data cannot be empty');
      } else {
        const updatedTableData = [...tableData];
        updatedTableData[editedRow][1] = editedData;
        setTableData(updatedTableData);
        setIsEditing(false);
        setEditedRow(null);
        setEditedData('');
        setError(''); // Clear the error when saving successfully
      }
    } else if (newFamilyName.trim() !== '') {
      // Add the new row at the beginning
      const updatedTableData = [...tableData, [String(tableData.length + 1), newFamilyName, false]];
      // Sort the tableData alphabetically based on the family name (second element of each sub-array)
      updatedTableData.sort((a, b) => a[1].localeCompare(b[1]));
      setTableData(updatedTableData);
      setIsAdding(false);
      setNewFamilyName('');
    } else {
      setError('Family Name cannot be empty');
    }
  };

  const renderEditIcon = (rowIndex) => {
    if (rowIndex === 'add') {
      return (
        <TouchableOpacity
          onPress={() => handleEditClick(rowIndex)}
          style={{
            justifyContent: 'center',
            width: normalize(60),
            height: normalize(30),
            alignSelf: 'flex-end',
            marginRight: 15,
            backgroundColor: COLORS.darkTransparent,
            borderRadius: 10,
            marginVertical: 8,
          }}
        >
          <Text style={{ textAlign: 'center', color: 'white', fontSize: 18, fontWeight: '500' }}>Add</Text>
        </TouchableOpacity>
      );
    }

    if (isEditing && editedRow === rowIndex) {
      return (
        <TouchableOpacity onPress={handleSaveRow} style={{ alignSelf: 'center', marginVertical: 6.5 }}>
          <Icon name="checkmark-circle" size={25} color="green" />
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity onPress={() => handleEditClick(rowIndex)} style={{ alignSelf: 'center', marginVertical: 6.5 }}>
          <Icon name="create" size={25} color="white" />
        </TouchableOpacity>
      );
    }
  };

  return (
    <SafeAreaView>
      <View>
        <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top }}>
          <View style={{ marginTop: 50 }}>
            <View style={{ flexDirection: 'row', marginHorizontal: 20, justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={{ alignSelf: 'center' }}>
                <Image source={Images.ARROW} style={{ width: 22, height: 22 }} />
              </TouchableOpacity>
              <Text style={styles.TextSettings}>Family</Text>
              <View />
            </View>
          </View>
          <Row data={['', '', renderEditIcon('add')]} />
          <Row data={['Family Name', 'Action']} style={styles.head} textStyle={styles.headText} />
          <View style={{ marginVertical: 4 }} />
          <ScrollView style={{ height: screenHeight - 10 }} showsVerticalScrollIndicator={false}>
            <View style={{ width: screenWidth - 25, marginLeft: 14 }}>
              <Table>
                {tableData.map((rowData, index) => (
                  <Row
                    key={index}
                    data={[
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
          </ScrollView>
          <Popover
            isVisible={isAdding || (isEditing && editedRow !== null)}
            onRequestClose={() => {
              setIsAdding(false);
              setIsEditing(false);
              setEditedRow(null);
              setEditedData('');
              setError(false)
            }}
            popoverStyle={styles.popover}
          >
            <View style={styles.modalContent}>
              {isAdding ? (
                <Text style={{ color: 'black', fontSize: 18, fontWeight: '500', marginVertical: 10 }}>Enter Family Name</Text>
              ) : (
                <Text style={{ color: 'black', fontSize: 18, fontWeight: '500', marginVertical: 10 }}>Change Family Name</Text>
              )}
              <TextInput
                value={isAdding ? newFamilyName : editedData}
                onChangeText={(text) => {
                  if (isAdding) {
                    setNewFamilyName(text);
                    setError(false)
                  } else {
                    setEditedData(text);
                    setError(false)
                  }
                }}
                style={styles.input}
              />
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={handleSaveRow} style={styles.saveButton}>
                  <Text style={{ textAlign: 'center', marginTop: 6, fontSize: 16, color: 'white', fontWeight: '500' }}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  setIsAdding(false);
                  setIsEditing(false);
                  setEditedRow(null);
                  setEditedData('');
                  setError(false)
                }} style={styles.cancelButton}>
                  <Text style={{ textAlign: 'center', marginTop: 6, fontSize: 16, color: 'white', fontWeight: '500' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
            {error ? <Text style={{ color: 'red', fontSize: 16, fontWeight: '400', letterSpacing: 1, alignSelf: 'center', marginVertical: 8 }}>{error}</Text> : null}
          </Popover>
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  head: {
    height: normalize(50),
    width: screenWidth - 25,
    marginLeft: 14,
    backgroundColor: 'rgb(212, 215, 219)',
    borderRadius: normalize(8),
  },
  Snackbar: {
    backgroundColor: 'rgb(195,0,0)',
    // color: '',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#0e9b81',
    width: normalize(90),
    height: normalize(34),
    borderRadius: 20,
    color: 'white',
  },
  cancelButton: {
    backgroundColor: 'red',
    width: normalize(90),
    height: normalize(34),
    marginLeft: 10,
    borderRadius: 20,
  },
  popover: {
    width: normalize(290),
    height: normalize(180),
    backgroundColor: 'rgb(212, 215, 219)',
    borderRadius: 8
  },
  input: {
    height: 40,
    width: 235,
    borderWidth: 1,
    marginBottom: 18,
    padding: 8,
    fontSize: 18,
    fontWeight: '500',
  },
  headText: {
    fontWeight: '500',
    textAlign: 'center',
    color: 'black',
    fontSize: 20,
  },
  text: {
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '500',
  },
  row: {
    height: normalize(50),
    backgroundColor: COLORS.darkTransparent,
    marginTop: 5,
    borderRadius: 8,
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
    color: 'white',
    marginRight: normalize(15),
  },
});

export default FamilyDoct;