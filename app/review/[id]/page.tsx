'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, X, Plus, Edit2, CloudUpload, ArrowLeft, Send, Bot, User, RefreshCw, AlertCircle, FileText, CheckCircle2, ExternalLink } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface JobDetail {
  job_id: string;
  filename: string;
  status: string;
  transcription: string | null;
  summary: string | null;
  notion_page_url: string | null;
  error_message: string | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState<string[]>(['議事録', '会議']);
  const [syncing, setSyncing] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcription' | 'summary'>('summary');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/jobs/${jobId}`);
        if (!res.ok) throw new Error('ジョブが見つかりませんでした');
        const data = await res.json();
        setJob(data);
        if (data.summary) setSummary(data.summary);
      } catch (e) {
        setError(e instanceof Error ? e.message : '不明なエラー');
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchJob();
  }, [jobId]);

  useEffect(() => {
    const createSession = async () => {
      if (!jobId) return;
      try {
        const res = await fetch(`${API_URL}/api/chat/sessions`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: jobId }),
        });
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.session_id);
          setChatMessages([{ id: '1', role: 'assistant', content: '議事録ドラフトを確認しました。修正や追加のご要望があればお知らせください。' }]);
        }
      } catch (e) { console.error('Failed to create chat session:', e); }
    };
    createSession();
  }, [jobId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const handleSummarize = async () => {
    if (!job) return;
    setSummarizing(true);
    try {
      const res = await fetch(`${API_URL}/api/summarize`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || '要約生成に失敗しました'); }
      const data = await res.json();
      setSummary(data.summary);
      setJob(prev => prev ? { ...prev, status: data.status, summary: data.summary } : null);
    } catch (e) { alert(`エラー: ${e instanceof Error ? e.message : '要約生成に失敗しました'}`); }
    finally { setSummarizing(false); }
  };

  const hasStartedAutoSummarize = useRef(false);
  useEffect(() => {
    if (job && job.status === 'transcribed' && !job.summary && !summarizing && !hasStartedAutoSummarize.current) {
      hasStartedAutoSummarize.current = true;
      handleSummarize();
    }
  }, [job, summarizing]);

  const sendMessage = async () => {
    if (!chatInput.trim() || isTyping || !sessionId) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput(''); setIsTyping(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { id: data.message_id, role: 'assistant', content: data.content }]);
        if (data.content.includes('##')) setSummary(data.content);
      } else { throw new Error('送信失敗'); }
    } catch { alert('メッセージの送信に失敗しました。'); }
    finally { setIsTyping(false); }
  };

  const handleApprove = async () => {
    if (!job) return;
    const approvedBy = prompt('承認者名を入力してください:');
    if (!approvedBy?.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/approve`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, approved_by: approvedBy.trim(), comment: '' }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || '承認に失敗しました'); }
      const data = await res.json();
      alert(data.slack_posted ? '承認が完了し、Slackに通知しました！' : '承認は完了しましたが、Slack通知に失敗しました。');
    } catch (e) { alert(`承認エラー: ${e instanceof Error ? e.message : '不明なエラー'}`); }
  };

  const handleSync = async () => {
    if (!job) return;
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/api/notion/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, title: job.filename }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || '同期に失敗しました'); }
      alert('Notionへの同期が完了しました！');
      router.push('/');
    } catch (e) { alert(`同期エラー: ${e instanceof Error ? e.message : '不明なエラー'}`); }
    finally { setSyncing(false); }
  };

  const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

  if (loading) return (
    <div className="flex-1 flex items-center justify-center h-screen">
      <RefreshCw className="animate-spin text-blue-600" size={32} />
    </div>
  );

  if (error || !job) return (
    <div className="flex-1 flex flex-col items-center justify-center h-screen gap-4">
      <AlertCircle className="text-red-500" size={48} />
      <p className="text-slate-700">{error || 'ジョブが見つかりませんでした'}</p>
      <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">ホームに戻る</button>
    </div>
  );

  const needsSummarization = job.status === 'transcribed' && !job.summary;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white animate-slide-in-from-right">

      {/* Header */}
      <div className="flex-none px-4 py-4 sm:px-8 sm:py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white z-10 gap-4 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 shrink-0"><Sparkles size={18} /></div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">レビュー & Notion同期</h2>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm pl-0 sm:pl-10 mt-1 truncate">
              会議: <span className="font-medium text-slate-900">{job.filename}</span>
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-200 ml-10 sm:ml-0">
          ステータス: {job.status}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left column: Transcription/Summary */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-100 order-2 lg:order-1 h-full">
          <div className="max-w-3xl mx-auto flex flex-col gap-6 sm:gap-8 pb-10">
            {job.transcription && (
              <div className="flex gap-2 border-b border-slate-200">
                <button onClick={() => setActiveTab('summary')} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'summary' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>
                  <Sparkles size={16} /> 要約
                </button>
                <button onClick={() => setActiveTab('transcription')} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'transcription' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>
                  <FileText size={16} /> 文字起こし
                </button>
              </div>
            )}

            {activeTab === 'transcription' && job.transcription && (
              <div className="w-full p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 max-h-[400px] overflow-y-auto">
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{job.transcription}</p>
              </div>
            )}

            {activeTab === 'summary' && (
              <>
                {needsSummarization && (
                  <div className="flex flex-col gap-3 p-6 rounded-xl bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-800">文字起こしが完了しました。次に要約を生成してください。</p>
                    <button onClick={handleSummarize} disabled={summarizing} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                      {summarizing ? <><RefreshCw className="animate-spin" size={18} /> 要約生成中...</> : <><Sparkles size={18} /> 要約を生成</>}
                    </button>
                  </div>
                )}

                {(job.summary || summary) && (
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-end">
                      エグゼクティブサマリー
                      <span className="text-[10px] normal-case font-normal text-slate-400">{job.status === 'completed' ? '閲覧・編集可能' : 'クリックして編集'}</span>
                    </label>
                    <div className="w-full p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">
                      <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full bg-transparent border-0 p-0 text-sm sm:text-base leading-relaxed text-slate-800 placeholder:text-slate-400 focus:ring-0 resize-none h-[200px] sm:h-[240px] focus:outline-none" spellCheck={false} />
                    </div>
                  </div>
                )}

                {(job.summary || summary) && (
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">主要インサイト</label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <div key={tag} className="group flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-default">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500 rounded-full p-0.5 hover:bg-red-50 transition-colors"><X size={14} /></button>
                        </div>
                      ))}
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 text-sm font-medium text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all">
                        <Plus size={16} /> タグ追加
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right column: AI Chat & Sync */}
        <div className="w-full lg:w-96 bg-slate-50 flex flex-col shrink-0 order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-slate-200 lg:h-full max-h-[50vh] lg:max-h-none overflow-hidden">
          <div className="p-4 sm:p-8 flex flex-col h-full gap-6 sm:gap-8 overflow-y-auto">
            {/* AI Chat */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI修正アシスタント</label>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Bot size={14} /><span className="text-[10px] font-medium">オンライン</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-slate-200 p-3 mb-3 min-h-[200px] max-h-[300px]">
                <div className="flex flex-col gap-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-2">
                      <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 text-slate-600"><Bot size={14} /></div>
                      <div className="px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-sm">
                        <span className="inline-flex gap-1">
                          <span className="animate-bounce">.</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
              <div className="flex gap-2">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="修正内容を入力..." className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" />
                <button onClick={sendMessage} disabled={!chatInput.trim() || isTyping} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl transition-colors">
                  <Send size={18} />
                </button>
              </div>
            </div>

            {/* Sync area */}
            {(job.status === 'summarized' || job.status === 'completed' || summary) && (
              <div className="mt-auto pt-6 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">同期先</label>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 mb-6 shadow-sm">
                  <div className="w-8 h-8 rounded bg-white flex items-center justify-center shrink-0 border border-slate-200">
                    <span className="text-sm font-bold font-serif">N</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-slate-500 font-medium leading-none mb-1">Notionデータベース</span>
                    <span className="text-sm font-bold text-slate-900 truncate leading-none">TechNotta DB</span>
                  </div>
                  <button className="ml-auto text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-slate-100"><Edit2 size={16} /></button>
                </div>

                {job.status === 'completed' && job.notion_page_url ? (
                  <>
                    <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span className="text-sm text-emerald-800 font-medium">Notion同期済み</span>
                    </div>
                    <a href={job.notion_page_url} target="_blank" rel="noopener noreferrer" className="w-full py-3.5 sm:py-4 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 mb-3">
                      <ExternalLink size={20} /> Notionで表示
                    </a>
                    <button onClick={handleSync} disabled={syncing} className="w-full py-3.5 sm:py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                      {syncing ? <><span className="animate-spin">⟳</span> 更新中...</> : <><Edit2 size={20} /> 修正をNotionに反映</>}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleApprove} className="w-full py-3.5 sm:py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 mb-3">
                      <CheckCircle2 size={20} /> 承認してSlack通知
                    </button>
                    <button onClick={handleSync} disabled={syncing} className="w-full py-3.5 sm:py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                      {syncing ? <><span className="animate-spin">⟳</span> 同期中...</> : <><CloudUpload size={20} /> Notionに同期</>}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
