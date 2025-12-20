'use client';

import { useEffect, useState } from 'react';
import { Plus, Users, Mail, Phone, Shield, Trash2, X, UserPlus } from 'lucide-react';
import { useBusinessStore } from '@/store';
import { staffService } from '@/services/staff';
import { Staff } from '@/types';
import toast from 'react-hot-toast';

const roles = [
  { value: 'Owner', label: 'Owner', description: 'Full access to all features' },
  { value: 'Accountant', label: 'Accountant', description: 'Can manage transactions and view reports' },
  { value: 'Viewer', label: 'Viewer', description: 'Can only view data, no edit access' },
];

export default function StaffPage() {
  const { currentBusiness } = useBusinessStore();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  
  const [inviteForm, setInviteForm] = useState<{ 
    email: string; 
    phoneNumber: string;
    firstName: string;
    lastName: string;
    role: 'Accountant' | 'Viewer';
    canDeleteEntries: boolean;
  }>({
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    role: 'Accountant',
    canDeleteEntries: false,
  });

  useEffect(() => {
    if (currentBusiness) {
      fetchStaff();
    }
  }, [currentBusiness]);

  const fetchStaff = async () => {
    if (!currentBusiness) return;

    try {
      setIsLoading(true);
      const data = await staffService.getStaff(currentBusiness.id);
      setStaff(data.items);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      toast.error('Failed to load staff members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBusiness) return;

    if (!inviteForm.email && !inviteForm.phoneNumber) {
      toast.error('Email or Phone number is required');
      return;
    }

    if (inviteForm.email && !/\S+@\S+\.\S+/.test(inviteForm.email)) {
      toast.error('Please enter a valid email');
      return;
    }

    if (inviteForm.phoneNumber && !/^[6-9]\d{9}$/.test(inviteForm.phoneNumber.replace(/\D/g, '').slice(-10))) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      await staffService.inviteStaff(currentBusiness.id, {
        email: inviteForm.email || undefined,
        phoneNumber: inviteForm.phoneNumber || undefined,
        firstName: inviteForm.firstName || undefined,
        lastName: inviteForm.lastName || undefined,
        role: inviteForm.role,
        canDeleteEntries: inviteForm.canDeleteEntries,
      });
      toast.success('Staff member added successfully!');
      setInviteModalOpen(false);
      setInviteForm({ email: '', phoneNumber: '', firstName: '', lastName: '', role: 'Accountant', canDeleteEntries: false });
      fetchStaff();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add staff member';
      toast.error(message);
    }
  };

  const handleRemoveStaff = async () => {
    if (!currentBusiness || !selectedStaff) return;

    try {
      await staffService.removeStaff(currentBusiness.id, selectedStaff.id);
      toast.success('Staff member removed successfully');
      setDeleteModalOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove staff member';
      toast.error(message);
    }
  };

  const handleUpdateRole = async (staffMember: Staff, newRole: 'Accountant' | 'Viewer') => {
    if (!currentBusiness) return;

    try {
      await staffService.updateStaffRole(currentBusiness.id, staffMember.id, newRole);
      toast.success('Role updated successfully');
      fetchStaff();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update role';
      toast.error(message);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Owner':
        return 'bg-purple-100 text-purple-800';
      case 'Accountant':
        return 'bg-blue-100 text-blue-800';
      case 'Viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Please select a business to manage staff</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-sm text-gray-500">Manage team members for {currentBusiness.name}</p>
        </div>
        <button
          onClick={() => setInviteModalOpen(true)}
          className="btn-primary flex items-center justify-center sm:justify-start"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Team Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{staff.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{staff.filter(s => s.isActive).length}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{staff.filter(s => s.role === 'Owner').length}</p>
              <p className="text-xs text-gray-500">Owners</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-500 mb-4 text-sm">Add team members to collaborate on this business</p>
            <button
              onClick={() => setInviteModalOpen(true)}
              className="btn-primary inline-flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Team Member
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-gray-200">
              {staff.map((member) => {
                const displayName = member.fullName || 
                  (member.firstName ? `${member.firstName} ${member.lastName || ''}`.trim() : null) || 
                  'Pending User';
                const initial = displayName !== 'Pending User' 
                  ? displayName.charAt(0).toUpperCase() 
                  : (member.phoneNumber?.slice(-2) || member.email.charAt(0).toUpperCase());
                
                return (
                  <div key={member.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-700 font-semibold text-lg">
                            {initial}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {displayName}
                          </div>
                          <div className="text-sm text-gray-500 space-y-0.5">
                            {!member.email.endsWith('@temp.local') && (
                              <div className="flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{member.email}</span>
                              </div>
                            )}
                            {member.phoneNumber && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                +91 {member.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {member.role !== 'Owner' && (
                        <button
                          onClick={() => {
                            setSelectedStaff(member);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                          <Shield className="h-3 w-3 mr-1" />
                          {member.role}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          member.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {member.isActive ? 'Active' : 'Pending'}
                        </span>
                        {member.role !== 'Owner' && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            member.canDeleteEntries ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <Trash2 className="h-3 w-3 mr-1" />
                            {member.canDeleteEntries ? 'Can Delete' : 'No Delete'}
                          </span>
                        )}
                      </div>
                      {member.role !== 'Owner' && (
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member, e.target.value as 'Accountant' | 'Viewer')}
                          className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="Accountant">Accountant</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      )}
                    </div>
                    {/* Delete Permission Toggle for Non-Owners */}
                    {member.role !== 'Owner' && (
                      <div className="mt-2 flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                        <span className="text-xs text-gray-600">Delete Permission</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={member.canDeleteEntries || false}
                            onChange={(e) => {
                              staffService.updateStaffRole(currentBusiness!.id, member.id, member.role as 'Accountant' | 'Viewer', e.target.checked)
                                .then(() => {
                                  toast.success('Permission updated');
                                  fetchStaff();
                                })
                                .catch(() => toast.error('Failed to update permission'));
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <table className="hidden sm:table min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delete Permission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {staff.map((member) => {
                const displayName = member.fullName || 
                  (member.firstName ? `${member.firstName} ${member.lastName || ''}`.trim() : null) || 
                  'Pending';
                const initial = displayName !== 'Pending' 
                  ? displayName.charAt(0).toUpperCase() 
                  : (member.phoneNumber?.slice(-2) || member.email.charAt(0).toUpperCase());
                
                return (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {initial}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {displayName}
                        </div>
                        <div className="text-sm text-gray-500 flex flex-col">
                          {!member.email.endsWith('@temp.local') && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </span>
                          )}
                          {member.phoneNumber && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              +91 {member.phoneNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.role === 'Owner' ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {member.role}
                      </span>
                    ) : (
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member, e.target.value as 'Accountant' | 'Viewer')}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="Accountant">Accountant</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.role === 'Owner' ? (
                      <span className="text-xs text-gray-400">Always allowed</span>
                    ) : (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={member.canDeleteEntries || false}
                          onChange={(e) => {
                            staffService.updateStaffRole(currentBusiness!.id, member.id, member.role as 'Accountant' | 'Viewer', e.target.checked)
                              .then(() => {
                                toast.success('Permission updated');
                                fetchStaff();
                              })
                              .catch(() => toast.error('Failed to update permission'));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                        <span className={`ml-2 text-xs font-medium ${member.canDeleteEntries ? 'text-red-600' : 'text-gray-500'}`}>
                          {member.canDeleteEntries ? 'Allowed' : 'Not allowed'}
                        </span>
                      </label>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {member.isActive ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {member.role !== 'Owner' && (
                      <button
                        onClick={() => {
                          setSelectedStaff(member);
                          setDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
          </>
        )}
      </div>

      {/* Role Descriptions */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {roles.map((role) => (
            <div key={role.value} className="p-3 sm:p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Shield className={`h-4 sm:h-5 w-4 sm:w-5 mr-2 ${
                  role.value === 'Owner' ? 'text-purple-600' :
                  role.value === 'Accountant' ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">{role.label}</h4>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Add Staff Member</h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-4 space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                <p className="text-xs text-gray-500 font-medium">At least one contact method is required</p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">+91</span>
                    <input
                      type="tel"
                      value={inviteForm.phoneNumber}
                      onChange={(e) => setInviteForm({ ...inviteForm, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="colleague@example.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as 'Accountant' | 'Viewer' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Accountant">Accountant</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {roles.find(r => r.value === inviteForm.role)?.description}
                </p>
              </div>

              {/* Permissions */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Entry Delete Permission</span>
                    <p className="text-xs text-gray-500 mt-0.5">Allow this member to delete entries</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={inviteForm.canDeleteEntries}
                      onChange={(e) => setInviteForm({ ...inviteForm, canDeleteEntries: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </div>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove Staff Member</h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to remove <strong>{selectedStaff?.fullName || selectedStaff?.email}</strong>? 
              They will no longer have access to this business.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedStaff(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleRemoveStaff} className="btn-danger">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
