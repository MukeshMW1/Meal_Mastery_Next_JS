'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function Signup() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      // Perform any validation or API calls here
      try {
        // Simulate an API call or authentication
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push('/chatbot');
      } catch (error) {
        console.error('Error during signup:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="flex flex-col items-center bg-white p-8 rounded shadow-md">
        <img src="https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg" alt="Logo" className="mb-8 h-[60px] w-[60px] rounded" />
        <h2 className="text-2xl mb-4">Create an account</h2>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 p-2 w-72 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 w-72 rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Continue
        </button>
      </form>
      <div className="mt-8 space-y-4 w-80">
        <a
          href="/api/auth/google"
          className="flex items-center justify-center p-2 border border-gray-300 rounded text-blue-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        >
          <img src="https://cdn2.hubspot.net/hubfs/53/image8-2.jpg" alt="Google" className="h-6 w-12 mr-2" />
          <span>Continue with Google</span>
        </a>
        <a
          href="/api/auth/facebook"
          className="flex items-center justify-center p-2 border border-gray-300 rounded text-blue-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/512px-Facebook_f_logo_%282019%29.svg.png" alt="Facebook" className="h-6 w-6 mr-2" />
          <span>Continue with Facebook</span>
        </a>
        <a
          href="/api/auth/apple"
          className="flex items-center justify-center p-2 border border-gray-300 rounded text-blue-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/512px-Apple_logo_black.svg.png" alt="Apple" className="h-6 w-6 mr-2" />
          <span>Continue with Apple</span>
        </a>
      </div>
      <div className="mt-4">
        Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login</a>
      </div>
    </div>
  );
}
