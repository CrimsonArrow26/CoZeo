import { useState, useEffect, useRef } from 'react';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [bubble1, setBubble1] = useState(false);
  const [bubble2, setBubble2] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const promptTimer = useRef(null);

  useEffect(() => {
    // Show prompt after 3s
    promptTimer.current = setTimeout(() => setShowPrompt(true), 3000);
    return () => clearTimeout(promptTimer.current);
  }, []);

  useEffect(() => {
    if (open) {
      setShowPrompt(false);
      setTimeout(() => setBubble1(true), 300);
      setTimeout(() => setBubble2(true), 1000);
    } else {
      setBubble1(false);
      setBubble2(false);
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message) setSubmitted(true);
  };

  return (
    <div className="chat-box">
      {open && (
        <div className="chat-wrapper chat-wrapper-animated" style={{ display: 'flex', height: 'auto' }}>
          <div className="chat-top">
            <p className="chat-top-text bold">Fashion Expert</p>
            <p className="chat-top-text" style={{ marginLeft: 4 }}>- Online</p>
          </div>
          <div className="chat-input-wrapper">
            <div className="chat-form-block w-form">
              {!submitted ? (
                <form className="chat-form" onSubmit={handleSubmit}>
                  <div className="chat-bubble-wrapper">
                    {bubble1 && (
                      <div className="chat-bubble _1" style={{ animation: 'slideUp 0.4s ease forwards' }}>
                        <p className="chat-bubble-text">Hey! Welcome to CoZeo.</p>
                      </div>
                    )}
                    {bubble2 && (
                      <div className="chat-bubble" style={{ animation: 'slideUp 0.4s ease forwards' }}>
                        <p className="chat-bubble-text">Need help finding your look?</p>
                      </div>
                    )}
                  </div>
                  <div className="chat-field-wrapper">
                    <input
                      className="chat-field w-input"
                      type="text"
                      placeholder="Type here"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                    />
                  </div>
                </form>
              ) : (
                <div className="chat-success w-form-done" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <div className="success-icon" style={{ animation: 'fadeInScale 0.5s ease forwards' }}>🎉</div>
                  <div className="success-message" style={{ animation: 'slideUp 0.4s 0.2s ease forwards', opacity: 0 }}>Message sent!</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div
        className="chat-button"
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setShowPrompt(true)}
        onMouseLeave={() => !open && setShowPrompt(false)}
      >
        <div className={`prompt-message${showPrompt && !open ? ' visible' : ''}`}>
          <div>Hey! Wanna chat? 🙃</div>
        </div>
        <div style={{
          fontSize: 26,
          transition: 'transform 0.3s ease',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {open ? '✕' : '💬'}
        </div>
      </div>
    </div>
  );
}
