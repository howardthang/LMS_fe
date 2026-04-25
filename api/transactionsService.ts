import axiosInstance from './axiosInstance';

export interface BorrowRequest {
  itemId: string;
}

export interface BorrowResponse {
  code: number;
  message: string;
  data: {
    transactionId: string;
    itemId: string;
    barcode: string;
    publicationId: string;
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
    transactionId: string;
    userId: string;
    studentId: string;
    fullName: string;
    itemId: string;
    barcode: string;
    publicationId: string;
    publicationTitle: string;
    branch: string;
    shelf: string;
    pickedUpDeadline: string;
    status: string;
  };
}

export interface UserTransaction {
  transactionId: string;
  publicationId: string;
  publicationTitle: string;
  barcode: string;
  branch: string;
  shelf: string;
  pickedUpDeadline: string;
  borrowedDate: string | null;
  dueDate: string;
  returnedDate: string | null;
  status: 'WAITING_FOR_PICKUP' | 'BORROWING' | 'OVERDUE' | 'RETURNED' | 'CANCELLED';
  fineAmount: number | null;
}

export interface MyTransactionsResponse {
  code: number;
  message: string;
  data: {
    content: UserTransaction[];
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    isFirst: boolean;
    isLast: boolean;
  };
}

export interface ConfirmPickupResponse {
  code: number;
  message: string;
  data: {
    transactionId: string;
    dueDate: string;
    status: string;
  };
}

const transactionsService = {
  borrow: async (data: BorrowRequest): Promise<BorrowResponse> => {
    const response = await axiosInstance.post('/transactions/borrow', data);
    return response as any;
  },
  lookup: async (params: { transactionId?: string; studentId?: string; barcode?: string }): Promise<LookupResponse> => {
    const response = await axiosInstance.get('/transactions/lookup', { params });
    return response as any;
  },
  confirmPickup: async (transactionId: string): Promise<ConfirmPickupResponse> => {
    const response = await axiosInstance.post(`/transactions/${transactionId}/confirm-pickup`);
    return response as any;
  },
  getMyTransactions: async (page: number = 0, size: number = 10): Promise<MyTransactionsResponse> => {
    const response = await axiosInstance.get('/transactions/my-transactions', { params: { page, size } });
    return response as any;
  },
};

export default transactionsService;
