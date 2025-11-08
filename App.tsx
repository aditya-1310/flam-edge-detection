import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Button,
  Image,
  Text,
  Alert,
  NativeModules, // To get our native module
  Platform,
} from 'react-native';

// Import the libraries we installed
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';

// 1. Get our native module
// The name "EdgeDetectionModule" MUST match the getName() in your Java file
const {EdgeDetectionModule} = NativeModules;

function App(): React.JSX.Element {
  // 2. Create state variables to hold our images
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const onPickImage = async () => {
    // Reset images
    setOriginalImage(null);
    setProcessedImage(null);

    // 3. Open the phone's image gallery
    const result = await launchImageLibrary({
      mediaType: 'photo',
    });

    if (result.didCancel || !result.assets || result.assets.length === 0) {
      console.log('User cancelled image picker');
      return;
    }

    const imageUri = result.assets[0].uri;
    if (!imageUri) {
      return;
    }

    // 4. THIS IS THE CRITICAL STEP
    // We must convert the "content://..." path to a real "file://..." path
    // so our C++ code can read it.
    
    // Create a new path in the app's temporary folder
    const fileName = new Date().getTime() + '.jpg';
    const tempPath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;

    try {
      // Copy the image from the gallery (content://) to our new path (file://)
      await RNFS.copyFile(imageUri, tempPath);

      // We add "file://" to the path so the <Image> component can show it
      setOriginalImage('file://' + tempPath);
      console.log('Original image saved to:', tempPath);

      // 5. Call our C++ function!
      // We pass the real file path (without the "file://" prefix)
      console.log('Sending to C++:', tempPath);
      const processedPath = await EdgeDetectionModule.processImage(tempPath);
      console.log('C++ returned:', processedPath);

      // 6. Set the new processed image path
      // We add "file://" so the <Image> component can show it
      setProcessedImage('file://' + processedPath);
    } catch (e: any) {
      Alert.alert('Error', `Failed to process image: ${e.message}`);
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Edge Detection App</Text>
      <Button title="Pick Image from Gallery" onPress={onPickImage} />
      <View style={styles.imageContainer}>
        {originalImage && (
          <View style={styles.imageBox}>
            <Text>Original</Text>
            <Image source={{uri: originalImage}} style={styles.image} />
          </View>
        )}
        {processedImage && (
          <View style={styles.imageBox}>
            <Text>Edges (from C++)</Text>
            <Image source={{uri: processedImage}} style={styles.image} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  imageBox: {
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
    resizeMode: 'contain',
  },
});

export default App;