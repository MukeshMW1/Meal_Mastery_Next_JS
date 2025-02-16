'use client'
import { useState } from 'react';
import { Header } from '../../components/Header';
import { Chatbot } from '../../components/Chatbot';
import ThemeToggle from '@/components/Toogle';
import IngredientChatbot from '@/components/Ingredients';

const Chat = () => {
    const [activeChatbot, setActiveChatbot] = useState('chatbot1');

    return (
        <div className='dark:bg-gray-900 dark:text-gray-100 min-h-dvh p-8'>
            <ThemeToggle />
            <Header />
            
            {/* Buttons to switch between chatbots */}
            <div className="flex gap-4 mb-4">
                <button 
                    onClick={() => setActiveChatbot('chatbot1')} 
                    className={`px-4 py-2 rounded ${activeChatbot === 'chatbot1' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
                >
                    Recipe
                </button>
                <button 
                    onClick={() => setActiveChatbot('chatbot2')} 
                    className={`px-4 py-2 rounded ${activeChatbot === 'chatbot2' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
                >
                    Ingredients
                </button>
            </div>

            {/* Conditional rendering of chatbots */}
            {activeChatbot === 'chatbot1' ? <Chatbot /> : <IngredientChatbot />}
        </div>
    );
};

export default Chat;
