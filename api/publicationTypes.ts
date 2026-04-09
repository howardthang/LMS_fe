/**
 * Publication API Types
 *
 * Định nghĩa types cho Publications API response
 */

// Publisher interface
export interface Publisher {
  id: number;
  publisherName: string;
  address: string;
  createdAt: string | null;
  updatedAt: string | null;
}

// Author interface
export interface Author {
  id: number;
  authorName: string;
  biography: string;
  dateOfBirth: string;
  dateOfDeath: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// Category interface
export interface Category {
  id: number;
  categoryName?: string;
  name?: string;
  parentCategoryId: number | null;
  parentCategoryName?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// Tag interface
export interface Tag {
  id: number;
  tagName: string;
  createdAt: string | null;
  updatedAt: string | null;
}

// Publication interface (Main entity)
export interface Publication {
  id: number;
  isbn: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  language: string;
  numberOfPages: number;
  publisher: Publisher;
  authors: Author[];
  publicationYear: number;
  edition: string | null;
  coverImageUrl: string | null;
  size: string | null;
  weight: number | null;
  categories: Category[];
  tags: Tag[];
  totalItems: number;
  availableItems: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UpdatePublicationMetadataRequest {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  language?: string | null;
  numberOfPages?: number | null;
  publicationYear?: number | null;
  edition?: number | null;
  size?: string | null;
  weight?: number | null;
  aiTargetAudience?: string | null;
};

// Librarian Response
export interface LibrarianPublicationResponse {
  publicationId: number;
  title: string;
  subtitle: string | null;
  authorNames: string[];
  publicationYear: number;
  totalItems: number;
  createdAt: string;
  coverImageUrl?: string;
  imageCoverUrl?: string; // Tên biến hỗ trợ trường hợp sai chính tả
}

// API Response wrapper
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// Paginated response for publications (Librarian payload)
// API Response wrapper cho Librarian Publication Detail
export interface LibrarianPublicationDetailResponse {
  publication: {
    id: number;
    isbn: string;
    title: string;
    subtitle: string | null;
    description: string;
    language: string;
    numberOfPages: number;
    aiSummary: string;
    aiTargetAudience: string;
    fileUrl: string;
    publicationYear: number;
    edition: string | number;
    coverImageUrl: string;
    size: string;
    weight: number;
  };
  publisher: {
    id: number;
    name: string;
  };
  authors: {
    id: number;
    name: string;
  }[];
  categories: {
    id: number;
    name: string;
  }[];
  tags: {
    id: number;
    name: string;
  }[];
  ratings: {
    averageRating: number;
    totalRatings: number;
  };
  items: {
    totalItems: number;
    totalAvailableItems: number;
    totalBorrowedItems: number;
  };
}

export interface PaginatedPublications {
  content: LibrarianPublicationResponse[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Availability filter enum matching backend
export type AvailabilityFilter = 'ALL' | 'HAS_ITEMS' | 'NO_ITEMS';

// Query parameters for getting publications
export interface GetPublicationsParams {
  keyword?: string;
  categoryId?: number;
  year?: number;
  hasItems?: boolean;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}
