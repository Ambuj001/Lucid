const fs = require('fs');
const file = './src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `const fetchWalletInventory = async () => {
    try {
      const response = await fetch(\`http://localhost:3000/api/v1/user/portfolio/list?user_id=\${CURRENT_USER_ID}\`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setMyWalletCards(data);
        if (data.length > 0) {
          setVacationCard(data[0].card_id);
        }
      } else {
        setMyWalletCards([]);
      }
    } catch (error) {
      console.error("Failed to fetch wallet inventory:", error);
    }
  };`,
  `const fetchWalletInventory = async () => {
    try {
      const tk = localStorage.getItem('cw_token');
      if (!tk) return;
      const response = await fetch(\`http://localhost:8000/api/v1/wallet\`, {
        headers: { Authorization: \`Bearer \${tk}\` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        const mapped = data.map(c => ({
          wallet_entry_id: c.id,
          card_id: c.id,
          bank_id: c.issuer,
          card_network: c.network,
          card_name: c.name,
          card_type: c.card_category || 'Platinum'
        }));
        setMyWalletCards(mapped);
        if (mapped.length > 0) {
          setVacationCard(mapped[0].card_id);
        }
      } else {
        setMyWalletCards([]);
      }
    } catch (error) {
      console.error("Failed to fetch wallet inventory:", error);
    }
  };`
);

content = content.replace(
  `const handleWidgetCardSearch = async (val: string) => {
    setWidgetSearchQuery(val);
    if (val.length < 2) {
      setWidgetSearchResults([]);
      return;
    }
    try {
      const response = await fetch(\`http://localhost:3000/api/v1/cards/search?query=\${val}\`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setWidgetSearchResults(data);
      } else {
        setWidgetSearchResults([]);
      }
    } catch (e) {
      console.error(e);
      setWidgetSearchResults([]);
    }
  };`,
  `const handleWidgetCardSearch = async (val: string) => {
    setWidgetSearchQuery(val);
    if (val.length < 2) {
      setWidgetSearchResults([]);
      return;
    }
    try {
      const response = await fetch(\`http://localhost:8000/api/v1/cards\`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const filtered = data.filter(c => c.name.toLowerCase().includes(val.toLowerCase()) || c.issuer.toLowerCase().includes(val.toLowerCase()));
        const mapped = filtered.map(c => ({
          card_id: c.id,
          bank_id: c.issuer,
          card_name: c.name
        }));
        setWidgetSearchResults(mapped);
      } else {
        setWidgetSearchResults([]);
      }
    } catch (e) {
      console.error(e);
      setWidgetSearchResults([]);
    }
  };`
);

content = content.replace(
  `const addCardToPortfolio = async (cardId: string, cardName: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/user/portfolio/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: CURRENT_USER_ID,
          card_id: cardId
        })
      });
      const data = await response.json();
      if (data.success) {
        setWidgetMessage(\`Successfully provisioned \${cardName}!\`);
        setWidgetSearchQuery('');
        setWidgetSearchResults([]);
        fetchWalletInventory();
        setTimeout(() => setWidgetMessage(''), 4000);
      } else {
        setWidgetMessage(\`Failed to provision: \${data.error || 'Unknown error'}\`);
      }
    } catch (error) {
      console.error(error);
      setWidgetMessage("Failed to contact the backend server.");
    }
  };`,
  `const addCardToPortfolio = async (cardId: string, cardName: string) => {
    try {
      const tk = localStorage.getItem('cw_token');
      const response = await fetch('http://localhost:8000/api/v1/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${tk}\` },
        body: JSON.stringify({
          card_id: cardId
        })
      });
      if (response.ok) {
        setWidgetMessage(\`Successfully provisioned \${cardName}!\`);
        setWidgetSearchQuery('');
        setWidgetSearchResults([]);
        fetchWalletInventory();
        setTimeout(() => setWidgetMessage(''), 4000);
      } else {
        setWidgetMessage(\`Failed to provision card.\`);
      }
    } catch (error) {
      console.error(error);
      setWidgetMessage("Failed to contact the backend server.");
    }
  };`
);

// Global replace of http://localhost:3000 with http://localhost:8000 for evaluate calls
content = content.replace(/http:\/\/localhost:3000\/api\/v1\/engine\/evaluate/g, 'http://localhost:8000/api/v1/engine/evaluate');

// We also need to add headers to evaluate calls
// Look for headers: { 'Content-Type': 'application/json' }, and replace it with headers including auth.
// Wait, we can't easily globally replace that because some calls might be rules/top-picks which don't have auth.
content = content.replace(
  /headers: \{ 'Content-Type': 'application\/json' \}/g,
  `headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${localStorage.getItem('cw_token')}\` }`
);

fs.writeFileSync(file, content);
console.log('Patched page.tsx successfully');
