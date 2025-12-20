'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Building2, Settings, Users, MoreVertical, Trash2, Edit } from 'lucide-react';
import { useBusinessStore } from '@/store';
import { businessService } from '@/services/business';
import { BusinessSummary } from '@/types';
import toast from 'react-hot-toast';

export default function BusinessesPage() {
  const { businesses, setBusinesses, setCurrentBusiness } = useBusinessStore();
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessSummary | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setIsLoading(true);
        const data = await businessService.getBusinesses();
        setBusinesses(data);
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
        toast.error('Failed to load businesses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, [setBusinesses]);

  const handleDelete = async () => {
    if (!selectedBusiness) return;

    try {
      await businessService.deleteBusiness(selectedBusiness.id);
      setBusinesses(businesses.filter(b => b.id !== selectedBusiness.id));
      toast.success('Business deleted successfully');
      setDeleteModalOpen(false);
      setSelectedBusiness(null);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete business';
      toast.error(message);
    }
  };

  const handleSelect = (business: BusinessSummary) => {
    setCurrentBusiness(business);
    toast.success(`Switched to ${business.name}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Businesses</h1>
          <p className="text-gray-500">Manage your businesses and organizations</p>
        </div>
        <Link href="/dashboard/businesses/new" className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Business
        </Link>
      </div>

      {/* Business Grid */}
      {businesses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first business</p>
          <Link href="/dashboard/businesses/new" className="btn-primary inline-flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Business
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <div
              key={business.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{business.currency} • {business.userRole}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === business.id ? null : business.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {openMenuId === business.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                        <Link
                          href={`/dashboard/businesses/${business.id}/edit`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setOpenMenuId(null)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                        <Link
                          href={`/dashboard/businesses/${business.id}/staff`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setOpenMenuId(null)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Manage Staff
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedBusiness(business);
                            setDeleteModalOpen(true);
                            setOpenMenuId(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Role: <span className="font-medium text-gray-600">{business.userRole}</span>
                  </span>
                  <button
                    onClick={() => handleSelect(business)}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Business</h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete <strong>{selectedBusiness?.name}</strong>? 
              This action cannot be undone and will delete all associated data.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedBusiness(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
