import { createRoot } from 'react-dom/client';
import type { BusinessProfile, Term } from './onboarding-context';
import {
  TERM_LABEL,
  TERM_MULTIPLIER,
  fmtUsd,
  type PricingLine,
  type PricingTotals,
} from './pricing-data';
import { GAP_AND_FIX } from './gap-and-fix-data';
import type { ToolId } from '../tools-context';

/**
 * Print-only proposal layout — opens in a new window, calls `window.print()`,
 * and closes once printing returns. This is a prototype shortcut: no
 * dependency on jsPDF, no server-side rendering. The user picks "Save as
 * PDF" in the system print dialog.
 *
 * The layout follows agency-proposal best practices:
 *   1. Cover (brand mark + tagline + date)
 *   2. Executive summary
 *   3. Discovery (what we found about you)
 *   4. Strategy (recommended features with gap → fix narrative)
 *   5. Investment (the pricing table from step 6)
 *   6. Timeline (90-day rollout)
 *   7. Next steps + about Blaze
 *
 * Typography uses Söhne (matches our prototype) with serif accents on the
 * cover heading to feel agency-grade rather than SaaS-pricing-page.
 */

export interface ProposalProps {
  profile: BusinessProfile;
  lines: PricingLine[];
  term: Term;
  totals: PricingTotals;
}

