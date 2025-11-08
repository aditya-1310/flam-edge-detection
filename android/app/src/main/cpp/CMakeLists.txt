# Sets the minimum version of CMake required
cmake_minimum_required(VERSION 3.18.1)

# Defines the project name
project("FlamRndAssignment")

# Set the path to OpenCV headers
set(OpenCV_DIR ${CMAKE_SOURCE_DIR}/../../../libs/opencv)
include_directories(${OpenCV_DIR}/include)

# Adds our C++ library to be built
add_library(
        flam-native-lib
        SHARED
        native-lib.cpp
)

# Finds and links the Android logging library
find_library(
        log-lib
        log
)

# Create an imported target for OpenCV's native wrapper and link it
add_library(opencv_java SHARED IMPORTED)

# Locate libopencv_java4.so for the ABI being built
set(OPENCV_SO_PATH "")
set(JNILIBS_DIR ${CMAKE_SOURCE_DIR}/../jniLibs/${ANDROID_ABI})
get_filename_component(JNILIBS_DIR_ABS ${JNILIBS_DIR} ABSOLUTE)
message(STATUS "DEBUG: CMAKE_SOURCE_DIR = ${CMAKE_SOURCE_DIR}")
message(STATUS "DEBUG: ANDROID_ABI = ${ANDROID_ABI}")
message(STATUS "DEBUG: JNILIBS_DIR = ${JNILIBS_DIR}")
message(STATUS "DEBUG: JNILIBS_DIR_ABS = ${JNILIBS_DIR_ABS}")
message(STATUS "DEBUG: Checking for: ${JNILIBS_DIR_ABS}/libopencv_java4.so")
if (EXISTS ${JNILIBS_DIR_ABS}/libopencv_java4.so)
        set(OPENCV_SO_PATH ${JNILIBS_DIR_ABS}/libopencv_java4.so)
        message(STATUS "DEBUG: Found OpenCV at: ${OPENCV_SO_PATH}")
elseif (EXISTS ${OpenCV_DIR}/abi-${ANDROID_ABI}/libopencv_java4.so)
        set(OPENCV_SO_PATH ${OpenCV_DIR}/abi-${ANDROID_ABI}/libopencv_java4.so)
elseif (EXISTS ${OpenCV_DIR}/sdk/native/libs/${ANDROID_ABI}/libopencv_java4.so)
        set(OPENCV_SO_PATH ${OpenCV_DIR}/sdk/native/libs/${ANDROID_ABI}/libopencv_java4.so)
else()
        message(WARNING "OpenCV native lib not found for ABI ${ANDROID_ABI}. Build may fail until you place libopencv_java4.so in jniLibs/<abi> or libs/opencv/abi-<abi>")
endif()

if (OPENCV_SO_PATH)
        set_target_properties(opencv_java PROPERTIES IMPORTED_LOCATION ${OPENCV_SO_PATH})
        target_link_libraries(
                flam-native-lib
                ${log-lib}
                opencv_java
        )
else()
        # Fallback: link only log; expect Java to load opencv at runtime (may still fail if symbols required at link)
        target_link_libraries(
                flam-native-lib
                ${log-lib}
        )
endif()