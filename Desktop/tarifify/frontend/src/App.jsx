import React, { useState } from 'react';
import Login from './Login';

export default function App() {
  // Kullanıcı oturumunu tarayıcı hafızasından kontrol ediyoruz
  const [user, setUser] = useState(localStorage.getItem('tarifify_user') || null);
  const [url, setUrl] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (email) => {
    localStorage.setItem('tarifify_user', email);
    setUser(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('tarifify_user');
    setUser(null);
  };

  // Tarif ayrıştırma fonksiyonu
  const handleParseRecipe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/parse-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const result = await response.json();
      
      if (result.success) {
        setRecipes([result.recipe, ...recipes]);
        setUrl('');
      } else {
        setError(result.error || 'Tarif ayrıştırılırken bir hata oluştu.');
      }
    } catch (err) {
      setError('Sunucuya bağlanırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Eğer kullanıcı giriş yapmadıysa, doğrudan Login ekranını göster ve ana sayfayı gizle
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdfbf7', padding: '20px', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* Sağ Üst Çıkış Yap Butonu */}
      <button 
        onClick={handleLogout} 
        style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          padding: '8px 16px', 
          background: '#e76f51', 
          color: 'white', 
          border: 'none', 
          borderRadius: '6px', 
          cursor: 'pointer',
          fontWeight: 'bold',
          zIndex: 1000 
        }}
      >
        Çıkış Yap ({user})
      </button>

      <div style={{ maxWidth: '600px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>Tarifify 🍳</h1>
        
        {/* Tarif Ekleme Formu */}
        <form onSubmit={handleParseRecipe} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Tarif linkini buraya yapıştırın..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '10px 20px', background: '#2a9d8f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {loading ? 'Yükleniyor...' : 'Tarif Çıkar'}
          </button>
        </form>

        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

        {/* Tarifler / Defterim Alanı */}
        <div>
          <h3 style={{ borderBottom: '2px solid #f1f3f5', paddingBottom: '8px', color: '#34495e' }}>Defterim ({recipes.length})</h3>
          {recipes.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', marginTop: '20px' }}>Henüz kayıtlı tarif yok.</p>
          ) : (
            recipes.map((recipe, index) => (
              <div key={index} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '10px', border: '1px solid #e9ecef' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{recipe.title || 'İsimsiz Tarif'}</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{recipe.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}