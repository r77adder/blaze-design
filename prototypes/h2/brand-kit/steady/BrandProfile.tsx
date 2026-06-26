import { type ReactNode } from 'react';
import { Heading, Text } from '@/components';
import { useToast } from '@/staging';
import Edit1 from '@/icons/20/Edit1';

/**
 * Brand Profile tab — narrative business knowledge. Each section is a
 * stand-alone editable block with a title, a thin divider, and an "Edit"
 * affordance in the top-right.
 */

export function BrandProfile() {
  return (
    <div>
      <SectionHeading title="Brand Profile" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 24 }}>
        <ProfileSection title="Business Name">
          <Text style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)' }}>
            Blanchard's Coffee Roasting Company
          </Text>
        </ProfileSection>

        <ProfileSection title="Business Overview & Positioning">
          <BodyParagraph>
            <strong>Core Identity:</strong> Blanchard's Coffee Roasting Company is a{' '}
            <strong>craft coffee roasting business based in Richmond, Virginia</strong>, focused on
            delivering high-quality, artisanal coffee blends and single-origin selections. Known for
            their dedication to the craft of coffee roasting and strong community presence, they
            offer a range of products from unique blends to educational coffee experiences.
          </BodyParagraph>
          <Subhead>Market positioning</Subhead>
          <BulletList>
            <li><strong>Primary Positioning:</strong> "Craft Coffee from the Heart of Richmond" - emphasizing local roots and artisanal quality</li>
            <li><strong>Secondary Positioning:</strong> "Explore the World, One Cup at a Time" - highlighting their single-origin and diverse coffee offerings</li>
            <li><strong>Tertiary Positioning:</strong> "Your Coffee Journey Starts Here" - focusing on subscriptions and educational experiences</li>
          </BulletList>
        </ProfileSection>

        <ProfileSection title="Direct Competitors">
          <BulletList>
            <li><strong>Local competitors:</strong> Lamplighter Coffee Roasters, Ironclad Coffee Roasters</li>
            <li><strong>National competitors:</strong> Blue Bottle Coffee, Stumptown Coffee Roasters, Intelligentsia Coffee</li>
          </BulletList>
        </ProfileSection>

        <ProfileSection title="Competitive Advantages">
          <OrderedList>
            <li><strong>Local Artisan Focus:</strong> Strong ties to Richmond, fostering community support and local loyalty.</li>
            <li><strong>Diverse Offerings:</strong> Wide range of blends and single-origin coffees, appealing to both casual drinkers and seasoned aficionados.</li>
            <li><strong>Educational Engagement:</strong> Coffee classes and subscription experiences that build deeper relationships with customers.</li>
          </OrderedList>
        </ProfileSection>
      </div>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--dark-8)' }}>
      <Heading level={2} style={{ margin: 0, fontSize: 22 }}>{title}</Heading>
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  const { showToast } = useToast();
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 8, borderBottom: '1px solid var(--dark-8)' }}>
        <Heading level={3} style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--dark-60)' }}>
          {title}
        </Heading>
        <button
          type="button"
          onClick={() => showToast({ message: `Edit ${title} coming soon` })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--dark-90)',
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'inherit',
            padding: 0,
          }}
        >
          <Edit1 size={14} color="currentColor" />
          Edit
        </button>
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </section>
  );
}

function BodyParagraph({ children }: { children: ReactNode }) {
  return (
    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--dark-90)' }}>
      {children}
    </p>
  );
}

function Subhead({ children }: { children: ReactNode }) {
  return (
    <p style={{ margin: '4px 0 0 0', fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
      {children}
    </p>
  );
}

function BulletList({ children }: { children: ReactNode }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, lineHeight: 1.6, color: 'var(--dark-90)' }}>
      {children}
    </ul>
  );
}

function OrderedList({ children }: { children: ReactNode }) {
  return (
    <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, lineHeight: 1.6, color: 'var(--dark-90)' }}>
      {children}
    </ol>
  );
}
