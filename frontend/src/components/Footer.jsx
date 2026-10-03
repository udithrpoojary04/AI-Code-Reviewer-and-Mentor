import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Globe, 
  MessageSquare, 
  Code, 
  X, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  Users, 
  Sparkles, 
  ArrowRight,
  Briefcase,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);

  const modalContent = {
    features: {
      title: 'Platform Features',
      icon: Sparkles,
      subtitle: 'Everything you need to write world-class, production-ready code.',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-semibold mb-1">
                <Code className="h-4 w-4" />
                <span>Instant Code Review</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Deep AST analysis and AI mentorship across security vulnerabilities, code cleanliness, and time/space complexity optimizations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-semibold mb-1">
                <Users className="h-4 w-4" />
                <span>Live Collaboration</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Pair program in real-time with synchronized Monaco editors, WebSocket room communication, and collaborative AI assistance.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-semibold mb-1">
                <BookOpen className="h-4 w-4" />
                <span>AI Mock Interviews</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Tailored interview scenarios according to your tech stack and seniority level, complete with live AI evaluation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-semibold mb-1">
                <Layers className="h-4 w-4" />
                <span>Personalized Roadmaps</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Dynamic skill growth curriculums generated from your code review performance metrics and weak spots.
              </p>
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button 
              onClick={() => { setActiveModal(null); navigate('/code-review'); }}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>Try Code Review</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )
    },
    pricing: {
      title: 'Simple, Transparent Pricing',
      icon: Zap,
      subtitle: 'Free for open source and solo developers. Upgrade when you need team superpowers.',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex flex-col justify-between">
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white">Community</h5>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1 mb-2">$0 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary-600" /> Unlimited Snippet Reviews</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary-600" /> 5 Mock Interview Sessions</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary-600" /> Live Collaboration Rooms</li>
                </ul>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="mt-4 w-full py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Current Plan
              </button>
            </div>

            <div className="p-4 rounded-xl bg-primary-50/60 dark:bg-primary-950/40 border-2 border-primary-500 flex flex-col justify-between relative shadow-lg shadow-primary-500/10">
              <span className="absolute -top-2.5 right-3 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Popular
              </span>
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white">Pro Developer</h5>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1 mb-2">$12 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
                <ul className="text-xs text-slate-700 dark:text-slate-200 space-y-1.5">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary-600" /> Unlimited Mock Interviews</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary-600" /> Full GitHub Repo & Zip Analysis</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary-600" /> High-Priority Gemini 2.0 AI</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary-600" /> Exportable PDF Certifications</li>
                </ul>
              </div>
              <button 
                onClick={() => { setActiveModal(null); }}
                className="mt-4 w-full py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                Upgrade to Pro
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex flex-col justify-between">
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white">Team Enterprise</h5>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 mb-2">$49 <span className="text-xs text-slate-500 font-normal">/ seat / mo</span></div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary-600" /> Zero Data Retention Guarantee</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary-600" /> Custom Internal Coding Standards</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary-600" /> SSO & Audit Logs</li>
                </ul>
              </div>
              <button 
                onClick={() => { setActiveModal(null); }}
                className="mt-4 w-full py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      )
    },
    changelog: {
      title: 'Release Notes & Changelog',
      icon: Clock,
      subtitle: 'Stay up to date with the latest features, improvements, and fixes in CodeMentor AI.',
      content: (
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
          <div className="border-l-2 border-primary-500 pl-4 py-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">v2.2.0 - UI Modernization & Unified Design</span>
              <span className="text-[10px] bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 px-2 py-0.5 rounded-full font-semibold">Latest</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">September 2026</p>
            <ul className="mt-2 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside space-y-1">
              <li>Comprehensive light and dark theme contrast polish across all components.</li>
              <li>Unified action button styling across the entire dashboard.</li>
              <li>Interactive navbar with real-time route tracking and mobile responsive drawer.</li>
              <li>Fully interactive footer modal system for all legal, docs, and product links.</li>
            </ul>
          </div>

          <div className="border-l-2 border-slate-300 dark:border-slate-700 pl-4 py-1">
            <div className="font-bold text-slate-900 dark:text-white text-sm">v2.1.0 - Multi-Language AST Analysis</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">August 2026</p>
            <ul className="mt-2 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside space-y-1">
              <li>Support for Java, Python, JavaScript, TypeScript, C++, and Go analysis.</li>
              <li>Real-time WebSocket pair programming rooms with instant synchronization.</li>
              <li>AI-powered mock interview simulator with scoring rubric.</li>
            </ul>
          </div>

          <div className="border-l-2 border-slate-300 dark:border-slate-700 pl-4 py-1">
            <div className="font-bold text-slate-900 dark:text-white text-sm">v2.0.0 - CodeMentor AI Foundation</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">July 2026</p>
            <ul className="mt-2 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside space-y-1">
              <li>Initial release of the AI Code Reviewer and Mentor platform.</li>
              <li>JWT authentication, protected routes, and bookmarking system.</li>
            </ul>
          </div>
        </div>
      )
    },
    documentation: {
      title: 'Documentation & Quickstart Guide',
      icon: BookOpen,
      subtitle: 'Learn how to get the most out of your AI Code Reviewer and pair programming mentor.',
      content: (
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
          <div>
            <h5 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              How to perform a Code Review
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 pl-6.5 leading-relaxed">
              Navigate to <strong>Code Review</strong> in the navbar or dashboard. Paste your code into the Monaco editor, select your programming language, and click <strong>Analyze Code</strong>. The AI analyzes code quality, potential bugs, time complexity, and security issues.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Generating AI Mock Interviews
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 pl-6.5 leading-relaxed">
              Go to <strong>Interview Prep</strong>. Choose your primary language or stack, your target experience level (Junior, Mid, Senior), and interview topic. Click <strong>Generate Interview</strong> to begin an interactive interview session.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              Live Pair Programming Rooms
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 pl-6.5 leading-relaxed">
              Launch a <strong>Live Collab</strong> room to get a unique room link. Share it with peers or mentors to collaborate simultaneously on code with shared AI feedback.
            </p>
          </div>
          <div className="pt-2 flex justify-end">
            <button 
              onClick={() => { setActiveModal(null); navigate('/code-review'); }}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Start Reviewing Now
            </button>
          </div>
        </div>
      )
    },
    about: {
      title: 'About CodeMentor AI',
      icon: HelpCircle,
      subtitle: 'Building the next generation of intelligent software engineering education.',
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>CodeMentor AI</strong> was born from a simple belief: code review shouldn't just be an automated checklist of linter rules; it should be an empathetic, deep, and continuous mentorship experience that teaches developers <em>why</em> a pattern works and <em>how</em> to design scalable systems.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-0.5">Modern Tech Stack</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">Spring Boot 3, React 19, Tailwind CSS v4, WebSocket protocols.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-0.5">Privacy First</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">Your proprietary code is analyzed in memory and never used to train public LLMs.</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Whether you are prepping for FAANG technical rounds, building your next startup, or mastering clean architecture, CodeMentor AI is your 24/7 senior engineering partner.
          </p>
        </div>
      )
    },
    careers: {
      title: 'Join Our Team',
      icon: Briefcase,
      subtitle: 'Help us shape the future of AI-powered engineering education.',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            We are looking for passionate builders who love developer tools, compilers, language models, and web applications.
          </p>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
              <div>
                <h6 className="font-bold text-slate-900 dark:text-white text-xs">Senior Full-Stack Engineer (React & Java)</h6>
                <p className="text-[11px] text-slate-500">Remote | Full-time | Distributed Systems</p>
              </div>
              <span className="text-[10px] bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-semibold">Open</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
              <div>
                <h6 className="font-bold text-slate-900 dark:text-white text-xs">AI & LLM Research Engineer</h6>
                <p className="text-[11px] text-slate-500">Remote | Full-time | Code Reasoning & ASTs</p>
              </div>
              <span className="text-[10px] bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-semibold">Open</span>
            </div>
          </div>
          <div className="pt-2 text-center">
            <a 
              href="mailto:careers@codementor.ai" 
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Apply via careers@codementor.ai</span>
            </a>
          </div>
        </div>
      )
    },
    privacy: {
      title: 'Privacy Policy & Code Security',
      icon: ShieldCheck,
      subtitle: 'Your source code is your intellectual property. We treat it with maximum security.',
      content: (
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 max-h-[350px] overflow-y-auto pr-1">
          <div>
            <h6 className="font-bold text-slate-900 dark:text-white mb-1">1. Code Confidentiality</h6>
            <p className="leading-relaxed">
              Code submitted to CodeMentor AI for review is strictly evaluated in ephemeral, secure memory sessions. We do NOT store your source code on persistent disks unless you explicitly bookmark a snippet to your personal profile.
            </p>
          </div>

          <div>
            <h6 className="font-bold text-slate-900 dark:text-white mb-1">2. No AI Training on User Code</h6>
            <p className="leading-relaxed">
              Your source code is never used to train, tune, or improve public foundational machine learning models.
            </p>
          </div>

          <div>
            <h6 className="font-bold text-slate-900 dark:text-white mb-1">3. End-to-End Encryption</h6>
            <p className="leading-relaxed">
              All communications between your browser and our backend APIs are secured with industry-standard TLS 1.3 encryption in transit.
            </p>
          </div>

          <div>
            <h6 className="font-bold text-slate-900 dark:text-white mb-1">4. Account Data Rights</h6>
            <p className="leading-relaxed">
              You maintain total control over your account. You can request a complete export or deletion of your account history at any time.
            </p>
          </div>
        </div>
      )
    },
    terms: {
      title: 'Terms of Service',
      icon: ShieldCheck,
      subtitle: 'Clear, reasonable terms governing your use of the CodeMentor AI platform.',
      content: (
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 max-h-[350px] overflow-y-auto pr-1">
          <div>
            <h6 className="font-bold text-slate-900 dark:text-white mb-1">1. Acceptance of Terms</h6>
            <p className="leading-relaxed">
              By accessing CodeMentor AI, you agree to comply with all applicable software laws and our acceptable use policies.
            </p>
          </div>

          <div>
            <h6 className="font-bold text-slate-900 dark:text-white mb-1">2. 100% Intellectual Property Ownership</h6>
            <p className="leading-relaxed">
              You retain all intellectual property rights to the source code you submit. All suggestions, refactorings, and optimizations generated by CodeMentor AI are licensed directly to you for unrestricted commercial and private use.
            </p>
          </div>

          <div>
            <h6 className="font-bold text-slate-900 dark:text-white mb-1">3. Fair Usage Policy</h6>
            <p className="leading-relaxed">
              To guarantee high service availability for all developers, automated scraping or abuse of review endpoints is prohibited without an enterprise API license.
            </p>
          </div>

          <div>
            <h6 className="font-bold text-slate-900 dark:text-white mb-1">4. Educational & Mentorship Disclaimer</h6>
            <p className="leading-relaxed">
              Code suggestions are provided to enhance your engineering skills. As with all automated tools, we recommend validating changes through your regular testing suite before deploying to production.
            </p>
          </div>
        </div>
      )
    },
    community: {
      title: 'Developer Community',
      icon: MessageSquare,
      subtitle: 'Connect, share code insights, and learn together with thousands of developers.',
      content: (
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            Join our thriving community of software engineers, computer science students, and tech leads:
          </p>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Discord Developer Server</span>
                <span className="text-[11px] text-slate-500">Live chat, code reviews, and weekly algorithm challenges.</span>
              </div>
              <button 
                onClick={() => alert("Welcome to the CodeMentor AI Discord community! Join code discussions anytime.")}
                className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-500 transition-colors"
              >
                Join Server
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">GitHub Discussions & Issues</span>
                <span className="text-[11px] text-slate-500">Feature requests, roadmap votes, and open-source contributions.</span>
              </div>
              <button 
                onClick={() => alert("GitHub Discussions: You can share feedback and upvote features on GitHub!")}
                className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                View Topics
              </button>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <footer className="w-full bg-slate-100/90 dark:bg-[#0a0a0c] border-t border-slate-200/80 dark:border-slate-800/60 py-12 mt-auto z-10 relative">
      <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div 
              className="flex items-center space-x-2 cursor-pointer select-none mb-3"
              onClick={() => navigate('/dashboard')}
            >
              <div className="h-7 w-7 rounded-lg bg-primary-600/10 dark:bg-primary-500/20 flex items-center justify-center">
                <Code className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                CodeMentor <span className="text-primary-600 dark:text-primary-400">AI</span>
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Elevate your coding skills with AI-driven mentorship, instant code reviews, live collaboration, and tailored interview roadmaps.
            </p>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              Engineered for modern software developers.
            </div>
          </div>
          
          {/* Product Column */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm tracking-wide uppercase">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => setActiveModal('features')} 
                  className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('pricing')} 
                  className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('changelog')} 
                  className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  Changelog <span className="text-[10px] bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-300 font-bold px-1.5 py-0.2 rounded-full">v2.2</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('documentation')} 
                  className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  Documentation
                </button>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm tracking-wide uppercase">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => setActiveModal('about')} 
                  className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('careers')} 
                  className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  Careers <span className="text-[10px] bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 font-bold px-1.5 py-0.2 rounded-full">Hiring</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('privacy')} 
                  className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('terms')} 
                  className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Nav & Connect Column */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm tracking-wide uppercase">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mb-5">
              <li>
                <button onClick={() => navigate('/code-review')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
                  &rarr; Code Review Tool
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/interview')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
                  &rarr; Interview Prep Simulator
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/roadmap')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
                  &rarr; Skill Roadmap
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/bookmarks')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
                  &rarr; Saved Bookmarks
                </button>
              </li>
            </ul>

            <h5 className="font-semibold text-slate-900 dark:text-white mb-2.5 text-xs tracking-wide uppercase">Connect</h5>
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate('/github')} 
                className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:scale-105 transition-all cursor-pointer" 
                title="GitHub Integration"
              >
                <Code className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setActiveModal('about')} 
                className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:scale-105 transition-all cursor-pointer" 
                title="About Website"
              >
                <Globe className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setActiveModal('community')} 
                className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:scale-105 transition-all cursor-pointer" 
                title="Developer Community"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
              <a 
                href="mailto:support@codementor.ai" 
                className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:scale-105 transition-all cursor-pointer" 
                title="Email Support"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom copyright line */}
        <div className="mt-12 pt-6 border-t border-slate-200/80 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} CodeMentor AI. All rights reserved. Built for developers worldwide.
          </p>
          <div className="flex space-x-4">
            <button onClick={() => setActiveModal('privacy')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
              Privacy
            </button>
            <span>&bull;</span>
            <button onClick={() => setActiveModal('terms')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
              Terms
            </button>
            <span>&bull;</span>
            <button onClick={() => setActiveModal('documentation')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
              Docs
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Content Modal */}
      <AnimatePresence>
        {activeModal && modalContent[activeModal] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div className="flex items-center space-x-3">
                  {modalContent[activeModal].icon && (
                    <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
                      {React.createElement(modalContent[activeModal].icon, { className: "h-5 w-5" })}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {modalContent[activeModal].title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {modalContent[activeModal].subtitle}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="py-2">
                {modalContent[activeModal].content}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
