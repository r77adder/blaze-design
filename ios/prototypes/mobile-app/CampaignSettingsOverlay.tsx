import { useState } from 'react';
import { ASSETS } from './assets';
import { SegmentSelector, Toggle } from '@ios/staging';
import chevronLeftIcon  from '@ios/icons/chevron-left.svg';
import chevronRightIcon from '@ios/icons/chevron-right-small.svg';
import checkIcon        from '@ios/icons/check-02.svg';
import layoutIcon       from '@ios/icons/layout-01.svg';
import calendarIcon     from '@ios/icons/calendar-01.svg';
import barGroupIcon     from '@ios/icons/bar-group-03.svg';
import imageIcon        from '@ios/icons/image-03.svg';
import layersIcon       from '@ios/icons/layers-05.svg';
import playIcon         from '@ios/icons/play.svg';
import plusIcon         from '@ios/icons/plus-01.svg';

const font = 'var(--ios-font)';

// section: constants

const POST_DAYS = ['Any day', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CONFIRM_CAMPAIGNS = [
  { id: 1, img: ASSETS.campThumb1, title: 'Savor The Origins: Craft Coffee Revealed',     category: '🎿 Lifestyle Content' },
  { id: 2, img: ASSETS.campThumb2, title: 'Signature Blends: Crafted for Coffee Lovers',   category: '💡 Quick Tips' },
  { id: 3, img: ASSETS.campThumb3, title: 'Brew Bold: Signature Blends, Local Pride',       category: '🛍️ Offer & Services' },
  { id: 4, img: ASSETS.campThumb4, title: 'Brewed for You: Curated Coffee Subscriptions',   category: '🏠 Product Showcase' },
  { id: 5, img: ASSETS.campThumb5, title: "Mother's Day Blend: Share Local Pride",          category: '🎿 Lifestyle Content' },
  { id: 6, img: ASSETS.campThumb6, title: 'Product Updates Q1',                             category: '🏠 Product Showcase' },
];

// section: types

type View = 'settings' | 'content' | 'still-image' | 'confirm';

interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

// section: shared sub-renders

function ScreenHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{ flexShrink: 0, height: 56, display: 'flex', alignItems: 'center', padding: '0 20px', position: 'relative' }}>
      <button type="button" onClick={onBack} style={{ width: 32, height: 32, borderRadius: 99, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, position: 'absolute', left: 20 }}>
        <img src={chevronLeftIcon} alt="Back" style={{ width: 24, height: 24 }} />
      </button>
      <span style={{ fontFamily: font, fontSize: 18, fontWeight: 400, color: 'var(--ios-dark-90)', margin: '0 auto' }}>{title}</span>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ padding: '16px 0 8px' }}>
      <span style={{ fontFamily: font, fontSize: 14, fontWeight: 500, color: 'var(--ios-dark-90)', letterSpacing: '0.14px' }}>{label}</span>
    </div>
  );
}

function PlatformBadge({ platform }: { platform: 'x' | 'linkedin' | 'google' }) {
  const styles: Record<string, { bg: string; color: string; text: string }> = {
    x:        { bg: '#000', color: '#fff', text: 'X' },
    linkedin: { bg: '#0A66C2', color: '#fff', text: 'in' },
    google:   { bg: '#fff', color: '#4285F4', text: 'G' },
  };
  const s = styles[platform];
  return (
    <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, border: platform === 'google' ? '1px solid rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontFamily: font, fontSize: 14, fontWeight: 700, color: s.color }}>{s.text}</span>
    </div>
  );
}

// section: main component

