import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Calendar, Mail, Check } from 'lucide-react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const targetDate = new Date('2026-02-26T00:00:00');
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://countdown-ny-production.up.railway.app/api/subscribe', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          targetDate: '2026-02-26' 
        })
      });
      
      if (!response.ok) throw new Error('Subscription failed');
      
      setIsSubscribed(true);
      localStorage.setItem('countdown_subscribed', 'true');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  useEffect(() => {
    // Check if already subscribed
    const subscribed = localStorage.getItem('countdown_subscribed');
    if (subscribed) {
      setIsSubscribed(true);
    }
  }, []);
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate - now;
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const TimeBlock = ({ value, label }) => (
    <div className="flex flex-col items-center bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
      <div className="text-6xl font-bold text-white mb-2 font-mono">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-sm uppercase tracking-wider text-gray-300 font-semibold">
        {label}
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg mb-6">
            NYC Visit
          </h1>
          
          <div className="flex items-center justify-center gap-2 text-gray-300 text-xl md:text-2xl mb-2">
            <MapPin className="w-6 h-6" />
            <span className="font-light">Delhi → NYC</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-gray-400 text-lg">
            <Calendar className="w-5 h-5" />
            <span>February 26, 2026</span>
          </div>
        </div>
        
        {/* Countdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <TimeBlock value={timeLeft.days} label="Days" />
          <TimeBlock value={timeLeft.hours} label="Hours" />
          <TimeBlock value={timeLeft.minutes} label="Minutes" />
          <TimeBlock value={timeLeft.seconds} label="Seconds" />
        </div>
        
        {/* Message */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 text-center shadow-xl">
          {timeLeft.days > 0 ? (
            isSubscribed ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-6 h-6" />
                  <span className="text-xl font-semibold">You're subscribed!</span>
                </div>
                <p className="text-gray-300">
                  You'll receive daily countdown reminders until Feb 26
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xl text-white mb-4">Get daily countdown reminders</p>
                <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-400 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              </div>
            )
          ) : (
            <p className="text-3xl md:text-4xl text-white font-light">
              Welcome to NYC! 🗽
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
