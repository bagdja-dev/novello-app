import { NextRequest, NextResponse } from 'next/server';

import { consumeSessionHandoff } from '@/lib/oauth-state-store';
import { resolveOrigin } from '@/lib/resolve-origin';
import { setSession } from '@/lib/session';

/**
 * Konsumen session-handoff (11 Sep 2026, lihat callback/route.ts &
 * oauth-state-store.ts `SessionHandoffPayload`) — route ini SENGAJA FISIK
 * dijalankan di origin tujuan (subdomain Platform tempat user login),
 * BUKAN di host tetap `redirect_uri` OAuth. Cookie di-set di sini, bukan di
 * callback, justru karena request INI yang benar-benar berada di host yang
 * tepat — host-only cookie sudah cukup, tidak perlu `Domain` wildcard sama
 * sekali.
 */
export async function GET(request: NextRequest) {
  const origin = resolveOrigin(request);
  const handoffId = request.nextUrl.searchParams.get('handoff');

  if (!handoffId) {
    return NextResponse.redirect(new URL('/?error=missing_params', origin));
  }

  const decoded = await consumeSessionHandoff(handoffId);
  if (!decoded) {
    return NextResponse.redirect(new URL('/?error=state_mismatch', origin));
  }

  await setSession(decoded.accessToken, decoded.user);

  return NextResponse.redirect(new URL(decoded.redirectTo, origin));
}
