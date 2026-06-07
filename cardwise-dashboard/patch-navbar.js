const fs = require('fs');
const file = './src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add isAuth state and update useEffect
if (!content.includes('const [isAuth, setIsAuth]')) {
  content = content.replace(
    `const [email, setEmail] = useState('');\n  const [copied, setCopied] = useState(false);`,
    `const [email, setEmail] = useState('');\n  const [copied, setCopied] = useState(false);\n  const [isAuth, setIsAuth] = useState(false);`
  );
}

content = content.replace(
  `useEffect(() => {
    const tk = localStorage.getItem('cw_token');
    const em = localStorage.getItem('cw_email');
    if (!tk) {
      router.replace('/login');
      return;
    }
    if (em) setEmail(em);
  }, [router]);`,
  `useEffect(() => {
    const tk = localStorage.getItem('cw_token');
    const em = localStorage.getItem('cw_email');
    if (!tk) {
      setIsAuth(false);
    } else {
      setIsAuth(true);
      if (em) setEmail(em);
    }
  }, [router]);`
);

// 2. Add handleLogout fix to update state
content = content.replace(
  `router.push('/login');\n  };`,
  `setIsAuth(false);\n    router.push('/login');\n  };`
);

// 3. Revert sidebar footer
const currentFooterRegex = /<div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">[\s\S]*?<\/div>/;
const originalFooter = `<div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
          <p className="text-xs font-semibold text-zinc-700">Team: 2 Engineers</p>
          <span className="text-[10px] text-zinc-400 block mt-0.5">V1.0.0 Stable Ready</span>
        </div>`;
if (currentFooterRegex.test(content)) {
  content = content.replace(currentFooterRegex, originalFooter);
}

// 4. Inject Top Navbar right inside the main content area
const mainContainerTarget = `<div className="flex-1 p-10 overflow-y-auto">`;
const topNavbarCode = `<div className="flex-1 p-10 overflow-y-auto">
        {/* TOP NAVBAR FOR AUTHENTICATION */}
        <div className="flex justify-end items-center mb-10 pb-4 border-b border-zinc-200/50">
          <div className="flex items-center gap-3">
            {isAuth ? (
              <>
                <span className="text-xs font-bold text-zinc-500 mr-2">{email}</span>
                <button onClick={copySyncKey} className="px-4 py-2 text-xs font-bold bg-[#FF2E93] hover:bg-[#E01E79] transition-colors text-white rounded-lg shadow-sm shadow-pink-200">
                  {copied ? 'KEY COPIED!' : 'COPY SYNC KEY'}
                </button>
                <button onClick={handleLogout} className="px-4 py-2 text-xs font-bold border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-lg transition-colors">
                  SIGN OUT
                </button>
              </>
            ) : (
              <>
                <button onClick={() => router.push('/login')} className="px-4 py-2 text-xs font-bold border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-lg transition-colors">
                  SIGN IN
                </button>
                <button onClick={() => router.push('/login?tab=register')} className="px-4 py-2 text-xs font-bold bg-[#FF2E93] hover:bg-[#E01E79] transition-colors text-white rounded-lg shadow-sm shadow-pink-200">
                  CREATE ACCOUNT
                </button>
              </>
            )}
          </div>
        </div>
`;

if (!content.includes('TOP NAVBAR FOR AUTHENTICATION')) {
  content = content.replace(mainContainerTarget, topNavbarCode);
}

fs.writeFileSync(file, content);
console.log('Navbar successfully injected!');
