import { filterTransactionsByRange } from './reporting';

/**
 * Minimal GSTR-1–shaped draft from journal tax metadata (not a government fileable return).
 */
export function buildGstr1Draft(transactions, fromDate, toDate) {
  const slice = filterTransactionsByRange(transactions || [], fromDate, toDate);
  const b2b = [];

  for (const tx of slice) {
    const t = tx.tax;
    if (!t || t.regime !== 'GST' || t.kind !== 'sale') continue;

    b2b.push({
      voucher_id: tx.id,
      date: tx.date,
      description: tx.description,
      taxable_value: Number(t.base) || 0,
      tax_rate_pct: Number(t.rate) || 0,
      tax_type: t.type,
      tax_amount: Number(t.amount) || 0,
      hsn_sac: t.hsn_sac || null,
      place_of_supply: t.place_of_supply || null,
    });
  }

  return {
    disclaimer:
      'Draft JSON derived from internal journals only. It is not a valid or fileable GSTR-1 payload.',
    generated_at: new Date().toISOString(),
    period: { from: fromDate, to: toDate },
    document_type: 'gstr1_style_draft_v1',
    b2b,
  };
}
