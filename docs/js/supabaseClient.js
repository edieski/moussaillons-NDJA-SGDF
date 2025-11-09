// Shared Supabase client for the Carnet Scout app
(() => {
    if (window.carpoolSupabase) {
        return;
    }

    if (!window.supabase) {
        console.error('Supabase library is not loaded. Please include supabase.min.js before supabaseClient.js');
        return;
    }

    const DEFAULT_SUPABASE_URL = '';
    const DEFAULT_SUPABASE_ANON_KEY = '';

    const runtimeConfig = window.__SUPABASE_CONFIG__ || {};

    const SUPABASE_URL =
        runtimeConfig.url ||
        window.SUPABASE_URL ||
        DEFAULT_SUPABASE_URL;

    const SUPABASE_KEY =
        runtimeConfig.anonKey ||
        window.SUPABASE_ANON_KEY ||
        DEFAULT_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error('Configuration Supabase manquante. Définissez `window.__SUPABASE_CONFIG__ = { url, anonKey }` avant de charger supabaseClient.js');
        return;
    }

    if (SUPABASE_KEY && SUPABASE_KEY.includes('service_role')) {
        console.warn('⚠️ Le Supabase key semble être un service_role. Utilisez toujours une clé anonyme côté client.');
    }

    window.carpoolSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: false
        }
    });
})();

