import { ASSETS } from './assets';
import { CampaignListItem, GlassIconButton, ToolbarHeader } from '@ios/components';
import type { CampaignStatusVariant } from '@ios/components';
import settingsIcon from '@ios/icons/settings.svg';
import historyIcon from '@ios/icons/history.svg';

const font = 'var(--ios-font)';

const CAMPAIGNS: Array<{
  id: number;
  img: string;
  dateStart: string;
  dateEnd: string;
  title: string;
  category: string;
  status: CampaignStatusVariant;
  statusLabel?: string;
}> = [
  {
    id: 1,
    img: ASSETS.campThumb1,
    dateStart: 'Fri, Feb 8', dateEnd: 'Mon, Feb 12',
    title: 'Savor The Origins: Craft Coffee Revealed',
    category: '🎿 Lifestyle Content',
    status: 'posting',
  },
  {
    id: 2,
    img: ASSETS.campThumb2,
    dateStart: 'Fri, Feb 8', dateEnd: 'Mon, Feb 12',
    title: 'Savor The Origins: Craft Coffee Revealed',
    category: '🎿 Lifestyle Content',
    status: 'approved',
  },
  {
    id: 3,
    img: ASSETS.campThumb3,
    dateStart: 'Fri, Feb 8', dateEnd: 'Mon, Feb 12',
    title: 'Savor The Origins: Craft Coffee Revealed',
    category: '🎿 Lifestyle Content',
    status: 'review',
    statusLabel: '12 posts to review',
  },
  {
    id: 4,
    img: ASSETS.campThumb4,
    dateStart: 'Fri, Feb 8', dateEnd: 'Mon, Feb 12',
    title: 'Savor The Origins: Craft Coffee Revealed',
    category: '🎿 Lifestyle Content',
    status: 'scheduled',
    statusLabel: 'Generates in 3 days',
  },
  {
    id: 5,
    img: ASSETS.campThumb5,
    dateStart: 'Fri, Feb 8', dateEnd: 'Mon, Feb 12',
    title: 'Savor The Origins: Craft Coffee Revealed',
    category: '🎿 Lifestyle Content',
    status: 'posting',
  },
  {
    id: 6,
    img: ASSETS.campThumb6,
    dateStart: 'Fri, Feb 8', dateEnd: 'Mon, Feb 12',
    title: 'Product updates Q1',
    category: '🏠 Product Showcase',
    status: 'ready',
  },
];

interface Props {
  onSettingsClick?: () => void;
  showSkeleton?: boolean;
  onCampaignClick?: () => void;
}

export function CampaignsScreen({ onSettingsClick, showSkeleton, onCampaignClick }: Props) {
  return (
    <div style={{ fontFamily: font, background: 'white', minHeight: '100%', paddingBottom: 120 }}>

      {/* Header */}
      <ToolbarHeader
        variant="screen"
        title="Campaigns"
        rightButtons={<>
          <GlassIconButton icon={settingsIcon} label="Settings" onClick={onSettingsClick} />
          <GlassIconButton icon={historyIcon} label="History" />
        </>}
      />

      {/* Campaign list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 20 }}>
        {/* Skeleton placeholder — shown immediately after adding a strategy */}
        {showSkeleton && <SkeletonCampaignRow />}
        {CAMPAIGNS.map((c) => (
          <div key={c.id} onClick={onCampaignClick} style={{ cursor: onCampaignClick ? 'pointer' : 'default' }}>
          <CampaignListItem
            thumbnailSrc={c.img}
            dateStart={c.dateStart}
            dateEnd={c.dateEnd}
            title={c.title}
            category={c.category}
            status={c.status}
            statusLabel={c.statusLabel}
          />
          </div>
        ))}
      </div>


    </div>
  );
}

function SkeletonCampaignRow() {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      {/* thumbnail placeholder */}
      <div style={{ width: 104, height: 125, borderRadius: 16, background: 'var(--ios-dark-4)', flexShrink: 0 }} />
      {/* text lines */}
      <div style={{ flex: 1, paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 12, width: '45%', borderRadius: 6, background: 'var(--ios-dark-4)' }} />
        <div style={{ height: 14, width: '90%', borderRadius: 6, background: 'var(--ios-dark-4)' }} />
        <div style={{ height: 14, width: '70%', borderRadius: 6, background: 'var(--ios-dark-4)' }} />
        <div style={{ height: 12, width: '35%', borderRadius: 6, background: 'var(--ios-dark-4)' }} />
        <div style={{ height: 22, width: '55%', borderRadius: 6, background: 'var(--ios-dark-4)' }} />
      </div>
    </div>
  );
}
