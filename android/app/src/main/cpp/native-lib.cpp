//// Placeholder for native code
#include <jni.h>
#include <string>
#include <android/log.h>

// --- OpenCV Headers ---
#include <opencv2/core.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/imgcodecs.hpp>

// --- Define a log tag for debugging ---
#define LOG_TAG "NativeLib"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)

// This is the C++ function that our Java code will call
extern "C" JNIEXPORT jstring JNICALL
Java_com_flam_1assigment_EdgeDetectionModule_nativeProcessImage(
        JNIEnv* env,        // JNI environment (the "bridge")
        jobject thiz,       // "this" object (our Java module)
        jstring source_uri) { // The image path we passed from Java

    // 1. Get the image path from Java and convert it to a C++ string
    const char* source_path_chars = env->GetStringUTFChars(source_uri, nullptr);
    std::string source_path(source_path_chars);

    LOGD("Processing image: %s", source_path.c_str()); // Log to Android console

    // 2. Read the image file using OpenCV
    cv::Mat source_image = cv::imread(source_path);

    // Check if the image loaded
    if (source_image.empty()) {
        LOGD("Failed to read image: %s", source_path.c_str());
        env->ReleaseStringUTFChars(source_uri, source_path_chars);
        return env->NewStringUTF("Error: Failed to read image");
    }

    // 3. Convert the image to grayscale
    cv::Mat gray_image;
    cv::cvtColor(source_image, gray_image, cv::COLOR_BGR2GRAY);

    // 4. Apply Canny edge detection
    cv::Mat edges_image;
    cv::Canny(gray_image, edges_image, 100, 200); // You can tune these threshold numbers

    // 5. Create a new file path for our processed image
    // We'll just add "_processed.jpg" to the original name
    std::string result_path = source_path + "_processed.jpg";

    // 6. Save the new edges_image to the new file path
    bool success = cv::imwrite(result_path, edges_image);

    if (!success) {
        LOGD("Failed to write image: %s", result_path.c_str());
        env->ReleaseStringUTFChars(source_uri, source_path_chars);
        return env->NewStringUTF("Error: Failed to write image");
    }

    LOGD("Successfully saved processed image to: %s", result_path.c_str());

    // 7. Clean up the string we got from Java
    env->ReleaseStringUTFChars(source_uri, source_path_chars);

    // 8. Send the new image's path back to Java
    return env->NewStringUTF(result_path.c_str());
}