import { useState } from 'react';
import { Text, Button } from '@/components';
import { TextField } from '@/staging';
import ChevronDown from '@/icons/20/ChevronDown';
import Copy from '@/icons/20/Copy';
import Check2 from '@/icons/20/Check2';
import LinkExternal from '@/icons/20/LinkExternal';
import { ACCESS_ITEMS, type AccessItem, type AccessCopyable } from './data';
import { CONNECT_ICONS } from './ConnectModal';
import { StepIntro } from './wizard';

/** Step 6 — the access grants onboarding needs. Each row is a collapsible
 *  disclosure with the service logo; expanding reveals step-by-step help,
 *  one-click copy of the values to paste (our email, manager IDs), and BDS
 *  TextField inputs for the client to hand over their details. */
export function StepIntegrations() {
  return (
    <div style={{ padding: '0 32px 48px' }}>
      <StepIntro
        title="Access we'll need"
        body="To run your campaigns, bookings, and reporting, we'll need access to a few accounts. Open a row for step-by-step help, copy anything you need to paste, and share your details. You can also do this together on the kickoff call."
        maxWidth={720}
      />
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <AccessChecklist />
      </div>
    </div>
  );
}

/** The access-grant accordions, reused on the client Home connect section so
 *  it is the exact same component as the review's last step. */
export function AccessChecklist() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {ACCESS_ITEMS.map((item) => (
        <AccessRow key={item.name} item={item} />
      ))}
    </div>
  );
}

/** A value to paste into the provider, with a one-click copy button. */
function CopyRow({ item }: { item: AccessCopyable }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = item.value;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* no-op */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--dark-8)', borderRadius: 8, padding: '8px 8px 8px 12px', background: 'var(--dark-2)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block' }}>{item.label}</Text>
        <Text style={{ display: 'block', fontWeight: 500, color: 'var(--dark-90)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.value}</Text>
      </div>
      <Button size="sm" variant={copied ? 'green' : 'secondary'} frontIcon={copied ? Check2 : Copy} onPress={copy}>
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}

function AccessRow({ item }: { item: AccessItem }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const filled = item.fields.filter((f) => (values[f.label] ?? '').trim()).length;
  const Logo = CONNECT_ICONS[item.icon];

  return (
    <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, background: 'var(--light-100)', overflow: 'hidden' }}>
      {/* header: logo + name + provided count + expand */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{ appearance: 'none', background: 'none', border: 'none', margin: 0, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', textAlign: 'left', fontFamily: 'inherit' }}
      >
        <Logo size={24} />
        <Text variant="primary" style={{ flex: 1, minWidth: 0 }}>{item.name}</Text>
        {filled > 0 && (
          <Text variant="metadata" color="var(--status-approved)">{filled} provided</Text>
        )}
        <span style={{ display: 'inline-flex', transition: 'transform 0.15s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
          <ChevronDown size={20} color="var(--dark-60)" />
        </span>
      </button>

      {/* body: help-guide link + copyables + input fields */}
      {open && (
        <div style={{ padding: '20px 22px 26px', borderTop: '1px solid var(--dark-8)', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button size="md" variant="secondary" endIcon={LinkExternal} onPress={() => { /* opens the external setup guide */ }}>
              Open the setup guide
            </Button>
            <Text variant="secondary" color="var(--dark-60)" style={{ whiteSpace: 'nowrap' }}>
              Step-by-step help, opens in a new tab.
            </Text>
          </div>

          {item.copyables && item.copyables.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {item.copyables.map((c) => (
                <CopyRow key={c.label} item={c} />
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {item.fields.map((f) => (
              <label key={f.label} style={{ display: 'block' }}>
                <Text variant="secondary" color="var(--dark-90)" style={{ display: 'block', marginBottom: 8 }}>{f.label}</Text>
                <TextField
                  fullWidth
                  size="lg"
                  value={values[f.label] ?? ''}
                  placeholder={f.placeholder}
                  onChange={(val) => setValues((v) => ({ ...v, [f.label]: val }))}
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
