/**
 * High-level reporting presentation label by entity country (not statutory filing).
 */
export function presentationLabelForCountry(country) {
  if (country === 'India') return 'IND AS–style presentation (simplified)';
  if (country === 'EU') return 'IFRS-style presentation';
  return 'US GAAP-style presentation';
}
