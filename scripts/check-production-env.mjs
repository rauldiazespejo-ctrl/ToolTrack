const url = process.env.VITE_SUPABASE_URL?.trim()
const anonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim()
const strict = process.argv.includes('--strict')

const failures = []

if (!url) {
  failures.push('VITE_SUPABASE_URL is missing.')
} else {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.endsWith('.supabase.co')) {
      failures.push('VITE_SUPABASE_URL should point to a Supabase project URL.')
    }
  } catch {
    failures.push('VITE_SUPABASE_URL is not a valid URL.')
  }
}

if (!anonKey) {
  failures.push('VITE_SUPABASE_ANON_KEY is missing.')
} else if (
  anonKey.startsWith('sb_secret_') ||
  anonKey.toLowerCase().includes('service_role')
) {
  failures.push('VITE_SUPABASE_ANON_KEY must be the anon public key, not a secret key.')
}

if (failures.length > 0) {
  const message = failures.map((failure) => `- ${failure}`).join('\n')

  if (strict) {
    console.error(`Production environment is not ready:\n${message}`)
    process.exit(1)
  }

  console.warn(`Production environment warnings:\n${message}`)
  process.exit(0)
}

console.log('Production environment looks ready.')
