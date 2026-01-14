
import React, { useState, useEffect } from 'react';
import { fetchDailyInspiration } from '../services/gemini';
import { Inspiration } from '../types';
import { Sparkles, Quote } from 'lucide-react';

export const AIInspiration: React.FC = () => {
  const [inspiration, setInspiration] = useState<Inspiration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchDailyInspiration();
      setInspiration(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="p-6 glass rounded-2xl animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  return (
    <div className="p-6 glass rounded-2xl border-l-4 border-green-600 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles size={64} className="text-green-800" />
      </div>
      <div className="flex items-start gap-4">
        <Quote className="text-green-600 mt-1 flex-shrink-0" size={24} />
        <div>
          <p className="text-green-900 italic text-lg leading-relaxed mb-3">
            "{inspiration?.text}"
          </p>
          <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">
            — {inspiration?.source}
          </span>
        </div>
      </div>
    </div>
  );
};
