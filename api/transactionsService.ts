import axiosInstance from './axiosInstance';

export interface BorrowRequest {
  itemId: number;
}

export interface BorrowResponse {
  success: boolean;
  data: {
    transactionId: number;
    itemId: number;
    barcode: string;
    publicationId: number;
    publicationTitle: string;
    branch: string;
    shelf: string;
    pickedUpDeadline: string;
    dueDate: string;
    status: string;
  };
}

export interface LookupResponse {
  code: number;
  message: string;
  data: {
    transactionId: number;
    userId: number;
    studentId: string;
    fullName: string;
    itemId: number;
    barcode: string;
    publicationId: number;
    publicationTitle: string;
    branch: string;
    shelf: string;
    pickedUpDeadline: string;
    status: string;
  };
}

const transactionsService = {
  borrow: async (data: BorrowRequest): Promise<BorrowResponse> => {
    const response = await axiosInstance.post('/transactions/borrow', data);
    return response as any;
  },
  lookup: async (params: { transactionId?: number; studentId?: string; barcode?: string }): Promise<LookupResponse> => {
    const response = await axiosInstance.get('/transactions/lookup', { params });
    return response as any;
  }
};

export default transactionsService;
