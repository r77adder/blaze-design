import { type ReactNode } from 'react';
import { Heading } from '@/components';
import {
  ActionGroup,
  Bullets,
  Callout,
  DataTable,
  InsightsReport,
  NumberedList,
  Panel,
  Prose,
  Section,
} from './shared';

// Painting/home creative thumbnails (recovered from the prior CertaPro
// creative set so they resolve reliably).
const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=160&q=80&fit=crop`;
const ADS = {
  vid: U('1565538810643-b5bdb714032a'),
  img1: U('1503387762-592deb58ef4e'),
  img3: U('1556909114-f6e7ad7d3136'),
  img2: U('1572025442646-866d16c84a54'),
  img5: U('1588854337115-1c67d9247e4d'),
  img4: U('1600585154340-be6161a56a0c'),
};

/** Rounded creative thumbnail. `video` adds a small play badge. */
function AdThumb({ src, video = false, w = 44, h = 32 }: { src: string; video?: boolean; w?: number; h?: number }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'relative',
        flexShrink: 0,
        display: 'inline-block',
        width: w,
        height: h,
        borderRadius: 6,
        border: '1px solid var(--dark-8)',
        background: `var(--dark-4) center / cover no-repeat url(${src})`,
      }}
    >
      {video && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                width: 0,
                height: 0,
                borderTop: '3px solid transparent',
                borderBottom: '3px solid transparent',
                borderLeft: '5px solid var(--light-100)',
                marginLeft: 1,
              }}
            />
          </span>
        </span>
      )}
    </span>
  );
}

/** Ad name cell with leading thumbnail. */
function AdCell({ name, src, video = false }: { name: string; src: string; video?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <AdThumb src={src} video={video} />
      <span>{name}</span>
    </span>
  );
}

/** Verdict row: a larger thumbnail beside the verdict copy. */
function VerdictRow({ src, video = false, children }: { src: string; video?: boolean; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <AdThumb src={src} video={video} w={64} h={48} />
      <Prose style={{ flex: 1 }}>{children}</Prose>
    </div>
  );
}

/**
 * Paid Social → Insights. Weekly performance report for the live Meta
 * Traffic campaign, rendered verbatim from the marketing-ops doc.
 */
export function PaidSocialInsightsView() {
  return (
    <InsightsReport
      eyebrow="Paid Social · CertaPro Austin"
      weeks={[
        { value: 'w0', label: 'Jun 1–7, 2026', subtitle: 'Campaign live Jun 2–5' },
        { value: 'w1', label: 'May 25–31, 2026' },
        { value: 'w2', label: 'May 18–24, 2026' },
        { value: 'w3', label: 'May 11–17, 2026' },
      ]}
    >
      {/* section: account health */}
      <Section title="Account health">
        <Callout headline="Strong first week — cheap traffic flowing at $0.25/landing page view and a 30.7% video hook rate.">
          <Prose lead>
            <strong style={{ fontWeight: 500, color: 'var(--dark-90)' }}>The story this week:</strong>{' '}
            This was the campaign&apos;s first live week (launched 6/2). In three days it spent $91 and
            drove 366 landing page views at $0.25 each, with the video ad doing virtually all the work
            (91% of spend, 90% of the views).
          </Prose>
        </Callout>
      </Section>

      {/* section: top-line results */}
      <Section title="Top-line results & pacing">
        <DataTable
          columns={[
            { label: 'Metric' },
            { label: 'This week (6/2–6/7)' },
            { label: 'vs. last week' },
            { label: 'vs. target' },
          ]}
          rows={[
            ['Spend', '$91.07', '— (first live week)', '$28/day'],
            ['Landing page views', '366', '—', 'No target on file'],
            ['Cost per LPV', '$0.25', '—', 'No target on file'],
            ['CPM', '$8.49', '—', '—'],
            ['Link CTR', '4.59%', '—', '—'],
            ['CPC (link)', '$0.185', '—', '—'],
          ]}
        />
      </Section>

      {/* section: funnel & attribution */}
      <Section title="Funnel & attribution">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Prose>
            CTR → LPV is genuinely healthy: 74% of link clicks turn into landing page views (492 clicks →
            366 LPVs). That&apos;s a high click-to-view rate, meaning the landing page loads and holds
            people rather than bouncing on arrival. The pre-click engine (creative + audience) is working.
          </Prose>
          <Prose>
            <strong style={{ fontWeight: 500, color: 'var(--dark-90)' }}>Where visibility ends</strong> —
            and this is the important caveat: your objective is Traffic, and the result event in the data
            is landing_page_view. That&apos;s exactly what the platform is optimizing for, so the data is
            internally consistent. But it means we can see people arrive and nothing after.
          </Prose>
        </div>
      </Section>

      {/* section: creative performance & verdicts */}
      <Section title="Creative — performance & verdicts">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <DataTable
            columns={[
              { label: 'Ad' },
              { label: 'Spend' },
              { label: 'Impr.' },
              { label: 'Link CTR' },
              { label: 'Cost/LPV' },
              { label: 'LPVs' },
              { label: 'Frequency' },
              { label: 'Hook rate' },
            ]}
            rows={[
              [<AdCell name="TOF – VID_0001" src={ADS.vid} video />, '$83.01', '9,280', '4.88%', '$0.25', '330', '1.23', '30.7%'],
              [<AdCell name="TOF – IMG_0001" src={ADS.img1} />, '$3.58', '632', '3.16%', '$0.19', '19', '1.07', '—'],
              [<AdCell name="TOF – IMG_0003" src={ADS.img3} />, '$1.25', '204', '3.43%', '$0.18', '7', '1.03', '—'],
              [<AdCell name="TOF – IMG_0002" src={ADS.img2} />, '$2.11', '404', '1.98%', '$0.35', '6', '1.09', '—'],
              [<AdCell name="TOF – IMG_0005" src={ADS.img5} />, '$0.75', '160', '1.88%', '$0.25', '3', '1.01', '—'],
              [<AdCell name="TOF – IMG_0004" src={ADS.img4} />, '$0.37', '49', '2.04%', '$0.37', '1', '1.04', '—'],
            ]}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Heading level={5} style={{ margin: 0 }}>
              Verdicts
            </Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <VerdictRow src={ADS.vid} video>
                <strong style={{ fontWeight: 500, color: 'var(--dark-90)' }}>
                  VID_0001 is the workhorse and it&apos;s good.
                </strong>{' '}
                4.88% link CTR and a 30.7% thumb-stop rate (2,853 three-second plays on 9,280 impressions)
                is a strong hook — nearly a third of people stop scrolling. The algorithm has correctly
                concentrated spend here. No fatigue risk: frequency is 1.23, so almost everyone&apos;s
                seeing it once. Keep running.
              </VerdictRow>
              <VerdictRow src={ADS.img1}>
                <strong style={{ fontWeight: 500, color: 'var(--dark-90)' }}>
                  The 5 image ads can&apos;t be judged yet
                </strong>{' '}
                — insufficient volume. None has cleared ~1,000 impressions (the highest is IMG_0001 at
                632). The CTRs and costs you see on them are noise, not signal. Don&apos;t kill or scale any
                image based on this week. The reason they&apos;re starved is that the campaign budget is
                (correctly) feeding the video.
              </VerdictRow>
            </div>
          </div>
        </div>
      </Section>

      {/* section: change log */}
      <Section title="Change log & external context">
        <Bullets
          items={[
            '6/2: Campaign launched (video + 5 images, TOF prospecting).',
            'No other operational changes — this is week one.',
            'External: nothing notable; no prior baseline to compare seasonality against yet.',
          ]}
        />
      </Section>

      {/* section: action plan */}
      <Section title="Action plan & next steps">
        <Panel>
          <ActionGroup label="This week">
            <NumberedList items={['Fix payment issue to resume delivery.']} />
          </ActionGroup>
          <ActionGroup label="Watch">
            <NumberedList
              items={[
                'The five image ads — not yet judgeable. Don’t act on their thin numbers.',
                'Frequency (currently 1.2, no fatigue) as spend accumulates.',
              ]}
            />
          </ActionGroup>
          <ActionGroup label="Test">
            <NumberedList
              items={[
                'Consider whether the objective should shift from Traffic toward a conversion/lead event if the goal is jobs, not visits.',
              ]}
            />
          </ActionGroup>
        </Panel>
      </Section>

      {/* section: strategic thread */}
      <Section title="Strategic thread">
        <Callout headline="The creative engine works — cheap clicks, strong hook, a clear winning video.">
          <Prose lead>
            The open question is whether all this cheap traffic converts to actual painting leads. Over the
            next 2–3 weeks the priority is connecting the campaign to a downstream signal (lead form, calls)
            so we&apos;re optimizing toward revenue, not just visits — and confirming the geo is landing in
            the service area.
          </Prose>
        </Callout>
      </Section>
    </InsightsReport>
  );
}
