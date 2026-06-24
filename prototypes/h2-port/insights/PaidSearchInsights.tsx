import {
  ActionGroup,
  Callout,
  DataTable,
  Delta,
  GoodValue,
  InsightsReport,
  NumberedList,
  Panel,
  Prose,
  Section,
} from './shared';

/**
 * Paid Search → Insights. Weekly performance report adapted from the
 * marketing-ops doc to the CertaPro Austin persona: structure, metrics, and
 * verdicts are kept verbatim; brand / search-term names are mapped to the
 * painting business so the tab stays coherent with the rest of the account.
 */
export function PaidSearchInsightsView() {
  return (
    <InsightsReport
      eyebrow="Paid Search · CertaPro Austin"
      weeks={[
        { value: 'w0', label: 'Jun 1–7, 2026', subtitle: 'vs. May 25–31, 2026' },
        { value: 'w1', label: 'May 25–31, 2026', subtitle: 'vs. May 18–24, 2026' },
        { value: 'w2', label: 'May 18–24, 2026', subtitle: 'vs. May 11–17, 2026' },
        { value: 'w3', label: 'May 11–17, 2026', subtitle: 'vs. May 4–10, 2026' },
      ]}
    >
      {/* section: summary */}
      <Section title="Summary">
        <Callout headline="Efficiency jumped — ROAS up to 5.14x and cost per conversion down 61%, even with spend cut in half.">
          <Prose lead>
            Last week the account spent $517 across brand and non-brand search and pulled in 4 conversions
            worth $2,030. This week spend fell to $254 and the account still booked 5 conversions worth
            $1,303. The account updates, particularly on the brand side, are taking hold. The new ad copy on
            the non-brand side will unlock the other side of this account.
          </Prose>
        </Callout>
      </Section>

      {/* section: top-line results */}
      <Section title="Top-line results & pacing">
        <DataTable
          columns={[
            { label: 'Metric' },
            { label: 'This week (Jun 1–7)' },
            { label: 'Last week (May 25–31)' },
            { label: 'Change' },
          ]}
          rows={[
            ['Spend', '$253.76', '$517.35', <Delta value="−51%" />],
            ['Conversions', <GoodValue>5.00</GoodValue>, '4.00', <Delta value="+25%" tone="good" />],
            ['Conv. value', '$1,303.10', '$2,030.00', <Delta value="−36%" />],
            ['ROAS (value/cost)', '5.14x', '3.92x', <Delta value="+31%" tone="good" />],
            ['CPC', <GoodValue>$1.13</GoodValue>, '$1.95', <Delta value="−42%" tone="good" />],
            ['Conv. rate', <GoodValue>2.23%</GoodValue>, '1.51%', <Delta value="+48%" tone="good" />],
            ['Cost / conv.', <GoodValue>$50.75</GoodValue>, '$129.34', <Delta value="−61%" tone="good" />],
          ]}
        />
      </Section>

      {/* section: search terms & wasted spend — both descriptions consolidated up top */}
      <Section
        title="Search terms & wasted spend"
        intro="This is normally where Google waste hides. The good news: there is very little classic waste this week. Spend is tightly concentrated on relevant queries. All 5 conversions this week came from people searching the brand by name — that tells you the brand ads are converting warm demand efficiently."
      >
        <DataTable
          columns={[
            { label: 'Search term' },
            { label: 'Clicks' },
            { label: 'Cost' },
            { label: 'Conv.' },
          ]}
          rows={[
            ['certapro austin (exact)', '74', '$122.38', '3.00'],
            ['certapro painters (exact)', '58', '$30.67', '0'],
            ['certapro painting austin (exact)', '8', '$25.46', '0'],
            ['certapro (exact)', '32', '$15.42', '2.00'],
          ]}
        />
      </Section>

      {/* section: action plan */}
      <Section title="Action plan & next steps">
        <Panel>
          <ActionGroup label="Next steps">
            <NumberedList
              items={[
                'Align on the non-brand ad copy and launch new non-brand ads.',
                'Align on CPL goals: under $75 for non-brand; under $50 for brand (approved by client on 6/10).',
              ]}
            />
          </ActionGroup>
        </Panel>
      </Section>
    </InsightsReport>
  );
}
