import axiosInstance from './axiosInstance';

export interface DashboardSummaryResponse {
  code: number;
  message: string;
  data: {
    overview: {
      totalUsers: number;
      activeUsers: number;
      totalPublications: number;
      totalItems: number;
      availableItems: number;
    };
    todayTransaction: {
      borrowedToday: number;
      returnedToday: number;
      damagedToday: number;
      lostToday: number;
      newlyOverdueToday: number;
    };
    pendingActions: {
      waitingForPickup: number;
      overdueTransactions: number;
      reservationsPending: number;
    };
    fineSummary: {
      unpaidFineCount: number;
      totalUnpaidAmount: number;
      collectedToday: number;
    };
  };
}

export interface DashboardChartsResponse {
  code: number;
  message: string;
  data: {
    weeklyBorrowReturnTrend: {
      date: string;
      borrowed: number;
      returned: number;
    }[];
    itemStatusDistribution: {
      available: number;
      borrowed: number;
      reserved: number;
      inMaintenance: number;
      lost: number;
    };
    topBorrowedPublications: {
      publicationId: number;
      title: string;
      borrowCount: number;
      coverImageUrl: string;
    }[];
    fineTypeDistribution: {
      overdueReturn: number;
      damagedBook: number;
      lostBook: number;
    };
  };
}

export interface RiskyUser {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  profilePictureUrl: string | null;
  creditScore: number;
  riskyMetrics: {
    overdueCount: number;
    unpaidFineCount: number;
    totalUnpaidAmount: number;
    damagedCount: number;
  };
}

export interface RiskyUsersResponse {
  code: number;
  message: string;
  data: {
    content: RiskyUser[];
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

const librarianDashboardService = {
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    return axiosInstance.get('/librarians/dashboard/summary');
  },
  getCharts: async (period: 'WEEKLY' | 'MONTHLY' | 'SIX_MONTHS' | 'YEARLY' = 'WEEKLY'): Promise<DashboardChartsResponse> => {
    return axiosInstance.get(`/librarians/dashboard/charts?period=${period}`);
  },
  getRiskyUsers: async (page = 0, size = 20): Promise<RiskyUsersResponse> => {
    return axiosInstance.get(`/librarians/dashboard/risky-users?page=${page}&size=${size}&sortBy=creditScore&sortDir=ASC`);
  }
};

export default librarianDashboardService;