export function CampaignSettingsOverlay({ onClose, onConfirm }: Props) {
  const [view, setView] = useState<View>('settings');

  // form state
  const [mode, setMode] = useState<'Crosspost' | 'Unique posts per channel'>('Unique posts per channel');
  const [postsPerWeek, setPostsPerWeek] = useState(2);
  const [accountsOn, setAccountsOn] = useState({ radiantHealth: true, adamNathan: true });
  const [postDays, setPostDays] = useState<Set<string>>(new Set(['Any day']));
  const [perAccount, setPerAccount] = useState({ radiantHealth: 5, adamNathan: 3 });
  const [showPicker, setShowPicker] = useState<'radiantHealth' | 'adamNathan' | null>(null);
  const [confirmedIds, setConfirmedIds] = useState<Set<number>>(new Set(CONFIRM_CAMPAIGNS.map(c => c.id)));

  function toggleDay(day: string) {
    if (day === 'Any day') { setPostDays(new Set(['Any day'])); return; }
    const next = new Set(postDays);
    next.delete('Any day');
    if (next.has(day)) next.delete(day); else next.add(day);
    if (next.size === 0) next.add('Any day');
    setPostDays(next);
  }

  function toggleCampaign(id: number) {
    const next = new Set(confirmedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setConfirmedIds(next);
  }

  function handleConfirm() {
    onConfirm();
    onClose();
  }

  return (
    <>
      {/* Scrim */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)', zIndex: 40 }} />

      {/* Full-screen overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 50, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* — Settings menu — */}
        {view === 'settings' && (
          <>
            <ScreenHeader title="Settings" onBack={onClose} />
            <div style={{ flex: 1, padding: '8px 20px 32px', background: 'var(--ios-background-gray)' }}>
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--ios-dark-4)', overflow: 'hidden' }}>
                {[
                  { icon: layoutIcon, title: 'Content', sub: 'Change channels, number of posts, and frequencies per campaign', onClick: () => setView('content') },
                  { icon: calendarIcon, title: 'Schedule', sub: 'Edit when campaigns and content should be generated', onClick: () => {} },
                  { icon: barGroupIcon, title: 'Growth settings', sub: 'Adjust how quickly your playbook expands and posting scales up', onClick: () => {} },
                ].map((row, i, arr) => (
                  <button
                    key={row.title} type="button" onClick={row.onClick}
                    style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', gap: 14, background: 'none', border: 'none', cursor: 'pointer', borderBottom: i < arr.length - 1 ? '1px solid var(--ios-dark-4)' : 'none', textAlign: 'left' }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--ios-dark-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img src={row.icon} alt="" aria-hidden="true" style={{ width: 20, height: 20 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: 'var(--ios-dark-90)', lineHeight: 1.3 }}>{row.title}</div>
                      <div style={{ fontFamily: font, fontSize: 12, color: 'var(--ios-dark-60)', lineHeight: 1.4, marginTop: 2, letterSpacing: '0.12px' }}>{row.sub}</div>
                    </div>
                    <img src={chevronRightIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16, opacity: 0.3, flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* — Content defaults — */}
        {view === 'content' && (
          <>
            <ScreenHeader title="Content defaults" onBack={() => setView('settings')} />
            <div style={{ flex: 1, padding: '0 20px', overflowY: 'auto', paddingBottom: 130 }}>
              {/* Description */}
              <p style={{ fontFamily: font, fontSize: 14, color: 'var(--ios-dark-60)', lineHeight: 1.5, margin: '0 0 20px', letterSpacing: '0.14px' }}>
                Set the default channels, cadence, and weekly post count that each strategy applies to its campaigns.
              </p>

              {/* Mode toggle */}
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontFamily: font, fontSize: 14, fontWeight: 500, color: 'var(--ios-dark-90)', display: 'block', marginBottom: 10 }}>
                  Post the same content or tailor per channel?
                </span>
                <SegmentSelector
                  options={['Crosspost', 'Unique posts per channel']}
                  selected={mode}
                  onSelect={v => setMode(v as typeof mode)}
                  fullWidth
                />
              </div>

              {/* Warning banner — unique posts mode only */}
              {mode === 'Unique posts per channel' && (
                <div style={{ background: 'rgba(255,174,0,0.1)', border: '1px solid rgba(255,174,0,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                  <div>
                    <div style={{ fontFamily: font, fontSize: 14, fontWeight: 500, color: 'var(--ios-dark-90)', lineHeight: 1.3 }}>Unique posts per account use more credits</div>
                    <div style={{ fontFamily: font, fontSize: 12, color: 'var(--ios-dark-60)', lineHeight: 1.4, marginTop: 2 }}>Add additional credits or scale back your weekly posts to stay on track.</div>
                  </div>
                </div>
              )}

              {/* Content type cards */}
              {[
                { icon: imageIcon,  label: 'Still image post',  onClick: () => setView('still-image') },
                { icon: layersIcon, label: 'Carousel post',     onClick: () => {} },
                { icon: playIcon,   label: 'Feed video post',   onClick: () => {} },
              ].map((type) => (
                <div key={type.label} style={{ border: '1px solid var(--ios-dark-8)', borderRadius: 12, marginBottom: 10, overflow: 'hidden' }}>
                  <button type="button" onClick={type.onClick} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', borderBottom: '1px solid var(--ios-dark-4)', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--ios-dark-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img src={type.icon} alt="" aria-hidden="true" style={{ width: 16, height: 16 }} />
                    </div>
                    <span style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: 'var(--ios-dark-90)', flex: 1, textAlign: 'left' }}>{type.label}</span>
                    <img src={chevronRightIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16, opacity: 0.3 }} />
                  </button>
                  <div style={{ padding: '0 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--ios-dark-4)' }}>
                      <span style={{ fontFamily: font, fontSize: 14, color: 'var(--ios-dark-60)', width: 80, flexShrink: 0 }}>Accounts</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 99, background: '#45164a', overflow: 'hidden' }}>
                          <img src={ASSETS.adamAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontFamily: font, fontSize: 14, color: 'var(--ios-dark-90)' }}>Adam Nathan</span>
                        <span style={{ fontFamily: font, fontSize: 14, color: 'var(--ios-dark-60)' }}>+ 3</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0' }}>
                      <span style={{ fontFamily: font, fontSize: 14, color: 'var(--ios-dark-60)', width: 80, flexShrink: 0 }}>Posting</span>
                      <span style={{ fontFamily: font, fontSize: 14, color: 'var(--ios-dark-60)' }}>
                        {mode === 'Crosspost' ? `Anyday, ${postsPerWeek} posts/week` : 'Anyday, total 8 posts'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky footer */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px 24px', background: 'white', borderTop: '1px solid var(--ios-dark-4)' }}>
              <button type="button" onClick={() => setView('confirm')} style={{ width: '100%', height: 52, borderRadius: 99, background: 'var(--ios-dark-90)', border: 'none', cursor: 'pointer', fontFamily: font, fontSize: 16, fontWeight: 500, color: 'white' }}>
                Save Changes
              </button>
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <span style={{ fontFamily: font, fontSize: 12, color: 'var(--ios-dark-60)' }}>12 posts per week · 165 credits · +15 more credits per week</span>
              </div>
            </div>
          </>
        )}

        {/* — Still image post — */}
        {view === 'still-image' && (
          <>
            <ScreenHeader title="Still image post" onBack={() => setView('content')} />
            <div style={{ flex: 1, padding: '0 20px 40px', overflowY: 'auto' }}>

              {/* Accounts section */}
              <SectionHeader label={mode === 'Crosspost' ? 'Accounts' : 'Accounts / posts per week'} />
              <div style={{ background: 'white', border: '1px solid var(--ios-dark-8)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                {/* Connected accounts */}
                {[
                  { key: 'radiantHealth' as const, name: 'Radiant Health', avatar: ASSETS.workspaceAvatar },
                  { key: 'adamNathan' as const,    name: 'Adam Nathan',    avatar: ASSETS.adamAvatar },
                ].map((acct, i) => (
                  <div key={acct.key} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12, borderBottom: '1px solid var(--ios-dark-4)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 99, background: '#45164a', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={acct.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)', flex: 1 }}>{acct.name}</span>
                    {mode === 'Crosspost' ? (
                      <Toggle on={accountsOn[acct.key]} onChange={v => setAccountsOn(prev => ({ ...prev, [acct.key]: v }))} />
                    ) : (
                      <button type="button" onClick={() => setShowPicker(acct.key)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <span style={{ fontFamily: font, fontSize: 14, color: 'var(--ios-dark-60)' }}>{perAccount[acct.key]} posts</span>
                        <img src={chevronRightIcon} alt="" style={{ width: 16, height: 16, opacity: 0.3 }} />
                      </button>
                    )}
                  </div>
                ))}
                {/* Unconnected platform accounts */}
                {[
                  { platform: 'x' as const,        name: 'X/Twitter' },
                  { platform: 'linkedin' as const,  name: 'LinkedIn' },
                  { platform: 'google' as const,    name: 'Google Business Profile' },
                ].map(acct => (
                  <div key={acct.name} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12, borderBottom: '1px solid var(--ios-dark-4)' }}>
                    <PlatformBadge platform={acct.platform} />
                    <span style={{ fontFamily: font, fontSize: 16, color: 'var(--ios-dark-90)', flex: 1 }}>{acct.name}</span>
                    {mode === 'Crosspost' ? (
                      <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <span style={{ fontFamily: font, fontSize: 14, color: 'var(--ios-dark-60)' }}>Connect</span>
                        <img src={chevronRightIcon} alt="" style={{ width: 16, height: 16, opacity: 0.3 }} />
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontFamily: font, fontSize: 14, color: 'var(--ios-dark-40)' }}>0 posts</span>
                        <img src={chevronRightIcon} alt="" style={{ width: 16, height: 16, opacity: 0.2 }} />
                      </div>
                    )}
                  </div>
                ))}
                {/* Add New Account */}
                <button type="button" style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 99, border: '1.5px dashed rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <img src={plusIcon} alt="" style={{ width: 16, height: 16, opacity: 0.4 }} />
                  </div>
                  <span style={{ fontFamily: font, fontSize: 16, color: 'var(--ios-dark-60)' }}>Add New Account</span>
                </button>
              </div>

              {/* Posts per week — crosspost mode only */}
              {mode === 'Crosspost' && (
                <>
                  <SectionHeader label="Posts per week" />
                  <div style={{ border: '1px solid var(--ios-dark-8)', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <button type="button" onClick={() => setPostsPerWeek(n => Math.max(0, n - 1))} style={{ width: 44, height: 44, borderRadius: 99, border: '1px solid var(--ios-dark-8)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontSize: 20, color: 'var(--ios-dark-90)' }}>
                        −
                      </button>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: font, fontSize: 28, fontWeight: 500, color: 'var(--ios-dark-90)', lineHeight: 1 }}>{postsPerWeek}</div>
                        <div style={{ fontFamily: font, fontSize: 12, color: 'var(--ios-dark-60)', marginTop: 4 }}>Posts per week</div>
                      </div>
                      <button type="button" onClick={() => setPostsPerWeek(n => Math.min(20, n + 1))} style={{ width: 44, height: 44, borderRadius: 99, border: '1px solid var(--ios-dark-8)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontSize: 20, color: 'var(--ios-dark-90)' }}>
                        +
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Post days */}
              <SectionHeader label="Post days" />
              <div style={{ border: '1px solid var(--ios-dark-8)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                {POST_DAYS.map((day, i) => {
                  const isSelected = postDays.has(day);
                  return (
                    <button
                      key={day} type="button" onClick={() => toggleDay(day)}
                      style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: 'none', borderBottom: i < POST_DAYS.length - 1 ? '1px solid var(--ios-dark-4)' : 'none', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <span style={{ fontFamily: font, fontSize: 16, color: 'var(--ios-dark-90)' }}>{day}</span>
                      {isSelected && (
                        <div style={{ width: 24, height: 24, borderRadius: 99, background: 'var(--ios-dark-90)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <img src={checkIcon} alt="" style={{ width: 14, height: 14, filter: 'invert(1)' }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Posts-per-account picker sheet */}
            {showPicker && (
              <>
                <div onClick={() => setShowPicker(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 10 }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderRadius: '24px 24px 0 0', padding: '12px 20px 32px', zIndex: 20 }}>
                  <div style={{ width: 58, height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.08)', margin: '0 auto 20px' }} />
                  <div style={{ fontFamily: font, fontSize: 18, fontWeight: 400, color: 'var(--ios-dark-90)', textAlign: 'center', marginBottom: 16 }}>Posts per week</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                    {[0, 1, 2, 3, 4].map(n => {
                      const cur = perAccount[showPicker];
                      const dist = Math.abs(n - cur);
                      const opacity = dist === 0 ? 1 : dist === 1 ? 0.4 : 0.2;
                      return (
                        <button key={n} type="button" onClick={() => { setPerAccount(prev => ({ ...prev, [showPicker!]: n })); setShowPicker(null); }}
                          style={{ width: '100%', height: 44, background: 'none', border: 'none', cursor: 'pointer', fontFamily: font, fontSize: dist === 0 ? 22 : 18, fontWeight: dist === 0 ? 500 : 400, color: 'var(--ios-dark-90)', opacity }}>
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* — Confirm — */}
        {view === 'confirm' && (
          <>
            <ScreenHeader title="Confirm" onBack={() => setView('content')} />
            <div style={{ flex: 1, padding: '0 20px', overflowY: 'auto', paddingBottom: 100 }}>
              <p style={{ fontFamily: font, fontSize: 14, color: 'var(--ios-dark-90)', lineHeight: 1.5, margin: '0 0 20px', letterSpacing: '0.14px' }}>
                All 6 planned campaigns and any future ones will be updated. Deselect any campaigns you'd like to keep unchanged.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--ios-dark-8)', borderRadius: 12, overflow: 'hidden' }}>
                {CONFIRM_CAMPAIGNS.map((c, i) => {
                  const isChecked = confirmedIds.has(c.id);
                  return (
                    <button
                      key={c.id} type="button" onClick={() => toggleCampaign(c.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'white', border: 'none', borderBottom: i < CONFIRM_CAMPAIGNS.length - 1 ? '1px solid var(--ios-dark-4)' : 'none', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <div style={{ width: 72, height: 72, borderRadius: 8, background: 'var(--ios-dark-4)', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={c.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: font, fontSize: 10, color: 'var(--ios-dark-40)', marginBottom: 2 }}>Fri, Feb 8 · Mon, Feb 12</div>
                        <div style={{ fontFamily: font, fontSize: 15, fontWeight: 500, color: 'var(--ios-dark-90)', lineHeight: 1.3, marginBottom: 4 }}>{c.title}</div>
                        <div style={{ fontFamily: font, fontSize: 12, color: 'var(--ios-dark-60)', marginBottom: 6 }}>{c.category}</div>
                        <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.04)', border: '1px solid var(--ios-dark-4)' }}>
                          <span style={{ fontFamily: font, fontSize: 11, color: 'var(--ios-dark-60)' }}>Generates in 3 days</span>
                        </div>
                      </div>
                      <div style={{ width: 32, height: 32, borderRadius: 99, flexShrink: 0, background: isChecked ? 'var(--ios-dark-90)' : 'transparent', border: isChecked ? 'none' : '1.5px solid rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isChecked && <img src={checkIcon} alt="" style={{ width: 16, height: 16, filter: 'invert(1)' }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirm footer */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px 28px', background: 'white', borderTop: '1px solid var(--ios-dark-4)' }}>
              <button type="button" onClick={handleConfirm} style={{ width: '100%', height: 52, borderRadius: 99, background: 'var(--ios-dark-90)', border: 'none', cursor: 'pointer', fontFamily: font, fontSize: 16, fontWeight: 500, color: 'white' }}>
                Confirm
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
