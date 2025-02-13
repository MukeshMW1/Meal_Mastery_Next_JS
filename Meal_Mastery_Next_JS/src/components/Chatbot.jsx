'use client';
import React, { useState, useEffect, useRef } from 'react';

export const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSubmit = async () => {
    if (message.trim()) {
      const userMessage = message;
      setChat([...chat, { type: 'user', text: userMessage }]);
      setMessage('');
      setIsLoading(true);

      setTimeout(() => {
        const analyzingReply = 'Analyzing your food item...';
        setChat((prevChat) => [...prevChat, { type: 'bot', text: analyzingReply }]);
        generateRecipeFromFlask(userMessage);

        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }, 1000);
    }
  };

  const generateRecipeFromFlask = async (dishName) => {
    try {
      const response = await fetch('http://localhost:5000/generate_recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishName }),
      });
  
      if (!response.ok) throw new Error('Failed to generate recipe');
  
      const data = await response.json();
      console.log("Raw Text from Flask:", data.generated_text);
  
      if (data.generated_text) {
        const rawText = data.generated_text;
  
        // Updated regex to match ingredients and instructions better
        const titleRegex = /<TITLE_START>\s*(.*?)\s*<TITLE_END>/;
        const ingredientsRegex = /<INGR_START>\s*(.*?)\s*(<NEXT_INGR>|<INGR_END>)/g;
        const instructionsRegex = /<INSTR_START>\s*(.*?)\s*(<NEXT_INSTR>|<INSTR_END>)/g;
  
        const titleMatch = rawText.match(titleRegex);
        const ingredientMatches = rawText.match(ingredientsRegex);
        const instructionMatches = rawText.match(instructionsRegex);
  
        const title = titleMatch ? titleMatch[1].trim() : 'Recipe Title';
        const ingredients = ingredientMatches && ingredientMatches.length > 0 
            ? ingredientMatches.map(ingredient => ingredient.replace('<INGR_START>', '').replace('<NEXT_INGR>', '').replace('<INGR_END>', '').trim())
            : ['No ingredients available.'];
  
        const instructions = instructionMatches && instructionMatches.length > 0 
            ? instructionMatches.map(instruction => instruction.replace('<INSTR_START>', '').replace('<NEXT_INSTR>', '').replace('<INSTR_END>', '').trim())
            : ['No instructions available.'];
  
        const recipeComponent = (
          <div className="recipe-container bg-white text-black p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-red-600">Recipe: {title}</h2>
            <h3 className="text-xl font-semibold mt-4">👩‍🍳 Ingredients</h3>
            <ul className="pl-5">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm">{ingredient}</li>
              ))}
            </ul>
            <h3 className="text-xl font-semibold mt-4">👨‍🍳 Instructions</h3>
            <ol className="pl-5">
              {instructions.map((instruction, index) => (
                <li key={index} className="text-sm">{instruction}</li>
              ))}
            </ol>
          </div>
        );
  
        setChat((prev) => [...prev, { type: 'bot', text: recipeComponent }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setChat((prev) => [...prev, { type: 'bot', text: '🚨 Error generating recipe. Try again!' }]);
    }
  };
  
  

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setChat([...chat, { type: 'user', text: <img src={reader.result} alt="uploaded" className="max-w-full h-auto" /> }]);
        setIsLoading(true);

        const formData = new FormData();
        formData.append('image', file);

        try {
          const response = await fetch('http://localhost:5000/classify', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            const botReply = `Ohhh! I see you sent me a picture of ${result.dishName}`;
            setChat((prevChat) => [...prevChat, { type: 'bot', text: botReply }]);
            await generateRecipeFromFlask(result.dishName);
          } else {
            setChat((prevChat) => [...prevChat, { type: 'bot', text: "Sorry, something went wrong while analyzing the image." }]);
          }
          setIsLoading(false);
        } catch (err) {
          console.log("There was an error making the fetch request", err.message);
          setChat((prevChat) => [...prevChat, { type: 'bot', text: "There was an error processing the image." }]);
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className='flex flex-col items-center mt-[40px] mb-[100px] mx-[40px]'>
      <div className='border rounded-[12px] p-[20px] w-full max-w-[800px] h-auto flex flex-col justify-between min-h-[400px] bg-neutral-800 text-neutral-100'>
        <div className='flex flex-col gap-[10px] max-h-[400px] overflow-y-auto scrollbar-hidden'>
          {chat.map((entry, index) => (
            <div
              key={index}
              className={`mb-[10px] p-[10px] rounded-[10px] max-w-[70%] ${entry.type === 'user' ? 'self-end bg-blue-500 text-white' : 'self-start bg-gray-200 text-black'}`}
            >
              {entry.text}
            </div>
          ))}
          {isLoading && (
            <div className="self-start text-black p-2 rounded-md flex items-center">
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 bg-black rounded-full"></div>
                <div className="h-2 w-2 bg-black rounded-full"></div>
                <div className="h-2 w-2 bg-black rounded-full"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className='flex justify-center items-center gap-[20px] mt-[20px]'>
          <input
            type='text'
            placeholder='Enter the ingredients or the food'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className='border rounded-[10px] p-[10px] text-[10px] lg:w-[200px] outline-none text-black'
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
