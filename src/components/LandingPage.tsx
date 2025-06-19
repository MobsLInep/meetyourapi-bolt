'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Code2, 
  Zap, 
  Shield, 
  Brain, 
  ArrowRight, 
  CheckCircle, 
  MessageSquare, 
  Ticket, 
  Database, 
  Clock,
  Bell,
  BarChart3,
  Settings,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Domain-Specific Chatbot",
      description: "AI trained specifically for API documentation and support queries"
    },
    {
      icon: <Ticket className="w-8 h-8" />,
      title: "Auto Ticket Escalation",
      description: "Seamlessly escalates complex queries to human support"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "API Knowledge Layer",
      description: "Deep understanding of API endpoints, parameters, and responses"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Context Retention",
      description: "Maintains conversation context for better support experience"
    }
  ];

  const bonusFeatures = [
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Admin Alerts",
      description: "Real-time notifications for support team"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Session Tracking",
      description: "Comprehensive analytics and insights"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Auto-Escalation Timers",
      description: "Smart timing for ticket escalation"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Structured Prompts",
      description: "Optimized AI prompts for better responses"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Ticket Status",
      description: "Real-time status tracking and updates"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "User Query",
      description: "Developer asks a question about API usage or encounters an issue"
    },
    {
      number: "02",
      title: "AI Analysis",
      description: "Chatbot analyzes query against comprehensive API knowledge base"
    },
    {
      number: "03",
      title: "Smart Response",
      description: "Provides instant, accurate answers or escalates to human support"
    },
    {
      number: "04",
      title: "Ticket Creation",
      description: "Automatically generates support ticket if escalation is needed"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transition: 'all 0.3s ease-out'
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-bounce" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 backdrop-blur-sm bg-black/20 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Code2 className="w-8 h-8 text-cyan-400" />
          <span className="text-2xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            MeetYourAPI
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="#features" className="text-gray-300 hover:text-cyan-400 transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-gray-300 hover:text-cyan-400 transition-colors">
            How It Works
          </Link>
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transform hover:-translate-y-1 transition-all duration-300"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transform hover:-translate-y-1 transition-all duration-300"
            >
              Get Started
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Animated Bot Icon */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
            <Brain className="w-16 h-16 text-white animate-bounce" />
          </div>
          <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-xl opacity-50 animate-ping" />
        </div>

        <h1 className="text-6xl md:text-8xl font-mono font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
          MeetYourAPI
        </h1>
        
        <p className="text-2xl md:text-3xl mb-4 text-gray-300 font-light">
          Smart Support. Instant Answers.
        </p>
        
        <p className="text-lg text-gray-400 mb-12 max-w-2xl">
          AI-powered chatbot and support ticketing system built specifically for APIhub users. 
          Get instant answers or seamless escalation to human support.
        </p>

        <div className="flex flex-col sm:flex-row gap-6">
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-in"}
            className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm"
          >
            <span className="flex items-center gap-2">
              Try the Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          
          <Link
            href="#features"
            className="px-8 py-4 border-2 border-cyan-500/50 rounded-xl font-semibold text-lg hover:bg-cyan-500/10 hover:border-cyan-500 transform hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm"
          >
            View Features
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Core Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-cyan-400">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-20 px-6 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mb-4 font-mono font-bold text-xl">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-cyan-400">
                    {step.title}
                  </h3>
                  <p className="text-gray-400">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 transform -translate-x-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bonus Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Bonus Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bonusFeatures.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-400 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-r from-cyan-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-mono font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Ready to Transform Your API Support?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers who trust MeetYourAPI for intelligent support solutions.
          </p>
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-in"}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-2 transition-all duration-300"
          >
            Get Started Now
            <Zap className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/10 bg-black/40">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <Code2 className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                MeetYourAPI
              </span>
            </div>
            
            <div className="flex items-center space-x-8">
              <Link href="#" className="text-gray-400 hover:text-cyan-400 transition-colors font-mono">
                Docs
              </Link>
              <Link href="#" className="text-gray-400 hover:text-cyan-400 transition-colors font-mono">
                About
              </Link>
              <Link href="#" className="text-gray-400 hover:text-cyan-400 transition-colors font-mono">
                Contact
              </Link>
            </div>
            
            <div className="flex items-center space-x-4 mt-6 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <Github className="w-6 h-6" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <Twitter className="w-6 h-6" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <Linkedin className="w-6 h-6" />
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 font-mono text-sm">
              © 2024 MeetYourAPI. Built for developers, by developers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}