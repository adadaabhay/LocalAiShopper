import React, { useState, useEffect } from 'react';
import { MessageSquare, Bot, User, Check, CheckCheck, UserCog, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { API_BASE } from '../config';

export default function MessagesPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/api/messages`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch data');
                return res.json();
            })
            .then(items => {
                setData(items);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                toast.error('Failed to load messages');
                setLoading(false);
            });
    }, []);

    const deleteMessage = (idToRemove: number | string) => {
        setData(prevData => prevData.filter((msg, index) => {
            const uniqueId = msg.id || index;
            return uniqueId !== idToRemove;
        }));
        toast.success('Message deleted', {
            style: {
                background: 'var(--color-bg-panel)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-subtle)'
            },
            iconTheme: {
                primary: 'var(--color-accent-purple)',
                secondary: 'var(--color-bg-base)',
            },
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex-1 p-6 flex flex-col items-center animate-fade-in gap-6"
        >
            <div className="flex flex-col items-center text-center mb-4">
                <div className="w-16 h-16 rounded-full border-2 border-[var(--color-accent-purple)] flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-[var(--color-accent-purple)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Agent Communications</h2>
                <p className="text-[var(--color-text-secondary)] max-w-md">
                    Past conversations and support tickets with AI analysts.
                </p>
            </div>

            {loading ? (
                <div className="animate-pulse flex flex-col gap-4 w-full max-w-3xl">
                    <div className="h-20 bg-[var(--color-bg-panel)] rounded-xl"></div>
                    <div className="h-20 bg-[var(--color-bg-panel)] rounded-xl"></div>
                </div>
            ) : (
                <div className="w-full max-w-3xl space-y-4">
                    {data.length === 0 && !loading ? (
                        <div className="text-center py-12 text-[var(--color-text-muted)]">
                            <p>No messages found in your inbox.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {data.map((msg, index) => {
                                const uniqueId = msg.id || index;
                                return (
                                    <motion.div
                                        key={uniqueId}
                                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                        exit={{ opacity: 0, height: 0, scale: 0.95, margin: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`glass-panel p-5 rounded-xl border transition-colors flex items-start gap-4 relative group ${msg.unread ? 'border-[var(--color-accent-purple)] bg-purple-500/5' : 'border-[var(--color-border-subtle)] hover:border-[var(--color-accent-purple)]'}`}
                                    >
                                        <div className="mt-1">
                                            {msg.sender === 'AI Agent' ? <Bot className={`w-6 h-6 ${msg.unread ? 'text-[var(--color-accent-purple)]' : 'text-[var(--color-text-muted)]'}`} /> : <UserCog className="w-6 h-6 text-blue-400" />}
                                        </div>
                                        <div className="flex-1 pr-8">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{msg.sender}</h3>
                                                    {msg.unread === 1 && <span className="w-2 h-2 rounded-full bg-[var(--color-accent-purple)]"></span>}
                                                </div>
                                                <span className="text-xs text-[var(--color-text-muted)]">{msg.time}</span>
                                            </div>
                                            <p className={`text-sm ${msg.unread ? 'text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-secondary)]'} leading-relaxed`}>{msg.content}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteMessage(uniqueId)}
                                            className="absolute top-4 right-4 p-1.5 rounded-md text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-accent-red)] hover:text-white"
                                            aria-label="Delete message"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            )}
        </motion.div>
    );
}
