import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Heading, Text } from '@/components';
import Lock3 from '@/icons/20/Lock3';
import ShieldChecked from '@/icons/20/ShieldChecked';
import Check2 from '@/icons/20/Check2';
import Card from '@/icons/20/Card';
import { TOOL_LABEL } from '../../tools-context';
import { useDevState } from '../../dev-state-context';
import { useBrandKit } from '../../brand-kit/brand-kit-context';
import { useOnboarding } from '../onboarding-context';
import {
  DIY_PLANS,
  DIY_TERM_CARD_LABEL,
  TERM_LABEL,
  computePricing,
  fmtUsd,
  pickDiyPlan,
  visibleLines,
} from '../pricing-data';

type CheckoutPhase = 'form' | 'processing' | 'success';

/**
 * Every feature path the user can land on after onboarding completes. We
 * pre-set all of them to 'cold' so the freshly-finished workspace shows
 * proper empty states everywhere the user might navigate first — not just
 * on Home.
 */
export const COLD_ON_FINISH = [
  '/h2',
  '/h2/organic-social',
  '/h2/seo-aeo',
  '/h2/ranking',
  '/h2/influencer-content',
  '/h2/paid-social',
  '/h2/paid-search',
  '/h2/landing-pages',
  '/h2/sdr',
  '/h2/reputation',
  '/h2/brand-kit',
];

