import React from 'react';

export type PostPreviewCardStatus = 'pending' | 'approved' | 'rejected';

export interface PostPreviewCardProps {
  /** Post image URL (used for still, carousel, feed-video) */
  img?: string;
  /** Caption text shown below the image */
  caption?: string;
  /** Platform account name shown in the header */
  username?: string;
  /** Avatar image URL */
  avatar?: string;
  /** Current approval status — drives green overlay on approved */
  status?: PostPreviewCardStatus;
  /** Approve animation phase */
  approveAnim?: 'idle' | 's1' | 's2';
  /** Checkmark image for approve animation (burst overlay) */
  checkmarkImg?: string;
  /** Approvals badge image shown statically once post is approved (70×70) */
  approvalsImg?: string;
}

const FONT = "'Sohne', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif";
const INTER = "'Inter', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif";

export function PostPreviewCard({
  img,
  caption = '',
  username = 'radiant_health',
  avatar,
  status = 'pending',
  approveAnim = 'idle',
  checkmarkImg,
  approvalsImg,
}: PostPreviewCardProps) {
  const isApproved = status === 'approved';
  const animating = approveAnim !== 'idle';
  // Green border + overlay only during the animation; plain card once approved
  const showAnimState = animating || (isApproved && approveAnim !== 'idle');

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 331,
        background: '#ffffff',
        border: animating ? '1px solid #20a14f' : '1.2px solid rgba(0,0,0,0.08)',
        borderRadius: 16,
        boxShadow: '0px 5.842px 46.732px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        transition: 'border-color 0.35s ease',
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 9px 8px' }}>
        <div
          style={{
            width: 25,
            height: 25,
            borderRadius: 99,
            background: '#45164a',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {avatar && (
            <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.8)', lineHeight: 1.42 }}>
            {username}
          </span>
          <span style={{ fontFamily: INTER, fontSize: 8, fontWeight: 400, color: 'rgba(0,0,0,0.4)', lineHeight: 1.32 }}>
            Just now
          </span>
        </div>
      </div>

      {/* ── Image ── */}
      <div style={{ width: '100%', aspectRatio: '1', position: 'relative', background: 'rgba(0,0,0,0.04)' }}>
        {img && (
          <img
            src={img}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}

        {/* Approve animation — green tint + filled circle checkmark */}
        {animating && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(32,161,79,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: approveAnim === 's2' ? 1 : 0,
              transition: 'opacity 0.35s ease',
            }}
          >
            {/* Filled green circle with white checkmark */}
            <div
              style={{
                width: approveAnim === 's2' ? 80 : 48,
                height: approveAnim === 's2' ? 80 : 48,
                borderRadius: '50%',
                background: '#20a14f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'width 0.45s cubic-bezier(0.34,1.56,0.64,1), height 0.45s cubic-bezier(0.34,1.56,0.64,1)',
                flexShrink: 0,
              }}
            >
              <svg
                width={approveAnim === 's2' ? 36 : 22}
                height={approveAnim === 's2' ? 28 : 17}
                viewBox="0 0 36 28"
                fill="none"
                style={{ transition: 'width 0.45s cubic-bezier(0.34,1.56,0.64,1), height 0.45s cubic-bezier(0.34,1.56,0.64,1)' }}
              >
                <path
                  d="M3 14.5L13.5 25L33 3"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* ── Action bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {/* Heart */}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M12 21.5C12 21.5 2.5 15.5 2.5 8.5C2.5 5.46 5.46 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.54 3 23.5 5.46 23.5 8.5C23.5 15.5 12 21.5 12 21.5Z" stroke="rgba(0,0,0,0.7)" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {/* Comment */}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="rgba(0,0,0,0.7)" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {/* Send */}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="rgba(0,0,0,0.7)" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {/* Bookmark */}
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="rgba(0,0,0,0.7)" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* ── Caption ── */}
      {caption && (
        <div style={{ padding: '0 13px 13px' }}>
          <p style={{ margin: 0, fontFamily: INTER, fontSize: 11, color: '#101419', lineHeight: 1.52 }}>
            <strong>{username} </strong>
            <span style={{ fontWeight: 400 }}>
              {caption.length > 90 ? caption.slice(0, 90) : caption}
            </span>
            {caption.length > 90 && (
              <span style={{ color: 'rgba(0,0,0,0.4)' }}> ... </span>
            )}
            {caption.length > 90 && (
              <span style={{ color: '#8f98a9' }}>more</span>
            )}
          </p>
        </div>
      )}

      {/* No static approved overlay — animation only, plain card after */}
    </div>
  );
}
