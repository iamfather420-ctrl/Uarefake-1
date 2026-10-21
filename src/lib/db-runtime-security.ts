/**
 * Fail-closed verification for the application's PostgreSQL runtime identity.
 *
 * The login role is expected to be a narrowly-scoped LOGIN role which can
 * switch only to the NOLOGIN application role. The effective role must not
 * bypass RLS or hold database/role creation privileges.
 */
export type RuntimeRoleSecurityRow = {
  session_user: string;
  current_user: string;
  session_can_login: boolean;
  session_is_superuser: boolean;
  session_bypasses_rls: boolean;
  session_can_create_database: boolean;
  session_can_create_roles: boolean;
  session_is_neon_superuser_member: boolean;
  current_can_login: boolean;
  current_is_superuser: boolean;
  current_bypasses_rls: boolean;
  current_can_create_database: boolean;
  current_can_create_roles: boolean;
  current_is_neon_superuser_member: boolean;
  session_can_use_current_role: boolean;
};

const truthy = (value: unknown) => value === true || value === "t";

/** Only the explicitly provisioned role pair is accepted in production. */
export function isLeastPrivilegeRuntimeRole(
  row: Partial<RuntimeRoleSecurityRow> | null | undefined,
): boolean {
  if (!row) return false;

  return (
    row.session_user === "solvex_runtime_login_v2" &&
    row.current_user === "solvex_app_runtime" &&
    truthy(row.session_can_login) &&
    !truthy(row.session_is_superuser) &&
    !truthy(row.session_bypasses_rls) &&
    !truthy(row.session_can_create_database) &&
    !truthy(row.session_can_create_roles) &&
    !truthy(row.session_is_neon_superuser_member) &&
    !truthy(row.current_can_login) &&
    !truthy(row.current_is_superuser) &&
    !truthy(row.current_bypasses_rls) &&
    !truthy(row.current_can_create_database) &&
    !truthy(row.current_can_create_roles) &&
    !truthy(row.current_is_neon_superuser_member) &&
    truthy(row.session_can_use_current_role)
  );
}