export function Step7Checkout() {
  const { selectedTools, term, profile, track, back, finish } = useOnboarding();
  const { setState: setDevState } = useDevState();
  const { reset: resetBrandKit } = useBrandKit();
  const navigate = useNavigate();
  const isDiy = track === 'diy';

  // DFY = per-feature pricing with term multiplier (existing model).
  // DIY = flat plan-tier pricing for the selected term (Starter or Growth).
  const lines = visibleLines(selectedTools);
  const dfyTotals = computePricing(lines, term);
  const diyPlan = DIY_PLANS[pickDiyPlan(selectedTools.length)];
  const diyMonthly = diyPlan.monthlyByTerm[term];
  const diyTermMonths = term === 1 ? 1 : term;
  const diyTermTotal = diyMonthly * diyTermMonths;

  // Numbers the rest of the screen uses — pulled from whichever model applies.
  const summaryMonthly = isDiy ? diyMonthly : dfyTotals.monthly;
  const summaryTermTotal = isDiy ? diyTermTotal : dfyTotals.termTotal;
  const summaryTermLabel = isDiy
    ? term === 1
      ? 'Monthly plan'
      : TERM_LABEL[term]
    : TERM_LABEL[term];
  const summaryTermBadge = isDiy ? DIY_TERM_CARD_LABEL[term] : `${term}-month term`;

  const [phase, setPhase] = useState<CheckoutPhase>('form');

  // Pre-filled, plausibly-real-looking values. The user just presses Pay.
  const [card, setCard] = useState({
    email: 'john@certapro.com',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12 / 28',
    cvc: '424',
    nameOnCard: 'John Bunnell',
    country: 'United States',
    zip: '78759',
  });

  const handlePay = () => {
    setPhase('processing');
  };

  useEffect(() => {
    if (phase === 'processing') {
      const t = setTimeout(() => setPhase('success'), 1500);
      return () => clearTimeout(t);
    }
    if (phase === 'success') {
      const t = setTimeout(() => {
        // Flip every feature path into its cold view so the freshly-finished
        // workspace shows proper empty states everywhere — not just on Home.
        COLD_ON_FINISH.forEach((path) => setDevState(path, 'cold'));
        // Wipe any prior brand-kit completion so Home's "Finalize your Brand
        // kit" row starts as a real to-do, not pre-marked "Locked in".
        resetBrandKit();
        finish();
        navigate('/h2');
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [phase, finish, navigate, setDevState, resetBrandKit]);

  if (phase === 'success') {
    return <SuccessScreen profile={profile} />;
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 3px)',
        background: '#fafbfc',
        padding: '40px 24px 60px',
      }}
    >
      <div style={{ maxWidth: 940, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        {/* Left: order summary */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              background: 'rgba(124, 92, 252, 0.10)',
              borderRadius: 6,
              color: 'var(--purple)',
              fontWeight: 500,
              fontSize: 13,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                background: 'var(--purple)',
                color: 'var(--light-100)',
                fontFamily: '"Times New Roman", Georgia, serif',
                fontSize: 14,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              B
            </span>
            Blaze
          </div>
          <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', fontSize: 13, marginBottom: 6 }}>
            Subscribe to {isDiy ? `${diyPlan.label} plan — ${summaryTermBadge}` : summaryTermLabel}
          </Text>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 24 }}>
            <span style={{ fontSize: 36, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.5px' }}>
              {fmtUsd(summaryMonthly)}
            </span>
            <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>per month</span>
          </div>

          <div
            style={{
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
            }}
          >
            {isDiy
              ? // DIY: flat plan — list what's included by tool, no per-line prices.
                selectedTools.map((toolId, i) => (
                  <div
                    key={toolId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 0',
                      borderTop: i === 0 ? 'none' : '1px solid var(--dark-4)',
                    }}
                  >
                    <Check2 size={14} color="#04af00" />
                    <Text variant="secondary" style={{ color: 'var(--dark-90)', fontSize: 13 }}>
                      {TOOL_LABEL[toolId]}
                    </Text>
                  </div>
                ))
              : lines.map((l, i) => (
                  <div
                    key={l.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '8px 0',
                      borderTop: i === 0 ? 'none' : '1px solid var(--dark-4)',
                    }}
                  >
                    <Text variant="secondary" style={{ color: 'var(--dark-90)', fontSize: 13 }}>
                      {l.label}
                    </Text>
                    <Text variant="metadata" style={{ color: 'var(--dark-60)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                      {l.isPack ? `${fmtUsd(l.packPrice ?? 0)} / pack` : `${fmtUsd(l.monthlyBase)} / mo`}
                    </Text>
                  </div>
                ))}
          </div>
          <div
            style={{
              padding: 16,
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <Row label="Subtotal" value={fmtUsd(summaryMonthly)} />
            <Row label="Tax" value="—" />
            <div style={{ height: 1, background: 'var(--dark-8)', margin: '6px 0' }} />
            <Row label="Total due today" value={fmtUsd(summaryMonthly)} bold />
            <Text variant="metadata" style={{ color: 'var(--dark-60)', fontSize: 12, marginTop: 2 }}>
              {isDiy && term === 1
                ? 'Charged monthly. Cancel any time.'
                : `Charged monthly. ${term}-month minimum term. Total over term: ${fmtUsd(summaryTermTotal)}.`}
            </Text>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 20,
              color: 'var(--dark-60)',
              fontSize: 12,
            }}
          >
            <ShieldChecked size={14} color="var(--dark-60)" />
            Payments secured by Stripe
          </div>
        </div>

        {/* Right: payment form */}
        <div
          style={{
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 14,
            padding: 28,
            boxShadow: '0 12px 32px rgba(0,0,0,0.04)',
            height: 'fit-content',
          }}
        >
          <Heading level={4} style={{ marginBottom: 20 }}>Pay with card</Heading>

          <StripeField label="Email">
            <input
              value={card.email}
              onChange={(e) => setCard({ ...card, email: e.target.value })}
              style={stripeInputStyle}
            />
          </StripeField>

          <StripeField label="Card information">
            <div style={{ position: 'relative' }}>
              <input
                value={card.cardNumber}
                onChange={(e) => setCard({ ...card, cardNumber: e.target.value })}
                style={{ ...stripeInputStyle, paddingRight: 64 }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  gap: 4,
                  alignItems: 'center',
                  color: 'var(--dark-60)',
                }}
              >
                <Card size={16} color="var(--dark-60)" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 0 }}>
              <input
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                placeholder="MM / YY"
                style={{
                  ...stripeInputStyle,
                  borderTop: 'none',
                  borderRight: 'none',
                  borderRadius: '0 0 0 8px',
                  flex: 1,
                }}
              />
              <input
                value={card.cvc}
                onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                placeholder="CVC"
                style={{
                  ...stripeInputStyle,
                  borderTop: 'none',
                  borderRadius: '0 0 8px 0',
                  flex: 1,
                }}
              />
            </div>
          </StripeField>

          <StripeField label="Cardholder name">
            <input
              value={card.nameOnCard}
              onChange={(e) => setCard({ ...card, nameOnCard: e.target.value })}
              style={stripeInputStyle}
            />
          </StripeField>

          <StripeField label="Country or region">
            <select
              value={card.country}
              onChange={(e) => setCard({ ...card, country: e.target.value })}
              style={{
                ...stripeInputStyle,
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23000' stroke-opacity='0.6' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='M4 6l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
              }}
            >
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
            </select>
            <input
              value={card.zip}
              onChange={(e) => setCard({ ...card, zip: e.target.value })}
              placeholder="ZIP"
              style={{
                ...stripeInputStyle,
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
              }}
            />
          </StripeField>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handlePay}
            isDisabled={phase === 'processing'}
            frontIcon={phase === 'processing' ? undefined : Lock3}
          >
            {phase === 'processing' ? 'Processing…' : `Pay ${fmtUsd(summaryMonthly)}`}
          </Button>

          <Text
            variant="metadata"
            style={{ display: 'block', color: 'var(--dark-60)', fontSize: 12, marginTop: 16, lineHeight: 1.55, textAlign: 'center' }}
          >
            By confirming, you agree to Blaze's Terms of Service and authorize a recurring monthly
            charge of {fmtUsd(summaryMonthly)}
            {isDiy && term === 1 ? ' until you cancel.' : ` for ${term} months.`}
          </Text>
        </div>
      </div>

      <div
        style={{
          maxWidth: 940,
          margin: '24px auto 0',
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
          ← Back to pricing
        </button>
      </div>
    </div>
  );
}

const stripeInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 14,
  fontFamily: 'inherit',
  background: 'var(--light-100)',
  border: '1px solid var(--dark-8)',
  borderRadius: 8,
  color: 'var(--dark-90)',
  outline: 'none',
};

function StripeField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Text
        variant="metadata"
        style={{ display: 'block', color: 'var(--dark-90)', fontSize: 12, marginBottom: 6, fontWeight: 500 }}
      >
        {label}
      </Text>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <Text
        variant="secondary"
        style={{
          color: bold ? 'var(--dark-90)' : 'var(--dark-60)',
          fontWeight: bold ? 500 : 400,
          fontSize: bold ? 14 : 13,
        }}
      >
        {label}
      </Text>
      <Text
        variant="secondary"
        style={{
          color: 'var(--dark-90)',
          fontWeight: bold ? 500 : 400,
          fontSize: bold ? 14 : 13,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </Text>
    </div>
  );
}

function SuccessScreen({ profile }: { profile: { name: string } }) {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 3px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: '50%',
          background: '#04af00',
          color: 'var(--light-100)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          animation: 'blaze-pop 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Check2 size={40} color="var(--light-100)" />
      </div>
      <Heading level={1} style={{ fontSize: 36, letterSpacing: '-0.5px', marginBottom: 8 }}>
        You're in.
      </Heading>
      <Text
        variant="primary"
        style={{ display: 'block', color: 'var(--dark-60)', fontSize: 17, lineHeight: 1.55, maxWidth: 460 }}
      >
        Welcome to Blaze, {profile.name}. We're spinning up your workspace now — taking you in.
      </Text>
      <style>
        {`
        @keyframes blaze-pop {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        `}
      </style>
    </div>
  );
}
