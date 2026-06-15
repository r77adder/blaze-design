import { Routes, Route } from 'react-router-dom';
import { ModalStack } from '@/components';
import { Toaster, ToasterProvider } from '@/staging';
import { Directory, StaffTeam } from './Directory';
import { Create } from './Create';
import { Workspace } from './Workspace';
import { ReviewProvider } from './lib/review';

/**
 * Blaze DFY — Done-For-You onboarding (AM workspace + client portal).
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
      <ToasterProvider>
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
      </ToasterProvider>
    </ReviewProvider>
  );
}
