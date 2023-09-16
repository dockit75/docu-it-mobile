import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { RNCamera } from 'react-native-camera';

const DocumentScannerScreen = () => {
  const [imageUri, setImageUri] = useState(null);

  const takePicture = async camera => {
    const options = { quality: 0.5, base64: true };
    const data = await camera.takePictureAsync(options);
    setImageUri(data.uri);
  };

  const openImagePicker = async () => {
    try {
      const image = await ImageCropPicker.openCamera({
        cropping: false,
        includeBase64: true,
      });
      setImageUri(`data:${image.mime};base64,${image.data}`);
    } catch (error) {
      console.log('Image picker error:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{ flex: 1 }} />
      ) : (
        <RNCamera
          style={{ flex: 1 }}
          type={RNCamera.Constants.Type.back}
          captureAudio={false}
        >
          {({ camera, status }) => {
            if (status !== 'READY') return null;
            return (
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <TouchableOpacity
                  onPress={() => takePicture(camera)}
                  style={{ alignSelf: 'center', marginBottom: 20 }}
                >
                  <Text style={{ fontSize: 20, color: 'white' }}>Capture</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={openImagePicker}
                  style={{ alignSelf: 'center', marginBottom: 20 }}
                >
                  <Text style={{ fontSize: 20, color: 'white' }}>Select Image</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        </RNCamera>
      )}
    </View>
  );
};

export default DocumentScannerScreen;
