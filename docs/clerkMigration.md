# Clerk authentication and account migration

The app uses Clerk session tokens. The API validates RS256 signatures with the
Clerk instance's public key and checks issuer, expiration, session ID, and the
authorized party when present. It does not accept the previous local JWTs.
Existing sessions end at cutover.

## Configure Clerk

Create or select a Clerk application and enable email/password and any desired
social providers in its dashboard. For the same instance, set these custom
session claims under **Sessions > Customize session token**:

```json
{
  "userId": "{{user.external_id || user.id}}",
  "primaryEmail": "{{user.primary_email_address}}"
}
```

The `userId` claim is required. Imported users must have their existing database
ID as Clerk `external_id`; new users use their Clerk ID. Never derive the ID
from client-writable metadata or link accounts by an unverified email.

Set `VITE_CLERK_PUBLISHABLE_KEY` in an ignored `.env.local` for Vite. For the
API, set these environment variables before starting the process:

- `Clerk__Issuer`: the instance's exact frontend API URL, including `https://`.
- `Clerk__JwtPublicKey`: the PEM **JWKS public key** from that instance's API
  keys page. PEM newlines may be represented as `\n` in an environment value.
- `Clerk__AuthorizedParties__0`, `Clerk__AuthorizedParties__1`, etc.: exact
  allowed browser origins, such as `http://localhost:5173` and the production
  site URL. A token containing `azp` is rejected unless it matches this list.

The public key and publishable key are not secret keys. Do not put Clerk secret
keys in Vite variables or source control. The API fails closed when its issuer
or public key is missing. Update the public key in the application configuration
if the Clerk instance rotates it.

For Docker builds, pass `VITE_CLERK_PUBLISHABLE_KEY` as a build argument; it is
embedded in the frontend at build time. Set the API variables separately on
the running service. PostgreSQL configuration remains unchanged.

## Import existing accounts

Do not import into production until a backup and rollback plan are in place.
The active database's `Users` records, not the old Supabase database alone, are
the source of application IDs. Export `Id`, `Email`, and `PasswordHash` from the
chosen database to a private CSV with those exact headers. The export contains
password hashes and personal data: keep it outside the repository, restrict
access, and delete it when it is no longer needed. Do not print it in logs.

The database does not retain email verification status. The supplied source
imports addresses as **unverified** and preserves nonempty bcrypt hashes;
accounts without usable hashes need a password reset or another enabled sign-in
method. The CLI's dry run reports unsupported hashes. Social identities and
MFA are not imported; configure providers and verify account linking with a
test account before cutover.

After selecting the correct Clerk application with the Clerk CLI, validate the
source and run a dry run against the intended **development** instance:

```bash
npx clerk@latest migrate sources ./scripts/clerkUserSource.mjs
npx clerk@latest migrate import /private/path/users.csv --source ./scripts/clerkUserSource.mjs --dry-run
```

Review skipped users, conflicts, hash compatibility, and verification behavior.
After explicitly approving the destination and results, follow Clerk's CLI
instructions to import. Verify an imported user's `external_id`, sign-in, and
access to their existing rankings before scheduling production cutover. Repeat
the dry run against the intended production instance; development and
production Clerk instances are separate. No import is performed by this repo.

Users who sign up in Clerk before their existing account is imported will not be
automatically linked by email: the API returns a conflict to avoid an account
takeover. Resolve those conflicts in Clerk before cutover.