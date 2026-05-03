import React, { useState } from 'react';
import { SearchInput } from './components/SearchInput';
import { RegionCard } from './components/RegionCard';
import { tiktokService } from './services/tiktokService';
import { TikTokAccountInfo } from './types/tiktok';
import { Globe2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [data, setData] = useState<TikTokAccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (input: string) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await tiktokService.fetchAccountRegion(input);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" id="app-container">
      <header>
        <div id="header-icon">
          <Globe2 size={32} color="#fff" />
        </div>
        <h1 id="app-title">Tiktok lookup tool</h1>
        <p className="subtitle" id="app-subtitle">
          Discover where TikTok accounts are rooted.
        </p>
      </header>

      <main>
        <SearchInput onSearch={handleSearch} isLoading={isLoading} />

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="error-message"
              id="error-container"
            >
              {error}
            </motion.div>
          )}

          {data && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              id="result-container"
            >
              <RegionCard info={data} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer style={{ marginTop: '40px', textAlign: 'center' }} id="app-footer">
        <p style={{ fontSize: '11px', color: '#333', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }} id="footer-text">
          Made by @huzoko 
        </p>
      </footer>
    </div>
  );
}
