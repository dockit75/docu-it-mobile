import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../slices/UserSlices';
import { normalize, screenWidth } from '../utilities/measurement';
import { retrieveUserSession, storeUserSession } from '../storageManager';

const LoginPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');;
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const data = await retrieveUserSession();
      // console.log('**************************',data);
      // if (!data?.token || isJwtExpired(data?.token)) {
      if (!data.username) {
        console.log('-----------login------------data---------InValid');
      } else {
        
        navigation.navigate('WelcomePage');
      }
    })();
  }, []);
  const handleLogin = () => {
    // const validEmail = 'user@example.com';
    const isValidPassword = password === '1111';

    //   if (email === validEmail && password === validPassword) {
    //     Alert.alert('Success', 'Login successful!');

    //   } else {
    //     Alert.alert('Error', 'Invalid email or password');
    //   }
    //   navigation.navigate('WelcomePage');
    // };
    if (isValidPassword) {
      // const { username } = useSelector((state) => {state.user.username, state.user.password});
      // const { username } = useSelector((state) => state.user);
      console.log('____Login Success_____');
      storeUserSession({ username });
      dispatch(setUser({ username }));
      // console.log(username);
      navigation.navigate('WelcomePage');
    }
  };
  // const uname = useSelector((state) => state.user.username);
  // console.log('**************************',uname);
  return (<>
    {/* <SafeAreaView>
    <ScrollView> */}
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={text => setPassword(text)}
        value={password}
        secureTextEntry
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
    {/* </ScrollView> */}
    {/* </SafeAreaView> */}
  </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: normalize(20),
  },
  input: {
    width: screenWidth - normalize(30),
    height: normalize(40),
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: normalize(10),
    marginBottom: normalize(15),
  },
  loginButton: {
    backgroundColor: 'blue',
    width: screenWidth - normalize(30),
    height: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginPage;