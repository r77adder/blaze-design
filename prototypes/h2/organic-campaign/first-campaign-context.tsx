import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevState } from '../dev-state-context';
import { useToast } from '@/staging';

/**
 * First-campaign-creation context. Drives the 7-step modal flow that fires
 * the first time a user is on `/h2/organic-social` in its cold state and
 * clicks "Plan first post".
 *
 * Step map (matches the Figma):
 *  1. Campaign details        ── Campaign
 *  2. Channels + schedule     ── Campaign
 *  3. Recommended content mix ── Campaign
 *  4. Generating topics       ── Content (loading, auto-advances)
 *  5. Review topics           ── Content
 *  6. Source materials        ── Finishing up
 *  7. Four campaigns ready    ── Finishing up
 *
 * On `finish()` the dev state for `/h2/organic-social` flips from
 * `cold` → `steady` so the cold view collapses behind the modal and the
 * user lands on the populated steady-state calendar.
 */

export type FirstCampaignStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type FirstCampaignContentType =
  | 'still'
  | 'carousel'
  | 'video'
  | 'short-video'
  | 'stories'
  | 'blog'
  | 'email';

export interface FirstCampaignTopic {
  id: string;
  /** 'ai' generates with a reference image, 'blank' is user-authored. */
  kind: 'ai' | 'blank';
  /** Short headline. Empty for blank posts (the input is shown instead). */
  topic: string;
  /** Selected content type. */
  contentType: FirstCampaignContentType;
  /** Unsplash URL for AI posts; empty for blank posts. */
  referenceImage: string;
}

export interface FirstCampaignChannelSelection {
  /** Group-prefixed id, e.g. "feed:instagram" or "stories:facebook". */
  id: string;
  selected: boolean;
}

export interface FirstCampaignQuantity {
  id: string;
  qty: number;
}

export interface FirstCampaignData {
  name: string;
  theme: string;
  cta: string;
  link: string;
  channels: Record<string, boolean>;
  schedule: 'any' | 'weekdays' | 'select';
  quantities: Record<string, number>;
  topics: FirstCampaignTopic[];
}

interface FirstCampaignContextValue {
  open: boolean;
  step: FirstCampaignStep;
  data: FirstCampaignData;
  setData: (updater: (prev: FirstCampaignData) => FirstCampaignData) => void;
  start: () => void;
  close: () => void;
  next: () => void;
  back: () => void;
  goTo: (step: FirstCampaignStep) => void;
  finish: () => void;
}

const STORAGE_KEY = 'h2-first-campaign-v1';

const DEFAULT_DATA: FirstCampaignData = {
  name: 'Building Trust Through Storytelling',
  theme:
    'Building trust through consistent, authentic storytelling. This week focuses on sharing real client outcomes and behind-the-scenes moments that humanize your brand and build lasting audience relationships.',
  cta: '',
  link: '',
  // All channels default to selected to match the Figma.
  channels: {
    'feed:instagram': true,
    'feed:facebook': true,
    'feed:linkedin': true,
    'feed:x': true,
    'feed:gbp': true,
    'stories:instagram': true,
    'stories:facebook': true,
    'short:reels': true,
    'short:tiktok': true,
    'short:youtube': true,
    'long:blog': true,
    'long:newsletter': true,
  },
  schedule: 'any',
  quantities: {
    'still-images': 3,
    carousels: 1,
    'feed-videos': 1,
    'short-form': 0,
    stories: 1,
    blogs: 1,
    emails: 1,
    'meta-ads': 0,
  },
  topics: [
    {
      id: 'seed-1',
      kind: 'ai',
      topic: 'Brewing temperature matters',
      contentType: 'still',
      referenceImage:
        'https://images.unsplash.com/photo-1562259949-a4c54b78b16d?w=320&q=80',
    },
    {
      id: 'seed-2',
      kind: 'ai',
      topic: 'Why we roast in small batches',
      contentType: 'carousel',
      referenceImage:
        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=320&q=80',
    },
    {
      id: 'seed-3',
      kind: 'ai',
      topic: 'Meet our newest single-origin',
      contentType: 'video',
      referenceImage:
        'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=320&q=80',
    },
    {
      id: 'seed-4',
      kind: 'ai',
      topic: 'From bean to brew in 60 seconds',
      contentType: 'short-video',
      referenceImage:
        'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=320&q=80',
    },
  ],
};

const FirstCampaignContext = createContext<FirstCampaignContextValue | null>(null);

function loadInitial(): { step: FirstCampaignStep; data: FirstCampaignData } {
  if (typeof window === 'undefined') {
    return { step: 1, data: DEFAULT_DATA };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { step: 1, data: DEFAULT_DATA };
    const parsed = JSON.parse(raw);
    return {
      step: (parsed.step ?? 1) as FirstCampaignStep,
      data: { ...DEFAULT_DATA, ...(parsed.data ?? {}) },
    };
  } catch {
    return { step: 1, data: DEFAULT_DATA };
  }
}

export function FirstCampaignProvider({ children }: { children: ReactNode }) {
  const initial = useRef(loadInitial());
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<FirstCampaignStep>(initial.current.step);
  const [data, setDataState] = useState<FirstCampaignData>(initial.current.data);
  const { setState } = useDevState();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ step, data }),
      );
    } catch {
      // No-op: persistence is a nicety, not a requirement.
    }
  }, [step, data]);

  const setData = useCallback(
    (updater: (prev: FirstCampaignData) => FirstCampaignData) => {
      setDataState((prev) => updater(prev));
    },
    [],
  );

  const start = useCallback(() => {
    setStep(1);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const next = useCallback(() => {
    setStep((s) => (s < 7 ? ((s + 1) as FirstCampaignStep) : s));
  }, []);

  const back = useCallback(() => {
    setStep((s) => (s > 1 ? ((s - 1) as FirstCampaignStep) : s));
  }, []);

  const goTo = useCallback((value: FirstCampaignStep) => {
    setStep(value);
  }, []);

  const finish = useCallback(() => {
    setState('/h2/organic-social', 'steady');
    setOpen(false);
    showToast({ message: 'Your first campaigns are publishing now' });
    // Default the user to the Campaigns page rather than the Organic
    // Social calendar — campaigns are the artifact they just created.
    navigate('/h2/campaigns');
  }, [setState, showToast, navigate]);

  const value = useMemo<FirstCampaignContextValue>(
    () => ({ open, step, data, setData, start, close, next, back, goTo, finish }),
    [open, step, data, setData, start, close, next, back, goTo, finish],
  );

  return (
    <FirstCampaignContext.Provider value={value}>
      {children}
    </FirstCampaignContext.Provider>
  );
}

export function useFirstCampaign(): FirstCampaignContextValue {
  const ctx = useContext(FirstCampaignContext);
  if (!ctx) {
    throw new Error('useFirstCampaign must be used inside <FirstCampaignProvider>');
  }
  return ctx;
}
