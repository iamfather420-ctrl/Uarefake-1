
/**
 * VaultService handles the local persistence of sensitive data.
 * It uses localStorage for persistence but provides a wrapper for future-proofing
 * with possible encryption layers.
 */
export class VaultService {
  private static PREFIX = 'wh_vault_';

  static storeSecret(key: string, value: string) {
    if (!value) return;
    // In a production environment, we would use a library like crypto-js to encrypt this 
    // with a user-provided master password. For this implementation, we prioritize 
    // local-only access.
    localStorage.setItem(this.PREFIX + key, btoa(value)); 
  }

  static getSecret(key: string): string | null {
    const val = localStorage.getItem(this.PREFIX + key);
    if (!val) return null;
    try {
      return atob(val);
    } catch {
      return null;
    }
  }

  static removeSecret(key: string) {
    localStorage.removeItem(this.PREFIX + key);
  }

  static clearVault() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
}
