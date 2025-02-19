'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './Toogle';
import { Header } from './Header';
import Button from './Button/Button';
export function Signup() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
  
      try {
      
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push('/chatbot');
      } catch (error) {
        console.error('Error during signup:', error);
      }
    }
  };

  return (
<>
<Button/>
</>
  );
}



