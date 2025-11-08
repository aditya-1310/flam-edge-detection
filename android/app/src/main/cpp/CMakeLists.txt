# Sets the minimum version of CMake required
cmake_minimum_required(VERSION 3.18.1)
# --- Add this block ---
# Set the path to our copied OpenCV library
set(OpenCV_DIR ${CMAKE_SOURCE_DIR}/../libs/opencv/native/jni)

# Find the OpenCV package
find_package(OpenCV REQUIRED)
# --- End of block ---

# Defines the project name
project("FlamRndAssignment")

# Adds a C++ library to be built
# We will call our native library "flam-native-lib"
# SRCS lists the source files (we'll add the file in the next step)
add_library(
        flam-native-lib
        SHARED
        native-lib.cpp
)

# Finds and links the Android logging library (for printing to logcat)
find_library(
        log-lib
        log
)

# Links the logging library to our main library
target_link_libraries(
        flam-native-lib
        ${log-lib}
        ${OpenCV_LIBS}
)