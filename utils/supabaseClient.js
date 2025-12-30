'use strict';

const { createClient } = require('@supabase/supabase-js');

function mustGetEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

function createAnonClient() {
  const url = mustGetEnv('SUPABASE_URL');
  const anon = mustGetEnv(process.env.SUPABASE_ANON_KEY ? 'SUPABASE_ANON_KEY' : 'SUPABASE_PUBLISHABLE_KEY');
  return createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function createAdminClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY || !String(SUPABASE_SERVICE_ROLE_KEY).trim()) return null;
  const url = mustGetEnv('SUPABASE_URL');
  const service = mustGetEnv(process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY' : 'SUPABASE_SECRET_KEY');
  return createClient(url, service, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createAnonClient() : null;
const supabaseAdmin = createAdminClient();

module.exports = { supabase, supabaseAdmin };
