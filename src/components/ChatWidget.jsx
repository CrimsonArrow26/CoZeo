import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, X, MessageCircle, Sparkles, HelpCircle, ShoppingBag, Truck, RotateCcw, CreditCard, User, ChevronLeft, ChevronRight } from 'lucide-react';

// FAQ Data for common questions
const FAQ_DATA = {
  shipping: {
    keywords: ['shipping', 'delivery', 'ship', 'deliver', 'how long', 'delivery time'],
    answer: '🚚 **Shipping Information**\n\n• **Standard Delivery**: 3-5 business days\n• **Express Delivery**: 1-2 business days\n• **Free Shipping**: On orders over ₹999\n• **Delivery Areas**: All across India\n\nTrack your order in your Dashboard under "Orders".'
  },
  returns: {
    keywords: ['return', 'refund', 'exchange', 'cancel', 'money back'],
    answer: '🔄 **Returns & Refunds**\n\n• **Return Window**: 7 days from delivery\n• **Condition**: Items must be unworn with tags\n• **Refund Method**: Original payment method\n• **Processing Time**: 5-7 business days\n\nTo initiate a return, go to your Dashboard → Orders → Request Return.'
  },
  payment: {
    keywords: ['payment', 'pay', 'upi', 'card', 'cod', 'cash', 'razorpay'],
    answer: '💳 **Payment Options**\n\n• **UPI**: Google Pay, PhonePe, Paytm\n• **Cards**: Credit/Debit cards accepted\n• **Net Banking**: All major banks\n• **COD**: Cash on Delivery available\n\nAll transactions are secured via Razorpay with 256-bit encryption.'
  },
  size: {
    keywords: ['size', 'fit', 'sizing', 'measurement', 'chart', 'large', 'small'],
    answer: '📏 **Size Guide**\n\nOur sizes run **true to size**. If you\'re between sizes, we recommend sizing up for a relaxed streetwear fit.\n\nEach product page has a detailed size chart. Measure your best-fitting garment and compare!'
  },
  order: {
    keywords: ['order', 'track', 'status', 'where is', 'delayed', 'package'],
    answer: '📦 **Order Tracking**\n\nTrack your orders in real-time:\n1. Go to **Dashboard** → **Orders**\n2. Click on any order for details\n3. View current status: Pending → Confirmed → Packed → Shipped → Delivered\n\nYou\'ll also receive SMS/email updates!'
  },
  products: {
    keywords: ['product', 'shop', 'buy', 'clothes', 'tshirt', 'hoodie', 'collection'],
    answer: '🛍️ **Shopping at CoZeo**\n\nBrowse our collections:\n• **Streetwear Essentials**: T-shirts, hoodies, joggers\n• **New Drops**: Fresh arrivals every week\n• **Featured Collection**: Curated best-sellers\n• **Sale Items**: Up to 50% off\n\nVisit /shop to explore all products!'
  },
  account: {
    keywords: ['account', 'login', 'sign up', 'register', 'profile', 'password', 'forgot'],
    answer: '👤 **Account Help**\n\n• **Sign Up**: Use email or Google OAuth\n• **Login**: Click the profile icon top-right\n• **Password Reset**: Available on login page\n• **Profile**: Update details in Dashboard\n\nHaving trouble? Contact us at cozeo.enterprise@gmail.com'
  },
  giveaway: {
    keywords: ['giveaway', 'contest', 'win', 'free', 'prize', 'lucky draw'],
    answer: '🎁 **Giveaways**\n\nWe run exciting giveaways monthly!\n• Follow us on Instagram @cozeowear.shop\n• Visit /giveaway to participate\n• Winners announced on Instagram Stories\n• Free merch and discount codes up for grabs!'
  },
  contact: {
    keywords: ['contact', 'support', 'help', 'email', 'call', 'phone', 'reach'],
    answer: '📞 **Contact CoZeo**\n\n• **Email**: cozeo.enterprise@gmail.com\n• **Instagram**: @cozeowear.shop\n• **Response Time**: Within 24 hours\n• **Business Hours**: Mon-Sat, 10 AM - 7 PM\n\nFor urgent issues, use this chat anytime!'
  }
};

// Quick action buttons
const QUICK_ACTIONS = [
  { id: 'shipping', icon: Truck, label: 'Shipping' },
  { id: 'returns', icon: RotateCcw, label: 'Returns' },
  { id: 'payment', icon: CreditCard, label: 'Payment' },
  { id: 'products', icon: ShoppingBag, label: 'Shop' },
];

