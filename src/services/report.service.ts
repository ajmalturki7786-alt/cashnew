import api from '@/lib/api';
import { ApiResponse, Dashboard, CashbookReport, CategorySummary } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:53676/api';

export const reportService = {
  getDashboard: async (businessId: string): Promise<Dashboard> => {
    const response = await api.get<ApiResponse<Dashboard>>(
      `/business/${businessId}/reports/dashboard`
    );
    return response.data.data!;
  },

  getCashbookReport: async (
    businessId: string,
    startDate: string,
    endDate: string,
    categoryId?: string,
    entryType?: string,
    createdByUserId?: string
  ): Promise<CashbookReport> => {
    const response = await api.get<ApiResponse<CashbookReport>>(
      `/business/${businessId}/reports/cashbook`,
      { params: { startDate, endDate, categoryId, entryType, createdByUserId } }
    );
    return response.data.data!;
  },

  getCategorySummary: async (
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<CategorySummary[]> => {
    const response = await api.get<ApiResponse<CategorySummary[]>>(
      `/business/${businessId}/reports/category-summary`,
      { params: { startDate, endDate } }
    );
    return response.data.data!;
  },

  // Export functions - Download files with authentication
  exportCashbookPdf: async (
    businessId: string,
    startDate: string,
    endDate: string,
    categoryId?: string,
    entryType?: string
  ): Promise<void> => {
    const params = new URLSearchParams({ startDate, endDate });
    if (categoryId) params.append('categoryId', categoryId);
    if (entryType) params.append('entryType', entryType);
    
    const response = await api.get(
      `/business/${businessId}/reports/cashbook/export/pdf?${params}`,
      { responseType: 'blob' }
    );
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cashbook_Report_${startDate}_${endDate}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  exportCashbookExcel: async (
    businessId: string,
    startDate: string,
    endDate: string,
    categoryId?: string,
    entryType?: string
  ): Promise<void> => {
    const params = new URLSearchParams({ startDate, endDate });
    if (categoryId) params.append('categoryId', categoryId);
    if (entryType) params.append('entryType', entryType);
    
    const response = await api.get(
      `/business/${businessId}/reports/cashbook/export/excel?${params}`,
      { responseType: 'blob' }
    );
    
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cashbook_Report_${startDate}_${endDate}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  exportBankStatementPdf: async (
    businessId: string,
    bankAccountId: string,
    startDate: string,
    endDate: string
  ): Promise<void> => {
    const params = new URLSearchParams({ startDate, endDate });
    
    const response = await api.get(
      `/business/${businessId}/reports/bank-statement/${bankAccountId}/export/pdf?${params}`,
      { responseType: 'blob' }
    );
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bank_Statement_${startDate}_${endDate}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  exportBankStatementExcel: async (
    businessId: string,
    bankAccountId: string,
    startDate: string,
    endDate: string
  ): Promise<void> => {
    const params = new URLSearchParams({ startDate, endDate });
    
    const response = await api.get(
      `/business/${businessId}/reports/bank-statement/${bankAccountId}/export/excel?${params}`,
      { responseType: 'blob' }
    );
    
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bank_Statement_${startDate}_${endDate}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  exportBusinessOverviewPdf: async (
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<void> => {
    const params = new URLSearchParams({ startDate, endDate });
    
    const response = await api.get(
      `/business/${businessId}/reports/business-overview/export/pdf?${params}`,
      { responseType: 'blob' }
    );
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Business_Overview_${startDate}_${endDate}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  exportBusinessOverviewExcel: async (
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<void> => {
    const params = new URLSearchParams({ startDate, endDate });
    
    const response = await api.get(
      `/business/${businessId}/reports/business-overview/export/excel?${params}`,
      { responseType: 'blob' }
    );
    
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Business_Overview_${startDate}_${endDate}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
