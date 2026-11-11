/**
 * FICTIONAL sample data for the interactive demo on the homepage.
 *
 * Every vendor, person and date here is made up. Names are deliberately
 * unusual so they are not mistaken for real businesses; the demo is labelled
 * "fictional" wherever it appears. Dates are stored as offsets from today
 * (expiresIn) so the demo never goes stale.
 *
 * Pure module — shared by the server render and the client script.
 */
import type { TrackedDocument } from '../lib/renewals.ts';

export interface DemoPerson {
  id: string;
  name: string;
  role: string;
  /** Hue for the avatar dot (OKLCH). */
  hue: number;
}

export const demoPeople: DemoPerson[] = [
  { id: 'dana', name: 'Dana', role: 'Office manager', hue: 200 },
  { id: 'marcus', name: 'Marcus', role: 'Property manager', hue: 255 },
  { id: 'priya', name: 'Priya', role: 'Property manager', hue: 150 },
  { id: 'sam', name: 'Sam', role: 'Assistant', hue: 85 },
];

export const demoDocuments: TrackedDocument[] = [
  { id: 'd01', vendor: 'Quillfeather Plumbing', trade: 'Plumbing', document: 'Certificate of insurance', expiresIn: 6, state: 'on-file', owner: 'dana' },
  { id: 'd02', vendor: 'Brassbell Electric', trade: 'Electrical', document: 'Certificate of insurance', expiresIn: -4, state: 'on-file', owner: 'marcus' },
  { id: 'd03', vendor: 'Tumbleweed Landscaping', trade: 'Landscaping', document: 'Workers’ comp certificate', expiresIn: 21, state: 'requested', requestedAgo: 9, owner: 'priya' },
  { id: 'd04', vendor: 'Larkspur HVAC', trade: 'HVAC', document: 'Signed vendor agreement', expiresIn: null, state: 'missing', owner: 'sam' },
  { id: 'd05', vendor: 'Wrenfield Pest Control', trade: 'Pest control', document: 'Business license', expiresIn: 12, state: 'received', owner: 'priya' },
  { id: 'd06', vendor: 'Glimmerlake Pool Service', trade: 'Pool service', document: 'Certificate of insurance', expiresIn: -18, state: 'requested', requestedAgo: 3, owner: 'sam' },
  { id: 'd07', vendor: 'Bluestem Painting', trade: 'Painting', document: 'Certificate of insurance', expiresIn: 28, state: 'on-file', owner: 'priya' },
  { id: 'd08', vendor: 'Ironpine Roofing', trade: 'Roofing', document: 'Certificate of insurance', expiresIn: 44, state: 'on-file', owner: 'dana' },
  { id: 'd09', vendor: 'Thistle & Pine Snow Removal', trade: 'Snow removal', document: 'Auto liability certificate', expiresIn: 57, state: 'on-file', owner: 'dana' },
  { id: 'd10', vendor: 'Oakhaven Locksmiths', trade: 'Locksmith', document: 'Business license', expiresIn: 96, state: 'on-file', owner: 'marcus' },
  { id: 'd11', vendor: 'Brassbell Electric', trade: 'Electrical', document: 'Contractor license', expiresIn: 140, state: 'on-file', owner: 'marcus' },
  { id: 'd12', vendor: 'Hollowbrook Elevator', trade: 'Elevator service', document: 'Certificate of insurance', expiresIn: 205, state: 'on-file', owner: 'marcus' },
  { id: 'd13', vendor: 'Copperkettle Cleaning', trade: 'Cleaning', document: 'W-9', expiresIn: null, state: 'on-file', owner: 'sam' },
  { id: 'd14', vendor: 'Quillfeather Plumbing', trade: 'Plumbing', document: 'W-9', expiresIn: null, state: 'missing', owner: 'dana' },
];

export function personById(id: string): DemoPerson {
  return demoPeople.find((person) => person.id === id) ?? { id, name: id, role: '', hue: 50 };
}
