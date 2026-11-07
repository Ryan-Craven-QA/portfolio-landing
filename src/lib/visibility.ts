/**
 * Public-visibility rules — the single source of truth.
 *
 * Every page, listing, the search index, the RSS feed, the sitemap and the
 * build verification script decide what is public through these functions.
 * Pure module (no Astro imports) so /scripts and unit tests can use it.
 *
 * Defaults are safe: a product line is hidden unless `visible: true`, a product
 * is a draft unless `visibility: public`, and a resource is a draft unless
 * `status: published`.
 */

export interface VisibilityContext {
  /** True only in `npm run dev:drafts` (dev server + drafts mode). Never true in a build. */
  previewDrafts: boolean;
  /** Build time; resources with a future publish date stay hidden until a later build. */
  now: Date;
}

export interface BusinessLike {
  id: string;
  visible: boolean;
}

export interface ProductLike {
  visibility: 'public' | 'draft';
  business: string;
}

export interface ResourceLike {
  status: 'published' | 'draft';
  publishDate: Date;
  business?: string | undefined;
}

export interface SolutionLike {
  businesses: readonly string[];
}

export interface LegalLike {
  status: 'published' | 'draft';
}

export function isBusinessPublic(business: BusinessLike, ctx: VisibilityContext): boolean {
  return ctx.previewDrafts || business.visible === true;
}

/** A product is public only if it is marked public AND its product line is public. */
export function isProductPublic(
  product: ProductLike,
  businessesById: ReadonlyMap<string, BusinessLike>,
  ctx: VisibilityContext,
): boolean {
  if (ctx.previewDrafts) return true;
  const business = businessesById.get(product.business);
  return product.visibility === 'public' && business !== undefined && isBusinessPublic(business, ctx);
}

/**
 * A resource is public when published, its publish date has passed, and — if
 * it belongs to a product line — that line is public.
 */
export function isResourcePublic(
  resource: ResourceLike,
  businessesById: ReadonlyMap<string, BusinessLike>,
  ctx: VisibilityContext,
): boolean {
  if (ctx.previewDrafts) return true;
  if (resource.status !== 'published') return false;
  if (resource.publishDate.getTime() > ctx.now.getTime()) return false;
  if (resource.business === undefined) return true;
  const business = businessesById.get(resource.business);
  return business !== undefined && isBusinessPublic(business, ctx);
}

/** A solution is shown when at least one of its product lines is public. */
export function isSolutionPublic(
  solution: SolutionLike,
  businessesById: ReadonlyMap<string, BusinessLike>,
  ctx: VisibilityContext,
): boolean {
  if (ctx.previewDrafts) return true;
  return solution.businesses.some((id) => {
    const business = businessesById.get(id);
    return business !== undefined && isBusinessPublic(business, ctx);
  });
}

export function isLegalPublic(page: LegalLike, ctx: VisibilityContext): boolean {
  return ctx.previewDrafts || page.status === 'published';
}

/** Whether an item is only visible because draft preview is on (used for the preview banner). */
export function isDraftOnlyVisible(isPublicWithoutPreview: boolean, ctx: VisibilityContext): boolean {
  return ctx.previewDrafts && !isPublicWithoutPreview;
}
