'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T1K</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Token1000</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-blue-500 transition-colors">
              首页
            </Link>
            <Link href="/zhan" className="text-gray-600 hover:text-blue-500 transition-colors">
              中转站
            </Link>
            <Link href="/jiage" className="text-gray-600 hover:text-blue-500 transition-colors">
              价格对比
            </Link>
            <Link href="/bikeng" className="text-red-600 hover:text-red-700 transition-colors font-medium">
              避坑专区
            </Link>
            <Link href="/guides" className="text-gray-600 hover:text-blue-500 transition-colors">
              教程
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-blue-500 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-3">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-blue-500 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                首页
              </Link>
              <Link 
                href="/zhan" 
                className="text-gray-600 hover:text-blue-500 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                中转站
              </Link>
              <Link 
                href="/jiage" 
                className="text-gray-600 hover:text-blue-500 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                价格对比
              </Link>
              <Link 
                href="/bikeng" 
                className="text-red-600 hover:text-red-700 transition-colors py-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                避坑专区 🚨
              </Link>
              <Link 
                href="/guides" 
                className="text-gray-600 hover:text-blue-500 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                教程
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
