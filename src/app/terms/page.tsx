"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <Link href="/" className="text-purple-600 hover:text-purple-700 mb-6 inline-block">← Back to Home</Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">Last updated: December 2024</p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 mb-4">
            By accessing and using CashApp, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
          <p className="text-gray-600 mb-4">
            CashApp is a cash management application designed for businesses to track their cash flow, manage staff permissions, and generate financial reports.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
          <p className="text-gray-600 mb-4">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. User Responsibilities</h2>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Provide accurate and complete information</li>
            <li>Keep your login credentials secure</li>
            <li>Use the service only for lawful purposes</li>
            <li>Not attempt to gain unauthorized access</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Data Security</h2>
          <p className="text-gray-600 mb-4">
            We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Limitation of Liability</h2>
          <p className="text-gray-600 mb-4">
            CashApp shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Changes to Terms</h2>
          <p className="text-gray-600 mb-4">
            We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Contact</h2>
          <p className="text-gray-600 mb-4">
            For questions about these Terms of Service, please contact us at support@cashapp.com
          </p>
        </div>
      </div>
    </main>
  );
}
