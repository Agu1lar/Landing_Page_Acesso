'use client';

import { SignIn } from '@clerk/nextjs';

type SignInPanelProps = {
  dashboardRedirectUrl: string;
  signInPath: string;
};

/**
 * Embedded Clerk sign-in (path routing). Avoid ClerkLoaded gates — they can spin forever
 * if clerk.acessoequipamentos.com.br is blocked or slow on the client network.
 */
export function SignInPanel(props: SignInPanelProps) {
  return (
    <div className="w-full max-w-md px-4">
      <SignIn
        fallbackRedirectUrl={props.dashboardRedirectUrl}
        path={props.signInPath}
        routing="path"
        signUpUrl={props.signInPath}
      />
    </div>
  );
}
