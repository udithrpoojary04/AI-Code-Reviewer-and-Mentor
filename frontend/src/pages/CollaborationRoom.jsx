import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { webSocketService } from '../services/WebSocketService';
import { useAuth } from '../contexts/AuthContext';
import { Users, MessageSquare, Send, Code, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const CollaborationRoom = () => {
    const { roomId } = useParams();
    const { user } = useAuth();
    
    const [code, setCode] = useState('// Welcome to the real-time collaboration room!\n// Type your code here...\n');
    const [language, setLanguage] = useState('javascript');
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    
    // Use a unique ID for this specific client to ignore our own code updates
    const clientId = useRef(uuidv4());
    const chatContainerRef = useRef(null);
    const isLocalChange = useRef(false);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    useEffect(() => {
        // Connect to WebSocket
        webSocketService.connect(() => {
            setIsConnected(true);
            
            // Subscribe to Code Updates
            webSocketService.subscribeToCode(roomId, (message) => {
                // Only update if the message didn't come from this client
                if (message.senderId !== clientId.current) {
                    isLocalChange.current = false;
                    setCode(message.content);
                    if (message.language) setLanguage(message.language);
                }
            });

            // Subscribe to Chat Messages
            webSocketService.subscribeToChat(roomId, (message) => {
                setChatMessages(prev => [...prev, message]);
                scrollToBottom();
            });
            
            // System message saying user joined
            webSocketService.sendChatMessage(roomId, 'System', `${user?.name || 'A user'} joined the room`);
        });

        return () => {
            if (webSocketService.connected) {
                webSocketService.sendChatMessage(roomId, 'System', `${user?.name || 'A user'} left the room`);
                webSocketService.disconnect();
            }
        };
    }, [roomId, user]);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }, 100);
    };

    const handleCodeChange = (value) => {
        isLocalChange.current = true;
        setCode(value);
        if (isConnected) {
            webSocketService.sendCodeUpdate(roomId, value, language, clientId.current);
        }
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        if (isConnected) {
            webSocketService.sendCodeUpdate(roomId, code, newLang, clientId.current);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !isConnected) return;

        webSocketService.sendChatMessage(roomId, user?.name || 'Anonymous', newMessage);
        setNewMessage('');
    };

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-200 p-4 md:p-6 flex flex-col h-screen overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                        <Users className="w-6 h-6 mr-2 text-primary-400" />
                        Collaboration Room
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Room ID: {roomId}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <div className={`w-2.5 h-2.5 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-slate-300">{isConnected ? 'Connected' : 'Connecting...'}</span>
                    </div>
                    <select 
                        value={language} 
                        onChange={handleLanguageChange}
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 outline-none focus:border-primary-500 text-sm"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="html">HTML</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
                {/* Editor Section */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-[2] glass-panel rounded-2xl overflow-hidden border border-slate-700/50 flex flex-col"
                >
                    <div className="bg-slate-100 dark:bg-slate-800/80 p-2.5 border-b border-slate-700/50 flex items-center shrink-0">
                        <Code className="w-4 h-4 text-primary-400 mr-2" />
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-200">Live Editor (Syncs automatically)</span>
                    </div>
                    <div className="flex-1 min-h-0">
                        <Editor
                            height="100%"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={handleCodeChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                padding: { top: 16 },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on'
                            }}
                        />
                    </div>
                </motion.div>

                {/* Chat Section */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 glass-panel rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden w-full lg:max-w-md"
                >
                    <div className="bg-slate-100 dark:bg-slate-800/80 p-2.5 border-b border-slate-700/50 flex items-center justify-between shrink-0">
                        <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 text-green-400 mr-2" />
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-200">Live Chat</span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 px-2 py-1 bg-slate-700/50 rounded flex items-center">
                            <Zap className="w-3 h-3 text-yellow-400 mr-1" />
                            Tip: Mention @AI to ask the Mentor
                        </div>
                    </div>
                    
                    <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col space-y-4 min-h-0">
                        {chatMessages.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-500 text-sm text-center px-4">
                                No messages yet. Say hello or mention @AI for help!
                            </div>
                        ) : (
                            chatMessages.map((msg, index) => {
                                const isMe = msg.senderName === user?.name;
                                const isSystem = msg.senderName === 'System';
                                const isAi = msg.aiResponse;

                                if (isSystem) {
                                    return (
                                        <div key={index} className="text-center text-xs text-slate-500 my-2">
                                            {msg.content}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <span className={`text-xs mb-1 ${isAi ? 'text-primary-400 font-bold flex items-center' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {isAi && <Zap className="w-3 h-3 mr-1" />}
                                            {msg.senderName}
                                        </span>
                                        <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${
                                            isMe ? 'bg-primary-600 text-white rounded-tr-none' : 
                                            isAi ? 'bg-primary-50 dark:bg-slate-700 text-primary-950 dark:text-primary-50 rounded-tl-none border border-primary-200 dark:border-primary-500/30' : 
                                            'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-tl-none border-slate-300 dark:border-slate-700'
                                        }`}>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-700/50 shrink-0">
                        <form onSubmit={handleSendMessage} className="flex relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message... (@AI for help)"
                                className="w-full bg-transparent border border-slate-700 text-slate-900 dark:text-white rounded-xl pl-4 pr-12 py-2.5 outline-none focus:border-primary-500 text-sm"
                            />
                            <button 
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-400 disabled:opacity-50 disabled:hover:text-primary-500 p-1.5 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CollaborationRoom;
