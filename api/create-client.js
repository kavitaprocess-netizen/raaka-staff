// Vercel serverless function — POST /api/create-client
//
// Creates a genuine placeholder client: a real (but unconfirmed,
// password-less) Supabase Auth user plus a matching profiles row, so
// the client can "claim" their account later via a normal
// password-reset-style flow. The previous version of this feature — a
// plain database RPC (staff_create_client_profile) — invented a random
// UUID with gen_random_uuid() and tried to insert it directly into
// profiles.id, which is a foreign key to a real Supabase Auth user.
// That constraint (profiles_id_fkey) correctly rejected every attempt;
// this feature never actually worked. Creating a real Auth user first
// is the correct fix, and that requires the Admin API, which requires
// the service role key — a credential that must never reach the
// browser, hence this running server-side.
//
// Deploy this SINGLE self-contained file (no npm dependencies — plain
// fetch() calls to Supabase's REST and Auth APIs, same zero-dependency
// approach as summarize-transcript.js, after that file's own ES-module
// loading problem) at api/create-client.js in BOTH the Staff and Owner
// Vercel projects.
//
// Needs ONE new real environment variable in each project's Settings →
// Environment Variables: SUPABASE_SERVICE_ROLE_KEY — found in Supabase
// at Project Settings → API (NOT the anon key; this one bypasses every
// RLS policy, so treat it like a password and never put it in any
// frontend file).

const SUPABASE_URL = 'https://ybklqnetvmoakckfiica.supabase.co'; // same public URL already embedded in every frontend file — not a secret

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed — use POST.' });
    return;
  }

  const { fullName, email, phone, accessToken } = req.body || {};
  if (!fullName || !fullName.trim()) { res.status(400).json({ error: 'A full name is required.' }); return; }
  if (!email || !email.trim()) { res.status(400).json({ error: 'An email is required.' }); return; }
  if (!accessToken) { res.status(401).json({ error: 'Not signed in.' }); return; }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    res.status(500).json({ error: 'Server is not configured with a Supabase service role key (SUPABASE_SERVICE_ROLE_KEY env var missing).' });
    return;
  }

  try {
    // Verify who's actually calling — never trust anything the
    // frontend claims about its own tenant or role, since every request
    // below uses the service role key, which bypasses RLS entirely.
    const callerResp = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: { 'Authorization': 'Bearer ' + accessToken, 'apikey': serviceRoleKey }
    });
    if (!callerResp.ok) {
      res.status(401).json({ error: 'Invalid or expired session.' });
      return;
    }
    const callerUser = await callerResp.json();
    const callerId = callerUser.id;

    const profileResp = await fetch(
      SUPABASE_URL + '/rest/v1/profiles?id=eq.' + callerId + '&select=tenant_id,role',
      { headers: { 'apikey': serviceRoleKey, 'Authorization': 'Bearer ' + serviceRoleKey } }
    );
    const profileRows = await profileResp.json();
    const callerProfile = profileRows && profileRows[0];
    if (!callerProfile || !['staff', 'owner'].includes(callerProfile.role)) {
      res.status(403).json({ error: 'Only staff or owner accounts can create client records.' });
      return;
    }
    const tenantId = callerProfile.tenant_id;
    const trimmedEmail = email.trim().toLowerCase();

    // Reuse an existing client with this email in the same tenant
    // rather than creating a duplicate — same behavior the old RPC had.
    const existingResp = await fetch(
      SUPABASE_URL + '/rest/v1/profiles?tenant_id=eq.' + tenantId + '&role=eq.client&email=ilike.' + encodeURIComponent(trimmedEmail) + '&select=id',
      { headers: { 'apikey': serviceRoleKey, 'Authorization': 'Bearer ' + serviceRoleKey } }
    );
    const existingRows = await existingResp.json();
    if (existingRows && existingRows[0]) {
      res.status(200).json({ clientId: existingRows[0].id });
      return;
    }

    // The real fix: create an actual (unconfirmed, password-less) Auth
    // user first, so profiles.id has something real to point at.
    // email_confirm: false — no confirmation email is sent, and this
    // account can't be used to sign in until the client later claims it
    // via a normal password-reset-style flow.
    const createUserResp = await fetch(SUPABASE_URL + '/auth/v1/admin/users', {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': 'Bearer ' + serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: trimmedEmail, email_confirm: false })
    });
    if (!createUserResp.ok) {
      const errBody = await createUserResp.text().catch(() => '');
      console.error('Admin createUser error:', createUserResp.status, errBody);
      res.status(500).json({ error: 'Could not create the client account (status ' + createUserResp.status + ').' });
      return;
    }
    const newUser = await createUserResp.json();
    const newClientId = newUser.id;

    const insertResp = await fetch(SUPABASE_URL + '/rest/v1/profiles', {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': 'Bearer ' + serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        id: newClientId,
        tenant_id: tenantId,
        role: 'client',
        full_name: fullName.trim(),
        email: trimmedEmail,
        phone: (phone || '').trim() || null,
        created_at: new Date().toISOString(),
        has_set_own_password: false
      })
    });
    if (!insertResp.ok) {
      const errBody = await insertResp.text().catch(() => '');
      console.error('Profile insert error:', insertResp.status, errBody);
      res.status(500).json({ error: 'The account was created but the profile record could not be saved.' });
      return;
    }

    res.status(200).json({ clientId: newClientId });
  } catch (err) {
    console.error('create-client function error:', err);
    res.status(500).json({ error: 'Unexpected server error creating the client.' });
  }
};
