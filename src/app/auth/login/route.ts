import { NextRequest, NextResponse } from 'next/server';
import { generateCodeVerifier, generateCodeChallenge, buildAuthorizeUrl } from '@/lib/auth';
import { generateStateId, saveOAuthState } from '@/lib/oauth-state-store';

function safeNextPath(next: string | null): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return null;
  return next;
}

export async function GET(request: NextRequest) {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const next = safeNextPath(request.nextUrl.searchParams.get('next'));

  // code_verifier + next path disimpan di Upstash Redis (bukan cookie) —
  // supaya tidak bergantung pada cookie yang di-set sebelum redirect
  // bertahan lintas navigasi ke IdP dan balik lagi. `state` yang dikirim ke
  // IdP cuma ID pendek acak (lihat oauth-state-store.ts).
  const stateId = generateStateId();
  const saved = await saveOAuthState(stateId, { codeVerifier, next });
  if (!saved) {
    console.error('Upstash Redis belum dikonfigurasi (KV_REST_API_URL/TOKEN atau UPSTASH_REDIS_REST_URL/TOKEN)');
    return NextResponse.redirect(new URL('/?error=server_misconfigured', request.url));
  }

  // forceLogin: true — selalu tampilkan form login bagdja-login, JANGAN
  // silent-approve pakai sesi SSO (`bagdja_auth_token`) yang mungkin masih
  // ada dari login sebelumnya (produk Bagdja lain, atau sesi lama di
  // browser yang sama). `prompt=login` dihonor bagdja-login dengan clear
  // cookie SSO + paksa balik ke form (lihat
  // core/bagdja-login/src/app/oauth/authorize/route.ts) — mekanisme resmi
  // yang sama dipakai untuk "mobile logout flow", bukan workaround.
  const authorizeUrl = buildAuthorizeUrl(stateId, codeChallenge, true);
  return NextResponse.redirect(authorizeUrl);
}
