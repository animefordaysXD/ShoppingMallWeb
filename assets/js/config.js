/* To Lead — backend configuration.

   Fill in the two values below with your Supabase project settings:
   Supabase Dashboard → Project Settings → API.

   - supabaseUrl:      https://YOUR-PROJECT-ref.supabase.co
   - supabaseAnonKey:  the "anon / public" key (safe to ship when RLS is enabled)

   NEVER put the service_role key here. It bypasses Row Level Security.

   While these are empty the store runs in local demo mode: everything is kept in
   localStorage and the admin login is admin / admin. As soon as both values are
   present the store hydrates from Supabase, and every admin save is written back
   to the database. See README.md → "Supabase backend" for setup steps. */
window.TOLEAD_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  /* Row id used for the shared storefront content/settings document. */
  storeId: 'main',
  /* On a completely empty project, push the bundled demo catalogue once so the
     hosted demo looks like the local one. Set to false to start empty instead. */
  seedOnEmpty: true
};
