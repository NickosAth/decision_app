const Groq = require('groq-sdk');
const GROQ_API_KEY = process.env.GROQ_API_KEY;
c.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [{role: 'user', content: 'Hello, reply with Hello!'}],
  temperature: 0.7
}).then(r => {
  console.log('SUCCESS!');
  console.log('Response:', r.choices[0].message.content);
}).catch(e => {
  console.log('ERROR:', e.message);
});
