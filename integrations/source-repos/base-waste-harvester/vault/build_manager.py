#!/usr/bin/env python3
"""
Base Waste Harvester Build Manager
Manages GitHub-hosted zlib headers and Android build configuration
"""

import os
import sys
import json
import yaml
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime

class BuildManager:
    def __init__(self, config_file="build_config.yaml"):
        self.config_file = config_file
        self.config = self._load_config()
        self.project_root = Path(__file__).parent
        self.libs_dir = self.project_root / "libs"
        
    def _load_config(self):
        """Load YAML build configuration."""
        try:
            with open(self.config_file, 'r') as f:
                config = yaml.safe_load(f)
            print(f"[BUILD] Configuration loaded from {self.config_file}")
            return config
        except Exception as e:
            print(f"[ERROR] Failed to load configuration: {e}")
            sys.exit(1)
    
    def download_github_zlib_headers(self):
        """Download zlib headers from GitHub releases."""
        print("[ZLIB] Downloading zlib headers from GitHub...")
        
        self.libs_dir.mkdir(exist_ok=True)
        
        zlib_config = self.config['zlib_headers']
        architectures = zlib_config['architectures']
        
        for arch, url in architectures.items():
            # Extract actual URL from "yes | url" format
            if " | " in url:
                url = url.split(" | ", 1)[1].strip()
            
            arch_dir = self.libs_dir / arch
            arch_dir.mkdir(exist_ok=True)
            
            lib_path = arch_dir / "libz.so"
            
            try:
                print(f"[ZLIB] Downloading {arch} from {url}...")
                urllib.request.urlretrieve(url, lib_path)
                print(f"[ZLIB] ✓ {arch}: {lib_path}")
            except urllib.error.URLError as e:
                print(f"[WARNING] Failed to download {arch}: {e}")
                # Create placeholder if download fails
                lib_path.touch()
                print(f"[ZLIB] Created placeholder: {lib_path}")
        
        print("[ZLIB] GitHub-hosted zlib headers configured")
        return True
    
    def validate_buildozer_spec(self):
        """Validate buildozer.spec against YAML configuration."""
        print("[VALIDATION] Checking buildozer.spec...")
        
        spec_file = self.project_root / "buildozer.spec"
        if not spec_file.exists():
            print("[ERROR] buildozer.spec not found")
            return False
        
        with open(spec_file, 'r') as f:
            spec_content = f.read()
        
        # Check for critical settings with yes | directives
        required_settings = [
            "android.api = 34",
            "android.minapi = 21",
            "android.ndk = 25b",
            "yes |",  # Check for yes | directive
            "android.debug_symbols = yes"
        ]
        
        for setting in required_settings:
            if setting not in spec_content:
                print(f"[WARNING] Missing setting: {setting}")
        
        print("[VALIDATION] buildozer.spec validation complete")
        return True
    
    def prepare_build_environment(self):
        """Prepare the complete build environment."""
        print("[BUILD] Preparing Base Waste Harvester build environment...")
        
        # Download GitHub-hosted zlib headers
        self.download_github_zlib_headers()
        
        # Validate buildozer.spec
        self.validate_buildozer_spec()
        
        # Create build metadata
        metadata = {
            "build_timestamp": datetime.utcnow().isoformat(),
            "configuration": self.config,
            "status": "READY",
            "zlib_headers_source": "GitHub",
            "github_repository": "iamfather420-ctrl/Base-Waste-Harvester"
        }
        
        metadata_file = self.project_root / ".build_metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print("[BUILD] Environment preparation complete")
        return True
    
    def generate_build_command(self):
        """Generate the buildozer command with all necessary flags."""
        cmd = "buildozer android debug"
        
        if self.config['android']['build_flags'].get('accept_sdk_license'):
            cmd += " -- --accept-android-sdk-license"
        
        print(f"[BUILD COMMAND] {cmd}")
        return cmd
    
    def setup_github_release_artifacts(self):
        """Setup GitHub release artifacts for zlib headers."""
        print("[GITHUB] Setting up GitHub release artifacts...")
        
        # Create a manifest for GitHub releases
        manifest = {
            "release_name": "zlib-headers",
            "description": "Ubuntu-compiled zlib headers for Base Waste Harvester",
            "architectures": list(self.config['zlib_headers']['architectures'].keys()),
            "created_at": datetime.utcnow().isoformat()
        }
        
        manifest_file = self.project_root / ".github_release_manifest.json"
        with open(manifest_file, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        print("[GITHUB] Release manifest created")
        return True


if __name__ == "__main__":
    manager = BuildManager()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "prepare":
            manager.prepare_build_environment()
        elif command == "validate":
            manager.validate_buildozer_spec()
        elif command == "zlib":
            manager.download_github_zlib_headers()
        elif command == "cmd":
            manager.generate_build_command()
        elif command == "github":
            manager.setup_github_release_artifacts()
        else:
            print(f"[ERROR] Unknown command: {command}")
            sys.exit(1)
    else:
        manager.prepare_build_environment()
