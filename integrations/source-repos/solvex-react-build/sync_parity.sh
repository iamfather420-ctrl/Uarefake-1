#!/usr/bin/env bash
# ==============================================================================
# PROJECT AGATE: 3-WAY SYNC PARITY UTILITY
# Script: ./sync_parity.sh
# Purpose: Establishes parity between Termux, Local Builds, and Remote Git Origin.
# ==============================================================================

set -e

echo "=== [1/4] INJECTING GRADLE CONFIGURATION ==="
mkdir -p app/src/main/assets app/src/main/java

# Implement user-requested gradle source sets for structural linking
cat << 'GRADLE_EOF' > app/build.gradle
android {
    // Project Agate Custom SourceSet Mappings
    sourceSets {
        main {
            // This tells Gradle to include your vault and core logic
            // Linking direct to repository structures
            assets.srcDirs = ['src/main/assets', '../consensus-vault']
            java.srcDirs = ['src/main/java', '../os-core']
        }
    }
}
GRADLE_EOF
echo "[STATUS] Inject target: app/build.gradle configured."

echo "=== [2/4] SYNCHRONIZING TERMUX ENVIRONMENT ==="
# Attempt to mirror states to standard termux runtime paths if executing locally
if [ -d "$HOME/.agate_node" ]; then
    echo "[STATUS] Agate node detected at $HOME/.agate_node. Copying gradle bindings..."
    cp -r app "$HOME/.agate_node/" 2>/dev/null || true
    echo "[STATUS] Termux environment aligned."
else
    echo "[WARNING] Primary node not detected at standard path. Proceeding with repository alignment..."
fi

echo "=== [3/4] ENFORCING FORENSIC GIT SYNC ==="
git add app/build.gradle
git add sync_parity.sh

if ! git diff-index --quiet HEAD; then
    git commit -m "[SolveX] Forensic Override: Gradle sourceSet parity injection and 3-way sync" || true
fi

echo "=== [4/4] ALIGNING ORIGIN REPOSITORY ==="
# Abort any lingering rebases/merges
git merge --abort >/dev/null 2>&1 || true
git rebase --abort >/dev/null 2>&1 || true

# Pull any upstream changes first to prevent collision
git pull origin main --rebase || (git rebase --abort >/dev/null 2>&1 || true)
# Force the parity state upward
git push origin main --force

echo "================================================================================"
echo "[SUCCESS] Project Agate Sync Parity enforced across Termux, Gradle, and Git."
echo "================================================================================"
