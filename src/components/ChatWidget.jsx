import { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, Sparkles } from 'lucide-react';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey! Welcome to CoZeo. 👋' },
    { role: 'assistant', content: 'I can help you find products, check orders, or answer questions!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const messagesEndRef = useRef(null);
  const promptTimer = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Show prompt after 5 seconds
    promptTimer.current = setTimeout(() => {
      if (!open) setShowPrompt(true);
    }, 5000);
    return () => clearTimeout(promptTimer.current);
  }, [open]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Check for specific commands first
      const lowerMsg = userMessage.toLowerCase();
      
      if (lowerMsg.includes('order') || lowerMsg.includes('tracking')) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'You can track your orders in your Dashboard. Go to /dashboard and click on "Orders" to see all your orders and their status.' 
        }]);
      } else if (lowerMsg.includes('cart') || lowerMsg.includes('bag')) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Click the shopping cart icon in the top right to view your cart. You can add items from any product page!' 
        }]);
      } else if (lowerMsg.includes('product') || lowerMsg.includes('shop') || lowerMsg.includes('buy')) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Check out our Shop page at /shop to browse all products, or visit the Home page to see featured drops!' 
        }]);
      } else if (lowerMsg.includes('return') || lowerMsg.includes('refund')) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'We offer hassle-free returns within 7 days. Contact us at support@cozeo.com with your order number to initiate a return.' 
        }]);
      } else if (lowerMsg.includes('size') || lowerMsg.includes('fit')) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Each product has a size guide on its page. Our sizes generally run true to size. If you\'re between sizes, we recommend sizing up for a relaxed fit!' 
        }]);
      } else if (lowerMsg.includes('shipping') || lowerMsg.includes('delivery')) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'We offer free shipping on orders over ₹999. Standard delivery takes 3-5 business days, express is 1-2 days.' 
        }]);
      } else if (lowerMsg.includes('contact') || lowerMsg.includes('support') || lowerMsg.includes('help')) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'You can reach us at:\n📧 support@cozeo.com\n📱 Instagram: @cozeo\n\nWe typically respond within 24 hours!' 
        }]);
      } else if (lowerMsg.includes('payment') || lowerMsg.includes('pay') || lowerMsg.includes('upi')) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'We accept UPI, Credit/Debit cards, and Net Banking through our secure Razorpay payment gateway. All transactions are encrypted and safe!' 
        }]);
      } else if (lowerMsg.includes('coupon') || lowerMsg.includes('discount') || lowerMsg.includes('code')) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Check our homepage for active promotions! You can also follow us on Instagram @cozeo for exclusive discount codes.' 
        }]);
      } else {
        // Generic helpful response
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Thanks for reaching out! I can help with:\n• Finding products\n• Order tracking\n• Shipping info\n• Returns & refunds\n• Size guides\n\nWhat would you like to know?' 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I had a little hiccup. Please try again or email us at support@cozeo.com!' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-widget-container">
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="chat-title">CoZeo Assistant</p>
                <p className="chat-status">
                  <span className="status-dot"></span>
                  Online
                </p>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-content">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-content typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <div className="quick-replies">
              {['Track order', 'Products', 'Shipping', 'Returns'].map((text) => (
                <button
                  key={text}
                  className="quick-reply-btn"
                  onClick={() => {
                    setInput(text);
                    setTimeout(() => handleSend(), 100);
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
            <div className="chat-input-wrapper">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="chat-toggle-btn"
        onClick={() => {
          setOpen(!open);
          setShowPrompt(false);
        }}
        onMouseEnter={() => !open && setShowPrompt(true)}
        onMouseLeave={() => !open && setShowPrompt(false)}
      >
        {showPrompt && !open && (
          <div className="chat-prompt">
            Need help? 💬
          </div>
        )}
        <MessageCircle size={24} />
      </div>
    </div>
  );
}
