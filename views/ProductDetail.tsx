
import React, { useState, useEffect, useRef } from 'react';
import { Product, Review, ChatMessage, StoreProfile } from '../types';
import { ArrowLeft, Star, Send, User, ShoppingCart, MessageCircle, MessageSquare, ShieldCheck, ShieldAlert } from 'lucide-react';
import { getReviews, addReview, getStoreReputation, ReputationResult } from '../services/storageService';
import { answerProductQuestion } from '../services/geminiService';

interface ProductDetailProps {
  product: Product;
  store: StoreProfile;
  onBack: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, store, onBack }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'reviews'>('chat');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reputation, setReputation] = useState<ReputationResult>({ rating: 0, count: 0, status: 'NEUTRAL' });
  
  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ author: '', rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: `¡Hola! Soy el asistente virtual de ${store.name}. ¿Tienes alguna duda sobre ${product.name}?`, timestamp: Date.now() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReviews(getReviews(product.id));
    setReputation(getStoreReputation(store.id));
  }, [product.id, store.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    const review: Review = {
      id: Date.now().toString(),
      productId: product.id,
      author: newReview.author || 'Anónimo',
      rating: newReview.rating,
      comment: newReview.comment,
      date: Date.now()
    };
    addReview(review);
    setReviews(prev => [review, ...prev]); // Optimistic update
    
    // Update reputation locally for immediate feedback if needed, though normally calculated on load
    
    setNewReview({ author: '', rating: 5, comment: '' });
    setShowReviewForm(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: chatInput, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    const aiResponseText = await answerProductQuestion(product, userMsg.text, store.name);
    
    const aiMsg: ChatMessage = { role: 'ai', text: aiResponseText, timestamp: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const currencySymbol = product.currency === 'NIO' ? 'C$' : '$';
  const images = product.images && product.images.length > 0 ? product.images : [];

  return (
    <div className="max-w-6xl mx-auto p-6 h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="flex items-center text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al catálogo
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex-1 flex flex-col lg:flex-row">
        {/* Left Column: Product Info & Gallery */}
        <div className="lg:w-1/2 p-8 border-b lg:border-b-0 lg:border-r border-gray-100 overflow-y-auto no-scrollbar">
          
          {/* Main Image */}
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4 relative shadow-inner group">
            {images.length > 0 ? (
              <img 
                src={images[selectedImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ShoppingCart className="w-24 h-24" />
              </div>
            )}
             <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                {product.size}
             </div>
          </div>

          {/* Gallery Thumbnails */}
          {images.length > 1 && (
             <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                {images.map((img, idx) => (
                   <button 
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImageIndex === idx ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-100 opacity-70 hover:opacity-100'}`}
                   >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                   </button>
                ))}
             </div>
          )}
          
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold tracking-wide uppercase">
                {product.brand}
            </span>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-gray-500 text-sm">{product.category}</span>
            
            {/* Seller Reputation Snippet */}
            <span className="text-gray-400 text-sm">•</span>
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
               {reputation.status === 'SCAM_ALERT' ? (
                  <ShieldAlert className="w-3 h-3 text-red-500" />
               ) : (
                  <ShieldCheck className={`w-3 h-3 ${reputation.status === 'EXCELLENT' ? 'text-green-500' : 'text-gray-400'}`} />
               )}
               <span className={`text-xs font-bold ${reputation.status === 'SCAM_ALERT' ? 'text-red-600' : 'text-gray-600'}`}>
                  {store.name}
               </span>
               {reputation.rating > 0 && (
                 <span className="text-xs text-gray-500 flex items-center ml-1">
                   {reputation.rating.toFixed(1)} <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 ml-0.5" />
                 </span>
               )}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-gray-600 leading-relaxed mb-6 text-lg">{product.description}</p>
          
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <span className="text-3xl font-bold text-gray-900">{currencySymbol}{product.price.toFixed(2)}</span>
            <button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-transform active:scale-95 shadow-lg shadow-gray-200">
              Comprar Ahora
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Area */}
        <div className="lg:w-1/2 flex flex-col bg-gray-50/50">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${activeTab === 'chat' ? 'border-primary text-primary bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <MessageCircle className="w-4 h-4" />
              Chat con Vendedor
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-secondary text-secondary bg-pink-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Star className="w-4 h-4" />
              Referencias ({reviews.length})
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {/* CHAT VIEW */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-primary text-white rounded-br-none' 
                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <span className={`text-[10px] mt-1 block opacity-70 ${msg.role === 'user' ? 'text-indigo-100' : 'text-gray-400'}`}>
                            {msg.role === 'ai' ? 'Asistente Virtual' : 'Tú'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-4 bg-white border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="relative flex items-center">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Pregunta sobre tallas, envíos, material..."
                      className="w-full pl-4 pr-12 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-primary focus:ring-0 rounded-xl transition-all outline-none text-sm"
                    />
                    <button 
                      type="submit"
                      disabled={!chatInput.trim() || isTyping}
                      className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* REVIEWS VIEW */}
            {activeTab === 'reviews' && (
              <div className="h-full flex flex-col overflow-y-auto p-6">
                {!showReviewForm ? (
                   <button 
                     onClick={() => setShowReviewForm(true)}
                     className="w-full mb-6 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-secondary/30 text-secondary rounded-xl hover:bg-pink-50 transition-colors font-medium"
                   >
                     <MessageSquare className="w-4 h-4" />
                     Escribir una referencia
                   </button>
                ) : (
                  <form onSubmit={handleSubmitReview} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-gray-800 mb-3">Nueva Referencia</h3>
                    <div className="mb-3">
                      <label className="block text-xs text-gray-500 mb-1">Calificación</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star}
                            type="button" 
                            onClick={() => setNewReview({...newReview, rating: star})}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star className={`w-6 h-6 ${star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <input 
                      type="text"
                      placeholder="Tu nombre (Opcional)"
                      className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-secondary"
                      value={newReview.author}
                      onChange={e => setNewReview({...newReview, author: e.target.value})}
                    />
                    <textarea 
                      placeholder="¿Qué te pareció el producto?"
                      required
                      rows={3}
                      className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-secondary resize-none"
                      value={newReview.comment}
                      onChange={e => setNewReview({...newReview, comment: e.target.value})}
                    />
                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-1.5 text-sm bg-secondary text-white rounded-lg hover:bg-pink-600 shadow-md shadow-pink-200"
                      >
                        Publicar
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <Star className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>Aún no hay referencias para este producto.</p>
                    </div>
                  ) : (
                    reviews.map(review => (
                      <div key={review.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center text-secondary font-bold text-xs">
                              {review.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{review.author}</p>
                              <div className="flex">{renderStars(review.rating)}</div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm pl-10">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
