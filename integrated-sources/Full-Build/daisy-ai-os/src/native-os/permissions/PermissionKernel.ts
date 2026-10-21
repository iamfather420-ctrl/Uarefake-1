/**
 * Daisy native permissions — fail-closed until an authenticated authorization
 * verifier is injected. A subject label is not proof of identity or consent.
 */
import type { PermissionGrant } from '../types.ts';

export class PermissionKernel {
  private grants: PermissionGrant[] = [];

  request(subject: string, resource: string, action: PermissionGrant['action']): PermissionGrant {
    const publicRead = action === 'read' && resource.startsWith('public:');
    const grant: PermissionGrant = {
      subject,
      resource,
      action,
      granted: publicRead,
      reason: publicRead
        ? 'Public read-only resource'
        : 'BLOCKED: authenticated identity and operation-bound human authorization verifier are not configured',
    };
    this.grants.push(grant);
    return grant;
  }

  list(): PermissionGrant[] {
    return [...this.grants];
  }
}
