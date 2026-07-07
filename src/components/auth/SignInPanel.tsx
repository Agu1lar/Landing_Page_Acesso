'use client';

import { usePathname } from 'next/navigation';
import { ClerkFailed, ClerkLoaded, ClerkLoading, SignIn } from '@clerk/nextjs';

type SignInPanelProps = {
  dashboardRedirectUrl: string;
  signInPath: string;
};

function SignInForm(props: SignInPanelProps) {
  return (
    <SignIn
      fallbackRedirectUrl={props.dashboardRedirectUrl}
      path={props.signInPath}
      routing="path"
      signUpUrl={props.signInPath}
    />
  );
}

/**
 * Clerk sign-in with loading/error states. OAuth callback routes skip the loaded gate
 * so Google sign-in does not spin forever on /sign-in/sso-callback.
 */
export function SignInPanel(props: SignInPanelProps) {
  const pathname = usePathname() ?? '';
  const isOAuthCallback = pathname.includes('sso-callback');

  if (isOAuthCallback) {
    return (
      <div className="w-full max-w-md space-y-4 px-4 text-center">
        <p className="text-sm text-neutral-600">Conectando com Google...</p>
        <SignInForm {...props} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-4">
      <ClerkLoading>
        <p className="text-center text-sm text-neutral-600">Carregando login...</p>
      </ClerkLoading>
      <ClerkFailed>
        <p className="text-center text-sm text-red-700">
          Não foi possível carregar o login. Confira as chaves Clerk na Vercel e o domínio em
          Developers → Domains.
        </p>
      </ClerkFailed>
      <ClerkLoaded>
        <SignInForm {...props} />
      </ClerkLoaded>
    </div>
  );
}
