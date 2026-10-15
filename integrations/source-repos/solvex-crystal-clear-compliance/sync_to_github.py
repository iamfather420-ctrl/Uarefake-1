import os
import subprocess
import base64
from datetime import datetime

# Configuration
# Fetches the token securely from the environment variables (secrets)
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN") 
if not GITHUB_TOKEN:
    raise ValueError("GITHUB_TOKEN environment variable is missing. Please set it securely in your environment.")

GITHUB_USERNAME = "iamfather420-ctrl"
GITHUB_REPO = "Base-Waste-Harvester"
GITHUB_BRANCH = "main"

def setup_git_credentials():
    """Configure Git with GitHub credentials"""
    print("Setting up Git credentials...")
    subprocess.run(["git", "config", "--global", "user.name", GITHUB_USERNAME])
    subprocess.run(["git", "config", "--global", "user.email", "i.am.father.420@gmail.com"])

def clone_repo():
    """Clone repository with token authentication"""
    repo_url = f"https://{GITHUB_TOKEN}@github.com/{GITHUB_USERNAME}/{GITHUB_REPO}.git"
    if not os.path.exists(GITHUB_REPO):
        print(f"Cloning repository {GITHUB_REPO}...")
        subprocess.run(["git", "clone", repo_url])
    else:
        print("Repository already cloned. Pulling latest architecture...")
        os.chdir(GITHUB_REPO)
        subprocess.run(["git", "pull", "origin", GITHUB_BRANCH])
        os.chdir("..")

def copy_vault_artifacts():
    """Inject local vault artifacts into the git repository staging area"""
    print("Migrating vault artifacts to the repository branch...")
    # Creates vault directory in the clone if it does not exist
    os.makedirs(f"{GITHUB_REPO}/vault", exist_ok=True)
    
    # Force copy the critical files into the repo folder
    if os.path.exists("vault/main.py"):
        subprocess.run(["cp", "vault/main.py", f"{GITHUB_REPO}/vault/"])
    if os.path.exists("vault/buildozer.spec"):
        subprocess.run(["cp", "vault/buildozer.spec", f"{GITHUB_REPO}/vault/"])

def sync_files(files_to_sync, commit_message):
    """Add, commit, and push files to GitHub"""
    os.chdir(GITHUB_REPO)
    
    for file_path in files_to_sync:
        print(f"Staging verified payload: {file_path}")
        subprocess.run(["git", "add", file_path])
    
    subprocess.run(["git", "commit", "-m", commit_message])
    print("Initiating secure packet transmission to remote GitHub server...")
    subprocess.run(["git", "push", "origin", GITHUB_BRANCH])
    
    os.chdir("..")

if __name__ == "__main__":
    print("Initializing sync protocol...")
    
    # Execute structural setup
    setup_git_credentials()
    clone_repo()
    copy_vault_artifacts()
    
    # Sync multiple required artifacts (Relative to repository root)
    files = ["vault/main.py", "vault/buildozer.spec"]
    
    # Generate timestamped signature
    timestamp = datetime.now().isoformat()
    sync_files(files, f"ci(sync): enforce vault architecture payload at {timestamp}")

    print(f"Data transmission complete. Vault payload pushed to {GITHUB_BRANCH}.")
