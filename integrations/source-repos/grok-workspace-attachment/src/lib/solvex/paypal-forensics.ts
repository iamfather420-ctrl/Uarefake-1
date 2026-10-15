export const paypalForensics = {
  "test_suite": "PAYPAL_DUAL_ENVIRONMENT_FORENSIC_TEST",
  "execution_id": "exec_paypal_1790484597629",
  "timestamp": "2026-09-27T04:49:57.629Z",
  "configuration": {
    "sandbox_client_id": "PRESENT",
    "sandbox_var_names_used": [
      "PAYPAL_SANDBOX_CLIENT_ID",
      "PAYPAL_SANDBOX_ID",
      "PAYPAL_SANDBOX_CLIENT_SECRET",
      "PAYPAL_SANDBOX_KEY"
    ],
    "live_client_id": "PRESENT",
    "live_var_names_used": [
      "PAYPAL_LIVE_CLIENT_ID",
      "PAYPAL_LIVE_LIVE_NT_SECRET"
    ],
    "active_environment_configured": "SANDBOX"
  },
  "authentication": {
    "sandbox_auth": "FAIL",
    "sandbox_status_code": 401,
    "live_auth": "PASS",
    "live_status_code": 200,
    "live_environment": "LIVE"
  }
} as const;
