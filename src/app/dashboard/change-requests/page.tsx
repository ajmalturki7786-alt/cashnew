'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ClipboardList,
  Check,
  X,
  Clock,
  ChevronDown,
  AlertCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import { changeRequestService } from '@/services/changeRequest.service';
import { ChangeRequest, ChangeRequestSummary } from '@/types';
import { useBusinessStore } from '@/store';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';

export default function ChangeRequestsPage() {
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [summary, setSummary] = useState<ChangeRequestSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('Pending');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const { currentBusiness } = useBusinessStore();

  useEffect(() => {
    if (currentBusiness?.id) {
      fetchRequests();
      fetchSummary();
    }
  }, [currentBusiness?.id, statusFilter]);

  useEffect(() => {
    const requestId = searchParams.get('id');
    if (requestId && currentBusiness?.id) {
      fetchRequestDetails(requestId);
    }
  }, [searchParams, currentBusiness?.id]);

  const fetchRequests = async () => {
    if (!currentBusiness?.id) return;
    try {
      setLoading(true);
      const data = await changeRequestService.getChangeRequests(currentBusiness.id, {
        page: 1,
        pageSize: 50,
        status: statusFilter || undefined,
      });
      setRequests(data.items || []);
    } catch (error) {
      console.error('Error fetching change requests:', error);
      toast.error('Failed to load change requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    if (!currentBusiness?.id) return;
    try {
      const data = await changeRequestService.getChangeRequestSummary(currentBusiness.id);
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchRequestDetails = async (requestId: string) => {
    if (!currentBusiness?.id) return;
    try {
      const data = await changeRequestService.getChangeRequest(currentBusiness.id, requestId);
      setSelectedRequest(data);
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  const handleReview = async (approve: boolean) => {
    if (!currentBusiness?.id || !selectedRequest) return;
    
    try {
      setReviewLoading(true);
      await changeRequestService.reviewChangeRequest(
        currentBusiness.id,
        selectedRequest.id,
        { approve, reviewNotes: reviewNotes || undefined }
      );
      
      toast.success(approve ? 'Request approved successfully' : 'Request rejected');
      setSelectedRequest(null);
      setReviewNotes('');
      fetchRequests();
      fetchSummary();
    } catch (error) {
      console.error('Error reviewing request:', error);
      toast.error('Failed to process request');
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <Check className="w-3 h-3" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <X className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'Update':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'Delete':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      default:
        return <ClipboardList className="w-4 h-4 text-gray-600" />;
    }
  };

  const parseChanges = (proposedChanges?: string, originalData?: string) => {
    try {
      const proposed = proposedChanges ? JSON.parse(proposedChanges) : null;
      const original = originalData ? JSON.parse(originalData) : null;
      return { proposed, original };
    } catch {
      return { proposed: null, original: null };
    }
  };

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Please select a business first</p>
      </div>
    );
  }

  const isOwner = currentBusiness.userRole === 'Owner';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Change Requests</h1>
        <p className="text-gray-500 mt-1">
          {isOwner 
            ? 'Review and approve or reject change requests from your team'
            : 'View the status of your change requests'}
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary.pendingCount}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary.approvedCount}</p>
                <p className="text-sm text-gray-500">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary.rejectedCount}</p>
                <p className="text-sm text-gray-500">Rejected</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary.totalCount}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          {['', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status || 'all'}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <ClipboardList className="w-12 h-12 mb-4 text-gray-300" />
            <p>No change requests found</p>
          </div>
        ) : (
          <div className="divide-y">
            {requests.map((request) => (
              <div
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getRequestTypeIcon(request.requestType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">
                          {request.requestType} Request
                        </span>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Entry: ₹{request.entryAmount?.toLocaleString('en-IN')} - {request.entryType}
                        {request.entryDescription && ` (${request.entryDescription})`}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        By {request.requestedByUserName} • {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedRequest.requestType} Request Details
                </h2>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setReviewNotes('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                {getStatusBadge(selectedRequest.status)}
              </div>

              {/* Entry Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Entry Details</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Amount:</span> ₹{selectedRequest.entryAmount?.toLocaleString('en-IN')}</p>
                  <p><span className="text-gray-500">Type:</span> {selectedRequest.entryType}</p>
                  <p><span className="text-gray-500">Description:</span> {selectedRequest.entryDescription || '-'}</p>
                  {selectedRequest.entryDate && (
                    <p><span className="text-gray-500">Date:</span> {format(new Date(selectedRequest.entryDate), 'dd MMM yyyy')}</p>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Reason for Change</h3>
                <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  {selectedRequest.reason}
                </p>
              </div>

              {/* Proposed Changes (for Update requests) */}
              {selectedRequest.requestType === 'Update' && selectedRequest.proposedChanges && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Proposed Changes</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    {(() => {
                      const { proposed, original } = parseChanges(selectedRequest.proposedChanges, selectedRequest.originalData);
                      if (!proposed) return <p className="text-sm text-gray-500">No changes specified</p>;
                      
                      return (
                        <div className="space-y-1 text-sm">
                          {proposed.Amount && proposed.Amount !== original?.Amount && (
                            <p>
                              <span className="text-gray-500">Amount:</span>{' '}
                              <span className="line-through text-red-500">₹{original?.Amount?.toLocaleString('en-IN')}</span>
                              {' → '}
                              <span className="text-green-600 font-medium">₹{proposed.Amount.toLocaleString('en-IN')}</span>
                            </p>
                          )}
                          {proposed.Description && proposed.Description !== original?.Description && (
                            <p>
                              <span className="text-gray-500">Description:</span>{' '}
                              <span className="line-through text-red-500">{original?.Description || '-'}</span>
                              {' → '}
                              <span className="text-green-600 font-medium">{proposed.Description}</span>
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Requester Info */}
              <div className="text-sm text-gray-500">
                <p>Requested by: <span className="text-gray-700">{selectedRequest.requestedByUserName}</span></p>
                <p>Requested on: {format(new Date(selectedRequest.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
              </div>

              {/* Review Notes (if already reviewed) */}
              {selectedRequest.status !== 'Pending' && selectedRequest.reviewNotes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Review Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    {selectedRequest.reviewNotes}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Reviewed by {selectedRequest.reviewedByUserName} on {format(new Date(selectedRequest.reviewedAt!), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              )}

              {/* Review Actions (for owners on pending requests) */}
              {isOwner && selectedRequest.status === 'Pending' && (
                <div className="pt-4 border-t space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Review Notes (optional)
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add any notes for the requester..."
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReview(false)}
                      disabled={reviewLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleReview(true)}
                      disabled={reviewLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
