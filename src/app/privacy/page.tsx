"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <Link href="/" className="text-purple-600 hover:text-purple-700 mb-6 inline-block">← Back to Home</Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">Last updated: December 2024</p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-gray-600 mb-4">
            We collect information you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Account information (name, email, phone number)</li>
            <li>Business information (business name, type)</li>
            <li>Transaction data you enter into the app</li>
            <li>Usage data and analytics</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-600 mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Provide and maintain our service</li>
            <li>Process your transactions</li>
            <li>Send you important notifications</li>
            <li>Improve our service</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Data Security</h2>
          <p className="text-gray-600 mb-4">
            We implement bank-grade security measures including encryption, secure servers, and regular security audits to protect your data.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Sharing</h2>
          <p className="text-gray-600 mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties. Your business data remains completely private.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Data Retention</h2>
          <p className="text-gray-600 mb-4">
            We retain your data as long as your account is active. You can request deletion of your data at any time by contacting us.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Your Rights</h2>
          <p className="text-gray-600 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Cookies</h2>
          <p className="text-gray-600 mb-4">
            We use cookies and similar technologies to maintain your session and improve your experience. You can control cookies through your browser settings.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Changes to This Policy</h2>
          <p className="text-gray-600 mb-4">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about this Privacy Policy, please contact us at privacy@cashapp.com
          </p>
        </div>
      </div>
    </main>
  );
}
