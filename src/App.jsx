import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FileInput from './components/FileInput';
import PromptInput from './components/PromptInput';
import AnalysisOutput from './components/AnalysisOutput';
import { Zap } from 'lucide-react';

function App() {
    const [file, setFile] = useState(null);
    const [prompt, setPrompt] = useState('');

    const handleAnalyze = () => {
        if (!file) {
            alert('Please upload a file first!');
            return;
        }
        if (!prompt) {
            alert('Please enter an analysis prompt!');
            return;
        }
        console.log('Analyzing:', file, prompt);
    };

    return (
        <div className="flex min-h-screen bg-[#0b0f19] text-white">
            <Sidebar />
            <div className="flex-1 ml-[220px] flex flex-col min-h-screen">
                <Header />

                <main className="p-10 flex-1 flex flex-col">
                    <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
                        {/* Header Section */}


                        {/* Inputs Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 items-stretch">
                            <FileInput file={file} setFile={setFile} />
                            <PromptInput prompt={prompt} setPrompt={setPrompt} />
                        </div>

                        {/* Analyze Button */}
                        <div className="flex justify-center mb-12">
                            <button
                                onClick={handleAnalyze}
                                className="btn-gradient px-12 py-5 rounded-2xl font-black text-xl flex items-center gap-3 active:scale-95 group"
                            >
                                <Zap size={24} className="group-hover:fill-current transition-all" />
                                Execute
                            </button>
                        </div>

                        {/* Subtle separator */}
                        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-10"></div>

                        {/* Analysis Viewport Area */}
                        <div className="flex-1 rounded-[2rem] border border-white/5 bg-white/[0.02] overflow-hidden">
                            <AnalysisOutput />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
