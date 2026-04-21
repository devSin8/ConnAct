import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://rnxkeylawspogfzelabd.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueGtleWxhd3Nwb2dmemVsYWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjExODAsImV4cCI6MjA5MjE5NzE4MH0.HKYj0n5_EztZuAl4hexdHfHIvDFm5XaCFIyhxLNOJ3Q"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)