import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Dialog, LinearProgress } from '@rneui/themed';


const Loader = (props) => {
  const [isLoading, setIsLoading] = useState(props.isLoading);

  return (
    <View >
      <Dialog overlayStyle={{ width: 120 }} isVisible={isLoading} >
        <ActivityIndicator size={'large'} color={'#0e9b81'} />
        <Text style={styles.text}>{props.text}</Text>
      </Dialog>
    </View>
  );
};
export default Loader;

const styles = StyleSheet.create({
  text:{
    textAlign: 'center', color: '#0e9b81'
  } 
 
});
