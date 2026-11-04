import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  Users, 
  CheckCircle2, 
  Circle, 
  Utensils, 
  ChefHat,
  Bookmark,
  Upload,
  Trash2,
  BookOpen,
  Search,
  X
} from 'lucide-react';

function App() {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState('');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('create'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);

  useEffect(() => {
    const localSaved = localStorage.getItem('tarifify_my_recipes');
    if (localSaved) {
      try {
        setSavedRecipes(JSON.parse(localSaved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleParse = async () => {
    if (!inputText.trim() && !selectedFile) {
      setError('Lütfen bir tarif metni yazın veya bir fotoğraf/video dosyası seçin.');
      return;
    }

    setLoading(true);
    setError('');
    setRecipe(null);
    setCompletedSteps([]);
    setCheckedIngredients([]);

    try {
      const formData = new FormData();
      if (inputText.trim()) formData.append('rawText', inputText);
      if (selectedFile) formData.append('file', selectedFile);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/parse-recipe`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setRecipe({
          ...result.data,
          id: Date.now(),
          image: result.data.image || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800"
        });
      } else {
        setError(result.error || 'Tarif çıkarılamadı.');
      }
    } catch (err) {
      console.error(err);
      setError('Sunucuya bağlanırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentRecipe = () => {
    if (!recipe) return;
    const exists = savedRecipes.some(r => r.id === recipe.id);
    if (!exists) {
      const updated = [recipe, ...savedRecipes];
      setSavedRecipes(updated);
      localStorage.setItem('tarifify_my_recipes', JSON.stringify(updated));
      alert('Tarif kişisel defterine kaydedildi! 📖');
    }
  };

  const deleteRecipe = (e, id) => {
    e.stopPropagation();
    const updated = savedRecipes.filter(r => r.id !== id);
    setSavedRecipes(updated);
    localStorage.setItem('tarifify_my_recipes', JSON.stringify(updated));
  };

  // Arama Filtresi
  const filteredRecipes = savedRecipes.filter(r => {
    const query = searchTerm.toLowerCase();
    const titleMatch = r.title?.toLowerCase().includes(query);
    const ingredientMatch = r.ingredients?.some(i => i.toLowerCase().includes(query));
    return titleMatch || ingredientMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-orange-500 text-white p-2 rounded-xl">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Tarifify
              </span>
              <span className="text-xs text-slate-400 block font-medium">Kişisel Tarif Defterim</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === 'create' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Tarif Çıkar
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === 'saved' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Defterim ({savedRecipes.length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        {activeTab === 'create' ? (
          <>
            <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200 mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Yeni Tarif Ekle
              </h2>
              <div className="flex flex-col gap-4 mt-4">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Tarif metnini buraya yapıştırabilirsin..."
                  className="w-full h-28 p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm resize-none bg-slate-50/50"
                />
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-orange-400 bg-slate-50/30">
                  <input type="file" id="fileInput" accept="image/*,video/*,audio/*" onChange={handleFileChange} className="hidden" />
                  <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-1">
                    <Upload className="w-6 h-6 text-orange-500" />
                    <span className="text-xs font-semibold text-slate-700">{selectedFile ? selectedFile.name : 'Ekran Görüntüsü veya Video Yükle'}</span>
                  </label>
                </div>
                {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs">{error}</div>}
                <button onClick={handleParse} disabled={loading} className="w-full sm:w-auto px-7 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2">
                  {loading ? 'Analiz Ediliyor...' : 'Tarifi Çıkar'}
                </button>
              </div>
            </div>

            {recipe && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{recipe.title}</h2>
                  <button onClick={saveCurrentRecipe} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4" /> Deftere Kaydet
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-sm mb-2">Malzemeler</h3>
                    <ul className="text-xs space-y-1">{recipe.ingredients?.map((item, i) => <li key={i}>• {item}</li>)}</ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-2">Hazırlanış</h3>
                    <ol className="text-xs space-y-2">{recipe.steps?.map((step, i) => <li key={i}>{i + 1}. {step}</li>)}</ol>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* DEFTERİM SEKMESİ (ARAMA & DETAY) */
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-500" />
                Kişisel Tarif Defterim
              </h2>
              
              {/* ARAMA ÇUBUĞU */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Tarif veya malzeme ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white"
                />
              </div>
            </div>

            {filteredRecipes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <p className="text-sm font-medium text-slate-600">Aradığın kıstaslara uygun tarif bulunamadı.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredRecipes.map((r) => (
                  <div 
                    key={r.id} 
                    onClick={() => setSelectedRecipeDetail(r)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-orange-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900 text-base hover:text-orange-600 transition">{r.title}</h3>
                        <button 
                          onClick={(e) => deleteRecipe(e, r.id)} 
                          className="text-slate-400 hover:text-red-500 transition p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-3 text-xs text-slate-500 mb-3">
                        <span>⏱️ {r.time || 'Bilinmiyor'}</span>
                        <span>👥 {r.servings || 'Bilinmiyor'}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{r.ingredients?.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* TARİF DETAY MODALI (Tıklayınca Açılan Ekran) */}
      {selectedRecipeDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto p-6 relative shadow-xl">
            <button 
              onClick={() => setSelectedRecipeDetail(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-1.5"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedRecipeDetail.title}</h2>
            <div className="flex gap-4 text-xs text-slate-500 mb-6 pb-4 border-b">
              <span>⏱️ {selectedRecipeDetail.time || 'Süre Yok'}</span>
              <span>👥 {selectedRecipeDetail.servings || 'Porsiyon Yok'}</span>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-sm text-orange-600 mb-2 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4" /> Malzemeler
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {selectedRecipeDetail.ingredients?.map((ing, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm text-orange-600 mb-2 flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4" /> Hazırlanış Adımları
                </h3>
                <div className="space-y-2 text-xs text-slate-700">
                  {selectedRecipeDetail.steps?.map((step, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl flex gap-3">
                      <span className="font-bold text-orange-500">{i + 1}.</span>
                      <p className="leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;