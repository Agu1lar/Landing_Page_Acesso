'use client';

import { ClerkFailed, ClerkLoaded, ClerkLoading, SignIn } from '@clerk/nextjs';

type SignInPanelProps = {
  signInPath: string;
};

/**
 * Clerk sign-in with loading/error states so OAuth setup issues do not show a blank page.
 */
export function SignInPanel(props: SignInPanelProps) {
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
        <SignIn path={props.signInPath} routing="path" signUpUrl={props.signInPath} />
      </ClerkLoaded>
    </div>
  );
}
