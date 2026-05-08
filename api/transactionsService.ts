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

export interface DirectBorrowRequest {
  studentId: string;
  barcode: string;
}

export interface DirectBorrowResponse {
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
    dueDate: string;
    status: string;
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

export interface StudentActiveTransactionsResponse {
  code: number;
  message: string;
  data: {
    studentId: string;
    fullName: string;
    items: {
      transactionId: string;
      publicationTitle: string;
      barcode: string;
      branch: string;
      shelf: string;
      borrowedDate: string;
      dueDate: string;
      status: 'BORROWING' | 'OVERDUE';
    }[];
  };
}

export interface ActiveTransactionResponse {
  code: number;
  message: string;
  data: {
    transactionId: string;
    userId: string;
    studentId: string;
    fullName: string;
    publicationTitle: string;
    barcode: string;
    branch: string;
    shelf: string;
    borrowedDate: string;
    dueDate: string;
    status: 'BORROWING' | 'OVERDUE';
  };
}

export interface ReturnResponse {
  code: number;
  message: string;
  data: {
    transactionId: string;
    publicationTitle: string;
    barcode: string;
    returnedDate: string;
    overdue: boolean;
    overdueFineAmount: number | null;
  };
}

export type IssueType = 'DAMAGED_BOOK' | 'LOST_BOOK';

export interface ReportIssueResponse {
  code: number;
  message: string;
  data: {
    transactionId: string;
    publicationTitle: string;
    itemStatus: string;
    finesCreated: {
      fineId: string;
      type: IssueType | 'OVERDUE_RETURN';
      amount: number;
    }[];
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
  borrowDirect: async (data: DirectBorrowRequest): Promise<DirectBorrowResponse> => {
    const response = await axiosInstance.post('/transactions/borrow-direct', data);
    return response as any;
  },
  getStudentActive: async (studentId: string): Promise<StudentActiveTransactionsResponse> => {
    const response = await axiosInstance.get('/transactions/student-active', { params: { studentId } });
    return response as any;
  },
  lookupActive: async (barcode: string): Promise<ActiveTransactionResponse> => {
    const response = await axiosInstance.get('/transactions/active', { params: { barcode } });
    return response as any;
  },
  returnBook: async (barcode: string): Promise<ReturnResponse> => {
    const response = await axiosInstance.post('/transactions/return', { barcode });
    return response as any;
  },
  reportIssue: async (transactionId: string, type: IssueType, fineAmount: number): Promise<ReportIssueResponse> => {
    const response = await axiosInstance.post(`/transactions/${transactionId}/report-issue`, { type, fineAmount });
    return response as any;
  },
};

export default transactionsService;
