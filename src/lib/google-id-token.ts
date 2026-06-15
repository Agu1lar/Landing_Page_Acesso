export type GoogleIdTokenPayload = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
};

type GoogleTokenInfoResponse = {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  error?: string;
  error_description?: string;
};

function parseEmailVerified(value: string | boolean | undefined) {
  if (value === true || value === 'true') {
    return true;
  }
  return false;
}

/**
 * Verifies a Google ID token (One Tap / Sign-In) against the configured client ID.
 */
export async function verifyGoogleIdToken(
  credential: string,
  clientId: string,
): Promise<GoogleIdTokenPayload | null> {
  const url = new URL('https://oauth2.googleapis.com/tokeninfo');
  url.searchParams.set('id_token', credential);

  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as GoogleTokenInfoResponse;
  if (data.error || !data.sub || !data.email) {
    return null;
  }

  if (data.aud !== clientId) {
    return null;
  }

  if (!parseEmailVerified(data.email_verified)) {
    return null;
  }

  return {
    sub: data.sub,
    email: data.email.toLowerCase(),
    emailVerified: true,
    name: data.name,
    givenName: data.given_name,
    familyName: data.family_name,
    picture: data.picture,
  };
}
