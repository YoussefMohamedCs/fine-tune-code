
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaRecordVinyl, FaStop } from "react-icons/fa";
import UserComponent from './Components/UserComponent';
import LLMcomponent from './Components/LLMcomponent';
import { OpenAI } from "openai";
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default function App() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [embedding, setEmbedding] = useState('');
  const [conversation, setConversation] = useState([]);
  const [textWriten, setTextWriten] = useState("");
  const [book , setBook] = useState([])



useEffect(()=>{

  fetch("/DBbook.json") 
      .then((response) => response.json())
      .then((json) => setBook(json));
} , [])



  //
  // 🧠 Qwen LLM call with full memory
  const LLM = async (text) => {
    const client = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: "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",
      dangerouslyAllowBrowser: true,
    });

    const fullMessages = [
      {
        role: "system",
        content : `You are a database expert. You must answer only questions related to databases using *exclusively* the content provided from the book.  
 If the answer is not found in the provided text, first respond with: "The answer is not available in the Book," and then give your best possible answer based on your knowledge.  
  If the question is unrelated to databases, respond with: "I only answer database-related questions."
`     },
       ...book ,
      ...conversation,
      { role: "user", content: text },
    ];

    try {
      const chatCompletion = await client.chat.completions.create({
        model: "Qwen/Qwen3-Next-80B-A3B-Instruct",
        messages: fullMessages,
      });

      const reply = chatCompletion?.choices[0]?.message?.content;
      handleAddLLMText(reply);
    } catch (error) {
      console.error("LLM error:", error);
      handleAddLLMText("Sorry, I couldn't process that.");
    }
  };

  const handleAddLLMText = (text) => {
    setConversation(prev => [...prev, { role: "assistant", content: text }]);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      const userText = e.target.value;
      setConversation(prev => [...prev, { role: "user", content: userText }]);
      setTextWriten("");
      LLM(userText);
    }
  };

  useEffect(() => {
    window.scrollBy({ top: 10000, behavior: "smooth" });
  }, [conversation]);

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = async (event) => {
    const text = event.results[0][0].transcript;
    setTranscript(text);
    setConversation(prev => [...prev, { role: "user", content: text }]);
    LLM(text);

    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/embedding',
        { text },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setEmbedding(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error sending to /embedding:', error);
      setEmbedding('Error retrieving embedding.');
    }
  };

  recognition.onend = () => {
    setListening(false);
  };

  const startListening = () => {
    setTranscript('');
    setEmbedding('');
    setListening(true);
    recognition.start();
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div className='mb-5 pb-5'>
        {conversation.map((msg, index) => (
          msg.role === "assistant"
            ? <LLMcomponent key={index} LLMtext={msg.content} />
            : <UserComponent key={index} UserText={msg.content} />
        ))}
      </div>

      <div className='text-and-audio'>
        <input
          type="text"
          placeholder='Ask about anything…'
          className='text-write'
          onKeyPress={handleEnter}
          onChange={(e) => setTextWriten(e.target.value)}
          value={textWriten}
        />
        <button onClick={startListening} disabled={listening} className='button-record'>
          {listening
            ? <FaStop size={"60px"} style={{ cursor: "pointer" }} />
            : <FaRecordVinyl size={"60px"} style={{ cursor: "pointer" }} />}
        </button>
      </div>
    </div>
  );
}
