import { ContentPreviewFooter } from '@ios/components';
import xIcon from '@ios/icons/x-02.svg';

const font = 'var(--ios-font)';

// Post card assets (fresh Figma CDN URLs)
const AVATAR       = 'https://www.figma.com/api/mcp/asset/faa823c3-805f-429f-bb96-66a08ca9786f';
const POST_IMG_1   = 'https://www.figma.com/api/mcp/asset/39de360f-cbb3-4ab2-a5c2-7613122a0565';
const POST_IMG_2   = 'https://www.figma.com/api/mcp/asset/7eb70412-5927-4bdd-a9b5-9967034028f1';
const POST_IMG_3   = 'https://www.figma.com/api/mcp/asset/e92fe919-912f-4bc4-bd15-226ef1fc3448';
const IG_HEART    = 'https://www.figma.com/api/mcp/asset/cb28b0dd-1cb7-4928-8e84-a64dbbc451ea';
const IG_COMMENT  = 'https://www.figma.com/api/mcp/asset/719902d4-e157-4e71-bade-beb450a138fc';
const IG_SEND     = 'https://www.figma.com/api/mcp/asset/4da0fe6a-0bba-40b8-8784-9151c2eb5cd3';
const IG_BOOKMARK = 'https://www.figma.com/api/mcp/asset/ca31c2f7-36ed-47db-bf7c-07786cd2e576';

interface Props {
  onClose: () => void;
}

export function ContentPreviewScreen({ onClose }: Props) {
  return (
    <>
      {/* Dim overlay */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 40 }}
      />

      {/* Drawer — top: 61 matches Figma's 874−813=61px offset */}
      <div style={{
        position: 'absolute',
        top: 61, bottom: 0, left: 0, right: 0,
        background: 'white',
        borderRadius: '38px 38px 0 0',
        boxShadow: '0 -15px 37.5px rgba(0,0,0,0.18)',
        zIndex: 50,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Drag handle */}
        <div style={{
          width: 36, height: 5, borderRadius: 99,
          background: 'rgba(0,0,0,0.18)',
          alignSelf: 'center', marginTop: 8, marginBottom: 0, flexShrink: 0,
        }} />

        {/* Header */}
        <div style={{
          flexShrink: 0,
          height: 76,
          padding: '0 20px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 44, height: 44, borderRadius: 99,
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'var(--ios-glass-blur)',
              WebkitBackdropFilter: 'var(--ios-glass-blur)',
              boxShadow: '0 0 32px rgba(0,0,0,0.08)',
              border: 'none', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <img src={xIcon} alt="Close" style={{ width: 20, height: 20 }} />
          </button>

          {/* Title */}
          <span style={{
            flex: 1, textAlign: 'center',
            fontFamily: font, fontSize: 18, fontWeight: 400,
            color: 'var(--ios-dark-90)',
          }}>
            Still image
          </span>

          {/* Review status pill */}
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '3px 6px 3px 4px',
            borderRadius: 5,
            background: 'rgba(255,174,0,0.3)',
            border: '1px solid rgba(255,174,0,0.3)',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: font, fontSize: 12,
              color: '#3f2b00', letterSpacing: '0.12px',
            }}>
              Review
            </span>
          </div>
        </div>

        {/* Scrollable post card */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{
            width: '100%', maxWidth: 331, margin: '0 auto',
            border: '1.2px solid var(--ios-dark-8)',
            borderRadius: 14.8,
            boxShadow: '0 5.8px 46.7px rgba(0,0,0,0.05)',
            overflow: 'hidden', background: 'white',
          }}>
            {/* Avatar row */}
            <div style={{ padding: '9px 9px', display: 'flex', alignItems: 'center', gap: 4.5 }}>
              <div style={{ width: 24, height: 24, borderRadius: 99, background: '#45164a', overflow: 'hidden', flexShrink: 0 }}>
                <img src={AVATAR} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.7, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'rgba(0,0,0,0.8)', lineHeight: 1.42 }}>
                  radiant_health
                </div>
                <div style={{ fontSize: 7.8, fontFamily: 'Inter, sans-serif', color: 'rgba(0,0,0,0.8)', lineHeight: 1.32 }}>
                  Just now
                </div>
              </div>
            </div>

            {/* Post image — three layers composited exactly as in Figma */}
            <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', position: 'relative' }}>
              <img src={POST_IMG_1} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <img src={POST_IMG_2} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <img src={POST_IMG_3} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>

            {/* IG actions */}
            <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <img src={IG_HEART}   alt="" aria-hidden="true" style={{ width: 17, height: 17 }} />
                <img src={IG_COMMENT} alt="" aria-hidden="true" style={{ width: 17, height: 17 }} />
                <img src={IG_SEND}    alt="" aria-hidden="true" style={{ width: 17, height: 17 }} />
              </div>
              <img src={IG_BOOKMARK} alt="" aria-hidden="true" style={{ width: 17, height: 17 }} />
            </div>

            {/* Caption */}
            <div style={{ padding: '0 13px 13px' }}>
              <p style={{ margin: 0, fontSize: 10.9, fontFamily: 'Inter, sans-serif', lineHeight: 1.52, color: '#101419' }}>
                <strong style={{ fontWeight: 700 }}>radiant_health </strong>
                Discover the joyful playtime moments at Houston Boxer Rescue where each wag of a tail bri{' '}
                <span style={{ color: 'rgba(0,0,0,0.4)' }}>...</span>
                <span style={{ color: '#8f98a9' }}> more</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <ContentPreviewFooter variant="review" date="Fri Sep 18 at 11:15am" />
      </div>
    </>
  );
}

