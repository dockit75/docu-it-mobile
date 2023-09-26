import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ImageBackground, Picker } from 'react-native';
import { normalize, normalizeVertical, screenHeight, screenWidth } from '../utilities/measurement';
import { Images } from '../assets/images/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetworkManager from '../services/NetworkManager';
import { retrieveUserSession } from '../storageManager';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
// import RNPickerSelect from 'react-native-picker-select';
import DropDownPicker from 'react-native-dropdown-picker';


const SaveDocumentScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedValue, setSelectedValue] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedOption1, setSelectedOption1] = useState(null);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' }
  ]);

  const options1 = [
    { label: 'Option 1.1', value: 'option1.1' },
    { label: 'Option 1.2', value: 'option1.2' },
    { label: 'Option 1.3', value: 'option1.3' },
  ];


  // const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  // useEffect(async() => {

  // //   const response = await NetworkManager.listCategories()
  // //   // .then((response) => {
  // // console.log(response);
  //       // Assuming the API response is an array of objects with 'value' and 'label' properties
  //       // setOptions(response.data);
  //     // })
  //     // .catch((error) => {
  //     //   console.error('Error fetching options:', error);
  //     // });
  // }, []);
  useEffect(() => {
    (async () => {
      try {
        // const res = await retrieveUserSession();
        // console.log(res, 'data...')
        // const response = await NetworkManager.listCategories();
        // console.log(response, 'response-----------------------')

      } catch (error) {
        console.error('Error in useEffect:', error);
      }
    })();
  }, []);
  const handleClose = () => {
    navigation.navigate('Dashboard')
  }
  const handleSave = () => {

  }

  const handleView = () => {
    navigation.navigate('DocumentScannerScreen')
  }

  return (
    <SafeAreaView tyle={{ height: screenHeight * 0.93, backgroundColor: 'rgba(4, 104, 77, 0.6)' }}>
      <ImageBackground source={Images.REGISTRATION} resizeMode='cover' style={{ width: screenWidth, height: screenHeight + insets.top, }}>
        <View>
          {/* <View>
            <Text style={{ fontSize: 20, color: 'white' }}>Select an item:(select dorp down)</Text>
            <SelectDropdown
              data={items}
              onSelect={(selectedItem, index) => {
                setSelectedItem(selectedItem);
                // You can add your logic here when an item is selected
              }}
              buttonStyle={{ width: 200, backgroundColor: 'lightgray', marginTop: 20 }}
              defaultButtonText={selectedItem || 'Select an item'}
              dropdownStyle={{ width: 200 }}
            />
            {selectedItem ? (
              <Text style={{ fontSize: 18, marginTop: 20 }}>
                You selected: {selectedItem}
              </Text>
            ) : null}
          </View> */}
          {/* <View>
            <Text>Select option 1:</Text>
            <RNPickerSelect
              items={options1}
              onValueChange={(value) => setSelectedOption1(value)}
              value={selectedOption1}
            />
          </View> */}
          {/* <View> */}
          <View style={{marginTop:normalizeVertical(10),width:screenWidth*0.98,alignSelf:'center'}}>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
          />
          </View>
          {/* </View> */}


        </View>
      </ImageBackground>
      <View style={{ width: screenWidth, flexDirection: 'row', bottom: 105, justifyContent: 'space-between', padding: normalize(5), position: 'absolute', }}>
        <TouchableOpacity style={[styles.nextButton,]} onPress={handleSave} >
          <Text style={styles.nextButtonText}>SAVE</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleView} style={{ justifyContent: 'center', borderRadius: normalize(25), paddingHorizontal: normalize(15), backgroundColor: '#0e9b81', }}>
          <Icon name="eye" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClose} style={{ justifyContent: 'center', borderRadius: normalize(25), paddingHorizontal: normalize(15), backgroundColor: '#0e9b81', }} >
          <MaterialIcon name={'close'} size={30} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  nextButton: {
    backgroundColor: '#0e9b81',
    alignSelf: 'center',
    height: normalizeVertical(50),
    borderRadius: normalize(25),
    // marginTop: 30,
    // marginBottom: normalize(10)
  },

  nextButtonText: {
    // justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    color: 'white',
    letterSpacing: 1.8,
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: normalize(15)
  },
});

export default SaveDocumentScreen;

