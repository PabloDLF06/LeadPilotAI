import { describe, expect, it } from "vitest";

import { classifyWorkspaceError, organizationSlug } from "@/lib/auth/bootstrap";

describe("workspace bootstrap safeguards", () => {
  it("classifica un fallo de grants sin exponer secretos", () => {
    expect(classifyWorkspaceError(new Error("permission denied for table organizations"))).toBe("table_permission_denied");
    expect(classifyWorkspaceError(new Error("new row violates row-level security policy"))).toBe("rls_denied");
    expect(classifyWorkspaceError(new Error("Missing Supabase server admin key"))).toBe("admin_key_missing");
    expect(classifyWorkspaceError(new Error("Invalid Supabase server admin key: publishable key supplied"))).toBe("admin_key_invalid");
  });

  it("genera un slug determinista distinto por usuario", () => {
    expect(organizationSlug("11111111-1111-1111-1111-111111111111")).not.toBe(organizationSlug("22222222-2222-2222-2222-222222222222"));
  });
});