export function openProposalPdf(props: ProposalProps) {
  // Open the proposal in a new window so it gets its own print context and
  // we don't fight the host page's scroll containers / fixed elements.
  const win = window.open('', '_blank', 'width=900,height=1200');
  if (!win) {
    // eslint-disable-next-line no-alert
    alert('Please allow pop-ups for this site to download the PDF proposal.');
    return;
  }

  // The brand logo lives at /blaze-logo.avif under the dev server's public dir.
  // We resolve to an absolute URL so the about:blank child window can fetch it
  // regardless of its own document.location.
  const logoUrl = `${window.location.origin}/blaze-logo.avif`;

  win.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Blaze Proposal — ${escapeHtml(props.profile.name)}</title>
  <style>${PROPOSAL_CSS}</style>
</head>
<body>
  <div id="proposal-root"></div>
</body>
</html>`);
  win.document.close();

  const mountTarget = win.document.getElementById('proposal-root');
  if (!mountTarget) return;
  const root = createRoot(mountTarget);
  root.render(<Proposal {...props} logoUrl={logoUrl} />);

  // Wait one paint frame so the layout is in place before triggering print.
  setTimeout(() => {
    win.focus();
    win.print();
  }, 250);
}

/**
 * A pricing line bundles 1+ ToolIds. Pick the first tool with a gap/fix
 * entry so the strategy page shows the most representative narrative for
 * the bundle.
 */
function pickNarrative(tools: ToolId[]): { gap: string; fix: string } | undefined {
  for (const t of tools) {
    const entry = GAP_AND_FIX[t];
    if (entry) return entry;
  }
  return undefined;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

const PROPOSAL_CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #f4f5f7; }
  #proposal-root { font-family: 'Sohne', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif; color: rgba(0,0,0,0.9); }

  .page {
    width: 8.5in;
    min-height: 11in;
    margin: 0 auto 24px;
    padding: 0.75in;
    background: #ffffff;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    page-break-after: always;
    position: relative;
    overflow: hidden;
  }
  .page:last-child { page-break-after: auto; }

  /* Cover */
  .cover {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 9.5in;
  }
  .cover-logo {
    display: block;
    height: 36px;
    width: auto;
    margin-bottom: 40px;
    object-fit: contain;
  }
  .cover-eyebrow {
    text-transform: none;
    letter-spacing: 0.08em;
    font-size: 11px;
    font-weight: 500;
    color: rgba(0,0,0,0.5);
  }
  .cover-title {
    font-family: 'Sohne', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif;
    font-size: 64px;
    line-height: 1.05;
    font-weight: 500;
    letter-spacing: -2px;
    margin: 16px 0 12px;
  }
  .cover-sub {
    font-size: 18px;
    line-height: 1.5;
    color: rgba(0,0,0,0.6);
    max-width: 5in;
  }
  .cover-meta {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding-top: 24px;
    border-top: 1px solid rgba(0,0,0,0.08);
  }
  .cover-meta-label { font-size: 11px; color: rgba(0,0,0,0.5); letter-spacing: 0.05em; }
  .cover-meta-value { font-size: 14px; color: rgba(0,0,0,0.9); margin-top: 4px; font-weight: 500; }

  /* Section pages */
  .section-eyebrow {
    text-transform: none;
    letter-spacing: 0.08em;
    font-size: 11px;
    font-weight: 500;
    color: rgba(0,0,0,0.5);
    margin-bottom: 8px;
  }
  .section-title {
    font-family: 'Sohne', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif;
    font-size: 38px;
    line-height: 1.15;
    font-weight: 500;
    letter-spacing: -0.9px;
    margin: 0 0 24px;
  }
  .section-intro {
    font-size: 15px;
    line-height: 1.6;
    color: rgba(0,0,0,0.7);
    margin-bottom: 32px;
    max-width: 6in;
  }

  h3 {
    font-family: 'Sohne', system-ui, sans-serif;
    font-size: 15px;
    font-weight: 500;
    color: rgba(0,0,0,0.9);
    margin: 0 0 4px;
  }
  p { margin: 0; line-height: 1.55; }

  .panel {
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 12px;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }
  .stat {
    padding: 16px;
    background: #fafbfc;
    border-radius: 8px;
  }
  .stat-label { font-size: 11px; color: rgba(0,0,0,0.5); letter-spacing: 0.05em; }
  .stat-value { font-size: 22px; font-weight: 500; margin-top: 4px; }

  .feature-row {
    padding: 18px 0;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
  .feature-row:last-child { border-bottom: none; }
  .feature-row .label { font-size: 14px; font-weight: 500; }
  .feature-row .sub { font-size: 12px; color: rgba(0,0,0,0.55); line-height: 1.5; margin-top: 6px; max-width: 5.5in; }
  .feature-row .narrative {
    display: grid;
    grid-template-columns: 40px 1fr;
    column-gap: 12px;
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.5;
    max-width: 5.5in;
  }
  .feature-row .narrative .tag { font-weight: 500; }
  .feature-row .narrative .tag.gap { color: #bc010b; }
  .feature-row .narrative .tag.fix { color: #04af00; }
  .feature-row .narrative .body { color: rgba(0,0,0,0.75); }

  .pricing-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .pricing-table th, .pricing-table td { text-align: left; padding: 14px 0; border-bottom: 1px solid rgba(0,0,0,0.06); font-size: 13px; }
  .pricing-table th { font-size: 11px; font-weight: 500; color: rgba(0,0,0,0.5); letter-spacing: 0.05em; padding-bottom: 8px; }
  .pricing-table td.num { text-align: right; font-variant-numeric: tabular-nums; }

  .totals {
    margin-top: 24px;
    padding: 20px;
    background: #fafbfc;
    border-radius: 10px;
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 24px;
    align-items: end;
  }
  .totals .heading { font-size: 16px; font-weight: 500; }
  .totals .label { font-size: 11px; color: rgba(0,0,0,0.5); letter-spacing: 0.05em; }
  .totals .value { font-size: 24px; font-weight: 500; margin-top: 4px; }

  .timeline {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 16px;
    margin-top: 8px;
  }
  .timeline .week {
    font-family: 'Sohne', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif;
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 0.02em;
    color: rgba(0,0,0,0.5);
  }
  .timeline .body { padding-bottom: 16px; border-bottom: 1px solid rgba(0,0,0,0.06); }
  .timeline .body:last-child { border-bottom: none; }
  .timeline .body p { font-size: 13px; color: rgba(0,0,0,0.7); margin-top: 4px; }

  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid rgba(0,0,0,0.08);
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: rgba(0,0,0,0.5);
  }

  @page {
    size: letter;
    margin: 0;
  }
  @media print {
    body { background: #ffffff; }
    .page { box-shadow: none; margin: 0; }
  }
`;

function Proposal({ profile, lines, term, totals, logoUrl }: ProposalProps & { logoUrl?: string }) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const multiplier = TERM_MULTIPLIER[term];

  return (
    <>
      {/* COVER */}
      <div className="page cover">
        <div>
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Blaze"
              className="cover-logo"
            />
          )}
          <div className="cover-eyebrow">Marketing Engagement Proposal</div>
          <h1 className="cover-title">
            A growth engine
            <br />
            for {profile.name}.
          </h1>
          <p className="cover-sub">
            A 90-day plan to close the gaps your scorecard surfaced — built around the channels
            where your customers already spend time, and run by Blaze's AI operations team.
          </p>
        </div>
        <div className="cover-meta">
          <div>
            <div className="cover-meta-label">Prepared for</div>
            <div className="cover-meta-value">{profile.name}</div>
          </div>
          <div>
            <div className="cover-meta-label">Prepared by</div>
            <div className="cover-meta-value">Blaze</div>
          </div>
          <div>
            <div className="cover-meta-label">Date</div>
            <div className="cover-meta-value">{today}</div>
          </div>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY */}
      <div className="page">
        <div className="section-eyebrow">01 — Executive summary</div>
        <h2 className="section-title">
          {profile.name} is leaving growth on the table — and Blaze can change that within 90 days.
        </h2>
        <p className="section-intro">
          Your scorecard surfaced clear gaps across organic reach, paid acquisition, AI visibility,
          and inbound response time. We're proposing a coordinated, AI-native engagement that
          attacks every gap in parallel — and gives you a single operating system to run it all from.
        </p>
        <div className="grid-2">
          <div className="stat">
            <div className="stat-label">Recommended features</div>
            <div className="stat-value">{lines.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Engagement term</div>
            <div className="stat-value">{TERM_LABEL[term]}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Monthly investment</div>
            <div className="stat-value">{fmtUsd(totals.monthly)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Total over term</div>
            <div className="stat-value">{fmtUsd(totals.termTotal)}</div>
          </div>
        </div>
        <div className="panel">
          <h3>The bet</h3>
          <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)', marginTop: 8 }}>
            Marketing teams that adopt AI-orchestrated workflows ship 4–6× more campaigns per
            quarter at a 30–40% lower cost per qualified lead. The 90-day plan in this proposal is
            engineered to land you on that curve, with quarterly review checkpoints to course-correct.
          </p>
        </div>
        <div className="footer">
          <span>Blaze Proposal · {profile.name}</span>
          <span>{today}</span>
        </div>
      </div>

      {/* DISCOVERY */}
      <div className="page">
        <div className="section-eyebrow">02 — Discovery</div>
        <h2 className="section-title">What we learned about your business.</h2>
        <p className="section-intro">
          Pulled from your website and competitor benchmarking. The strategy on the following pages
          is anchored to these findings.
        </p>
        <div className="panel">
          <h3>Business</h3>
          <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)', marginTop: 8 }}>
            {profile.elevatorPitch}
          </p>
        </div>
        <div className="grid-2">
          <div className="panel">
            <h3>Primary audience</h3>
            <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)', marginTop: 6 }}>
              {profile.audienceGender}, ages {profile.audienceAgeMin}–{profile.audienceAgeMax}, in{' '}
              {profile.audienceLocations.join(', ')}
            </p>
          </div>
          <div className="panel">
            <h3>Content language</h3>
            <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)', marginTop: 6 }}>
              {profile.primaryLanguage}
            </p>
          </div>
        </div>
        <div className="panel">
          <h3>Market positioning</h3>
          <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)', marginTop: 8, marginBottom: 6 }}>
            <strong>Primary:</strong> {profile.positioningPrimary}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)', marginBottom: 6 }}>
            <strong>Secondary:</strong> {profile.positioningSecondary}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)' }}>
            <strong>Tertiary:</strong> {profile.positioningTertiary}
          </p>
        </div>
        <div className="footer">
          <span>Blaze Proposal · {profile.name}</span>
          <span>{today}</span>
        </div>
      </div>

      {/* STRATEGY */}
      <div className="page">
        <div className="section-eyebrow">03 — Strategy</div>
        <h2 className="section-title">The {lines.length} features we'll run for you.</h2>
        <p className="section-intro">
          Each feature is paired to a specific gap in your scorecard. They reinforce each other —
          paid amplifies organic, landing pages catch paid, AEO captures intent, the AI Receptionist converts it.
        </p>
        {lines.map((line) => {
          const narrative = pickNarrative(line.tools);
          return (
            <div key={line.key} className="feature-row">
              <div className="label">{line.label}</div>
              <p className="sub">{line.blurb}</p>
              {narrative && (
                <>
                  <div className="narrative">
                    <span className="tag gap">Gap</span>
                    <span className="body">{narrative.gap}</span>
                  </div>
                  <div className="narrative">
                    <span className="tag fix">Fix</span>
                    <span className="body">{narrative.fix}</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
        <div className="footer">
          <span>Blaze Proposal · {profile.name}</span>
          <span>{today}</span>
        </div>
      </div>

      {/* INVESTMENT */}
      <div className="page">
        <div className="section-eyebrow">04 — Investment</div>
        <h2 className="section-title">Investment summary.</h2>
        <p className="section-intro">
          {TERM_LABEL[term]}. Pricing reflects the discount tied to this term. Content packs are
          billed every 4 months ({totals.packsInTerm} pack{totals.packsInTerm === 1 ? '' : 's'} included).
        </p>
        <table className="pricing-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th className="num">Cadence</th>
              <th className="num">Price</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const price = line.isPack
                ? `${fmtUsd(Math.round((line.packPrice ?? 0) * multiplier))} / pack`
                : `${fmtUsd(Math.round(line.monthlyBase * multiplier))} / mo`;
              const cadence = line.isPack ? '1 pack / 4 mo' : 'Monthly';
              return (
                <tr key={line.key}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{line.label}</div>
                    <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>{line.blurb}</div>
                  </td>
                  <td className="num">{cadence}</td>
                  <td className="num">{price}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="totals">
          <div>
            <div className="heading">{TERM_LABEL[term]} total</div>
            <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
              All-in over {term} months including content packs
            </p>
          </div>
          <div>
            <div className="label">Per month</div>
            <div className="value">{fmtUsd(totals.monthly)}</div>
          </div>
          <div>
            <div className="label">Total</div>
            <div className="value">{fmtUsd(totals.termTotal)}</div>
          </div>
        </div>
        <div className="footer">
          <span>Blaze Proposal · {profile.name}</span>
          <span>{today}</span>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="page">
        <div className="section-eyebrow">05 — Timeline</div>
        <h2 className="section-title">Your first 90 days.</h2>
        <p className="section-intro">
          We launch in waves so each feature has time to gather signal before the next one lights up.
          Reviews at week 4 and week 12.
        </p>
        <div className="timeline">
          <div className="week">Week 1</div>
          <div className="body">
            <h3>Onboarding + connections</h3>
            <p>
              Connect platforms, brand voice calibration, audit your existing campaigns and content.
              Brand profile reviewed and locked.
            </p>
          </div>
          <div className="week">Week 2</div>
          <div className="body">
            <h3>Foundation launch</h3>
            <p>
              Landing pages and SEO foundation deployed. AEO citations submitted. First content
              calendar ships for review.
            </p>
          </div>
          <div className="week">Week 3</div>
          <div className="body">
            <h3>Acquisition on</h3>
            <p>
              Paid campaigns launch across Meta, TikTok, and Google Ads. AI Receptionist live for
              inbound. First UGC pack shoots.
            </p>
          </div>
          <div className="week">Week 4</div>
          <div className="body">
            <h3>First review</h3>
            <p>
              We sit down to review CAC, response time, and pipeline lift. Reallocate spend toward
              the winners.
            </p>
          </div>
          <div className="week">Weeks 5–12</div>
          <div className="body">
            <h3>Compound</h3>
            <p>
              Weekly creative rotation, biweekly content batches, monthly SEO/AEO drops, and
              continuous bid optimization. We send a weekly Friday report to your inbox.
            </p>
          </div>
        </div>
        <div className="footer">
          <span>Blaze Proposal · {profile.name}</span>
          <span>{today}</span>
        </div>
      </div>

      {/* NEXT STEPS */}
      <div className="page">
        <div className="section-eyebrow">06 — Next steps</div>
        <h2 className="section-title">Ready when you are.</h2>
        <p className="section-intro">
          Approve the engagement and we move on the kickoff in 24 hours. The fastest you can be live
          across all selected features is 72 hours from countersignature.
        </p>
        <div className="panel">
          <h3>What we need from you</h3>
          <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)', marginTop: 8 }}>
            1. Approval of this proposal
            <br />
            2. Platform credentials (we handle the connections during onboarding)
            <br />
            3. 30 minutes for a brand voice calibration call in week 1
          </p>
        </div>
        <div className="panel">
          <h3>What you can expect from Blaze</h3>
          <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)', marginTop: 8 }}>
            • A dedicated Customer Strategist as your single point of contact
            <br />
            • 24-hour response time on every request
            <br />
            • Weekly Friday performance summary by email
            <br />
            • Quarterly business review with channel-level attribution
          </p>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', marginTop: 36, lineHeight: 1.55 }}>
          This proposal is valid for 14 days from the date above. Pricing assumes the term selected
          on the cover page. Cancellation policy: 30-day notice, no early-termination fees.
        </p>
        <div className="footer">
          <span>Blaze Proposal · {profile.name}</span>
          <span>{today}</span>
        </div>
      </div>
    </>
  );
}
