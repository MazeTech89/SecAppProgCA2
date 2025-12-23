import React, { useState } from 'react';
import axios from 'axios';

function DomXssDemo() {
  // Demonstration component: shows DOM-XSS and reflected-XSS patterns.
  // This is intentionally unsafe and should not exist in production code.
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  // DOM-based XSS: directly set innerHTML from user input.
  const handleDomXss = () => {
    document.getElementById('dom-xss-output').innerHTML = input;
  };

  // Reflected XSS: backend echoes attacker-controlled input.
  const handleReflectedXss = async () => {
    const res = await axios.get('/insecure/echo?input=' + encodeURIComponent(input));
    setOutput(res.data);
  };

  return (
    <div>
      <h3>XSS Demo</h3>
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text (try <script>alert(1)</script>)" />
      <button onClick={handleDomXss}>DOM XSS</button>
      <button onClick={handleReflectedXss}>Reflected XSS</button>
      <div>
        <b>DOM XSS Output:</b>
        <div id="dom-xss-output" style={{border:'1px solid #ccc', minHeight:30, margin:'5px 0'}}></div>
      </div>
      <div>
        <b>Reflected XSS Output:</b>
        <div dangerouslySetInnerHTML={{__html: output}} style={{border:'1px solid #ccc', minHeight:30, margin:'5px 0'}} />
      </div>
    </div>
  );
}

export default DomXssDemo;
