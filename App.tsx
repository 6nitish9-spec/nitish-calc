import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HistoryItem, CalculatorMode } from './types';
import { Button } from './components/Button';
import { Display } from './components/Display';
import { HistoryPanel } from './components/HistoryPanel';
import { solveMathWithGemini } from './services/geminiService';
import { 
  History, 
  Delete, 
  Settings2, 
  Sparkles, 
  Calculator as CalcIcon, 
  FunctionSquare,
  X,
  Send
} from 'lucide-react';

const OPERATORS = ['+', '-', '*', '/', '%'];

export default function App() {
  // State
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [previewResult, setPreviewResult] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [showHistory, setShowHistory] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiInput, setAiInput] = useState('');

  // Refs
  const aiInputRef = useRef<HTMLInputElement>(null);

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem('lumina-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) { console.error("Failed to parse history"); }
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('lumina-history', JSON.stringify(history));
  }, [history]);

  // Safe Evaluate Function
  const safeEvaluate = (expr: string): string => {
    try {
      // Basic sanitization: only allow digits, operators, parens, dot, and Math functions
      if (/[^0-9+\-*/().%^MathsincostanlogsqrtPIE\s]/.test(expr)) return '';
      
      // Replace symbols for JS execution
      let evalExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(');

      // Handle percentage (simple case: number% -> number/100)
      // This is a naive regex for demo purposes.
      evalExpr = evalExpr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

      // eslint-disable-next-line no-new-func
      const res = new Function(`return ${evalExpr}`)();
      
      if (!isFinite(res) || isNaN(res)) return 'Error';
      
      // Format number to avoid floating point ugliness
      const rounded = Math.round(res * 10000000000) / 10000000000;
      return String(rounded);
    } catch (e) {
      return '';
    }
  };

  // Real-time preview
  useEffect(() => {
    if (!expression || isAiProcessing) {
      setPreviewResult('');
      return;
    }
    // Don't preview if ends with operator
    const lastChar = expression.trim().slice(-1);
    if (OPERATORS.includes(lastChar) || lastChar === '(') {
      setPreviewResult('');
      return;
    }
    const res = safeEvaluate(expression);
    if (res && res !== 'Error') {
      setPreviewResult(res);
    } else {
      setPreviewResult('');
    }
  }, [expression, isAiProcessing]);

  // Handlers
  const handleClear = () => {
    setExpression('');
    setResult('');
    setPreviewResult('');
  };

  const handleDelete = () => {
    if (result) {
      handleClear();
    } else {
      setExpression((prev) => prev.slice(0, -1));
    }
  };

  const handleAppend = (val: string) => {
    if (result) {
      // If we have a result, starting a new number clears it,
      // but starting with an operator appends to the result.
      if (OPERATORS.includes(val)) {
        setExpression(result + val);
      } else {
        setExpression(val);
      }
      setResult('');
    } else {
      setExpression((prev) => prev + val);
    }
  };

  const handleEvaluate = () => {
    if (!expression) return;
    
    const res = safeEvaluate(expression);
    if (res && res !== 'Error') {
      setResult(res);
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression,
        result: res,
        timestamp: Date.now(),
        type: 'manual',
      };
      setHistory((prev) => [newItem, ...prev].slice(0, 50));
    } else {
      setResult('Error');
    }
  };

  const handleAiSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!aiInput.trim()) return;

    setIsAiProcessing(true);
    setMode('ai'); // Ensure we visualize AI mode
    
    // Clear previous calculator result context to focus on AI
    setExpression(aiInput); 
    setResult(''); 

    const response = await solveMathWithGemini(aiInput);

    setIsAiProcessing(false);
    
    if (response.isError) {
      setResult('Error');
    } else {
      setResult(response.result);
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression: aiInput,
        result: response.result,
        timestamp: Date.now(),
        type: 'ai',
        explanation: response.steps
      };
      setHistory((prev) => [newItem, ...prev].slice(0, 50));
      // Keep input for reference or clear? Let's clear to show we processed it.
      setAiInput('');
    }
  };

  const handleKeyboard = useCallback((e: KeyboardEvent) => {
    if (isAiProcessing) return;
    // Don't capture if user is typing in AI input field
    if (document.activeElement === aiInputRef.current) return;

    const key = e.key;
    if (/[0-9.]/.test(key)) handleAppend(key);
    if (['+', '-', '*', '/', '%', '(', ')', '^'].includes(key)) handleAppend(key);
    if (key === 'Enter') { e.preventDefault(); handleEvaluate(); }
    if (key === 'Backspace') handleDelete();
    if (key === 'Escape') handleClear();
  }, [expression, result, isAiProcessing]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyboard]);

  // Layout Constants
  const isSci = mode === 'scientific';

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="w-full max-w-6xl flex gap-6 h-[85vh] relative">
        
        {/* Main Calculator Body */}
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10">
          
          {/* Header Controls */}
          <div className="px-6 pt-6 pb-2 flex items-center justify-between">
            <div className="flex bg-gray-800/50 p-1 rounded-full border border-gray-700/50">
              <button 
                onClick={() => setMode('standard')} 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${mode === 'standard' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Standard
              </button>
              <button 
                onClick={() => setMode('scientific')} 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${mode === 'scientific' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Scientific
              </button>
              <button 
                onClick={() => setMode('ai')} 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${mode === 'ai' ? 'bg-indigo-600/80 text-white shadow-md shadow-indigo-500/20' : 'text-indigo-300 hover:text-indigo-200'}`}
              >
                <Sparkles size={14} /> AI
              </button>
            </div>
            
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className={`p-3 rounded-full transition-colors ${showHistory ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <History size={20} />
            </button>
          </div>

          {/* AI Input Mode */}
          {mode === 'ai' && (
            <div className="px-6 mb-2 animate-fade-in-down">
              <form onSubmit={handleAiSubmit} className="relative">
                <input
                  ref={aiInputRef}
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask any math question (e.g., 'Volume of a sphere radius 4')"
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-2xl py-4 pl-4 pr-12 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!aiInput.trim() || isAiProcessing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}

          {/* Display Area */}
          <div className="px-6">
            <Display 
              expression={expression} 
              result={result} 
              previewResult={previewResult}
              isAiProcessing={isAiProcessing}
            />
          </div>

          {/* Keypad */}
          <div className="flex-1 bg-gray-900/30 p-6 pt-2 overflow-y-auto no-scrollbar">
            <div className={`grid gap-3 md:gap-4 transition-all duration-300 ${isSci ? 'grid-cols-5' : 'grid-cols-4'}`}>
              
              {/* Scientific Keys Row 1 */}
              {isSci && (
                <>
                  <Button label="(" onClick={() => handleAppend('(')} variant="scientific" />
                  <Button label=")" onClick={() => handleAppend(')')} variant="scientific" />
                  <Button label="sin" onClick={() => handleAppend('sin(')} variant="scientific" />
                  <Button label="cos" onClick={() => handleAppend('cos(')} variant="scientific" />
                  <Button label="tan" onClick={() => handleAppend('tan(')} variant="scientific" />
                </>
              )}

              {/* Standard + Extra Sci keys mixed if sci mode */}
              <Button label="C" onClick={handleClear} variant="action" />
              {isSci ? <Button label="ln" onClick={() => handleAppend('ln(')} variant="scientific" /> : <Button label="(" onClick={() => handleAppend('(')} variant="action" />}
              {isSci ? <Button label="log" onClick={() => handleAppend('log(')} variant="scientific" /> : <Button label=")" onClick={() => handleAppend(')')} variant="action" />}
              <Button label="÷" value="/" onClick={() => handleAppend('/')} variant="operator" />

              {isSci && <Button label="^" onClick={() => handleAppend('^')} variant="scientific" />}
              <Button label="7" onClick={() => handleAppend('7')} />
              <Button label="8" onClick={() => handleAppend('8')} />
              <Button label="9" onClick={() => handleAppend('9')} />
              <Button label="×" value="*" onClick={() => handleAppend('*')} variant="operator" />

              {isSci && <Button label="√" onClick={() => handleAppend('sqrt(')} variant="scientific" />}
              <Button label="4" onClick={() => handleAppend('4')} />
              <Button label="5" onClick={() => handleAppend('5')} />
              <Button label="6" onClick={() => handleAppend('6')} />
              <Button label="-" onClick={() => handleAppend('-')} variant="operator" />

              {isSci && <Button label="π" onClick={() => handleAppend('π')} variant="scientific" />}
              <Button label="1" onClick={() => handleAppend('1')} />
              <Button label="2" onClick={() => handleAppend('2')} />
              <Button label="3" onClick={() => handleAppend('3')} />
              <Button label="+" onClick={() => handleAppend('+')} variant="operator" />

              {isSci && <Button label="e" onClick={() => handleAppend('e')} variant="scientific" />}
              <Button label="0" onClick={() => handleAppend('0')} cols={isSci ? 1 : 2} />
              <Button label="." onClick={() => handleAppend('.')} />
              {!isSci && <Button label={<Delete size={20}/>} onClick={handleDelete} variant="action" />}
              <Button label="=" onClick={handleEvaluate} variant="ai" className={isSci ? "col-span-2" : ""} />
            </div>
          </div>
        </div>

        {/* Side Panel (History) - Desktop only or Absolute Overlay Mobile */}
        <div className={`
          absolute inset-0 z-20 md:static md:w-80 md:inset-auto transition-transform duration-300 transform 
          ${showHistory ? 'translate-x-0' : 'translate-x-[110%] md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden'}
        `}>
           <div className="h-full md:pl-4">
             {/* Mobile Close Button */}
             <button 
               onClick={() => setShowHistory(false)} 
               className="md:hidden absolute top-4 right-4 z-50 p-2 bg-gray-800 text-white rounded-full shadow-lg"
             >
               <X size={20} />
             </button>
             <HistoryPanel 
               history={history} 
               isOpen={true} 
               onSelect={(item) => {
                 setExpression(item.expression);
                 setResult(item.result);
                 // If AI item, switch to AI mode to see explanation nicely? 
                 // Or just load values. Let's just load values for standard calc.
                 if (item.type === 'ai') setMode('ai');
                 if (window.innerWidth < 768) setShowHistory(false);
               }}
               onClear={() => setHistory([])}
             />
           </div>
        </div>

      </div>
    </div>
  );
}
