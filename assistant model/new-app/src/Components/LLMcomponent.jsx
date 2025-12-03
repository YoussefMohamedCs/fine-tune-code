import React, { useEffect } from 'react'
import {createRoot} from 'react-dom/client'
import Markdown from 'react-markdown'
export default function LLMcomponent({LLMtext}) {
   
 useEffect(()=>{
  window.speechSynthesis.cancel();
var msg = new SpeechSynthesisUtterance(LLMtext);
window.speechSynthesis.speak(msg);
 } , [LLMtext])
  return (
    <div className='LLMcomponent'>
      <div className='LLMtext'>
{/* {LLMtext} */}
{<Markdown>{LLMtext}</Markdown>}
      </div>
    </div>

  )
}
