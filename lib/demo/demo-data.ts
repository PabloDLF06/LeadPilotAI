export type DemoRecord = { organization_id: string; metadata?: { demo?: boolean; demo_dataset?: string } | null };

export function isDemoDatasetLoaded(records: DemoRecord[], organizationId: string) {
  return records.some((record) => record.organization_id === organizationId && (record.metadata?.demo === true || Boolean(record.metadata?.demo_dataset)));
}
