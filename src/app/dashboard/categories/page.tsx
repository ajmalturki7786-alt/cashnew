'use client';

import { useEffect, useState } from 'react';
import { Plus, Tag, Edit, Trash2, X } from 'lucide-react';
import { useBusinessStore } from '@/store';
import { categoryService } from '@/services/category';
import { Category } from '@/types';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const { currentBusiness } = useBusinessStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Income' as 'Income' | 'Expense',
    description: '',
  });

  useEffect(() => {
    if (currentBusiness) {
      fetchCategories();
    }
  }, [currentBusiness]);

  const fetchCategories = async () => {
    if (!currentBusiness) return;

    try {
      setIsLoading(true);
      const data = await categoryService.getCategories(currentBusiness.id);
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBusiness) return;

    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await categoryService.updateCategory(currentBusiness.id, editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoryService.createCategory(currentBusiness.id, formData);
        toast.success('Category created successfully');
      }

      setModalOpen(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save category';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!currentBusiness || !selectedCategory) return;

    try {
      await categoryService.deleteCategory(currentBusiness.id, selectedCategory.id);
      toast.success('Category deleted successfully');
      setDeleteModalOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete category';
      toast.error(message);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    const categoryType = (category.type === 'CashIn' ? 'Income' : category.type === 'CashOut' ? 'Expense' : category.type) as 'Income' | 'Expense';
    setFormData({
      name: category.name,
      type: categoryType,
      description: category.description || '',
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Income',
      description: '',
    });
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'CashIn':
      case 'Income':
        return 'bg-green-100 text-green-800';
      case 'CashOut':
      case 'Expense':
        return 'bg-red-100 text-red-800';
      case 'Both':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Please select a business to manage categories</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500">Manage transaction categories for {currentBusiness.name}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingCategory(null);
            setModalOpen(true);
          }}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-500 mb-4">Create categories to organize your transactions</p>
            <button
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Tag className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeBadgeColor(
                          category.type
                        )}`}
                      >
                        {category.type === 'Both' ? 'Both' : category.type === 'CashIn' ? 'Income' : 'Expense'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1 text-gray-400 hover:text-primary-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {category.description && (
                  <p className="mt-2 text-sm text-gray-500">{category.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingCategory(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Sales, Rent, Utilities"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'Income', label: 'Income' },
                    { value: 'Expense', label: 'Expense' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, type: option.value as typeof formData.type })
                      }
                      className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        formData.type === option.value
                          ? option.value === 'Income'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCategory ? 'Update' : 'Add Category'}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Category</h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete <strong>{selectedCategory?.name}</strong>? 
              This may affect existing transactions using this category.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedCategory(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
