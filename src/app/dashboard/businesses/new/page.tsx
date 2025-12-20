'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useBusinessStore } from '@/store';
import { businessService } from '@/services/business';
import toast from 'react-hot-toast';

const businessTypes = [
  { value: 'retail', label: 'Retail Store' },
  { value: 'restaurant', label: 'Restaurant / Food Service' },
  { value: 'service', label: 'Service Business' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];

export default function NewBusinessPage() {
  const router = useRouter();
  const { setBusinesses, setCurrentBusiness, businesses } = useBusinessStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    phone: '',
    email: '',
    gstNumber: '',
    panNumber: '',
    currency: 'INR',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Please select a business type';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Map form data to backend API format
      const apiData = {
        name: formData.name,
        description: formData.type ? `Business Type: ${businessTypes.find(t => t.value === formData.type)?.label || formData.type}` : undefined,
        address: formData.address || undefined,
        phoneNumber: formData.phone || undefined,
        email: formData.email || undefined,
        taxId: formData.gstNumber || formData.panNumber || undefined,
        currency: formData.currency,
      };
      const newBusiness = await businessService.createBusiness(apiData);
      setBusinesses([...businesses, newBusiness]);
      setCurrentBusiness(newBusiness);
      toast.success('Business created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create business';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/businesses"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Businesses
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Business</h1>
        <p className="text-gray-500">Add a new business to manage your cash flow</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="My Business"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Business Type */}
          <div className="md:col-span-2">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Business Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a type</option>
              {businessTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              id="address"
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="123 Business Street, City, State"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="+91 9876543210"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="business@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* GST Number */}
          <div>
            <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700">
              GST Number
            </label>
            <input
              id="gstNumber"
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="22AAAAA0000A1Z5"
            />
          </div>

          {/* PAN Number */}
          <div>
            <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700">
              PAN Number
            </label>
            <input
              id="panNumber"
              type="text"
              value={formData.panNumber}
              onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="AAAAA0000A"
            />
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Link href="/dashboard/businesses" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={isLoading} className="btn-primary flex items-center">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Business'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
