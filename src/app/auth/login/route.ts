import { NextRequest, NextResponse } from 'next/server';
import { generateCodeVerifier, generateCodeChallenge, buildAuthorizeUrl } from '@/lib/auth';
import { generateStateId, saveOAuthState } from '@/lib/oauth-state-store';
import { resolveOrigin } from '@/lib/resolve-origin';

function safeNextPath(next: string | null): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return null;
  return next;
}

export async function GET(request: NextRequest) {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const next = safeNextPath(request.nextUrl.searchParams.get('next'));
  // Direkam SEKARANG (subdomain Platform asal user klik login) — redirect_uri
  // OAuth ke bagdja-auth cuma boleh satu host tetap, jadi callback tidak
  // pernah tahu subdomain asal dari request-nya sendiri. Lihat
  // oauth-state-store.ts (field `origin`) & callback/route.ts.
  const origin = resolveOrigin(request);

  // code_verifier + next path disimpan di Upstash Redis (bukan cookie) —
  // supaya tidak bergantung pada cookie yang di-set sebelum redirect
  // bertahan lintas navigasi ke IdP dan balik lagi. `state` yang dikirim ke
  // IdP cuma ID pendek acak (lihat oauth-state-store.ts).
  const stateId = generateStateId();
  const saved = await saveOAuthState(stateId, { codeVerifier, next, origin });
  if (!saved) {
    console.error('Upstash Redis belum dikonfigurasi (KV_REST_API_URL/TOKEN atau UPSTASH_REDIS_REST_URL/TOKEN)');
    return NextResponse.redirect(new URL('/?error=server_misconfigured', resolveOrigin(request)));
  }

  // TIDAK pakai forceLogin — dicoba sebelumnya (prompt=login) tapi ternyata
  // (a) auction-web/website-admin/pos-admin juga tidak pakainya (silent-SSO
  // memang pola standar ekosistem, lihat "Masuk"/"Mulai Sekarang" di
  // bagdja-pos-admin — keduanya cuma link polos ke /auth/login, sama
  // persis), dan (b) parameter `prompt` toh di-drop oleh bagdja-auth
  // (core/bagdja-auth/src/auth/oauth.controller.ts method authorize() —
  // tidak diteruskan ke bagdja-login) jadi tidak pernah benar-benar
  // berfungsi. Silent-SSO across produk Bagdja adalah perilaku yang
  // diharapkan, bukan bug.
  const authorizeUrl = buildAuthorizeUrl(stateId, codeChallenge);
  return NextResponse.redirect(authorizeUrl);
}
