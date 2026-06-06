// ═══════════════════════════════════════════
// CONFIG — Supabase credentials & shared state
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// SUPABASE CONFIG
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// ✅ CONFIG — Admin បំពេញត្រង់នេះ ១ ដងគត់
// ═══════════════════════════════════════════
const SB_CONFIG = { url: 'https://eafafsasgootmplemioi.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZmFmc2FzZ29vdG1wbGVtaW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NDE3NzcsImV4cCI6MjA5MjQxNzc3N30.r6t1MFr6qKSRM_lsLXmo5DtU4GvE9X0xqb4ImIzrcLg' };
// ═══════════════════════════════════════════

var SB_URL = 'https://eafafsasgootmplemioi.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZmFmc2FzZ29vdG1wbGVtaW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NDE3NzcsImV4cCI6MjA5MjQxNzc3N30.r6t1MFr6qKSRM_lsLXmo5DtU4GvE9X0xqb4ImIzrcLg';
const TABLE = 'blood_records';

// Override with hardcoded credentials
const SB_URL_VAL = 'https://eafafsasgootmplemioi.supabase.co';
const SB_KEY_VAL = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZmFmc2FzZ29vdG1wbGVtaW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NDE3NzcsImV4cCI6MjA5MjQxNzc3N30.r6t1MFr6qKSRM_lsLXmo5DtU4GvE9X0xqb4ImIzrcLg';

// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
var allRecs = [];
let filtered = [];
let curPage  = 1;
const PER    = 50;
let activeDay = 'all';
let editId   = null;
let importWB = null;

// Force credentials
SB_URL = SB_URL_VAL;
SB_KEY = SB_KEY_VAL;
