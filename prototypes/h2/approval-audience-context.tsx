import { createContext, useContext, useState, type ReactNode } from 'react';

export type ApprovalAudience = 'dfy' | 'diy';

interface ApprovalAudienceContextValue {
  audience: ApprovalAudience;
  setAudience: (a: ApprovalAudience) => void;
}

const ApprovalAudienceContext = createContext<ApprovalAudienceContextValue>({
  audience: 'dfy',
  setAudience: () => {},
});

/**
 * Whether the Approvals surface behaves as DFY (agency manages content via an
 * internal-review → client-handoff pipeline) or DIY (self-serve customer
 * reviews their own generated content: generated → Approve → autopublish).
 *
 * Lives at the H2 root — like the onboarding track and View-as-client state —
 * so the DevStatePanel toggle and the Approvals page share one value.
 */
export function ApprovalAudienceProvider({ children }: { children: ReactNode }) {
  const [audience, setAudience] = useState<ApprovalAudience>('dfy');
  return (
    <ApprovalAudienceContext.Provider value={{ audience, setAudience }}>
      {children}
    </ApprovalAudienceContext.Provider>
  );
}

export function useApprovalAudience() {
  return useContext(ApprovalAudienceContext);
}
