import { useState } from 'react';
import { ASSETS } from './assets';
import closeIcon      from '@ios/icons/x-02.svg';
import chevronLeftIcon  from '@ios/icons/chevron-left.svg';
import chevronRightIcon from '@ios/icons/chevron-right-small.svg';
import refreshIcon    from '@ios/icons/refresh.svg';
import calendarIcon   from '@ios/icons/calendar-01.svg';
import checkIcon      from '@ios/icons/check-02.svg';
import moreDotsIcon   from '@ios/icons/more-dots.svg';

const font = 'var(--ios-font)';

const IG_HEART    = 'https://www.figma.com/api/mcp/asset/76f9aece-d551-4a69-8410-e063599ad18d';
const IG_COMMENT  = 'https://www.figma.com/api/mcp/asset/bd0b2bf7-1be4-4162-8ab8-497260db4046';
const IG_SEND_IG  = 'https://www.figma.com/api/mcp/asset/b8079d5c-f706-48e9-8847-637e96242a1b';
const IG_BOOKMARK = 'https://www.figma.com/api/mcp/asset/853f9e13-12c0-45ad-b65f-8b8fef4939f6';

const FEEDBACK_REASONS = [
  'Wrong image',
  'Too much / too little text',
  'Wrong facts',
  'Wrong style',
  'Other',
];

type Sheet = 'preview' | 'feedback' | 'other';

export interface PostData {
  id: number;
  type: string;
  img: string | null;
  body: string;
}

