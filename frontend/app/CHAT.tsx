"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ChatGPTStreamUI() {
      const [messages, setMessages] = useState([]);
      const [input, setInput] = useState('');
      const [loading, setLoading] = useState(false);
      const containerRef = useRef(null);

      const handleSend = async () => {
            if (!input.trim()) return;
            const userMessage = { role: 'user', text: input };
            setMessages((prev) => [...prev, userMessage]);
            setInput('');
            setLoading(true);

            // Initialize SSE
            const evtSource = new EventSource(`http://localhost:5050/api/v1/writer/?prompt=${encodeURIComponent(input)}`);
            let assistantText = '';
            const assistantMessage = { role: 'assistant', text: '' };
            setMessages((prev) => [...prev, assistantMessage]);

            evtSource.onmessage = (e) => {
                  assistantText += e.data;
                  setMessages((prev) => {
                        const msgs = [...prev];
                        msgs[msgs.length - 1] = { role: 'assistant', text: assistantText };
                        return msgs;
                  });
                  scrollToBottom();
            };

            evtSource.addEventListener('done', () => {
                  setLoading(false);
                  evtSource.close();
            });

            evtSource.onerror = () => {
                  setLoading(false);
                  evtSource.close();
            };
      };

      const scrollToBottom = () => {
            if (containerRef.current) {
                  containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
      };

      useEffect(() => {
            scrollToBottom();
      }, [messages]);

      return (
            <div className="flex flex-col h-screen bg-gray-100">
                  <header className="p-4 bg-white shadow">
                        <h1 className="text-xl font-bold">AI Book Writer</h1>
                  </header>
                  <div ref={containerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, idx) => (
                              <motion.div
                                    key={idx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`max-w-2xl p-3 rounded-2xl shadow ${msg.role === 'user' ? 'self-end bg-blue-500 text-white' : 'self-start bg-white text-gray-800'}`}
                              >
                                    {msg.text.split('\n').map((line, i) => (
                                          <p key={i}>{line}</p>
                                    ))}
                              </motion.div>
                        ))}
                        {loading && (
                              <div className="self-start bg-white p-3 rounded-2xl shadow animate-pulse">
                                    Typing...
                              </div>
                        )}
                  </div>
                  <div className="p-4 bg-white flex space-x-2">
                        <input
                              type="text"
                              className="flex-1 p-2 border rounded-xl focus:outline-none focus:ring"
                              placeholder="Type your prompt..."
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                              onClick={handleSend}
                              disabled={loading}
                              className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
                        >
                              Send
                        </button>
                  </div>
            </div>
      );
}
