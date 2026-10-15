[app]
title = SolveX Node
package.name = solvexnode
package.domain = org.solvex

source.dir = app
source.include_exts = py,png,jpg,kv,atlas,json

version = 1.0.0

# REMOVED python3.11 from here - it's handled by buildozer automatically
requirements = kivy,fastapi,uvicorn,pydantic,python-multipart

orientation = portrait
fullscreen = 0

android.api = 34
android.ndk = 25b
android.minapi = 24
android.archs = arm64-v8a, armeabi-v7a

android.accept_sdk_license = True
android.skip_update = False

android.permissions = INTERNET, WRITE_EXTERNAL_STORAGE, READ_EXTERNAL_STORAGE

p4a.branch = master

[buildozer]
log_level = 2
warn_on_root = 0