function getFAQResponse(userMessage) {
  const lowerMsg = userMessage.toLowerCase();
  
  for (const [category, data] of Object.entries(FAQ_DATA)) {
    if (data.keywords.some(keyword => lowerMsg.includes(keyword))) {
      return data.answer;
    }
  }
  
  return null;
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  
  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-bubble">
        <div className="message-content">
          {msg.content.split('\n').map((line, i) => (
            <p key={i} className={line.startsWith('•') || line.startsWith('📦') || line.startsWith('🚚') || line.startsWith('🔄') || line.startsWith('💳') || line.startsWith('📏') || line.startsWith('🎁') || line.startsWith('📞') || line.startsWith('👤') || line.startsWith('🛍️') ? 'faq-line' : ''}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hey! Welcome to CoZeo 👋\n\nI\'m your AI assistant. Ask me about:\n• Orders & Shipping\n• Returns & Refunds\n• Products & Sizing\n• Payments\n• Or anything else!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const quickActionsRef = useRef(null);

  // Scroll quick actions left/right
  const scrollQuickActions = (direction) => {
    if (quickActionsRef.current) {
      const scrollAmount = 150;
      quickActionsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      // Prevent body scroll when chat is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when chat is closed
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Show tooltip after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowTooltip(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Prevent scroll propagation from chat to body
  const handleWheel = useCallback((e) => {
    if (isOpen) {
      e.stopPropagation();
    }
    }, [isOpen]);

  useEffect(() => {
    document.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen, handleWheel]);

  const handleQuickAction = (actionId) => {
    const faq = FAQ_DATA[actionId];
    if (faq) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: faq.answer, timestamp: new Date() }]);
        setIsTyping(false);
      }, 600);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
    setIsTyping(true);

    // Get FAQ response
    const faqResponse = getFAQResponse(userMsg);

    setTimeout(() => {
      if (faqResponse) {
        setMessages(prev => [...prev, { role: 'assistant', content: faqResponse, timestamp: new Date() }]);
      } else {
        // Generic response with suggestions
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'I\'m not sure I understand. Try asking about:\n\n📦 **Orders & Tracking**\n🚚 **Shipping & Delivery**\n🔄 **Returns & Refunds**\n💳 **Payment Options**\n📏 **Size Guide**\n🛍️ **Our Products**\n\nOr type a specific question!',
          timestamp: new Date()
        }]);
      }
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-widget-wrapper">
      {isOpen && (
        <div className="chat-window-modern">
          {/* Header */}
          <div className="chat-header-modern">
            <div className="chat-header-left">
              <div className="chat-avatar-modern">
                <Sparkles size={20} />
              </div>
              <div className="chat-header-info">
                <h4 className="chat-title-modern">CoZeo Assistant</h4>
                <span className="chat-status-modern">
                  <span className="status-dot-online"></span>
                  Online
                </span>
              </div>
            </div>
            <button className="chat-close-btn-modern" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div 
            className="chat-messages-modern"
            onWheel={(e) => {
              const el = e.currentTarget;
              const isAtTop = el.scrollTop <= 0;
              const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
              
              if (e.deltaY < 0 && !isAtTop) {
                el.scrollTop -= Math.abs(e.deltaY);
              } else if (e.deltaY > 0 && !isAtBottom) {
                el.scrollTop += Math.abs(e.deltaY);
              }
            }}
          >
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} msg={msg} />
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions with Arrows */}
          <div className="quick-actions-wrapper">
            <button 
              className="quick-action-arrow left"
              onClick={() => scrollQuickActions('left')}
            >
              <ChevronLeft size={16} />
            </button>
            
            <div 
              ref={quickActionsRef}
              className="quick-actions"
            >
              {QUICK_ACTIONS.map(action => (
                <button 
                  key={action.id} 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction(action.id)}
                >
                  <action.icon size={14} />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
            
            <button 
              className="quick-action-arrow right"
              onClick={() => scrollQuickActions('right')}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Input Area */}
          <div className="chat-input-modern">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                className="send-btn-modern" 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <div className="chat-toggle-wrapper">
        {showTooltip && !isOpen && (
          <div className="chat-tooltip" onClick={() => setShowTooltip(false)}>
            <span>Need help? 💬</span>
            <button className="tooltip-close" onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}>×</button>
          </div>
        )}
        <button
          className={`chat-toggle-btn-modern ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      </div>
    </div>
  );
}
