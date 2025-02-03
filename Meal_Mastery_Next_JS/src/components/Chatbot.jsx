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

 // Updated generateRecipeFromFlask function
const generateRecipeFromFlask = async (searchQuery) => {
  try {
    const response = await fetch('http://localhost:5000/generate_recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dishName: searchQuery }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate recipe from Flask API');
    }

    const data = await response.json();
    
   // In your generateRecipeFromFlask function, process the data like this:
if (data.recipe) {
  // Clean and format ingredients
  const ingredients = Array.from(new Set(  // Remove duplicates
    data.recipe.Ingredients
      .filter(ing => ing.trim().length > 0)  // Remove empty items
      .map(ing => ing.replace(/<[^>]+>/g, '').trim())  // Remove HTML tags
      .filter(ing => !ing.match(/NEXT_/))  // Remove leftover tags
  ));

  // Clean and format instructions
  const instructions = data.recipe.Instructions
    .filter(inst => inst.trim().length > 0)
    .map(inst => inst.replace(/<[^>]+>/g, '').trim())
    .filter(inst => !inst.match(/NEXT_/))
    .filter((inst, index, self) => self.indexOf(inst) === index);  // Remove duplicates

  const recipeComponent = (
    <div className="recipe-container bg-white text-black p-6 rounded-lg shadow-md mb-4">
      <h2 className="text-3xl font-bold mb-6 text-red-600 border-b-2 border-red-200 pb-2">
        🍕 {data.recipe.Title || 'Pizza Recipe'}
      </h2>

      <div className="ingredients-section mb-8">
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          <span className="mr-2">🥄 Ingredients</span>
          <span className="text-sm text-gray-500">(serves 2-3)</span>
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
              <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center mr-3">
                {index + 1}
              </span>
              {ingredient}
            </li>
          ))}
        </ul>
      </div>

      <div className="instructions-section">
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          👩🍳 Step-by-Step Instructions
        </h3>
        <ol className="space-y-4">
          {instructions.map((step, index) => (
            <li key={index} className="flex items-start bg-gray-50 p-4 rounded-lg">
              <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center mr-4 shrink-0">
                {index + 1}
              </span>
              <p className="leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="tips-section mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="text-lg font-semibold mb-2 flex items-center">
          💡 Pro Tips
        </h4>
        <ul className="list-disc pl-6 space-y-2">
          <li>Let dough rise for at least 1 hour for better texture</li>
          <li>Use a pizza stone for crispy crust</li>
          <li>Preheat oven to maximum temperature</li>
        </ul>
      </div>
    </div>
  );

  // Add to chat
  setChat(prev => [...prev, { type: 'bot', text: recipeComponent }]);
}
  } catch (error) {
    console.error("Error generating recipe from Flask API:", error);
    setChat((prevChat) => [
      ...prevChat,
      { 
        type: 'bot', 
        text: <div className="text-red-500">🚨 Sorry, something went wrong while generating the recipe. Please try again.</div> 
      },
    ]);
  }
};

// Updated chat message rendering
{chat.map((entry, index) => (
  <div
    key={index}
    className={`mb-[10px] p-[10px] rounded-[10px] max-w-[90%] ${
      entry.type === 'user' 
        ? 'self-end bg-blue-500 text-white' 
        : 'self-start bg-gray-100 text-black recipe-message'
    }`}
    style={entry.type === 'bot' ? { minWidth: '70%' } : {}}
  >
    {typeof entry.text === 'string' ? (
      <div className="prose">{entry.text}</div>
    ) : (
      entry.text
    )}
  </div>
))}

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
            console.log(result);
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
          <div ref={chatEndRef} /> {/* Scroll target */}
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
