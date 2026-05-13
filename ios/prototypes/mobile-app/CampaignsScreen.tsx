import { ASSETS } from './assets';
import { CampaignListItem, GlassIconButton, ToolbarHeader } from '@ios/staging';
import type { CampaignStatusVariant } from '@ios/staging';
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
}

export function CampaignsScreen({ onSettingsClick }: Props) {
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
        {CAMPAIGNS.map((c) => (
          <CampaignListItem
            key={c.id}
            thumbnailSrc={c.img}
            dateStart={c.dateStart}
            dateEnd={c.dateEnd}
            title={c.title}
            category={c.category}
            status={c.status}
            statusLabel={c.statusLabel}
          />
        ))}
      </div>


    </div>
  );
}
