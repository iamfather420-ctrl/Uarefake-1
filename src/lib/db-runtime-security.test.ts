import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isLeastPrivilegeRuntimeRole,
  type RuntimeRoleSecurityRow,
} from "./db-runtime-security.ts";

const safeRole: RuntimeRoleSecurityRow = {
  session_user: "solvex_runtime_login_v2",
  current_user: "solvex_app_runtime",
  session_can_login: true,
  session_is_superuser: false,
  session_bypasses_rls: false,
  session_can_create_database: false,
  session_can_create_roles: false,
  session_is_neon_superuser_member: false,
  current_can_login: false,
  current_is_superuser: false,
  current_bypasses_rls: false,
  current_can_create_database: false,
  current_can_create_roles: false,
  current_is_neon_superuser_member: false,
  session_can_use_current_role: true,
};

describe("isLeastPrivilegeRuntimeRole", () => {
  it("accepts only the expected safe login/effective-role pair", () => {
    assert.equal(isLeastPrivilegeRuntimeRole(safeRole), true);
  });

  it("rejects the legacy privileged runtime login", () => {
    assert.equal(
      isLeastPrivilegeRuntimeRole({
        ...safeRole,
        session_user: "solvex_runtime_login",
        session_bypasses_rls: true,
        session_can_create_database: true,
        session_can_create_roles: true,
        session_is_neon_superuser_member: true,
      }),
      false,
    );
  });

  it("rejects a runtime login that can bypass row-level security", () => {
    assert.equal(
      isLeastPrivilegeRuntimeRole({ ...safeRole, session_bypasses_rls: true }),
      false,
    );
  });

  it("rejects a privileged effective role even if the login itself is safe", () => {
    assert.equal(
      isLeastPrivilegeRuntimeRole({
        ...safeRole,
        current_user: "neondb_owner",
        current_is_superuser: true,
        current_bypasses_rls: true,
      }),
      false,
    );
  });

  it("rejects unexpected identities, role escalation membership, and missing fields", () => {
    assert.equal(
      isLeastPrivilegeRuntimeRole({
        ...safeRole,
        current_is_neon_superuser_member: true,
      }),
      false,
    );
    assert.equal(
      isLeastPrivilegeRuntimeRole({
        ...safeRole,
        session_can_use_current_role: false,
      }),
      false,
    );
    assert.equal(isLeastPrivilegeRuntimeRole(null), false);
    assert.equal(isLeastPrivilegeRuntimeRole({}), false);
  });
});
