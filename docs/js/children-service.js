// Children (roster) service – reads from Supabase and allows password-guarded writes
(function () {
  const LOG_PREFIX = '[ChildrenService]';

  function ensureClient() {
    if (!window.carpoolSupabase) {
      console.error(LOG_PREFIX, 'Supabase client not found. Ensure supabaseClient.js is loaded and configured.');
      return null;
    }
    return window.carpoolSupabase;
  }

  function normalize(child) {
    if (!child) return null;
    return {
      id: child.id,
      last_name: child.last_name || child.nom || '',
      first_name: child.first_name || child.prenom || '',
      team: child.team || null,
      active: child.active !== false,
      created_at: child.created_at || null,
      // legacy-friendly fields used across the app
      nom: child.last_name || child.nom || '',
      prenom: child.first_name || child.prenom || ''
    };
  }

  const ChildrenService = {
    async list() {
      const client = ensureClient();
      if (!client) return [];
      const { data, error } = await client
        .from('children')
        .select('id, last_name, first_name, team, active, created_at')
        .eq('active', true)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true });
      if (error) {
        console.error(LOG_PREFIX, 'list error', error);
        return [];
      }
      return (data || []).map(normalize);
    },

    async create(child, secret) {
      const client = ensureClient();
      if (!client) return null;
      if (!secret) throw new Error('Mot de passe chef requis');
      const lastName = child.last_name || child.nom || '';
      const firstName = child.first_name || child.prenom || '';
      const team = child.team || null;
      const { data, error } = await client.rpc('create_child_with_secret', {
        p_secret: secret,
        p_last_name: lastName,
        p_first_name: firstName,
        p_team: team,
        p_active: child.active !== false
      });
      if (error) {
        console.error(LOG_PREFIX, 'create error', error);
        throw error;
      }
      return normalize(data);
    },

    async upsert(child, secret) {
      const client = ensureClient();
      if (!client) return null;
      if (!secret) throw new Error('Mot de passe chef requis');
      const lastName = (child.last_name || child.nom || '').toString();
      const firstName = (child.first_name || child.prenom || '').toString();
      const team = child.team || null;
      const { data, error } = await client.rpc('upsert_child_with_secret', {
        p_secret: secret,
        p_last_name: lastName,
        p_first_name: firstName,
        p_team: team,
        p_active: child.active !== false
      });
      if (error) {
        console.error(LOG_PREFIX, 'upsert error', error);
        throw error;
      }
      return normalize(data);
    },

    async importMany(childrenArray, secret, onProgress) {
      const created = [];
      for (let i = 0; i < childrenArray.length; i++) {
        const c = childrenArray[i];
        try {
          const res = await this.upsert(c, secret);
          created.push(res);
          if (onProgress) onProgress(i + 1, childrenArray.length, null);
          // small delay to avoid rate limits
          await new Promise(r => setTimeout(r, 150));
        } catch (e) {
          if (onProgress) onProgress(i + 1, childrenArray.length, e);
        }
      }
      return created;
    }
  };

  window.ChildrenService = ChildrenService;
})();
