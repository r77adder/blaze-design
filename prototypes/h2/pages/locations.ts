/**
 * The set of Google Business Profile locations for the demo account
 * (CertaPro Painters of Austin). Every location shares the same business
 * name on purpose — the street address + neighborhood is the only thing that
 * distinguishes them. Used by:
 *   - LocationPickerModal (cold-state "which profiles should Blaze manage?")
 *   - OrganicProfile › ProfilePreviewTab (steady-state location switcher)
 */

export interface BusinessLocation {
  id: string;
  /** Same for every location — the address disambiguates. */
  name: string;
  /** Street line, e.g. "401 Congress Ave, Ste 1540". */
  street: string;
  /** City/state/zip line, e.g. "Austin, TX 78701". */
  cityState: string;
  /** Neighborhood tag, the clearest human-readable disambiguator. */
  neighborhood: string;
  /** Unsplash photo id used as the location's profile photo. */
  photoId: string;
}

/** Build an Unsplash URL for a location photo at the requested dimensions. */
export function photoUrl(loc: BusinessLocation, w: number, h?: number): string {
  const size = h ? `w=${w}&h=${h}` : `w=${w}`;
  return `https://images.unsplash.com/${loc.photoId}?${size}&q=80&auto=format&fit=crop`;
}

/** "Austin, TX 78701 · Downtown" — the secondary metadata line. */
export const regionLine = (loc: BusinessLocation) => `${loc.cityState} · ${loc.neighborhood}`;

/** "401 Congress Ave, Ste 1540, Austin, TX 78701" — one-line full address. */
export const fullAddress = (loc: BusinessLocation) => `${loc.street}, ${loc.cityState}`;

export const AUSTIN_LOCATIONS: BusinessLocation[] = [
  {
    id: 'downtown',
    name: 'CertaPro Painters of Austin',
    street: '401 Congress Ave, Ste 1540',
    cityState: 'Austin, TX 78701',
    neighborhood: 'Downtown',
    photoId: 'photo-1600585154340-be6161a56a0c',
  },
  {
    id: 'north',
    name: 'CertaPro Painters of Austin',
    street: '2525 W Anderson Ln, Ste 540',
    cityState: 'Austin, TX 78757',
    neighborhood: 'Crestview',
    photoId: 'photo-1568605114967-8130f3a36994',
  },
  {
    id: 'lakeway',
    name: 'CertaPro Painters of Austin',
    street: '5145 N FM 620, Bldg C',
    cityState: 'Austin, TX 78732',
    neighborhood: 'Steiner Ranch',
    photoId: 'photo-1570129477492-45c003edd2be',
  },
  {
    id: 'mueller',
    name: 'CertaPro Painters of Austin',
    street: '1801 E 51st St, Ste 200',
    cityState: 'Austin, TX 78723',
    neighborhood: 'Mueller',
    photoId: 'photo-1600566753086-00f18fb6b3ea',
  },
  {
    id: 'southwest',
    name: 'CertaPro Painters of Austin',
    street: '9600 Escarpment Blvd, Ste 745',
    cityState: 'Austin, TX 78749',
    neighborhood: 'Circle C',
    photoId: 'photo-1600607687939-ce8a6c25118c',
  },
];
