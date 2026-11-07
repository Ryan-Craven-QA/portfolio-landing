/**
 * Every internal URL is built here so links stay consistent with the
 * `trailingSlash: 'always'` setting. Pure module.
 */
export const routes = {
  home: '/',
  products: '/products/',
  solutions: '/solutions/',
  resources: '/resources/',
  about: '/about/',
  contact: '/contact/',
  support: '/support/',
  rss: '/rss.xml',
  searchIndex: '/search.json',
  line: (lineId: string) => `/products/${lineId}/`,
  product: (lineId: string, productId: string) => `/products/${lineId}/${productId}/`,
  solution: (solutionId: string) => `/solutions/${solutionId}/`,
  resource: (resourceId: string) => `/resources/${resourceId}/`,
  legal: (pageId: string) => `/legal/${pageId}/`,
  contactTopic: (topic: 'general' | 'support' | 'business', productId?: string) =>
    `/contact/?topic=${topic}${productId ? `&product=${encodeURIComponent(productId)}` : ''}#contact-form`,
} as const;

/** True for absolute http(s) URLs. */
export function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
