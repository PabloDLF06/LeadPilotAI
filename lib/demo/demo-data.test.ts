import { describe, expect, it } from "vitest";

import { isDemoDatasetLoaded } from "@/lib/demo/demo-data";

describe("demo dataset guard", () => {
  it("es idempotente para la misma organización y no cuenta datos de otra", () => {
    const records = [{ organization_id: "org-a", metadata: { demo_dataset: "nova-growth-v1" } }];
    expect(isDemoDatasetLoaded(records, "org-a")).toBe(true);
    expect(isDemoDatasetLoaded(records, "org-b")).toBe(false);
  });
});
