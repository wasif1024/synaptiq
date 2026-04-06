import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { agentsAPI, conversationsAPI } from '@/lib/api';
import { FiSend, FiPlus, FiCpu } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import styles from '@/styles/Chat.module.css';

export default function ChatPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvo, setActiveConvo] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<number>(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    agentsAPI.list().then(r => {
      setAgents(r.data);
      if (r.data.length > 0) setSelectedAgent(r.data[0].id);
    }).catch(() => {});
    conversationsAPI.list().then(r => setConversations(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeConvo) {
      conversationsAPI.messages(activeConvo).then(r => setMessages(r.data)).catch(() => {});
    }
  }, [activeConvo]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startNew = async () => {
    try {
      const r = await conversationsAPI.create({ agent_id: selectedAgent, title: 'New Chat' });
      setConversations(prev => [r.data, ...prev]);
      setActiveConvo(r.data.id);
      setMessages([]);
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    if (!activeConvo) {
      try {
        const r = await conversationsAPI.create({ agent_id: selectedAgent, title: input.slice(0, 50) });
        setConversations(prev => [r.data, ...prev]);
        setActiveConvo(r.data.id);
        await sendToConvo(r.data.id, input);
      } catch {}
    } else {
      await sendToConvo(activeConvo, input);
    }
  };

  const sendToConvo = async (convoId: number, text: string) => {
    const userMsg = { role: 'user', content: text, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const r = await conversationsAPI.chat(convoId, text);
      setMessages(prev => [...prev, r.data]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error getting response. Please try again.', id: Date.now() + 1 }]);
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className={styles.chatLayout}>
        <aside className={styles.convoSidebar}>
          <div className={styles.convoHeader}>
            <button className={styles.newBtn} onClick={startNew}><FiPlus /> New Chat</button>
          </div>
          <div className={styles.agentSelect}>
            <FiCpu />
            <select value={selectedAgent} onChange={e => setSelectedAgent(Number(e.target.value))}>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className={styles.convoList}>
            {conversations.map(c => (
              <div key={c.id} className={`${styles.convoItem} ${activeConvo === c.id ? styles.convoActive : ''}`} onClick={() => setActiveConvo(c.id)}>
                {c.title}
              </div>
            ))}
          </div>
        </aside>
        <div className={styles.chatMain}>
          <div className={styles.messagesArea}>
            {messages.length === 0 && !activeConvo && (
              <div className={styles.welcome}>
                <div className={styles.welcomeIcon}>S</div>
                <h2>Welcome to Synaptiq</h2>
                <p>Your AI assistant powered by Myndlab. Start a conversation below.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={m.id || i} className={`${styles.message} ${m.role === 'user' ? styles.userMsg : styles.assistantMsg}`}>
                <div className={styles.msgBubble}>
                  {m.role === 'assistant' ? <ReactMarkdown>{m.content}</ReactMarkdown> : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className={`${styles.message} ${styles.assistantMsg}`}>
                <div className={styles.msgBubble}><span className={styles.typing}>Thinking<span>...</span></span></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className={styles.inputArea}>
            <div className={styles.inputWrap}>
              <textarea
                className={styles.input}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Type your message..."
                rows={1}
              />
              <button className={styles.sendBtn} onClick={sendMessage} disabled={loading || !input.trim()}>
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}