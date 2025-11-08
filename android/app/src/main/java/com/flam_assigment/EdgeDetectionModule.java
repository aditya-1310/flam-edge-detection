package com.flam_assigment;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class EdgeDetectionModule extends ReactContextBaseJavaModule {

    // 1. Load our C++ library
    static {
        System.loadLibrary("flam-native-lib");
    }

    public EdgeDetectionModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        // This is the name our JavaScript will use to call the module
        return "EdgeDetectionModule";
    }

    // 3. Define the JNI bridge function
    // This is a placeholder function we will implement in C++
    // It will take a source image path and return a processed image path
    @ReactMethod
    public void processImage(String sourceUri, Promise promise) {
        try {
            // We will add a call to our native function here
            String resultUri = "processed_image_path_from_c++";
            promise.resolve(resultUri);
        } catch (Exception e) {
            promise.reject("NATIVE_ERROR", e);
        }
    }
}