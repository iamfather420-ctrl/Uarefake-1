[app]
title = Base Waste Harvester
package.name = basewasteharvester
package.domain = org.agate
source.dir = .
source.include_exts = py,png,jpg,kv,atlas,yaml
version = 0.1
requirements = python3,kivy,pyyaml,zlib
orientation = portrait
fullscreen = 0

# Android Build Configuration
android.api = 34
android.minapi = 21
android.ndk = 25b
android.skip_update = False
android.accept_sdk_license = True

# zlib header configuration for Android
android.add_libs_armeabi_v7a = yes | https://github.com/iamfather420-ctrl/Base-Waste-Harvester/releases/download/zlib-headers/libz-armeabi-v7a.so
android.add_libs_arm64_v8a = yes | https://github.com/iamfather420-ctrl/Base-Waste-Harvester/releases/download/zlib-headers/libz-arm64-v8a.so
android.add_libs_x86 = yes | https://github.com/iamfather420-ctrl/Base-Waste-Harvester/releases/download/zlib-headers/libz-x86.so
android.add_libs_x86_64 = yes | https://github.com/iamfather420-ctrl/Base-Waste-Harvester/releases/download/zlib-headers/libz-x86_64.so

# Gradle and build flags
android.gradle_dependencies = androidx.appcompat:appcompat:1.6.1
android.add_src = yes
android.release_artifact = aab
android.logcat_filters = *:S python:D
android.debug_symbols = yes
android.external_storage = yes
android.copy_libs = yes
android.permissions = INTERNET,ACCESS_NETWORK_STATE

[buildozer]
log_level = 2
warn_on_root = 1
