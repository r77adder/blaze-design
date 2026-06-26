import { Heading, Text } from '@/components';
import Globe from '@/icons/20/Globe';
import UploadsCloud from '@/icons/20/UploadsCloud';
import Upload from '@/icons/20/Upload';

const PEOPLE_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80',
  'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=120&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&q=80',
];

/** Step 6 — Source materials. Two-card grid. */
export function Step6SourceMaterials() {
  return (
    <div style={{ width: '100%', maxWidth: 880, margin: '24px auto 0' }}>
      <Heading level={2} style={{ marginBottom: 8, fontSize: 32 }}>
        Give Blaze everything it needs to create amazing content.
      </Heading>
      <Text variant="secondary">
        This is what Blaze draws from when creating content. Upload additional
        materials now, or add them later.
      </Text>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginTop: 28,
        }}
      >
        {/* From your website */}
        <div style={cardStyle}>
          <IconChip color="var(--purple)" background="rgba(124, 92, 252, 0.12)">
            <Globe size={20} />
          </IconChip>
          <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--dark-90)' }}>
            From your website
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--dark-60)',
              lineHeight: 1.55,
              letterSpacing: '0.26px',
            }}
          >
            Images and videos pulled from your website during analysis. Blaze uses
            these as the foundation for your visual content.
          </p>
          <div
            style={{
              height: 1,
              background: 'var(--dark-8)',
              margin: '4px 0',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 14, color: 'var(--dark-90)', fontWeight: 500 }}>
              85 images, 2 videos
            </div>
            <button type="button" style={pillButtonStyle}>
              Adjust
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {PEOPLE_AVATARS.map((src, i) => (
              <div
                key={i}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: 'var(--dark-4)',
                  flexShrink: 0,
                }}
              >
                <img
                  src={src}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Add more source materials */}
        <div style={cardStyle}>
          <IconChip color="var(--purple)" background="rgba(124, 92, 252, 0.12)">
            <UploadsCloud size={20} />
          </IconChip>
          <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--dark-90)' }}>
            Add more source Materials
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--dark-60)',
              lineHeight: 1.55,
              letterSpacing: '0.26px',
            }}
          >
            Brand guidelines, reference docs, and additional context that help
            Blaze understand your voice and generate smarter content.
          </p>
          <div
            style={{
              height: 1,
              background: 'var(--dark-8)',
              margin: '4px 0',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 14, color: 'var(--dark-60)' }}>
              Drop files here or click to upload
            </div>
            <button type="button" style={uploadButtonStyle}>
              <Upload size={14} />
              <span>Upload</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 20,
  borderRadius: 12,
  border: '1px solid var(--dark-8)',
  background: 'var(--light-100)',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

function IconChip({
  children,
  color,
  background,
}: {
  children: React.ReactNode;
  color: string;
  background: string;
}) {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
}

const pillButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid var(--dark-8)',
  background: 'var(--light-100)',
  color: 'var(--dark-90)',
  fontFamily: 'inherit',
  fontSize: 14,
  cursor: 'pointer',
};

const uploadButtonStyle: React.CSSProperties = {
  ...pillButtonStyle,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};
