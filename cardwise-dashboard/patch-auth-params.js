const fs = require('fs');
const file = './src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add useSearchParams
if (!content.includes('useSearchParams')) {
  content = content.replace(
    `import { useRouter } from 'next/navigation';`,
    `import { useRouter, useSearchParams } from 'next/navigation';`
  );
}

// 2. Add authParam state inside component
if (!content.includes('const searchParams = useSearchParams();')) {
  content = content.replace(
    `const router = useRouter();`,
    `const router = useRouter();\n  const searchParams = useSearchParams();`
  );
}

// 3. Add useEffect to read authParam
const authParamEffect = `
  useEffect(() => {
    const auth = searchParams?.get('auth');
    if (auth === 'login' || auth === 'register') {
      setAuthModalTab(auth);
      setAuthModalOpen(true);
    }
  }, [searchParams]);
`;

if (!content.includes(`const auth = searchParams?.get('auth');`)) {
  content = content.replace(
    `const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');`,
    `const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');\n${authParamEffect}`
  );
}

fs.writeFileSync(file, content);
console.log('page.tsx successfully patched to handle URL auth parameters!');
