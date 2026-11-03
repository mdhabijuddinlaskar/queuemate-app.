import React, { useState } from 'react';
import {
  FileCode2,
  Database,
  Github,
  Globe,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { FirebaseSetupModal } from '../components/common/FirebaseSetupModal';

export const SetupGuidePage: React.FC = () => {
  const { info } = useToast();
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'firebase' | 'vercel' | 'github' | 'checklist'>('firebase');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    info(`Copied ${label} to clipboard!`);
  };

  const envSample = `# QueueMate Firebase Environment Configuration
VITE_FIREBASE_API_KEY="AIzaSyYourApiKeyHere"
VITE_FIREBASE_AUTH_DOMAIN="your-app-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-app-id"
VITE_FIREBASE_STORAGE_BUCKET="your-app-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"`;

  const firestoreRulesSample = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /businesses/{businessId} {
      allow read: if true; // Allows customer display kiosk to view business name and avg wait
      allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }

    match /counters/{counterId} {
      allow read, write: if request.auth != null;
    }

    match /tokens/{tokenId} {
      allow read: if true; // Allows live customer display screen to read tokens
      allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
      allow update: if request.auth != null && resource.data.ownerId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }

    match /activities/{activityId} {
      allow read, write: if request.auth != null;
    }
  }
}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer & Deployment Handbook</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            QueueMate Setup & Production Guide
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Complete instructions to connect Firebase Authentication & Cloud Firestore, export to GitHub, deploy to Vercel, and verify multi-tenant isolation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSetupModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0"
        >
          <Database className="w-4 h-4" />
          <span>Launch In-App Config Modal</span>
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('firebase')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'firebase'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>1. Firebase Setup & Rules</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('github')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'github'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Github className="w-4 h-4" />
          <span>2. Export to GitHub</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vercel')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'vercel'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>3. Deploy on Vercel</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('checklist')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'checklist'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>4. Testing Checklist</span>
        </button>
      </div>

      {/* Tab 1: Firebase Setup */}
      {activeTab === 'firebase' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" />
              <span>Step-by-Step Firebase Console Configuration</span>
            </h3>

            <ol className="list-decimal pl-5 space-y-3 text-sm text-slate-700 leading-relaxed">
              <li>
                Visit the{' '}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-teal-600 underline inline-flex items-center gap-1"
                >
                  Firebase Console <ExternalLink className="w-3.5 h-3.5" />
                </a>{' '}
                and click <strong>Add project</strong>. Enter a project name like{' '}
                <code>queuemate-app</code>.
              </li>
              <li>
                <strong>Enable Authentication:</strong> In the left sidebar under{' '}
                <em>Build</em>, click <strong>Authentication</strong> &gt;{' '}
                <strong>Get started</strong>. Under Sign-in method, select{' '}
                <strong>Email/Password</strong> and enable the first switch.
              </li>
              <li>
                <strong>Enable Firestore Database:</strong> In the left sidebar under{' '}
                <em>Build</em>, click <strong>Firestore Database</strong> &gt;{' '}
                <strong>Create database</strong>. Choose a cloud region (e.g.{' '}
                <code>us-central1</code> or closest to your customers).
              </li>
              <li>
                <strong>Register Web App:</strong> In Project Overview, click the Web icon{' '}
                <code>&lt;/&gt;</code> to register your web application. Give it an app nickname.
              </li>
              <li>
                Copy the <code>firebaseConfig</code> keys into your local <code>.env</code> file or paste them directly into QueueMate via the{' '}
                <button
                  type="button"
                  onClick={() => setSetupModalOpen(true)}
                  className="text-teal-600 font-bold underline"
                >
                  Configure Credentials modal
                </button>
                .
              </li>
            </ol>
          </div>

          {/* Environment Variables Block */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Environment File Template (.env)
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(envSample, '.env template')}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy .env</span>
              </button>
            </div>
            <pre className="text-xs font-mono bg-slate-950 p-4 rounded-xl overflow-x-auto text-teal-300">
              {envSample}
            </pre>
          </div>

          {/* Security Rules Block */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Production Firestore Security Rules (firestore.rules)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Enforces business tenant data isolation and protects customer records.
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(firestoreRulesSample, 'Firestore Security Rules')}
                className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Rules</span>
              </button>
            </div>
            <pre className="text-xs font-mono bg-slate-900 text-slate-200 p-4 rounded-xl overflow-x-auto">
              {firestoreRulesSample}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Export to GitHub */}
      {activeTab === 'github' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Github className="w-5 h-5 text-slate-900" />
            <span>Instructions to Export Project to GitHub</span>
          </h3>

          <ol className="list-decimal pl-5 space-y-4 text-sm text-slate-700 leading-relaxed">
            <li>
              <strong>Create a new repository on GitHub:</strong> Go to{' '}
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-teal-600 underline inline-flex items-center gap-0.5"
              >
                github.com/new <ExternalLink className="w-3 h-3" />
              </a>
              , set repository name as <code>queuemate</code> and choose Public or Private. Leave "Initialize with README" unchecked.
            </li>
            <li>
              <strong>Download / Export from AI Studio:</strong> Use the top right Export button in Google AI Studio or clone the workspace.
            </li>
            <li>
              <strong>Push your code to GitHub:</strong>
              <pre className="mt-2 text-xs font-mono bg-slate-900 text-slate-200 p-3 rounded-xl overflow-x-auto">
{`git init
git add .
git commit -m "feat: initial QueueMate release with Firebase Auth and Firestore"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/queuemate.git
git push -u origin main`}
              </pre>
            </li>
          </ol>
        </div>
      )}

      {/* Tab 3: Deploy on Vercel */}
      {activeTab === 'vercel' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-600" />
            <span>Instructions to Deploy on Vercel</span>
          </h3>

          <ol className="list-decimal pl-5 space-y-4 text-sm text-slate-700 leading-relaxed">
            <li>
              Sign in to{' '}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-teal-600 underline inline-flex items-center gap-0.5"
              >
                Vercel.com <ExternalLink className="w-3 h-3" />
              </a>{' '}
              with your GitHub account.
            </li>
            <li>
              Click <strong>Add New... &gt; Project</strong> and import your <code>queuemate</code> GitHub repository.
            </li>
            <li>
              Under <strong>Framework Preset</strong>, verify <strong>Vite</strong> is selected.
            </li>
            <li>
              Expand <strong>Environment Variables</strong> and enter all 6 <code>VITE_FIREBASE_*</code> values:
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs font-mono text-slate-600">
                <li>VITE_FIREBASE_API_KEY</li>
                <li>VITE_FIREBASE_AUTH_DOMAIN</li>
                <li>VITE_FIREBASE_PROJECT_ID</li>
                <li>VITE_FIREBASE_STORAGE_BUCKET</li>
                <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li>
                <li>VITE_FIREBASE_APP_ID</li>
              </ul>
            </li>
            <li>
              Click <strong>Deploy</strong>. In ~30 seconds your app will be live with full SSL, global CDN, and real-time Firebase sync!
            </li>
            <li>
              In the Firebase Console under <strong>Authentication &gt; Settings &gt; Authorized domains</strong>, add your Vercel deployment URL (e.g. <code>queuemate.vercel.app</code>).
            </li>
          </ol>
        </div>
      )}

      {/* Tab 4: Final Testing Checklist */}
      {activeTab === 'checklist' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Pre-Submission Quality & Testing Checklist</span>
          </h3>
          <p className="text-xs text-slate-500">
            Verify every core business requirement in your environment:
          </p>

          <div className="space-y-3">
            {[
              {
                title: 'User Registration & Business Profile Creation',
                desc: 'Sign up with a new business name and password. Verify user document is stored in users/{uid} and business profile is created in businesses/{businessId}.',
              },
              {
                title: 'Authentication & Session Persistence',
                desc: 'Log out and log back in. Refresh the browser page. Confirm that the Firebase auth state listener maintains login status without redirecting to landing.',
              },
              {
                title: 'Sequential Daily Token Generation',
                desc: 'Issue Token 1, 2, and 3. Confirm token numbers follow prefix sequence (e.g. A-001, A-002) via atomic transaction on counters collection.',
              },
              {
                title: 'Operator Lifecycle (Call Next, Complete, Skip)',
                desc: 'Click "Call Next Customer". Confirm status updates to Serving, audio chime plays, and customer display screen updates immediately.',
              },
              {
                title: 'Customer TV Screen Real-Time Sync',
                desc: 'Open Customer Display in another tab or device. Issue or advance a token on the operator desk and verify the TV screen updates without page refresh.',
              },
              {
                title: 'Business Tenant Data Isolation',
                desc: 'Sign up with a second business account in an incognito window. Verify that Business B only sees its own tokens and cannot access Business A records.',
              },
              {
                title: 'Analytics Data Integrity',
                desc: 'Visit Queue Analytics. Confirm metrics (Total Tokens, Wait Time, Completion Rate) derive strictly from Firestore records without fabricated mock data.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3.5"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <FirebaseSetupModal isOpen={setupModalOpen} onClose={() => setSetupModalOpen(false)} />
    </div>
  );
};
