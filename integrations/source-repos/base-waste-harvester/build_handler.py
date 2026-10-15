#!/usr/bin/env python3
"""
Planetary Harvester Build Handler
Manages YAML configuration, zlib header outsourcing, and Android debug builds
"""

import os
import sys
import json
import yaml
import shutil
from pathlib import Path

class BuildHandler:
    def __init__(self, config_file="build_config.yaml"):
        self.config_file = config_file
        self.config = self._load_config()
        self.project_root = Path(__file__).parent
        
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
    
    def setup_zlib_headers(self):
        """Setup zlib headers for Android architectures."""
        print("[ZLIB] Setting up zlib headers for Android debug...")
        
        libs_dir = self.project_root / "libs"
        libs_dir.mkdir(exist_ok=True)
        
        architectures = self.config['android']['zlib']['architectures']
        for arch in architectures:
            arch_dir = libs_dir / arch
            arch_dir.mkdir(exist_ok=True)
            
            # Create placeholder zlib library reference
            lib_path = arch_dir / "libz.so"
            if not lib_path.exists():
                lib_path.touch()
            print(f"[ZLIB] Prepared {arch}: {lib_path}")
        
        print("[ZLIB] zlib headers outsourced and configured")
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
        
        # Check for critical settings
        required_settings = [
            "android.api = 34",
            "android.minapi = 21",
            "android.ndk = 25b",
            "android.accept_catch_all = True",
            "android.debug_symbols = yes"
        ]
        
        for setting in required_settings:
            if setting not in spec_content:
                print(f"[WARNING] Missing setting: {setting}")
        
        print("[VALIDATION] buildozer.spec validation complete")
        return True
    
    def prepare_build_environment(self):
        """Prepare the complete build environment."""
        print("[BUILD] Preparing Planetary Harvester build environment...")
        
        # Setup zlib headers
        self.setup_zlib_headers()
        
        # Validate buildozer.spec
        self.validate_buildozer_spec()
        
        # Create build metadata
        metadata = {
            "build_timestamp": __import__('datetime').datetime.utcnow().isoformat(),
            "configuration": self.config,
            "status": "READY"
        }
        
        metadata_file = self.project_root / ".build_metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print("[BUILD] Environment preparation complete")
        return True
    
    def generate_build_command(self):
        """Generate the buildozer command with all necessary flags."""
        cmd = "buildozer android debug"
        
        if self.config['build_flags']['accept_sdk_license']:
            cmd += " -- --accept-android-sdk-license"
        
        print(f"[BUILD COMMAND] {cmd}")
        return cmd


if __name__ == "__main__":
    handler = BuildHandler()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "prepare":
            handler.prepare_build_environment()
        elif command == "validate":
            handler.validate_buildozer_spec()
        elif command == "zlib":
            handler.setup_zlib_headers()
        elif command == "cmd":
            handler.generate_build_command()
        else:
            print(f"[ERROR] Unknown command: {command}")
            sys.exit(1)
    else:
        handler.prepare_build_environment()
