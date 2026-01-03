import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import ReportView from './components/ReportView';
import { AppState, ChatInteraction, UserProfile, AnalysisReport } from './types';
import { sendChatRequest } from './services/geminiService';
import { LayoutDashboard, MessageSquare, Settings, User, Zap, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  // App State with Default User (Simulating a logged-in user)
  const [appState, setAppState] = useState<AppState>({
    view: 'chat',
    currentReportId: null,
    reports: {},
    user: {
      id: 'usr_123',
      tier: 'free',
      credits: 5
    }
  });

  const [chatHistory, setChatHistory] = useState<ChatInteraction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendMessage = async (text: string) => {
    setErrorMsg(null);
    const userMsg: ChatInteraction = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsProcessing(true);

    // Call Backend API
    const result = await sendChatRequest(appState.user, text, chatHistory);

    if (result.error) {
      setIsProcessing(false);
      
      // If payment required, show specific message
      if (result.error.code === 'INSUFFICIENT_CREDITS') {
         setErrorMsg("You have run out of credits. Please upgrade to Pro.");
         const errorMsg: ChatInteraction = {
            id: Date.now().toString(),
            role: 'assistant',
            content: "⚠️ **Insufficient Credits**\n\nYou've used all your credits for this billing cycle. Please upgrade to the Pro plan for unlimited analysis."
         };
         setChatHistory(prev => [...prev, errorMsg]);
      } else {
         setErrorMsg(result.error.message);
         const errorMsg: ChatInteraction = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `⚠️ Error: ${result.error.message}`
         };
         setChatHistory(prev => [...prev, errorMsg]);
      }
      return;
    }

    // Update User Credits
    setAppState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        credits: result.remainingCredits
      }
    }));

    // Handle New Report if generated
    let relatedReportId: string | undefined = undefined;
    if (result.savedReport) {
       // Extract ID from the returned URL or generate one (The backend logic ensures URL exists)
       const reportId = result.savedReport.details_url.split('/').pop() || 'unknown';
       relatedReportId = reportId;

       setAppState(prev => ({
         ...prev,
         reports: {
           ...prev.reports,
           [reportId]: result.savedReport!
         }
       }));
    }

    const aiMsg: ChatInteraction = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: result.text,
      relatedReportId
    };

    setChatHistory(prev => [...prev, aiMsg]);
    setIsProcessing(false);
  };

  const handleViewReport = (reportId: string) => {
    setAppState(prev => ({ ...prev, view: 'dashboard', currentReportId: reportId }));
  };

  const handleBackToChat = () => {
    setAppState(prev => ({ ...prev, view: 'chat', currentReportId: null }));
  };

  // --- UI Helpers for Demo Control ---
  const togglePlan = () => {
    setAppState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        tier: prev.user.tier === 'free' ? 'pro' : 'free',
        credits: prev.user.tier === 'free' ? 100 : 5 // Reset credits on switch
      }
    }));
  };

  const refillCredits = () => {
    setAppState(prev => ({
      ...prev,
      user: { ...prev.user, credits: prev.user.tier === 'free' ? 5 : 100 }
    }));
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
      
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-30">
        
        {/* Brand */}
        <div className="p-6 flex items-center space-x-3 border-b border-gray-100">
             <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">C</span>
             </div>
             <span className="font-bold text-lg text-gray-800">chatflies.ai</span>
        </div>
        
        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-2">
            <button 
                onClick={() => setAppState(prev => ({...prev, view: 'chat'}))}
                className={`w-full p-3 rounded-lg flex items-center space-x-3 transition-all ${appState.view === 'chat' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <MessageSquare className="w-5 h-5" />
                <span>Analyst Chat</span>
            </button>
            <button 
                 onClick={() => {
                     const keys = Object.keys(appState.reports);
                     if (keys.length > 0) handleViewReport(keys[keys.length - 1]);
                 }}
                 disabled={Object.keys(appState.reports).length === 0}
                 className={`w-full p-3 rounded-lg flex items-center space-x-3 transition-all ${appState.view === 'dashboard' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'}`}
            >
                <LayoutDashboard className="w-5 h-5" />
                <span>Recent Reports</span>
            </button>
        </nav>

        {/* User Profile / Plan Demo Controls */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <User className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-800">Demo User</p>
                    <p className="text-xs text-gray-500 capitalize">{appState.user.tier} Plan</p>
                </div>
            </div>

            {/* Credit Display */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-gray-500">CREDITS REMAINING</span>
                    <span className={`text-xs font-bold ${appState.user.credits === 0 ? 'text-red-500' : 'text-purple-600'}`}>
                        {appState.user.credits} / {appState.user.tier === 'free' ? '5' : '∞'}
                    </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className={`h-full ${appState.user.credits === 0 ? 'bg-red-500' : 'bg-purple-500'}`} 
                        style={{ width: `${Math.min(100, (appState.user.credits / (appState.user.tier === 'free' ? 5 : 100)) * 100)}%` }}
                    ></div>
                </div>
            </div>
            
            <div className="space-y-2">
                <button 
                    onClick={togglePlan}
                    className="w-full text-xs py-2 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md flex items-center justify-center transition-colors"
                >
                    <Settings className="w-3 h-3 mr-2" />
                    Switch to {appState.user.tier === 'free' ? 'Pro' : 'Free'}
                </button>
                <button 
                    onClick={refillCredits}
                    className="w-full text-xs py-2 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md flex items-center justify-center transition-colors"
                >
                    <Zap className="w-3 h-3 mr-2 text-yellow-500" />
                    Refill Credits
                </button>
            </div>
        </div>
      </div>

      {/* Main Area */}
      <main className="flex-1 relative overflow-hidden">
        {appState.view === 'chat' && (
            <div className="h-full flex flex-col">
                {errorMsg && (
                    <div className="bg-red-50 text-red-700 px-4 py-2 text-sm text-center border-b border-red-100 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {errorMsg}
                    </div>
                )}
                <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
                    <ChatInterface 
                        chatHistory={chatHistory} 
                        onSendMessage={handleSendMessage}
                        isProcessing={isProcessing}
                        onViewReport={handleViewReport}
                    />
                </div>
            </div>
        )}

        {appState.view === 'dashboard' && appState.currentReportId && (
            <div className="h-full w-full absolute inset-0 bg-white z-40">
                <ReportView 
                    report={appState.reports[appState.currentReportId]} 
                    onBack={handleBackToChat}
                />
            </div>
        )}
      </main>
    </div>
  );
};

export default App;