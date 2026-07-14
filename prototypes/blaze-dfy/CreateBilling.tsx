import { Heading, Text, Button, IconButton } from '@/components';
import { Select } from '@/staging';
import Plus from '@/icons/20/Plus';
import Trash2 from '@/icons/20/Trash2';
import File from '@/icons/20/File';
import Check2 from '@/icons/20/Check2';
import { Field } from './ui';
import {
  PACKAGES, packageByKey, CONTRACT_TERMS, monthlyTotal, oneOffTotal, usd, contractDates, fmtDate,
  type BillingInfo, type SelectedPackage, type Duration, type ContractTerm,
} from './lib/billing';

/** Small segmented control (matches the AM/Client switch styling). */
function Segmented<T extends string | number>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, padding: 3, background: 'var(--dark-3)', borderRadius: 8 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={String(o.value)} onClick={() => onChange(o.value)} style={{ border: on ? '1px solid var(--dark-8)' : '1px solid transparent', background: on ? 'var(--light-100)' : 'transparent', color: on ? 'var(--dark-90)' : 'var(--dark-60)', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}>{o.label}</button>
        );
      })}
    </div>
  );
}

/** Package option row: name left, catalog price right (dark-60). Used in the
 *  Select trigger and menu. */
function PkgOptionLabel({ name, price }: { name: string; price: string }) {
  return (
    <span style={{ display: 'flex', width: '100%', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      <span style={{ color: 'var(--dark-60)', flexShrink: 0 }}>{price}</span>
    </span>
  );
}

/** Editable price with a $ prefix and a duration suffix, styled like a field. */
function PriceField({ price, suffix, onChange }: { price: number; suffix: string; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 150, height: 46, padding: '0 12px', boxSizing: 'border-box', borderRadius: 8, border: '1px solid var(--dark-8)', background: 'var(--light-100)' }}>
      <span style={{ color: 'var(--dark-40)', fontSize: 14 }}>$</span>
      <input value={String(price)} inputMode="numeric" onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)} style={{ flex: 1, minWidth: 0, width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 14, color: 'var(--dark-90)' }} />
      <span style={{ color: 'var(--dark-40)', fontSize: 14, whiteSpace: 'nowrap' }}>{suffix}</span>
    </div>
  );
}

/** Billing editor for the New Workspace flow, multi-package, durations,
 *  custom prices, contract term, and a Dropbox Sign import. */
export function BillingSection({ value, onChange, imported, onImport }: {
  value: BillingInfo;
  onChange: (b: BillingInfo) => void;
  imported: boolean;
  onImport: () => void;
}) {
  const { packages, term } = value;
  const setPackages = (pkgs: SelectedPackage[]) => onChange({ ...value, packages: pkgs });
  const dates = contractDates(value.startDate, term);
  const mTotal = monthlyTotal(packages);
  const oTotal = oneOffTotal(packages);

  const addPackage = () => {
    const taken = new Set(packages.map((p) => p.key));
    const def = PACKAGES.find((p) => !taken.has(p.key)) ?? PACKAGES[0];
    setPackages([...packages, { key: def.key, duration: def.durations[0], price: def.price }]);
  };
  const updatePackage = (i: number, patch: Partial<SelectedPackage>) =>
    setPackages(packages.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <Heading level={3} style={{ margin: '0 0 4px' }}>Billing</Heading>
          <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', maxWidth: 420, lineHeight: 1.5 }}>Pulled from the signed contract in Dropbox Sign. Adjust anything that was negotiated, then we create the Stripe subscription.</Text>
        </div>
        {imported
          ? <Text variant="metadata" color="var(--positive-60)" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', paddingTop: 2 }}><Check2 /> Imported from Dropbox Sign</Text>
          : <Button variant="secondary" size="sm" frontIcon={File} onPress={onImport}>Pull from Dropbox Sign</Button>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        {packages.length === 0 && (
          <Text variant="secondary" color="var(--dark-40)" style={{ padding: '8px 0' }}>No packages yet. Pull from the contract or add one.</Text>
        )}
        {packages.map((p, i) => {
          const def = packageByKey(p.key)!;
          const dual = def.durations.length > 1;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Select
                  value={p.key}
                  onChange={(k) => { const d = packageByKey(k)!; updatePackage(i, { key: k, duration: d.durations.includes(p.duration) ? p.duration : d.durations[0], price: d.price }); }}
                  options={PACKAGES.map((pk) => ({ value: pk.key, label: <PkgOptionLabel name={pk.label} price={pk.priceLabel} /> }))}
                  size="lg"
                  fullWidth
                />
              </div>
              {dual && (
                <Segmented value={p.duration} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'one-off', label: 'One-off' }]} onChange={(d) => updatePackage(i, { duration: d as Duration })} />
              )}
              <PriceField price={p.price} suffix={p.duration === 'monthly' ? '/mo' : 'one-off'} onChange={(v) => updatePackage(i, { price: v })} />
              <IconButton icon={Trash2} variant="secondary" size="md" title="Remove package" onPress={() => setPackages(packages.filter((_, j) => j !== i))} />
            </div>
          );
        })}
        <div style={{ display: 'flex' }}><Button variant="secondary" frontIcon={Plus} onPress={addPackage}>Add package</Button></div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Contract length" hint="Clients sign on for a fixed term. We track the end date and flag renewal early.">
          <div><Segmented value={term} options={CONTRACT_TERMS.map((t) => ({ value: t, label: `${t} months` }))} onChange={(t) => onChange({ ...value, term: t as ContractTerm })} /></div>
        </Field>
        <div style={{ padding: 14, borderRadius: 10, background: 'var(--dark-2)', border: '1px solid var(--dark-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6, gap: 12 }}>
            <Text variant="largeList" color="var(--dark-90)">{usd(mTotal)}/mo{oTotal > 0 ? ` + ${usd(oTotal)} one-off` : ''}</Text>
            <Text variant="secondary" color="var(--dark-60)">{term}-month contract</Text>
          </div>
          <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', lineHeight: 1.5 }}>
            Ends {fmtDate(dates.end)}. We'll flag the AM on {fmtDate(dates.remindAt)} (45 days out) to confirm renewal. Decision due {fmtDate(dates.decideBy)}.
          </Text>
        </div>
      </div>
    </div>
  );
}

/** Read-only billing recap for the Confirm summary. */
export function BillingSummary({ value }: { value: BillingInfo }) {
  const dates = contractDates(value.startDate, value.term);
  const mTotal = monthlyTotal(value.packages);
  const oTotal = oneOffTotal(value.packages);
  if (value.packages.length === 0) return <Text variant="secondary" color="var(--dark-40)">No packages selected.</Text>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {value.packages.map((p, i) => {
        const def = packageByKey(p.key)!;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Text variant="secondary" color="var(--dark-80)">{def.label}</Text>
            <Text variant="secondary" color="var(--dark-60)">{usd(p.price)}{p.duration === 'monthly' ? '/mo' : ' one-off'}</Text>
          </div>
        );
      })}
      <div style={{ height: 1, background: 'var(--dark-6)', margin: '4px 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Text variant="smallList" color="var(--dark-90)">{usd(mTotal)}/mo{oTotal > 0 ? ` + ${usd(oTotal)} one-off` : ''}</Text>
        <Text variant="metadata" color="var(--dark-60)">{value.term}-month · ends {fmtDate(dates.end)}</Text>
      </div>
    </div>
  );
}
