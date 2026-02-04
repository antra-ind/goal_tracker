import { useState } from 'react';
import { X, ExternalLink, Key, AlertCircle } from 'lucide-react';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (token: string) => Promise<void>;
  error?: string;
}

export function TokenModal({ isOpen, onClose, onSubmit, error }: TokenModalProps) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setLoading(true);
    try {
      await onSubmit(token.trim());
    } finally {
      setLoading(false);
    }
  };

  const tokenUrl = 'https://github.com/settings/tokens/new?description=Goal%20Tracker&scopes=gist';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Key size={20} />
            Connect GitHub
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm">
            <p className="font-medium mb-2">Why connect GitHub?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Sync data across all your devices</li>
              <li>Backup to your private GitHub Gist</li>
              <li>Your data stays private - only you can access it</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-gray-700">
              Step 1: Generate a Personal Access Token
            </label>
            <a
              href={tokenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <ExternalLink size={14} />
              Open GitHub → Generate Token (select "gist" scope)
            </a>
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-gray-700">
              Step 2: Paste your token here
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <p className="text-xs text-gray-500">
              Token is stored only in your browser's localStorage
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={!token.trim() || loading}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
