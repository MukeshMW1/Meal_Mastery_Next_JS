import {React} from 'react';
import {Header} from '../../components/Header'
import {Chatbot} from '../../components/Chatbot'
import ThemeToggle from '@/components/Toogle';
 const Chat=()=>{
    return(

<div className='dark:bg-gray-900 dark:text-gray-100 min-h-dvh p-8'>
   <ThemeToggle /> 
<Header/>
<Chatbot/>
</div>
    )
}

export default Chat