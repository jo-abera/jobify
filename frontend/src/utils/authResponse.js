/**
 * Normalizes auth API responses to { user, token }.
 * Backend returns { status, token, data: { user } } for sign-in flows.
 */

export function parseAuthResponse(res) {
  const body = res.data;

  return {
    user: body.data?.user ?? body.user,
    token: body.token,
  };
}

export function parseMeResponse(res) {
  return res.data.data?.user ?? res.data.user ?? res.data;
}
