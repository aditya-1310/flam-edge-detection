package com.flam_assigment;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class EdgeDetectionModule extends ReactContextBaseJavaModule {

    // 1. Load our C++ library
    static {

        System.loadLibrary("opencv_java4");
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
    private native String nativeProcessImage(String sourceUri);
    public void processImage(String sourceUri, Promise promise) {
        try {
        // Call our new C++ function and get the result path
        String resultUri = nativeProcessImage(sourceUri);

        // Send the successful result back to JavaScript
        promise.resolve(resultUri);
    } catch (Exception e) {
        // Send an error back to JavaScript if anything went wrong
        promise.reject("NATIVE_ERROR", e);
    }
    }
}