import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Heading, Text } from '@/components';
import { TabChip } from '@/staging';
import {
  AlertTriangle,
  Close,
  EyeOpen,
  Globe,
  Heart01,
  Map02,
  Marker03,
  Share,
  Star,
  StarFilled,
} from '@/icons/20';
import ArrowLeft from '@/icons/20/ArrowLeft';
import { Check as CheckSm } from '@/icons/16';
import PhoneCall01 from '@/icons/16/PhoneCall01';
import { H2Layout } from '../H2Layout';
import { useDevState } from '../dev-state-context';
import { MapRankingBody, GooglePreview, PROFILE_FIELDS, ProfileFieldCard, MiniRing } from './MapRankingBody';

type OrganicProfileTab = 'dashboard' | 'profile-preview' | 'profile-consistency';

// ─── GOOGLE MAPS PREVIEW ─────────────────────────────────────────────

function GoogleMapsPreview() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'about'>('overview');
  const [adDismissed, setAdDismissed] = useState(false);

  const starBars = [
    { label: '5', pct: 78 },
    { label: '4', pct: 12 },
    { label: '3', pct: 5 },
    { label: '2', pct: 2 },
    { label: '1', pct: 3 },
  ];

  return (
    <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 14, overflow: 'hidden' }}>
      {/* Header photo */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
        <img
          src="https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/04/AfterIMG_0384-scaled.jpeg"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: 10, right: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Close size={14} color="white" />
          </div>
        </div>
      </div>

      {/* Business header */}
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--dark-90)', lineHeight: 1.2, marginBottom: 4 }}>
          CertaPro Painters of Austin
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: 'var(--dark-90)' }}>4.7</span>
          <span style={{ color: '#F5B400', display: 'inline-flex', gap: 1 }}>
            {[0, 1, 2, 3, 4].map((i) => <StarFilled key={i} size={13} />)}
          </span>
          <span style={{ color: '#1A73E8' }}>(187)</span>
          <span style={{ color: 'var(--dark-15)' }}>·</span>
          <span style={{ color: 'var(--dark-60)' }}>Painting contractor</span>
        </div>

        {/* Manage button */}
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: '#202124',
              borderRadius: 20,
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            <CheckSm size={14} color="#34A853" />
            <span style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>Manage your Business Profile</span>
          </div>
        </div>

        {/* Views count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--dark-60)', marginBottom: 12 }}>
          <EyeOpen size={14} />
          1,284 views in the last 28 days
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--dark-8)' }}>
          {(['overview', 'reviews', 'about'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === t ? '3px solid #1A73E8' : '3px solid transparent',
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: activeTab === t ? 600 : 400,
                color: activeTab === t ? '#1A73E8' : 'var(--dark-60)',
                cursor: 'pointer',
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: '16px 18px 20px' }}>
        {/* Advertising card */}
        {!adDismissed && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 8,
              background: '#F8F9FA',
              border: '1px solid var(--dark-8)',
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 2 }}>Start advertising on Google</div>
              <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>Reach more customers with Google Ads</div>
            </div>
            <button
              onClick={() => setAdDismissed(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--dark-40)', display: 'flex' }}
            >
              <Close size={16} />
            </button>
          </div>
        )}

        {activeTab === 'overview' && (
          <>
            {/* Actions row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, justifyContent: 'space-around' }}>
              {(
                [
                  { Icon: Map02,       label: 'Directions',    dark: true  },
                  { Icon: Heart01,     label: 'Save',          dark: false },
                  { Icon: Marker03,    label: 'Nearby',        dark: false },
                  { Icon: PhoneCall01, label: 'Send to phone', dark: false },
                  { Icon: Share,       label: 'Share',         dark: false },
                ] as { Icon: typeof Map02; label: string; dark: boolean }[]
              ).map(({ Icon: Ic, label, dark }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: dark ? '#1A73E8' : 'var(--dark-4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: dark ? 'white' : 'var(--dark-80)',
                    }}
                  >
                    <Ic size={16} />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--dark-60)', textAlign: 'center', maxWidth: 52, lineHeight: 1.3 }}>{label}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--dark-8)', marginBottom: 14 }} />

            {/* Address + website */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}><Marker03 size={15} color="var(--dark-60)" /></div>
              <span style={{ fontSize: 13, color: 'var(--dark-80)' }}>12444 Research Blvd, Austin, TX 78759</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}><Globe size={15} color="var(--dark-60)" /></div>
              <span style={{ fontSize: 13, color: '#1A73E8' }}>certapro.com/austin</span>
            </div>

            {/* Missing info */}
            <div style={{ fontSize: 12, color: 'var(--dark-60)', paddingLeft: 25, marginBottom: 14 }}>
              Add missing information:
              <span style={{ color: '#1A73E8', marginLeft: 4 }}>Phone number</span>
              <span style={{ color: 'var(--dark-40)', margin: '0 4px' }}>·</span>
              <span style={{ color: '#1A73E8' }}>Business hours</span>
            </div>

            <div style={{ borderTop: '1px solid var(--dark-8)', marginBottom: 14 }} />

            {/* Photos & videos */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 10 }}>Photos & videos</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ position: 'relative', height: 90, borderRadius: 8, overflow: 'hidden' }}>
                  <img
                    src="https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/04/IMG_9426-scaled.jpeg"
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 11, color: 'white', background: 'rgba(0,0,0,0.45)', padding: '2px 6px', borderRadius: 4 }}>By owner</div>
                </div>
                <div style={{ position: 'relative', height: 90, borderRadius: 8, overflow: 'hidden' }}>
                  <img
                    src="https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2024/12/After-3-scaled.jpeg"
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 11, color: 'white', background: 'rgba(0,0,0,0.45)', padding: '2px 6px', borderRadius: 4 }}>By owner</div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--dark-8)', marginBottom: 14 }} />

            {/* People also search for */}
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 10 }}>People also search for</div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {[
                { name: 'Five Star Painting of Austin', rating: '4.8' },
                { name: 'Tex-Pro Painters', rating: '4.6' },
                { name: 'Capital Painting Co.', rating: '4.9' },
              ].map(({ name, rating }) => (
                <div
                  key={name}
                  style={{
                    flexShrink: 0,
                    width: 140,
                    background: 'var(--dark-2)',
                    border: '1px solid var(--dark-8)',
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}
                >
                  <svg width="140" height="70" viewBox="0 0 140 70" preserveAspectRatio="xMidYMid slice">
                    <rect width="140" height="70" fill="#e8efdb" />
                    <rect x="10" y="5"  width="40" height="25" fill="#d4e0c4" rx="2" />
                    <rect x="60" y="5"  width="50" height="25" fill="#d4e0c4" rx="2" />
                    <rect x="10" y="40" width="35" height="25" fill="#d4e0c4" rx="2" />
                    <rect x="55" y="40" width="55" height="25" fill="#d4e0c4" rx="2" />
                    <rect x="0"  y="32" width="140" height="7"  fill="#f5f5f0" />
                    <rect x="52" y="0"  width="7"   height="70" fill="#f5f5f0" />
                    <circle cx="70" cy="36" r="5" fill="#EA4335" />
                    <circle cx="70" cy="36" r="2" fill="white" />
                  </svg>
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-90)', lineHeight: 1.3, marginBottom: 4 }}>{name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                      <StarFilled size={11} color="#F5B400" />
                      <span style={{ color: 'var(--dark-80)' }}>{rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'reviews' && (
          <>
            {/* Summary */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--dark-90)', lineHeight: 1 }}>4.7</div>
                <div style={{ color: '#F5B400', display: 'flex', justifyContent: 'center', gap: 2, margin: '4px 0' }}>
                  {[0, 1, 2, 3, 4].map((i) => <StarFilled key={i} size={14} />)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>187 reviews</div>
              </div>
              <div style={{ flex: 1 }}>
                {starBars.map(({ label, pct }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--dark-60)', width: 8, flexShrink: 0 }}>{label}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--dark-8)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#F5B400', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review card */}
            <div style={{ background: 'var(--dark-2)', border: '1px solid var(--dark-4)', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 15, fontWeight: 600, flexShrink: 0 }}>K</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>Kimberly Voliva</div>
                  <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>2 weeks ago</div>
                </div>
              </div>
              <div style={{ color: '#F5B400', display: 'flex', gap: 1, marginBottom: 6 }}>
                {[0, 1, 2, 3, 4].map((i) => <StarFilled key={i} size={13} />)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--dark-80)', lineHeight: 1.55 }}>
                Absolutely thrilled with the results! The team was professional, punctual, and the finish is flawless.
                They did a full interior repaint and the house looks brand new. Highly recommend!
              </div>
            </div>
          </>
        )}

        {activeTab === 'about' && (
          <>
            <div style={{ fontSize: 13, color: 'var(--dark-80)', lineHeight: 1.6, marginBottom: 14 }}>
              Your local painters in Austin, TX. CertaPro Painters of Austin handles residential and commercial
              painting across the Austin metro — interior and exterior, cabinet refinishing, color consultation,
              and more. We make the process easy and convenient.
            </div>
            <div style={{ borderTop: '1px solid var(--dark-8)', marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ flexShrink: 0 }}><Marker03 size={15} color="var(--dark-60)" /></div>
              <span style={{ fontSize: 13, color: 'var(--dark-80)' }}>12444 Research Blvd, Austin, TX 78759</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ flexShrink: 0 }}><Globe size={15} color="var(--dark-60)" /></div>
              <span style={{ fontSize: 13, color: '#1A73E8' }}>certapro.com/austin</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flexShrink: 0 }}><PhoneCall01 size={15} color="var(--dark-60)" /></div>
              <span style={{ fontSize: 13, color: '#1A73E8' }}>Add phone number</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── PROFILE EDITOR VIEW ─────────────────────────────────────────────

function ProfileEditorView({ onBack }: { onBack: () => void }) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(PROFILE_FIELDS.map((f) => [f.label, f.value])),
  );
  const updateField = (label: string, next: string) =>
    setFieldValues((prev) => ({ ...prev, [label]: next }));

  return (
    <>
      <div style={{ padding: '24px 28px 120px', maxWidth: 780, margin: '0 auto' }}>
        {/* Back link */}
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            padding: 0,
            fontFamily: 'inherit',
            fontSize: 13,
            color: 'var(--dark-60)',
            cursor: 'pointer',
            marginBottom: 20,
          }}
        >
          <ArrowLeft size={14} />
          Profile Preview
        </button>

        <div style={{ marginBottom: 24 }}>
          <Heading level={3} style={{ display: 'block', marginBottom: 4 }}>Edit Business Profile</Heading>
          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>
            Changes sync to your Google Business Profile. Nothing publishes until you save.
          </Text>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PROFILE_FIELDS.map((f) => (
            <ProfileFieldCard
              key={f.label}
              field={f}
              value={fieldValues[f.label]}
              onSave={(next) => updateField(f.label, next)}
            />
          ))}
        </div>
      </div>

      {/* Sticky save bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 238,
          right: 0,
          background: 'var(--light-100)',
          borderTop: '1px solid var(--dark-8)',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
          zIndex: 10,
        }}
      >
        <Button variant="tertiary" size="lg" onPress={onBack}>Cancel</Button>
        <Button variant="primary" size="lg" onPress={onBack}>Save changes</Button>
      </div>
    </>
  );
}

// ─── PROFILE PREVIEW TAB ─────────────────────────────────────────────

function ProfilePreviewTab({ onEdit }: { onEdit: () => void }) {
  return (
    <div style={{ padding: '24px 28px 80px', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* GBP change alert */}
      <div style={{ background: 'rgba(188,1,11,0.04)', border: '1px solid rgba(188,1,11,0.18)', borderRadius: 12, padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <AlertTriangle size={16} color="var(--red-70)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 2 }}>
                Google changed your business name
              </div>
              <div style={{ fontSize: 13, color: 'var(--dark-60)' }}>
                Google updated your name from <strong style={{ color: 'var(--dark-90)' }}>CertaPro Painters of Austin</strong> to <strong style={{ color: 'var(--dark-90)' }}>CertaPro Painters Austin</strong>. This may affect your search rankings.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Button variant="tertiary" size="sm">Reject</Button>
            <Button variant="secondary" size="sm">Keep change</Button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <MiniRing score={72} size={64} stroke={5} />
          <div>
            <Heading level={3} style={{ display: 'block' }}>How your profile appears on Google</Heading>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>
              Previews reflect the Business Profile fields you reviewed in the Dashboard tab.
            </Text>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Button variant="tertiary" size="sm" onPress={() => {}}>
            View on Google
          </Button>
          <Button variant="secondary" size="sm" onPress={onEdit}>
            Edit profile
          </Button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
        <div>
          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', fontWeight: 500, marginBottom: 10 }}>
            Google Search
          </Text>
          <GooglePreview />
        </div>
        <div>
          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', fontWeight: 500, marginBottom: 10 }}>
            Google Maps
          </Text>
          <GoogleMapsPreview />
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE CONSISTENCY TAB ─────────────────────────────────────────

const CONSISTENCY_DISCREPANCIES = [
  {
    field: 'Business name',
    status: 'error' as const,
    values: [
      { platform: 'Website',         value: 'CertaPro Painters of Austin', ok: true  },
      { platform: 'Google Business', value: 'CertaPro Painters Austin',    ok: false },
      { platform: 'LinkedIn',        value: 'CertaPro Austin TX',           ok: false },
      { platform: 'Yelp',            value: 'CertaPro Painters of Austin',  ok: true  },
    ],
    note: 'Inconsistent name signals confuse entity matching. Use exact same string everywhere.',
  },
  {
    field: 'Brand description',
    status: 'warning' as const,
    values: [
      { platform: 'Website',         value: '142 words — comprehensive', ok: true  },
      { platform: 'Google Business', value: '28 words — too short',      ok: false },
      { platform: 'LinkedIn',        value: '95 words — good',           ok: true  },
      { platform: 'Yelp',            value: '12 words — too short',      ok: false },
    ],
    note: 'Short descriptions reduce AI engine confidence in brand identity. Aim for 80–120 words.',
  },
  {
    field: 'Service categories',
    status: 'warning' as const,
    values: [
      { platform: 'Website',         value: 'Interior painting, Exterior painting, Cabinet refinishing', ok: true  },
      { platform: 'Google Business', value: 'Painter',                                                   ok: false },
      { platform: 'LinkedIn',        value: 'Painting contractor & cabinet refinishing',                 ok: true  },
      { platform: 'Yelp',            value: 'Painters',                                                  ok: false },
    ],
    note: 'Category labels affect how AI engines classify you. Align with your primary keyword clusters.',
  },
  {
    field: 'Phone number',
    status: 'ok' as const,
    values: [
      { platform: 'Website',         value: '(512) 323-9502', ok: true },
      { platform: 'Google Business', value: '(512) 323-9502', ok: true },
      { platform: 'LinkedIn',        value: '(512) 323-9502', ok: true },
      { platform: 'Yelp',            value: '(512) 323-9502', ok: true },
    ],
    note: '',
  },
];

const PLATFORMS = ['Website', 'Google Business', 'LinkedIn', 'Yelp'];

function ProfileConsistencyTab() {
  const errorCount = CONSISTENCY_DISCREPANCIES.filter((d) => d.status === 'error').length;
  const warnCount  = CONSISTENCY_DISCREPANCIES.filter((d) => d.status === 'warning').length;

  const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    textAlign: 'left',
    fontWeight: 400,
    fontSize: 12,
    color: 'var(--dark-60)',
    borderBottom: '1px solid var(--dark-4)',
    whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '16px',
    fontSize: 13,
    verticalAlign: 'top',
    borderBottom: '1px solid var(--dark-4)',
  };

  return (
    <div style={{ padding: '24px 28px 80px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div>
          <Heading level={3} style={{ display: 'block', marginBottom: 4 }}>Profile Consistency</Heading>
          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>
            Blaze found mismatches across your platforms. Fix these to help AI engines reliably identify CertaPro Painters of Austin as a single authoritative entity.
          </Text>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--red-70)', background: 'rgba(188,1,11,0.06)', border: '1px solid rgba(188,1,11,0.18)', borderRadius: 6, padding: '3px 8px' }}>
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#EF6800', background: 'rgba(239,104,0,0.06)', border: '1px solid rgba(239,104,0,0.18)', borderRadius: 6, padding: '3px 8px' }}>
              {warnCount} warning{warnCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        {null}
      </div>

      {/* Comparison table — one row per field, one column per platform */}
      <div style={{ border: '1px solid var(--dark-4)', borderRadius: 12, overflow: 'hidden', background: 'var(--light-100)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '14%' }} />
            {PLATFORMS.map((p) => <col key={p} style={{ width: '14%' }} />)}
            <col style={{ width: '30%' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={thStyle}>Field</th>
              {PLATFORMS.map((p) => (
                <th key={p} style={thStyle}>{p}</th>
              ))}
              <th style={thStyle}>Note</th>
            </tr>
          </thead>
          <tbody>
            {CONSISTENCY_DISCREPANCIES.map((d) => {
              const statusIcon = d.status === 'error' ? '✕' : d.status === 'warning' ? '⚠' : '✓';
              const statusColor = d.status === 'error' ? 'var(--red-70)' : d.status === 'warning' ? '#EF6800' : 'var(--status-approved)';
              return (
                <tr key={d.field}>
                  {/* Field name + status icon */}
                  <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--dark-90)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, color: statusColor, flexShrink: 0 }}>{statusIcon}</span>
                      {d.field}
                    </div>
                    {d.status === 'ok' && (
                      <div style={{ fontSize: 11, color: 'var(--status-approved)', marginTop: 4 }}>All match</div>
                    )}
                  </td>
                  {/* One cell per platform */}
                  {PLATFORMS.map((platform) => {
                    const v = d.values.find((x) => x.platform === platform);
                    if (!v) return <td key={platform} style={tdStyle} />;
                    return (
                      <td key={platform} style={{ ...tdStyle, color: v.ok ? 'var(--dark-80)' : 'var(--dark-90)', fontStyle: v.ok ? 'normal' : 'italic' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                          <span style={{ fontSize: 11, color: v.ok ? 'var(--status-approved)' : '#EF6800', marginTop: 1, flexShrink: 0 }}>
                            {v.ok ? '✓' : '⚠'}
                          </span>
                          <span style={{ wordBreak: 'break-word' }}>{v.value}</span>
                        </div>
                        {!v.ok && (
                          <a href="#" style={{ display: 'inline-block', marginTop: 6, fontSize: 11, color: 'var(--dark-60)', background: 'var(--dark-4)', borderRadius: 5, padding: '3px 8px', textDecoration: 'none' }}>
                            Edit ↗
                          </a>
                        )}
                      </td>
                    );
                  })}
                  {/* Note */}
                  <td style={{ ...tdStyle, color: 'var(--dark-60)', fontSize: 12 }}>
                    {d.note}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ROUTE ───────────────────────────────────────────────────────────

export function OrganicProfileRoute() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as OrganicProfileTab | null) ?? 'dashboard';
  const [tab, setTab] = useState<OrganicProfileTab>(initialTab);
  const [editingProfile, setEditingProfile] = useState(false);
  // In the cold (setup) state the sub-tabs are meaningless, so hide them.
  const { getState } = useDevState();
  const isCold = getState('/h2/organic-profile') === 'cold';

  const handleTabChange = (next: OrganicProfileTab) => {
    setTab(next);
    setEditingProfile(false);
    // Reflect the active tab in the URL so deep-links work (e.g. from SEO/AEO).
    if (next === 'dashboard') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab: next }, { replace: true });
    }
  };

  const topbarCenter = (
    <div style={{ display: 'flex', gap: 4 }}>
      <TabChip selected={tab === 'dashboard'} onSelect={() => handleTabChange('dashboard')}>Dashboard</TabChip>
      <TabChip selected={tab === 'profile-preview'} onSelect={() => handleTabChange('profile-preview')} count={1}>Profile</TabChip>
      <TabChip selected={tab === 'profile-consistency'} onSelect={() => handleTabChange('profile-consistency')} count={3}>Profile Consistency</TabChip>
    </div>
  );

  return (
    <H2Layout title="Local SEO" topbarCenter={isCold ? undefined : topbarCenter}>
      {tab === 'dashboard' ? (
        <MapRankingBody devStatePath="/h2/organic-profile" onProfileConsistency={() => handleTabChange('profile-consistency')} />
      ) : tab === 'profile-consistency' ? (
        <ProfileConsistencyTab />
      ) : editingProfile ? (
        <ProfileEditorView onBack={() => setEditingProfile(false)} />
      ) : (
        <ProfilePreviewTab onEdit={() => setEditingProfile(true)} />
      )}
    </H2Layout>
  );
}
