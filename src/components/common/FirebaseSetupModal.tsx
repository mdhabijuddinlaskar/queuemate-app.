import React, { useState } from 'react';
import { Modal } from './Modal';
import {
  saveFirebaseConfig,
  clearFirebaseConfig,
  getFirebaseConfig,
  testConnection,
} from '../../lib/firebase';
import {
  Database,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface FirebaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSetupModal: React.FC<FirebaseSetupModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getFirebaseConfig();
  const { success, error, info } = useToast();

  const [jsonInput, setJsonInput] = useState('');
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig?.authDomain || '');
  const [projectId, setProjectId] = useState(currentConfig?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(
    currentConfig?.messagingSenderId || ''
  );
  const [appId, setAppId] = useState(currentConfig?.appId || '');

  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
  } | null>(null);

  const handleParseJson = () => {
    try {
      // Clean string if user pastes `const firebaseConfig = { ... };`
      let clean = jsonInput.trim();
      if (clean.includes('{')) {
        clean = clean.substring(clean.indexOf('{'), clean.lastIndexOf('}') + 1);
      }
      // If keys aren't quoted, convert JS object syntax to valid JSON
      const jsonCompatible = clean.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
      const parsed = JSON.parse(jsonCompatible);

      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);

      success('Firebase config parsed successfully!');
    } catch (err) {
      error('Invalid configuration snippet. Please paste valid JSON or fill fields manually.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      error('API Key and Project ID are required.');
      return;
    }

    saveFirebaseConfig({
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    });
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await testConnection();
      setConnectionResult({
        tested: true,
        connected: res.connected,
        message: res.message,
      });
      if (res.connected) {
        success(res.message);
      } else {
        error(res.message);
      }
    } catch (err: any) {
      setConnectionResult({
        tested: true,
        connected: false,
        message: err?.message || 'Connection failed.',
      });
      error('Failed to verify connection.');
    } finally {
      setTestingConnection(false);
    }
  };

  const envSample = `# QueueMate Firebase Credentials
VITE_FIREBASE_API_KEY="${apiKey || 'your-api-key'}"
VITE_FIREBASE_AUTH_DOMAIN="${authDomain || `${projectId || 'your-project-id'}.firebaseapp.com`}"
VITE_FIREBASE_PROJECT_ID="${projectId || 'your-project-id'}"
VITE_FIREBASE_STORAGE_BUCKET="${storageBucket || `${projectId || 'your-project-id'}.appspot.com`}"
VITE_FIREBASE_MESSAGING_SENDER_ID="${messagingSenderId || 'your-sender-id'}"
VITE_FIREBASE_APP_ID="${appId || 'your-app-id'}"`;

  const copyEnvSample = () => {
    navigator.clipboard.writeText(envSample);
    info('Copied .env configuration to clipboard!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Firebase Configuration & Setup"
      description="Connect real Firebase Authentication and Cloud Firestore"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Status banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            currentConfig
              ? 'bg-teal-50 border-teal-200 text-teal-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {currentConfig ? (
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <p className="font-semibold text-sm">
                {currentConfig ? 'Firebase is Connected' : 'Firebase is Not Connected'}
              </p>
              <p className="text-xs opacity-80">
                {currentConfig
                  ? `Active Project ID: ${currentConfig.projectId}`
                  : 'Authentication and live database operations require Firebase credentials.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection || !currentConfig}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              Test DB
            </button>
            {currentConfig && (
              <button
                type="button"
                onClick={clearFirebaseConfig}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-100/50 transition-colors"
                title="Disconnect stored config"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {connectionResult && (
          <div
            className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              connectionResult.connected
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {connectionResult.connected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{connectionResult.message}</span>
          </div>
        )}

        {/* Quick Paste JSON */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Quick Setup: Paste `firebaseConfig` snippet from Firebase Console
          </label>
          <div className="flex gap-2">
            <textarea
              rows={3}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`const firebaseConfig = {\n  apiKey: "AIza...",\n  projectId: "queuemate-app",\n  ...\n};`}
              className="flex-1 text-xs font-mono p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="button"
            onClick={handleParseJson}
            disabled={!jsonInput.trim()}
            className="mt-2 text-xs font-semibold px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-40"
          >
            Auto-Fill Form from Snippet
          </button>
        </div>

        {/* Manual inputs form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                API Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Project ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="my-queuemate-project"
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Auth Domain
              </label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="my-queuemate-project.firebaseapp.com"
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Storage Bucket
              </label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                placeholder="my-queuemate-project.appspot.com"
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Messaging Sender ID
              </label>
              <input
                type="text"
                value={messagingSenderId}
                onChange={(e) => setMessagingSenderId(e.target.value)}
                placeholder="1029384756"
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                App ID
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:1029384756:web:abcd..."
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Key className="w-3.5 h-3.5" />
              Credentials stay securely in your browser/env
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              Save & Apply Credentials
            </button>
          </div>
        </form>

        {/* Copy for .env */}
        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Environment Variables for Local & Vercel
            </span>
            <button
              type="button"
              onClick={copyEnvSample}
              className="text-xs text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy .env text
            </button>
          </div>
          <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
            {envSample}
          </pre>
        </div>

        {/* Step by step guide */}
        <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl text-xs text-blue-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>How to create a free Firebase project (Takes 2 minutes)</span>
          </div>
          <ol className="list-decimal pl-4 space-y-1 text-blue-900/90">
            <li>
              Go to{' '}
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="underline font-semibold inline-flex items-center gap-0.5"
              >
                Firebase Console <ExternalLink className="w-3 h-3" />
              </a>{' '}
              and click <strong>Add project</strong>.
            </li>
            <li>
              In left sidebar, go to <strong>Build &gt; Authentication</strong>, click{' '}
              <strong>Get Started</strong>, and enable <strong>Email/Password</strong>.
            </li>
            <li>
              In left sidebar, go to <strong>Build &gt; Firestore Database</strong>, click{' '}
              <strong>Create Database</strong>, start in test mode or paste our{' '}
              <code>firestore.rules</code>.
            </li>
            <li>
              Click the gear icon (<strong>Project Settings</strong>) &gt; General &gt; In{' '}
              <strong>Your apps</strong> click the Web icon (<code>&lt;/&gt;</code>) to register an
              app and copy your keys!
            </li>
          </ol>
        </div>
      </div>
    </Modal>
  );
};
