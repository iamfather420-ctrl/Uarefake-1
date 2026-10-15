[app]

# (str) Title of your application
title = SolveX Crystal Clear Box

# (str) Package name
package.name = solvex_crystal_box

# (str) Package domain (needed for android packaging)
package.domain = org.agate

# (str) Source code where the main.py live
source.dir = .

# (list) Source files to include (leave empty to include all the files)
source.include_exts = py,png,jpg,kv,atlas

# (list) List of inclusions using pattern matching
#source.include_patterns = assets/*,images/*.png

# (list) Source files to exclude (leave empty to not exclude anything)
#source.exclude_exts = spec

# (list) List of directories to exclude (leave empty to not exclude anything)
#source.exclude_dirs = tests, bin, venv

# (list) List of exclusions using pattern matching
#source.exclude_patterns = license,images/*/*.jpg

# (str) Application versioning (method 1)
version = 1.0.0

# (list) Application requirements
# comma separated e.g. requirements = sqlite3,kivy
requirements = python3, kivy

# (str) Supported orientations
orientation = portrait

# ---------------------------------------------------------------------------
# Android specific configurations
# ---------------------------------------------------------------------------

# (int) Target Android API, should be as high as possible.
android.api = 34

# (int) Minimum API your APK / AAB will support.
android.minapi = 21

# (int) Android SDK version to use
android.sdk = 20

# (str) Android NDK version to use
android.ndk = 25b

# (int) Android NDK API to use. This is the minimum API your app will support.
android.ndk_api = 21

# (bool) If True, then automatically accept SDK license
# agreements. This is intended for automation only.
android.accept_sdk_license = True

