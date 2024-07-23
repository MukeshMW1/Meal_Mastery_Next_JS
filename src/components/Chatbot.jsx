'use client';
import React, { useState } from 'react';

export const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  const handleSubmit = () => {
    if (message.trim()) {
      const userMessage = message;
      setChat([...chat, { type: 'user', text: userMessage }]);
      setMessage('');

      // Simulate bot analyzing the dish
      setTimeout(() => {
        const analyzingReply = 'Analyzing your food item...';
        setChat((prevChat) => [...prevChat, { type: 'bot', text: analyzingReply }]);

        setTimeout(() => {
          const finalReply = `Your dish name is ${userMessage}.`;
          setChat((prevChat) => [...prevChat, { type: 'bot', text: finalReply }]);
        }, 2000); // Simulate delay for final reply
      }, 1000); // Simulate delay for analyzing
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setChat([...chat, { type: 'user', text: <img src={reader.result} alt="uploaded" className="max-w-full h-auto" /> }]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className='flex flex-col items-center mt-[40px] mb-[100px] mx-[40px]'>
      <div className='border rounded-[12px] p-[20px] bg-white w-full max-w-[500px] flex flex-col justify-between min-h-[400px]'>
        <div className='flex flex-col gap-[10px] max-h-[400px]  overflow-x-hidden'>
          {chat.map((entry, index) => (
            <div
              key={index}
              className={`mb-[10px] p-[10px] rounded-[10px] max-w-[70%] ${
                entry.type === 'user' ? 'self-end bg-primary text-white' : 'self-start bg-gray-200 text-black'
              }`}
            >
              {entry.text}
            </div>
          ))}
        </div>
        <div className='flex justify-center items-center gap-[20px] mt-[20px]'>
          <input
            type='text'
            placeholder='Enter the ingredients or the food'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className='border rounded-[10px] p-[10px] text-[10px] lg:w-[200px] outline-none'
          />
          <div className='flex gap-[10px]'>
            <button
              onClick={handleSubmit}
              className='border rounded-[10px] p-[10px] text-[10px] cursor-pointer bg-blue-500'
            >
              Submit
            </button>
            <label className='border rounded-[10px] p-[10px] text-[10px] cursor-pointer'>
              Image
              <input type="file" onChange={handleImageUpload} className='hidden' />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
