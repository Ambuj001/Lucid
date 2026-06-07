const fs = require('fs');
const file = './src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add AuthModal import
if (!content.includes('import AuthModal')) {
  content = content.replace(
    `import { useRouter } from 'next/navigation';`,
    `import { useRouter } from 'next/navigation';\nimport AuthModal from '../../components/AuthModal';`
  );
}

// 2. Add state variables
if (!content.includes('const [authModalOpen')) {
  content = content.replace(
    `const [isAuth, setIsAuth] = useState(false);`,
    `const [isAuth, setIsAuth] = useState(false);\n  const [authModalOpen, setAuthModalOpen] = useState(false);\n  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');`
  );
}

// 3. Update the Navbar buttons to open modal
content = content.replace(
  `onClick={() => router.push('/login')}`,
  `onClick={() => { setAuthModalTab('login'); setAuthModalOpen(true); }}`
);

content = content.replace(
  `onClick={() => router.push('/login?tab=register')}`,
  `onClick={() => { setAuthModalTab('register'); setAuthModalOpen(true); }}`
);

// 4. Render AuthModal at the end
const authModalJSX = `
      {/* AUTH MODAL */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialTab={authModalTab}
        onSuccess={(tk, em) => {
          setIsAuth(true);
          setEmail(em);
          setAuthModalOpen(false);
          // refresh data if needed
          fetchWalletInventory();
        }}
      />
    </div>
  );
}
`;

if (!content.includes('<AuthModal')) {
  content = content.replace(/    <\/div>\s*  \);\s*}\s*$/, authModalJSX);
}

fs.writeFileSync(file, content);
console.log('page.tsx successfully patched with AuthModal!');
