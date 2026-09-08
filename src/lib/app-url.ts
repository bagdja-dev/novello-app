/**
 * App base URL (without /auth/callback).
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }

  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI ?? 'http://localhost:5021/auth/callback';
  return redirectUri.replace(/\/auth\/callback\/?$/, '') || 'http://localhost:5021';
}

/**
 * Bagdja Login (SSO UI) base URL.
 */
export function getLoginUrl(): string {
  return (process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://login.bagdja.com').replace(/\/$/, '');
}

/**
 * Build SSO logout URL — clears bagdja_auth_token cookie (Domain=.bagdja.com,
 * jadi berlaku lintas SEMUA produk Bagdja) lalu redirect balik ke app.
 *
 * KOREKSI PENTING (revisi kedua): path-nya `/logout` di domain
 * `login.bagdja.com` (bagdja-login, `app/logout/route.ts`) — BUKAN
 * `/oauth/logout` di `auth.bagdja.com` (bagdja-auth). Sempat "diperbaiki"
 * ke `/oauth/logout` sebelumnya karena itu memang endpoint yang ADA (tidak
 * 404) di `auth.bagdja.com` — tapi ternyata endpoint itu cuma redirect
 * kosong, TIDAK PERNAH benar-benar clear cookie SSO (lihat komentar di
 * source-nya: "Session/token clearing is typically handled by the
 * client"). Akibatnya tiap "logout" lalu "Masuk" lagi selalu silent
 * re-approve tanpa lewat form — sesi SSO-nya memang tidak pernah benar2
 * berakhir. Diverifikasi manual: curl ke `login.bagdja.com/logout` balas
 * `Set-Cookie: bagdja_auth_token=; ...; Domain=.bagdja.com` (expired) —
 * `auth.bagdja.com/oauth/logout` tidak pernah kirim header ini.
 *
 * `getLoginUrl()` HARUS resolve ke `login.bagdja.com` (`NEXT_PUBLIC_AUTH_URL`
 * di `.env`), bukan `auth.bagdja.com` — samakan pola `bagdja-auction-web`.
 */
export function buildSsoLogoutUrl(returnTo?: string): string {
  const url = new URL('/logout', getLoginUrl());
  url.searchParams.set('redirect_uri', returnTo ?? getAppUrl());
  return url.toString();
}
