package com.flam_assigment;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class EdgeDetectionModule extends ReactContextBaseJavaModule {

    private static boolean libsLoaded = false;

    // Load native libraries defensively to avoid hard crashes on init issues
    static {
        try {
            System.loadLibrary("opencv_java4");
            System.loadLibrary("flam-native-lib");
            libsLoaded = true;
        } catch (Throwable t) {
            libsLoaded = false;
        }
    }

    public EdgeDetectionModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        // This is the name our JavaScript will use to call the module
        return "EdgeDetectionModule";
    }

    // JNI bridge (implemented in C++)
    private native String nativeProcessImage(String sourceUri);

    // Exposed method to JS
    @ReactMethod
    public void processImage(String sourceUri, Promise promise) {
        try {
        if (!libsLoaded) {
            promise.reject("NATIVE_LIB_LOAD_FAILURE", "OpenCV/native library not loaded");
            return;
        }
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