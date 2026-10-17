[app]
title = Planetary Harvester
package.name = planetaryharvester
package.domain = org.agate
source.dir = .
source.include_exts = py,png,jpg,kv,atlas,yaml,json
version = 1.0.0
requirements = python3,kivy,pillow,pyyaml,zlib,requests
orientation = portrait
osx.kivy_version = 2.2.0

# Optimized Android Build Directives
android.presplash_color = #0A0A0A
android.permissions = INTERNET,ACCESS_NETWORK_STATE
android.api = 34
android.minapi = 21
android.ndk = 25b
android.accept_catch_all = True
android.gradle_dependencies = androidx.appcompat:appcompat:1.6.1,com.squareup.okhttp3:okhttp:4.11.0
android.add_src = yes
android.release_artifact = aab
android.logcat_filters = *:S python:D
android.debug_symbols = yes

# zlib header configuration for Android debug
android.add_libs_armeabi_v7a = libs/armeabi-v7a/libz.so
android.add_libs_arm64_v8a = libs/arm64-v8a/libz.so
android.add_libs_x86 = libs/x86/libz.so
android.add_libs_x86_64 = libs/x86_64/libz.so

# Outsource zlib headers to pass Android debug validation
android.external_storage = yes
android.copy_libs = yes

icon.filename = icon.png
presplash.filename = presplash.png

[buildozer]
log_level = 2
warn_on_root = 1
android.skip_update = yes
android.accept_sdk_license = yes
