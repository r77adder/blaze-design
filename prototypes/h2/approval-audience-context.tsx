import { createContext, useContext, useState, type ReactNode } from 'react';

export type ApprovalAudience = 'dfy' | 'diy';

interface ApprovalAudienceContextValue {
  audience: ApprovalAudience;
  setAudience: (a: ApprovalAudience) => void;
}

const ApprovalAudienceContext = createContext<ApprovalAudienceContextValue>({
  audience: 'diy',
  setAudience: () => {},
});

/**
 * The AI Receptionist cold state is the only surface that still toggles between
 * the DFY view ("let our team set it up for you") and the DIY self-serve setup
 * wizard. The two cold views switch via their own inline links; default is DIY.
 */
export function ApprovalAudienceProvider({ children }: { children: ReactNode }) {
  const [audience, setAudience] = useState<ApprovalAudience>('diy');
  return (
    <ApprovalAudienceContext.Provider value={{ audience, setAudience }}>
      {children}
    </ApprovalAudienceContext.Provider>
  );
}

export function useApprovalAudience() {
  return useContext(ApprovalAudienceContext);
}
