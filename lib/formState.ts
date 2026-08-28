/**
 * React resets uncontrolled form fields once a `<form action={...}>` submission
 * completes, whether the action succeeds or returns an error — so a failed
 * validation would otherwise wipe everything the admin just typed. Server
 * actions call this to echo the submitted text fields back in their error
 * state, and forms re-key themselves off that state to repopulate the DOM.
 */
export function extractFormValues(formData: FormData, fields: string[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of fields) {
    values[field] = String(formData.get(field) ?? "");
  }
  return values;
}
