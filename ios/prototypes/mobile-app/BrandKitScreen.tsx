import { ASSETS } from './assets';
import { ToolbarHeader, ToolbarButton } from '@ios/components';
import chevronRightSmall from '@ios/icons/chevron-right-small.svg';

const font = 'var(--ios-font)';

function Chevron() {
  return (
    <img
      src={chevronRightSmall}
      alt=""
      aria-hidden="true"
      style={{ width: 20, height: 20, opacity: 0.25, flexShrink: 0 }}
    />
  );
}

// File thumbnail: Blaze B icon (yellow)
function FileThumbnailBlaze() {
  return (
    <div style={{
      width: 60, height: 60, borderRadius: 12, flexShrink: 0,
      background: 'var(--ios-dark-4)', border: '1px solid var(--ios-dark-4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      <div style={{ width: 34, height: 34, borderRadius: 4, background: '#ffdc18', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={ASSETS.brandFileBlazeIcon} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
      </div>
    </div>
  );
}

// File thumbnail: PDF
function FileThumbnailPDF() {
  return (
    <div style={{
      width: 60, height: 60, borderRadius: 12, flexShrink: 0,
      background: 'var(--ios-dark-4)', border: '1px solid var(--ios-dark-4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 5, background: 'white',
        boxShadow: '0 1.2px 2.4px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
      }}>
        <div style={{ width: 16, height: 12, background: 'rgba(0,0,0,0.06)', borderRadius: 2 }} />
        <span style={{ fontFamily: font, fontSize: 7.5, fontWeight: 600, color: '#ec1e28', letterSpacing: 0.15 }}>PDF</span>
      </div>
    </div>
  );
}

// File thumbnail: TXT
function FileThumbnailTXT() {
  return (
    <div style={{
      width: 60, height: 60, borderRadius: 12, flexShrink: 0,
      background: 'var(--ios-dark-4)', border: '1px solid var(--ios-dark-4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 5, background: 'white',
        boxShadow: '0 1.2px 2.4px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
      }}>
        <div style={{ width: 16, height: 12, background: 'rgba(0,0,0,0.06)', borderRadius: 2 }} />
        <span style={{ fontFamily: font, fontSize: 7.5, fontWeight: 600, color: '#2ab5f0', letterSpacing: 0.15 }}>TXT</span>
      </div>
    </div>
  );
}

const CARD_BASE: React.CSSProperties = {
  background: 'white',
  border: '1px solid var(--ios-dark-4)',
  padding: 16,
  overflow: 'hidden',
  position: 'relative',
  cursor: 'pointer',
};

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: font, fontSize: 16, fontWeight: 500, lineHeight: 1.4, color: 'rgba(0,0,0,0.8)' }}>
      {children}
    </div>
  );
}

function CardSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: font, fontSize: 12, fontWeight: 400, lineHeight: 1.4, color: 'rgba(0,0,0,0.6)', letterSpacing: 0.12, marginTop: 1 }}>
      {children}
    </div>
  );
}

export function BrandKitScreen() {
  return (
    <div style={{ fontFamily: font, background: '#f8f8f9', minHeight: '100%' }}>

      <ToolbarHeader
        variant="screen"
        title="Brand Kit"
        rightButtons={<ToolbarButton variant="credits" credits={96} />}
      />

      {/* Content */}
      <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Row 1: Content Preferences — full width */}
        <div style={{ ...CARD_BASE, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <CardTitle>Content Preferences</CardTitle>
            <CardSubtitle>Set design, content, and CTA preferences</CardSubtitle>
          </div>
          <Chevron />
        </div>

        {/* Row 2: Media Library + Source Materials */}
        <div style={{ display: 'flex', gap: 8 }}>

          {/* Media Library */}
          <div style={{ ...CARD_BASE, flex: 1, borderRadius: 26, height: 186, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ paddingRight: 24 }}>
              <CardTitle>Media<br />Library</CardTitle>
              <CardSubtitle>Upload and manage images and video</CardSubtitle>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <img src={ASSETS.brandMediaThumb1} alt="" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
              <img src={ASSETS.brandMediaThumb2} alt="" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
              <img src={ASSETS.brandMediaThumb3} alt="" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
            </div>
            <div style={{ position: 'absolute', top: 15, right: 15 }}><Chevron /></div>
          </div>

          {/* Source Materials */}
          <div style={{ ...CARD_BASE, flex: 1, borderRadius: 16, height: 186, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ paddingRight: 24 }}>
              <CardTitle>Source<br />Materials</CardTitle>
              <CardSubtitle>Link websites, docs, and social media for context</CardSubtitle>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <FileThumbnailBlaze />
              <FileThumbnailPDF />
              <FileThumbnailTXT />
            </div>
            <div style={{ position: 'absolute', top: 15, right: 15 }}><Chevron /></div>
          </div>

        </div>

        {/* Row 3: Styles & Voice + Brand Profile */}
        <div style={{ display: 'flex', gap: 8 }}>

          {/* Styles & Voice */}
          <div style={{ ...CARD_BASE, flex: 1, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ paddingRight: 24 }}>
              <CardTitle>Styles<br />& Voice</CardTitle>
              <CardSubtitle>Visual brand identity and brand voice writing style</CardSubtitle>
            </div>
            {/* Overlapping color circles */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {[['#45164a', 3], ['#f79434', 2], ['#fac671', 1]].map(([color, z], i) => (
                <div
                  key={i}
                  style={{
                    width: 60, height: 60, borderRadius: 999,
                    background: color as string,
                    border: '2.4px solid white',
                    marginRight: i < 2 ? -18 : 0,
                    zIndex: z as number,
                    flexShrink: 0,
                    boxShadow: 'inset 0 0 0 1.2px var(--ios-dark-8)',
                  }}
                />
              ))}
            </div>
            <div style={{ position: 'absolute', top: 15, right: 15 }}><Chevron /></div>
          </div>

          {/* Brand Profile */}
          <div style={{ ...CARD_BASE, flex: 1, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ paddingRight: 24 }}>
              <CardTitle>Brand<br />Profile</CardTitle>
              <CardSubtitle>Share your mission, audience, and competitors</CardSubtitle>
            </div>
            <div style={{
              width: 60, height: 60, borderRadius: 37, background: '#45164a',
              overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src={ASSETS.brandProfileAvatar} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
            </div>
            <div style={{ position: 'absolute', top: 15, right: 15 }}><Chevron /></div>
          </div>

        </div>

      </div>
    </div>
  );
}
