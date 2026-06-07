const fs = require('fs');
const file = './src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import useRouter
if (!content.includes('useRouter')) {
  content = content.replace(
    `import { useState, useEffect } from 'react';`,
    `import { useState, useEffect } from 'react';\nimport { useRouter } from 'next/navigation';`
  );
}

// 2. Add router, email state, and auth redirect inside CardwiseDashboard
content = content.replace(
  `export default function CardwiseDashboard() {`,
  `export default function CardwiseDashboard() {\n  const router = useRouter();\n  const [email, setEmail] = useState('');\n  const [copied, setCopied] = useState(false);\n\n  useEffect(() => {\n    const tk = localStorage.getItem('cw_token');\n    const em = localStorage.getItem('cw_email');\n    if (!tk) {\n      router.replace('/login');\n      return;\n    }\n    if (em) setEmail(em);\n  }, [router]);\n\n  const handleLogout = () => {\n    localStorage.removeItem('cw_token');\n    localStorage.removeItem('cw_email');\n    document.cookie = 'cw_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';\n    document.cookie = 'cw_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';\n    router.push('/login');\n  };\n\n  const copySyncKey = () => {\n    const token = localStorage.getItem('cw_token') || '';\n    navigator.clipboard.writeText(token);\n    setCopied(true);\n    setTimeout(() => setCopied(false), 2000);\n  };\n`
);

// 3. Replace the sidebar footer with the user profile & logout buttons
const targetFooter = `<div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
          <p className="text-xs font-semibold text-zinc-700">Team: 2 Engineers</p>
          <span className="text-[10px] text-zinc-400 block mt-0.5">V1.0.0 Stable Ready</span>
        </div>`;

const newFooter = `<div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
          <p className="text-[10px] font-bold text-zinc-600 truncate text-center mb-2">{email}</p>
          <button onClick={copySyncKey} className="w-full bg-white hover:bg-zinc-100 border border-[#FF2E93] border-dashed text-[#FF2E93] text-[10px] font-bold px-3 py-2 rounded-xl transition-colors">
            {copied ? 'KEY COPIED!' : '🔑 COPY SYNC KEY'}
          </button>
          <button onClick={handleLogout} className="w-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 text-[10px] font-bold px-3 py-2 rounded-xl transition-colors">
            SIGN OUT
          </button>
        </div>`;

content = content.replace(targetFooter, newFooter);

fs.writeFileSync(file, content);
console.log('Patched page.tsx with auth successfully');
