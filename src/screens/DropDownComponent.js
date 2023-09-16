import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet ,Image} from 'react-native';
import { normalize, normalizeVertical, screenWidth } from '../utilities/measurement';
import { Images } from '../assets/images/images';

const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Gender'); // Initially value
  const [isFocus, setIsFocus] = useState()

  const options = ['Male', 'Female'];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectOption = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.dropdownContainer} onPress={toggleDropdown}>
        <Text style={styles.selectedOption}>{selectedOption}</Text>      
        {isOpen ? (
        <Image source={Images.DROPDOWN_UP} style={styles.icon} />
        ) : (
          <Image source={Images.DROPDOWN} style={styles.icon} />
        )
         }
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.optionItem}
              onPress={() => selectOption(option)}
            >
              <Text style={styles.text}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: normalize(5),
    marginBottom: 15,
    width: screenWidth - normalize(30),
    height: normalizeVertical(50),
    alignSelf: 'center',
    backgroundColor: '#e3e3e3cc',
    letterSpacing: 1.5,
    paddingHorizontal: normalizeVertical(20),
    marginVertical: normalizeVertical(4),
    flexDirection:'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  selectedOption: {
    fontSize: 16,
  },
  optionsContainer: {
    borderWidth: 0.1,
    borderRadius: 5,   
    backgroundColor: 'white',
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 0.2,
    borderBottomColor: 'transparent',  
  },
  text:{
    fontWeight:'bold',
    fontSize:18
  },
  icon:{
    width: 28 ,
    height: 28 ,
  }
});

export default Dropdown;

// import React, { useState } from 'react'
// import SelectDropdown from 'react-native-select-dropdown'
// import { View, Text, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView } from 'react-native';
// import { normalize, normalizeVertical, screenWidth } from '../utilities/measurement';
// import { Images } from '../assets/images/images';


// const DropDown = () => {

//   const data = ["Male", "Female"]
//   const [Gender, setGenter] = useState('Gender')
//   return (
//     // <View>
//     <KeyboardAvoidingView>    
//       <SelectDropdown
//         data={data}
//         defaultValue={Gender}
//         defaultButtonText='Gender'
//        buttonStyle={styles.buttonStyle}
//       buttonTextStyle={styles.buttonTextStyle}
//         renderDropdownIcon={isOpened => {
//           return isOpened ? <Image style={styles.Icon} source={Images.DROPDOWN} /> : <Image style={styles.Icon} source={Images.DROPDOWN_UP} />
//         }}
//         dropdownIconPosition={'right'}
//         onSelect={(selectedItem, index) => {
//           setGenter(selectedItem, index)
//         }}
//         buttonTextAfterSelection={(selectedItem, index) => {
//           return selectedItem
//         }}
//         rowTextForSelection={(item, index) => {
//           return item
//         }}
//         dropdownStyle={styles.dropdownStyle}
//       />
//       </KeyboardAvoidingView>
//       // </View>
//   )
// }

// const styles = StyleSheet.create({
//   buttonStyle: {
//       borderWidth: 1,
//       borderColor: '#ccc',
//       borderRadius: normalize(5),
//       marginBottom: 15,
//       width: screenWidth - normalize(30),
//       height: normalizeVertical(50),
//       alignSelf: 'center',
//       backgroundColor: '#e3e3e3cc',
//       letterSpacing: 1.5,
//       paddingHorizontal: normalizeVertical(20),
//       marginVertical: normalizeVertical(4),
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//     },
//     buttonTextStyle: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         right: 150     
//     },
//   Icon: {
//     width:28,
//     height: 28,
//     left:300
//   },
// dropdownStyle: {
//   marginTop: normalize(10),
//   backgroundColor: 'white'
// }
// })

// export default DropDown;