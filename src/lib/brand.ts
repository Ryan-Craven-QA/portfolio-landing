/**
 * Copy in src/config/*.ts uses a {brand} token so the product name can change
 * (e.g. after trademark clearance) by editing `name` in src/config/site.ts.
 */
export function brandify(text: string, brand: string): string {
  return text.replaceAll('{brand}', brand);
}
