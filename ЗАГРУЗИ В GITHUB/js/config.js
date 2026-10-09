// Настройки входа. Возьми оба значения в Supabase: Project Settings → API.
// anon-ключ публичный, его можно хранить в коде сайта (доступ к данным ограничен правилами RLS из supabase/schema.sql).
window.RDS_CONFIG={
  supabaseUrl:'',      // например 'https://abcdefgh.supabase.co'
  supabaseAnonKey:''   // длинный ключ 'eyJ...' из поля anon public
};
