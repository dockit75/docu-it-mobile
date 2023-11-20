import EncryptedStorage from 'react-native-encrypted-storage';

export async function storeUserSession(data) {
  try {
    await EncryptedStorage.setItem('user_session', JSON.stringify(data));
  } catch (error) {
    // console.log('EncryptedStorage_storeUserSession Error: ', error);
  }
}

export async function retrieveUserSession() {
  try {
    const session = await EncryptedStorage.getItem('user_session');

    if (session !== undefined) {
      return JSON.parse(session);
    }
  } catch (error) {
    // console.log('EncryptedStorage_retrieveUserSession Error: ', error);
  }
}

export async function removeUserSession() {
  try {
    await EncryptedStorage.removeItem('user_session');
  } catch (error) {
    // console.log('EncryptedStorage_removeUserSession Error: ', error);
  }
}

export async function clearStorage() {
  try {
    await EncryptedStorage.clear();
  } catch (error) {
    // console.log('EncryptedStorage_clearStorage Error: ', error);
  }
}

export async function retrieveCurrentScreen() {
  try {
    const currentScreen = await EncryptedStorage.getItem('currentScreen');

    if (currentScreen !== undefined) {
      return JSON.parse(currentScreen);
    }
  } catch (error) {
    // console.log('EncryptedStorage_retrieveUserSession Error: ', error);
  }
}

export async function storeUserDetail(data) {
  try {
    await EncryptedStorage.setItem('user_detail', JSON.stringify(data));
  } catch (error) {
    // console.log('EncryptedStorage_storeUserDetail Error: ', error);
  }
}


export async function retrieveUserDetail() {
  try {
    const userDetail = await EncryptedStorage.getItem('user_detail');

    if (userDetail !== undefined) {
      return JSON.parse(userDetail);
    }
  } catch (error) {
    // console.log('EncryptedStorage_retrieveUserDetail Error: ', error);
  }
}