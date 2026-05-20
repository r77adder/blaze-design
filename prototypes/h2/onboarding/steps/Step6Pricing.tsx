import { useState } from 'react';
import { Button, Heading, Text } from '@/components';
import ArrowRight from '@/icons/20/ArrowRight';
import Download from '@/icons/20/Download';
import Check2 from '@/icons/20/Check2';
import {
  TERM_LABEL,
  TERM_MULTIPLIER,
  TERM_SUBTEXT,
  computePricing,
  fmtUsd,
  visibleLines,
  type PricingLine,
} from '../pricing-data';
import { type Term } from '../onboarding-context';
import { useOnboarding } from '../onboarding-context';
import { openProposalPdf } from '../ProposalPdf';

const TERMS: Term[] = [12, 6, 3];

export function Step6Pricing() {
  const { selectedTools, term, setTerm, next, back, profile } = useOnboarding();
  const lines = visibleLines(selectedTools);
  const totals = computePricing(lines, term);
  const [pdfBusy, setPdfBusy] = useState(false);

  const handleDownloadPdf = () => {
    setPdfBusy(true);
    openProposalPdf({ profile, lines, term, totals });
    // window.print() returns synchronously after the user closes the dialog.
    // Reset the spinner shortly after so the UI doesn't get stuck.
    setTimeout(() => setPdfBusy(false), 600);
  };

  return (
    <div style={{ padding: '64px 24px 120px', maxWidth: 920, margin: '0 auto' }}>
      <Heading
        level={1}
        style={{ fontSize: 32, letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: 8 }}
      >
        Your Blaze plan
      </Heading>
      <Text
        variant="primary"
        style={{ display: 'block', color: 'var(--dark-60)', fontSize: 16, marginBottom: 32 }}
      >
        Pick a term — longer terms come with a meaningful per-month discount. You can change this anytime.
      </Text>

      {/* Term selector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 28,
        }}
      >
        {TERMS.map((t) => (
          <TermCard
            key={t}
            term={t}
            selected={term === t}
            onPress={() => setTerm(t)}
            monthlyAtTerm={lines
              .filter((l) => !l.isPack)
              .reduce((sum, l) => sum + Math.round(l.monthlyBase * TERM_MULTIPLIER[t]), 0)}
          />
        ))}
      </div>

      {/* Pricing table */}
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          padding: 0,
          marginBottom: 24,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--dark-8)' }}>
          <Heading level={4}>What's included</Heading>
          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>
            {lines.length} features, billed monthly for {term} months
          </Text>
        </div>
        <div>
          {lines.map((line) => (
            <LineRow key={line.key} line={line} term={term} />
          ))}
        </div>

        <div
          style={{
            padding: '20px 24px',
            background: '#fafbfc',
            borderTop: '1px solid var(--dark-8)',
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: 24,
            alignItems: 'center',
          }}
        >
          <div>
            <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
              {TERM_LABEL[term]}
            </Text>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>
              Total over {term} months including {totals.packsInTerm} content pack
              {totals.packsInTerm === 1 ? '' : 's'}
            </Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', fontSize: 12 }}>
              Per month
            </Text>
            <Heading level={3} style={{ marginTop: 2 }}>
              {fmtUsd(totals.monthly)}
            </Heading>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', fontSize: 12 }}>
              {term}-mo total
            </Text>
            <Heading level={3} style={{ marginTop: 2 }}>
              {fmtUsd(totals.termTotal)}
            </Heading>
          </div>
        </div>
      </div>

      {/* PDF download */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          background: 'var(--light-100)',
          border: '1px dashed var(--dark-15)',
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Heading level={5} style={{ marginBottom: 4 }}>
            Want this proposal as a PDF?
          </Heading>
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            Share with stakeholders or save for later. Includes discovery, strategy, pricing, and timeline.
          </Text>
        </div>
        <Button
          variant="secondary"
          size="md"
          frontIcon={Download}
          onPress={handleDownloadPdf}
          isDisabled={pdfBusy}
        >
          {pdfBusy ? 'Preparing…' : 'Download PDF proposal'}
        </Button>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 24px',
          background: 'var(--light-100)',
          borderTop: '1px solid var(--dark-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 4,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
        }}
      >
        <button
          type="button"
          onClick={back}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'inherit',
            fontSize: 14,
            color: 'var(--dark-90)',
            cursor: 'pointer',
            padding: '8px 12px',
          }}
        >
          Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            {fmtUsd(totals.monthly)}/mo · {term}-month term
          </Text>
          <Button variant="primary" size="lg" onPress={next} endIcon={ArrowRight}>
            Continue to checkout
          </Button>
        </div>
      </div>
    </div>
  );
}

function TermCard({
  term,
  selected,
  monthlyAtTerm,
  onPress,
}: {
  term: Term;
  selected: boolean;
  monthlyAtTerm: number;
  onPress: () => void;
}) {
  const savings =
    term === 12 ? 'Best price' : term === 6 ? 'Mid-tier' : 'Most flexible';
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        position: 'relative',
        textAlign: 'left',
        padding: 18,
        background: 'var(--light-100)',
        border: `1.5px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'border-color 120ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Heading level={5}>{TERM_LABEL[term]}</Heading>
        <RadioCircle on={selected} />
      </div>
      <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 6 }}>
        {TERM_SUBTEXT[term]}
      </Text>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 14 }}>
        <span style={{ fontSize: 24, fontWeight: 500, color: 'var(--dark-90)' }}>
          {fmtUsd(monthlyAtTerm)}
        </span>
        <span style={{ fontSize: 13, color: 'var(--dark-60)' }}>/ month</span>
      </div>
      <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)', fontSize: 12, marginTop: 4 }}>
        {savings}
      </Text>
    </button>
  );
}

function RadioCircle({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 22,
        height: 22,
        borderRadius: '50%',
        border: `1.5px solid ${on ? 'var(--dark-90)' : 'var(--dark-15)'}`,
        background: on ? 'var(--dark-90)' : 'var(--light-100)',
      }}
    >
      {on && <Check2 size={14} color="var(--light-100)" />}
    </span>
  );
}

function LineRow({ line, term }: { line: PricingLine; term: Term }) {
  const multiplier = TERM_MULTIPLIER[term];
  const priceLabel = line.isPack
    ? `${fmtUsd(Math.round((line.packPrice ?? 0) * multiplier))} / pack`
    : `${fmtUsd(Math.round(line.monthlyBase * multiplier))} / mo`;
  const subtext = line.isPack
    ? `1 pack every 4 months · ${line.packRangeLabel ?? ''}`
    : 'Billed monthly';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 24,
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid var(--dark-4)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
          {line.label}
        </Text>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>
          {line.blurb}
        </Text>
      </div>
      <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: 15, color: 'var(--dark-90)', fontWeight: 500 }}>{priceLabel}</div>
        <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)', fontSize: 12, marginTop: 2 }}>
          {subtext}
        </Text>
      </div>
    </div>
  );
}

