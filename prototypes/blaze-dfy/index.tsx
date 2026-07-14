import { Routes, Route } from 'react-router-dom';
import { ModalStack } from '@/components';
import { Toaster, ToasterProvider } from '@/staging';
import { Directory, StaffTeam } from './Directory';
import { Create } from './Create';
import { Workspace } from './Workspace';
import { ReviewProvider } from './lib/review';
import { DfyStateProvider } from './lib/dev-state';
// Provider stack required by the faithfully-ported H2 feature pages (Awareness
// / Conversion). The pages were copied into ../h2-port; these supply the
// contexts they read. dev-state is shimmed in h2-port onto our global toggle.
import { ToolsProvider } from '../h2-port/tools-context';
import { OnboardingProvider } from '../h2-port/onboarding/onboarding-context';
import { BrandKitProvider } from '../h2-port/brand-kit/brand-kit-context';
import { SavedCardsProvider } from '../h2-port/competitor-tracking/SavedCardsContext';
import { MetaCampaignProvider } from '../h2-port/meta-campaign/meta-campaign-context';
import { ClientViewProvider } from '../h2-port/client-view-context';

/**
 * Blaze DFY: Done-For-You onboarding (AM workspace + client portal).
 *
 * Routed with the playground's react-router (prototypes mount at
 * `/blaze-dfy/*`). Routes, relative to that base:
 *   /                                -> account directory
 *   /new                             -> create workspace
 *   /:accountId/:side                -> workspace (defaults section)
 *   /:accountId/:side/:section[/:sub]-> workspace section / sub-step
 */
export default function BlazeDfy() {
  return (
    <ReviewProvider>
      <DfyStateProvider>
      <ToolsProvider>
      <OnboardingProvider>
      <BrandKitProvider>
      <ToasterProvider>
      <SavedCardsProvider>
      <MetaCampaignProvider>
      <ClientViewProvider>
        <ModalStack>
          <Routes>
            <Route index element={<Directory />} />
            <Route path="team" element={<StaffTeam />} />
            <Route path="new" element={<Create />} />
            <Route path=":accountId/:side" element={<Workspace />} />
            <Route path=":accountId/:side/:section" element={<Workspace />} />
            <Route path=":accountId/:side/:section/:sub" element={<Workspace />} />
          </Routes>
          <Toaster />
        </ModalStack>
      </ClientViewProvider>
      </MetaCampaignProvider>
      </SavedCardsProvider>
      </ToasterProvider>
      </BrandKitProvider>
      </OnboardingProvider>
      </ToolsProvider>
      </DfyStateProvider>
    </ReviewProvider>
  );
}