interface Props {
  post: PostData;
  hasPrev: boolean;
  hasNext: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function ContentPreviewSheet({ post, hasPrev, hasNext, onClose, onPrev, onNext }: Props) {
  const [sheet, setSheet] = useState<Sheet>('preview');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [otherText, setOtherText] = useState('');

  function handleSubmit() {
    setSubmitted(true);
    setShowToast(true);
    setSheet('preview');
    setSelectedReasons([]);
    setOtherText('');
    setTimeout(() => setShowToast(false), 5000);
  }

  function toggleReason(reason: string) {
    if (reason === 'Other') {
      setSheet('other');
      return;
    }
    setSelectedReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  }

  const canSubmit = sheet === 'feedback' ? selectedReasons.length > 0 : otherText.trim().length > 0;

  const statusPill = submitted ? (
    <div style={{ padding: '4px 10px', borderRadius: 99, background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
      <span style={{ fontFamily: font, fontSize: 12, fontWeight: 400, color: 'var(--ios-dark-60)', letterSpacing: '0.12px' }}>Draft</span>
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: 'rgba(255,174,0,0.15)', border: '1px solid rgba(255,174,0,0.3)' }}>
      <div style={{ width: 6, height: 6, borderRadius: 99, background: '#edb62c', flexShrink: 0 }} />
      <span style={{ fontFamily: font, fontSize: 12, fontWeight: 400, color: '#7a5a00', letterSpacing: '0.12px' }}>Review</span>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes iosFeedbackToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-64px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .ios-feedback-toast { animation: iosFeedbackToastIn 0.32s cubic-bezier(0.34, 1.4, 0.64, 1) forwards; }
      `}</style>

      {/* Scrim */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 40 }}
      />

      {/* Toast */}
      {showToast && (
        <div
          className="ios-feedback-toast"
          style={{
            position: 'absolute', top: 16, left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.9)', borderRadius: 99,
            height: 52, padding: '0 20px',
            display: 'flex', alignItems: 'center', gap: 8,
            zIndex: 100, whiteSpace: 'nowrap',
          }}
        >
          <img src={checkIcon} alt="" aria-hidden="true" style={{ width: 20, height: 20, filter: 'invert(1)', flexShrink: 0 }} />
          <span style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'white' }}>Feedback submitted!</span>
        </div>
      )}

      {/* Bottom sheet */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, top: 32,
        background: 'white', borderRadius: '28px 28px 0 0',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
        zIndex: 50, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* Drag handle */}
        <div style={{ width: 58, height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.08)', alignSelf: 'center', marginTop: 10, marginBottom: 4, flexShrink: 0 }} />

        {/* Header */}
        <div style={{ flexShrink: 0, height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button" onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 99, background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <img src={closeIcon} alt="Close" style={{ width: 16, height: 16 }} />
          </button>
          <span style={{ fontFamily: font, fontSize: 18, fontWeight: 400, color: 'var(--ios-dark-90)' }}>
            {post.type}
          </span>
          {statusPill}
        </div>

        {/* Scrollable card area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 0' }}>
          <div style={{
            width: '100%', maxWidth: 331, margin: '0 auto',
            border: '1px solid var(--ios-dark-8)', borderRadius: 15,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden', background: 'white',
          }}>
            {/* Avatar row */}
            <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 99, background: '#45164a', overflow: 'hidden', flexShrink: 0 }}>
                <img src={ASSETS.workspaceAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: font, fontSize: 12, fontWeight: 500, color: 'var(--ios-dark-90)', lineHeight: 1.3 }}>@radiant_health</div>
                <div style={{ fontFamily: font, fontSize: 11, color: 'var(--ios-dark-40)', lineHeight: 1.3 }}>Just now</div>
              </div>
              <img src={moreDotsIcon} alt="" aria-hidden="true" style={{ width: 20, height: 20, opacity: 0.4 }} />
            </div>

            {/* Post photo */}
            <div style={{ width: '100%', aspectRatio: '1 / 1', background: 'var(--ios-dark-4)', overflow: 'hidden' }}>
              {post.img && <img src={post.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
            </div>

            {/* Action icons */}
            <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={IG_HEART}    alt="" style={{ width: 24, height: 24 }} />
              <img src={IG_COMMENT}  alt="" style={{ width: 24, height: 24 }} />
              <img src={IG_SEND_IG}  alt="" style={{ width: 24, height: 24 }} />
              <div style={{ marginLeft: 'auto' }}>
                <img src={IG_BOOKMARK} alt="" style={{ width: 24, height: 24 }} />
              </div>
            </div>

            {/* Caption */}
            <div style={{ padding: '0 12px 14px' }}>
              <span style={{ fontFamily: font, fontSize: 12, color: 'var(--ios-dark-90)', lineHeight: 1.4 }}>
                <strong style={{ fontWeight: 500 }}>radiant_health</strong>{' '}
                {post.body.slice(0, 120)}{post.body.length > 120 ? '…' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, padding: '12px 16px 28px', background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, white 28%)' }}>
          {/* Schedule / posting label */}
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            {submitted ? (
              <span style={{ fontFamily: font, fontSize: 13, color: 'var(--ios-dark-60)' }}>Not scheduled ▾</span>
            ) : (
              <span style={{ fontFamily: font, fontSize: 13, color: 'var(--ios-dark-60)' }}>
                Posting on ·{' '}
                <span style={{ color: 'var(--ios-dark-90)', fontWeight: 500 }}>Fri Sep 18 at 11:15am</span>
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Prev */}
            <button
              type="button" onClick={onPrev} disabled={!hasPrev}
              style={{ width: 40, height: 40, borderRadius: 99, background: 'rgba(0,0,0,0.04)', border: 'none', cursor: hasPrev ? 'pointer' : 'default', opacity: hasPrev ? 1 : 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <img src={chevronLeftIcon} alt="Previous" style={{ width: 20, height: 20 }} />
            </button>

            {/* Center buttons */}
            <div style={{ flex: 1, display: 'flex', gap: 6 }}>
              {submitted ? (
                <>
                  <button type="button" style={{ flex: 1, height: 40, borderRadius: 99, background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <img src={calendarIcon} alt="" aria-hidden="true" style={{ width: 15, height: 15 }} />
                    <span style={{ fontFamily: font, fontSize: 13, fontWeight: 500, color: 'var(--ios-dark-90)' }}>Schedule</span>
                  </button>
                  <button type="button" style={{ flex: 1, height: 40, borderRadius: 99, background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <img src={refreshIcon} alt="" aria-hidden="true" style={{ width: 15, height: 15 }} />
                    <span style={{ fontFamily: font, fontSize: 13, fontWeight: 500, color: 'var(--ios-dark-90)' }}>Regenerate</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button" onClick={() => setSheet('feedback')}
                    style={{ flex: 1, height: 40, borderRadius: 99, background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <img src={closeIcon} alt="" aria-hidden="true" style={{ width: 14, height: 14, opacity: 0.5 }} />
                    <span style={{ fontFamily: font, fontSize: 13, fontWeight: 500, color: 'var(--ios-dark-90)' }}>Don't Post</span>
                  </button>
                  <button type="button" style={{ flex: 1, height: 40, borderRadius: 99, background: 'var(--ios-dark-90)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <img src={checkIcon} alt="" aria-hidden="true" style={{ width: 14, height: 14, filter: 'invert(1)' }} />
                    <span style={{ fontFamily: font, fontSize: 13, fontWeight: 500, color: 'white' }}>Approve</span>
                  </button>
                </>
              )}
              <button type="button" style={{ width: 40, height: 40, borderRadius: 99, background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={moreDotsIcon} alt="Actions" style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {/* Next */}
            <button
              type="button" onClick={onNext} disabled={!hasNext}
              style={{ width: 40, height: 40, borderRadius: 99, background: 'rgba(0,0,0,0.04)', border: 'none', cursor: hasNext ? 'pointer' : 'default', opacity: hasNext ? 1 : 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <img src={chevronRightIcon} alt="Next" style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </div>

        {/* Feedback / Other overlay sheet */}
        {(sheet === 'feedback' || sheet === 'other') && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: '#f8f8f9', borderRadius: '28px 28px 0 0',
            boxShadow: '0 -4px 30px rgba(0,0,0,0.14)',
            padding: '0 20px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            zIndex: 10,
          }}>
            {/* Drag handle */}
            <div style={{ width: 58, height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.08)', margin: '12px 0 20px', flexShrink: 0 }} />

            {/* Title row */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 20 }}>
              {sheet === 'other' && (
                <button
                  type="button" onClick={() => setSheet('feedback')}
                  style={{ position: 'absolute', left: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  <img src={chevronLeftIcon} alt="Back" style={{ width: 24, height: 24 }} />
                </button>
              )}
              <span style={{ fontFamily: font, fontSize: 18, fontWeight: 400, color: 'var(--ios-dark-90)' }}>
                {sheet === 'other' ? 'Other' : 'What was wrong with it?'}
              </span>
            </div>

            {/* Feedback pills */}
            {sheet === 'feedback' && (
              <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {FEEDBACK_REASONS.map((reason) => {
                  const isSel = selectedReasons.includes(reason);
                  return (
                    <button
                      key={reason} type="button" onClick={() => toggleReason(reason)}
                      style={{
                        padding: '9px 16px', borderRadius: 99,
                        background: isSel ? 'white' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${isSel ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.04)'}`,
                        cursor: 'pointer',
                        fontFamily: font, fontSize: 16, fontWeight: isSel ? 500 : 400,
                        color: 'var(--ios-dark-90)',
                      }}
                    >
                      {reason}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Other text field + keyboard */}
            {sheet === 'other' && (
              <>
                <textarea
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  placeholder="Tell us more"
                  value={otherText}
                  onChange={e => setOtherText(e.target.value)}
                  style={{
                    width: '100%', height: 80, borderRadius: 20,
                    background: 'white', border: '1px solid rgba(0,0,0,0.08)',
                    padding: '14px 16px', boxSizing: 'border-box',
                    fontFamily: font, fontSize: 16, fontWeight: 400,
                    color: 'var(--ios-dark-90)', resize: 'none', outline: 'none',
                    marginBottom: 16,
                  }}
                />
                {/* iOS keyboard placeholder */}
                <div style={{ width: '100%', height: 220, background: 'rgba(0,0,0,0.04)', borderRadius: 12, marginBottom: 16 }} />
              </>
            )}

            {/* Submit button */}
            <button
              type="button" onClick={handleSubmit} disabled={!canSubmit}
              style={{
                width: '100%', height: 52, borderRadius: 99,
                background: 'var(--ios-dark-90)', border: 'none',
                cursor: canSubmit ? 'pointer' : 'default',
                fontFamily: font, fontSize: 16, fontWeight: 500, color: 'white',
                opacity: canSubmit ? 1 : 0.4, transition: 'opacity 0.15s',
              }}
            >
              Submit Feedback
            </button>
          </div>
        )}
      </div>
    </>
  );
}
