"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-20 py-5 bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-xl shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="font-black text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">CashApp</span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <Link href="#features" className="text-gray-700 font-semibold hover:text-purple-600 transition">Features</Link>
          <Link href="#benefits" className="text-gray-700 font-semibold hover:text-purple-600 transition">Benefits</Link>
          <Link href="#pricing" className="text-gray-700 font-semibold hover:text-purple-600 transition">Pricing</Link>
          <Link href="#faq" className="text-gray-700 font-semibold hover:text-purple-600 transition">FAQs</Link>
          <Link href="/auth/login" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-7 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">Login →</Link>
        </div>
        <div className="md:hidden">
          <Link href="/auth/login" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-full font-bold">Login</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-20 py-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 flex flex-col gap-8">
            <div className="inline-block">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">🎉 India's #1 Business Cash Manager</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">Manage Your Business</span>
              <br />
              <span className="text-gray-900">Like Never Before</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              Complete cash management solution with approval workflows, real-time reports, staff permissions, and mobile access. Perfect for retail, services, and growing businesses across India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/auth/login" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-full font-bold text-lg shadow-2xl hover:shadow-purple-300 hover:scale-105 transition-all">Start Free Trial →</Link>
              <a href="#features" className="px-10 py-5 rounded-full border-3 border-purple-600 text-purple-600 font-bold text-lg hover:bg-purple-50 transition flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Watch Demo
              </a>
            </div>
            <div className="flex items-center gap-8 mt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white"></div>)}
                </div>
                <span className="text-sm text-gray-600 font-semibold">1,500+ businesses trust us</span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center relative">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            {/* Dashboard Illustration */}
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl border-4 border-white p-8 w-full max-w-lg">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center text-white">
                  <span className="font-bold">Today&apos;s Balance</span>
                  <span className="text-2xl font-black">₹1,25,000</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">↓</div>
                    <span className="font-semibold text-gray-700">Cash In</span>
                  </div>
                  <span className="text-green-600 font-bold">+₹50,000</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white">↑</div>
                    <span className="font-semibold text-gray-700">Cash Out</span>
                  </div>
                  <span className="text-red-600 font-bold">-₹25,000</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white">⏳</div>
                    <span className="font-semibold text-gray-700">Pending Approval</span>
                  </div>
                  <span className="text-orange-600 font-bold">3</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between">
                <div className="text-center">
                  <div className="text-gray-500 text-sm">This Month</div>
                  <div className="font-bold text-green-600">₹2.5L</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 text-sm">Entries</div>
                  <div className="font-bold text-purple-600">156</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 text-sm">Staff</div>
                  <div className="font-bold text-pink-600">5</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 md:px-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          <div>
            <div className="text-5xl font-black mb-2">1,500+</div>
            <div className="text-purple-100 font-medium">Active Businesses</div>
          </div>
          <div>
            <div className="text-5xl font-black mb-2">50K+</div>
            <div className="text-purple-100 font-medium">Daily Transactions</div>
          </div>
          <div>
            <div className="text-5xl font-black mb-2">99.9%</div>
            <div className="text-purple-100 font-medium">Uptime</div>
          </div>
          <div>
            <div className="text-5xl font-black mb-2">24/7</div>
            <div className="text-purple-100 font-medium">Support</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-bold text-sm uppercase tracking-wider">POWERFUL FEATURES</span>
            <h2 className="text-5xl font-black text-gray-900 mt-4 mb-6">Everything You Need in One Place</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Designed specifically for Indian businesses to manage cash, staff, and approvals effortlessly</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-purple-100 hover:border-purple-300 hover:shadow-2xl transition-all group">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Approval System</h3>
              <p className="text-gray-600 leading-relaxed">Accountants request changes, owners approve with one tap. Every action tracked with complete audit trail and notifications.</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-8 border-2 border-orange-100 hover:border-orange-300 hover:shadow-2xl transition-all group">
              <div className="bg-gradient-to-br from-orange-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Mobile First Design</h3>
              <p className="text-gray-600 leading-relaxed">Lightning fast on any device. Add entries, check reports, and manage business on-the-go from anywhere in India.</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-100 hover:border-blue-300 hover:shadow-2xl transition-all group">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Instant Reports</h3>
              <p className="text-gray-600 leading-relaxed">Real-time cashbook, party ledger, and category reports. Export to Excel and PDF with one click.</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-100 hover:border-green-300 hover:shadow-2xl transition-all group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Bank-Grade Security</h3>
              <p className="text-gray-600 leading-relaxed">Enterprise-level encryption, secure cloud storage, automatic backups. Your business data is always protected.</p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 border-2 border-pink-100 hover:border-pink-300 hover:shadow-2xl transition-all group">
              <div className="bg-gradient-to-br from-pink-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Team Management</h3>
              <p className="text-gray-600 leading-relaxed">Add unlimited staff with custom roles and permissions. Control who can add, edit, delete, or just view entries.</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-2xl transition-all group">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Notifications</h3>
              <p className="text-gray-600 leading-relaxed">Get instant alerts for all activities. Never miss approval requests, new entries, or important updates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-6 md:px-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-bold text-sm uppercase tracking-wider">WHY CASHAPP</span>
            <h2 className="text-5xl font-black text-gray-900 mt-4 mb-6">Built for Indian Businesses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              {/* Approval Flow Illustration */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">AK</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">Amit Kumar</div>
                    <div className="text-sm text-gray-500">Requested edit on Entry #245</div>
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-semibold">Pending</span>
                </div>
                <div className="flex gap-3 justify-end">
                  <button className="px-6 py-2 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition">✓ Approve</button>
                  <button className="px-6 py-2 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition">✗ Reject</button>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="text-sm text-gray-500 mb-2">Recent Approvals</div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700">Entry #244 approved</span>
                    <span className="text-gray-400 ml-auto">2 min ago</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xl">✓</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Control</h3>
                  <p className="text-gray-600">Owners have full visibility and control. Set permissions for each staff member - who can add, edit, or just view.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-gradient-to-br from-orange-500 to-pink-500 text-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xl">✓</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Zero Learning Curve</h3>
                  <p className="text-gray-600">Designed for everyone. Your staff can start using CashApp in minutes without any training.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xl">✓</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Always Available</h3>
                  <p className="text-gray-600">Works on any device, anywhere. Your business data is always accessible and automatically synced.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-purple-600 font-bold text-sm uppercase tracking-wider">PRICING</span>
          <h2 className="text-5xl font-black text-gray-900 mt-4 mb-6">Simple & Transparent</h2>
          <p className="text-xl text-gray-600 mb-12">No hidden charges. No credit card required.</p>
          
          <div className="max-w-lg mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-12 text-white shadow-2xl">
            <div className="text-6xl font-black mb-4">₹0</div>
            <div className="text-2xl font-bold mb-6">Free Forever</div>
            <ul className="space-y-4 text-left mb-8">
              <li className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Unlimited Entries
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Unlimited Staff Members
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Approval Workflow
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                All Reports & Export
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Mobile & Web Access
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                24/7 Support
              </li>
            </ul>
            <Link href="/auth/login" className="block bg-white text-purple-600 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all">Start Using CashApp →</Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 md:px-20 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-300 font-bold text-sm uppercase tracking-wider">SIMPLE PROCESS</span>
            <h2 className="text-5xl font-black mt-4 mb-6">Start in 3 Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border-2 border-white/20 hover:border-purple-300 hover:bg-white/20 transition-all text-center">
              <div className="bg-gradient-to-br from-purple-400 to-pink-400 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-black shadow-xl">1</div>
              <h3 className="text-2xl font-bold mb-4">Sign Up Free</h3>
              <p className="text-purple-100">Create your account in 30 seconds. No credit card needed.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border-2 border-white/20 hover:border-pink-300 hover:bg-white/20 transition-all text-center">
              <div className="bg-gradient-to-br from-orange-400 to-pink-400 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-black shadow-xl">2</div>
              <h3 className="text-2xl font-bold mb-4">Add Your Team</h3>
              <p className="text-purple-100">Invite staff members and set their permissions.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border-2 border-white/20 hover:border-blue-300 hover:bg-white/20 transition-all text-center">
              <div className="bg-gradient-to-br from-blue-400 to-purple-400 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-black shadow-xl">3</div>
              <h3 className="text-2xl font-bold mb-4">Start Managing</h3>
              <p className="text-purple-100">Begin recording transactions and tracking your cash flow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="py-24 px-6 md:px-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-bold text-sm uppercase tracking-wider">TRUSTED BY</span>
            <h2 className="text-5xl font-black text-gray-900 mt-4 mb-6">Perfect for Every Business</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-300">
              <div className="text-5xl mb-4">🏪</div>
              <h3 className="font-bold text-gray-900">Retail Stores</h3>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all border-2 border-transparent hover:border-orange-300">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="font-bold text-gray-900">Restaurants</h3>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300">
              <div className="text-5xl mb-4">🏭</div>
              <h3 className="font-bold text-gray-900">Manufacturing</h3>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all border-2 border-transparent hover:border-green-300">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="font-bold text-gray-900">Logistics</h3>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all border-2 border-transparent hover:border-pink-300">
              <div className="text-5xl mb-4">🏢</div>
              <h3 className="font-bold text-gray-900">Offices</h3>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-300">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="font-bold text-gray-900">Consulting</h3>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-300">
              <div className="text-5xl mb-4">🏗️</div>
              <h3 className="font-bold text-gray-900">Construction</h3>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all border-2 border-transparent hover:border-red-300">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="font-bold text-gray-900">Services</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-bold text-sm uppercase tracking-wider">SUCCESS STORIES</span>
            <h2 className="text-5xl font-black text-gray-900 mt-4 mb-6">Loved by Business Owners</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-purple-100 hover:shadow-2xl transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-500 text-2xl">★</span>)}
              </div>
              <p className="text-gray-700 mb-6 text-lg">"CashApp transformed how we manage our retail store. The approval system saves us from errors!"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">RK</div>
                <div>
                  <div className="font-bold text-gray-900">Rajesh Kumar</div>
                  <div className="text-sm text-gray-500">Retail Business Owner</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-8 border-2 border-orange-100 hover:shadow-2xl transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-500 text-2xl">★</span>)}
              </div>
              <p className="text-gray-700 mb-6 text-lg">"Mobile access means I can check my business from anywhere. Real-time reports are amazing!"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">PS</div>
                <div>
                  <div className="font-bold text-gray-900">Priya Sharma</div>
                  <div className="text-sm text-gray-500">Restaurant Owner</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-100 hover:shadow-2xl transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-500 text-2xl">★</span>)}
              </div>
              <p className="text-gray-700 mb-6 text-lg">"Best cashbook app hands down! Simple interface, powerful features, and completely free!"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">AP</div>
                <div>
                  <div className="font-bold text-gray-900">Amit Patel</div>
                  <div className="text-sm text-gray-500">Construction Business</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 md:px-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-bold text-sm uppercase tracking-wider">HAVE QUESTIONS?</span>
            <h2 className="text-5xl font-black text-gray-900 mt-4 mb-6">Frequently Asked Questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Is CashApp really free?</h3>
              <p className="text-gray-600">Yes! CashApp is 100% free forever. No hidden costs, no premium tiers. All features are available to all users.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border-2 border-orange-100 hover:border-orange-300 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Is my data secure?</h3>
              <p className="text-gray-600">Absolutely. We use bank-grade encryption and security measures to protect your business data. Your information is stored securely and never shared.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Can I use it on mobile?</h3>
              <p className="text-gray-600">Yes! CashApp works perfectly on phones, tablets, and computers. Access your business from anywhere, anytime.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border-2 border-green-100 hover:border-green-300 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How many staff can I add?</h3>
              <p className="text-gray-600">Unlimited! Add as many staff members as you need with customizable permissions for each person.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border-2 border-pink-100 hover:border-pink-300 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Do I need accounting knowledge?</h3>
              <p className="text-gray-600">Not at all! CashApp is designed to be simple and intuitive. If you can use WhatsApp, you can use CashApp.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Can I export my data?</h3>
              <p className="text-gray-600">Yes! Export all your data to Excel or PDF anytime. Your data always belongs to you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 md:px-20 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-6">Ready to Transform Your Business?</h2>
          <p className="text-2xl mb-10 text-purple-100">Join 1,500+ businesses already using CashApp</p>
          <Link href="/auth/login" className="inline-block bg-white text-purple-600 px-12 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all">Start Free Today →</Link>
          <p className="mt-6 text-purple-100">No credit card required • Setup in 30 seconds</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="12" fill="url(#gradient)" />
                  <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="20" cy="20" r="3" fill="white" />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                      <stop stopColor="#9333ea" />
                      <stop offset="1" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-2xl font-black">CashApp</span>
              </div>
              <p className="text-gray-400">Modern cashbook management for Indian businesses.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-purple-400 transition">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-purple-400 transition">Pricing</Link></li>
                <li><Link href="#how-it-works" className="hover:text-purple-400 transition">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-purple-400 transition">About Us</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition">Contact</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-purple-400 transition">Support</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition">Documentation</Link></li>
                <li><Link href="/auth/login" className="hover:text-purple-400 transition">Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CashApp. All rights reserved. Made with ❤️ for Indian businesses.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
