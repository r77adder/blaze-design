import { useEffect } from 'react';
import { Heading } from '@/components';
import { useFirstCampaign } from '../first-campaign-context';
import Instagram from '@/icons/20/Instagram';
import Heart from '@/icons/20/Heart';
import Comment from '@/icons/20/Comment';
import Send1 from '@/icons/20/Send1';
import Save2 from '@/icons/20/Save2';

const TOPIC_IMAGE =
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80';
const POST_IMAGE =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80';

/** Step 4 — Loading "Generating your topics…" state. Auto-advances. */
export function Step4Generating() {
  const { next } = useFirstCampaign();

  useEffect(() => {
    const id = window.setTimeout(next, 2500);
    return () => window.clearTimeout(id);
  }, [next]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 800,
        margin: '24px auto 0',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 14,
          color: 'var(--dark-60)',
          letterSpacing: '0.28px',
          marginBottom: 8,
        }}
      >
        In progress&hellip;
      </div>
      <Heading level={2} style={{ marginBottom: 12, fontSize: 32 }}>
        Generating your topics&hellip;
      </Heading>
      <p
        style={{
          margin: '0 auto',
          maxWidth: 560,
          color: 'var(--dark-60)',
          fontSize: 14,
          lineHeight: 1.55,
          letterSpacing: '0.28px',
        }}
      >
        Every post starts with two things: a topic that sets the direction, and a
        reference image that keeps it looking like you. Here&rsquo;s how it comes
        together:
      </p>

      <div
        style={{
          height: 1,
          background: 'var(--dark-8)',
          margin: '32px 0',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        {/* Topic block */}
        <div style={{ textAlign: 'left', maxWidth: 320 }}>
          <div
            style={{
              fontSize: 13,
              color: 'var(--dark-60)',
              marginBottom: 12,
              letterSpacing: '0.26px',
            }}
          >
            Topic inside your campaign:
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div
              style={{
                position: 'relative',
                width: 122,
                height: 122,
                borderRadius: 10,
                overflow: 'hidden',
                background: 'var(--dark-4)',
                flexShrink: 0,
              }}
            >
              <img
                src={TOPIC_IMAGE}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '4px 8px',
                  background: 'rgba(0,0,0,0.55)',
                  color: 'var(--light-100)',
                  fontSize: 11,
                  letterSpacing: '0.22px',
                  textAlign: 'center',
                }}
              >
                Reference image
              </div>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: 'var(--dark-90)',
                lineHeight: 1.5,
                letterSpacing: '0.26px',
              }}
            >
              Encouraging creative professionals to share their work-in-progress
              openly &mdash; building a brand around creative transparency, not
              just finished results.
            </p>
          </div>
        </div>

        <div style={{ color: 'var(--dark-40)' }}>
          <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
            <path
              d="M0 7H26M26 7L20 1M26 7L20 13"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Generated post preview */}
        <div style={{ textAlign: 'left' }}>
          <div
            style={{
              fontSize: 13,
              color: 'var(--dark-60)',
              marginBottom: 12,
              letterSpacing: '0.26px',
            }}
          >
            Generated post:
          </div>
          <div
            style={{
              width: 177,
              borderRadius: 10,
              overflow: 'hidden',
              border: '1px solid var(--dark-8)',
              background: 'var(--light-100)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, #FFC371 0%, #FF5F6D 60%, #C13584 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#fff', fontSize: 10 }}>r</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--dark-90)',
                  }}
                >
                  radiant_health
                </span>
                <span style={{ fontSize: 9, color: 'var(--dark-60)' }}>1d ago</span>
              </div>
              <span
                style={{
                  marginLeft: 'auto',
                  color: 'var(--dark-60)',
                  fontSize: 14,
                }}
              >
                &hellip;
              </span>
            </div>
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1 / 1',
                background: 'var(--dark-4)',
              }}
            >
              <img
                src={POST_IMAGE}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 12,
                  top: 12,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: 1.05,
                  textShadow: '0 2px 6px rgba(0,0,0,0.4)',
                }}
              >
                unlock
                <br />
                your
                <br />
                creative
                <br />
                potential
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                color: 'var(--dark-90)',
              }}
            >
              <Heart size={14} />
              <Comment size={14} />
              <Send1 size={14} />
              <span style={{ marginLeft: 'auto' }}>
                <Save2 size={14} />
              </span>
              <span style={{ display: 'none' }}>
                <Instagram size={14} />
              </span>
            </div>
            <div
              style={{
                padding: '0 10px 10px',
                fontSize: 10,
                color: 'var(--dark-60)',
                lineHeight: 1.4,
              }}
            >
              <strong style={{ color: 'var(--dark-90)' }}>radiant_health</strong>{' '}
              Discover the joyful&hellip;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
