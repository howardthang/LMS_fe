/**
 * Publication API Types
 *
 * Định nghĩa types cho Publications API response
 */

// Publisher interface
export interface Publisher {
  id: string;
  publisherName: string;
  address: string;
}

// Author interface
export interface Author {
  id: string;
  authorName: string;
  biography: string;
  dateOfBirth: string;
  dateOfDeath: string | null;
}

// Category interface
export interface Category {
  id: string;
  categoryName?: string;
  name?: string;
  parentCategoryId: string | null;
  parentCategoryName?: string | null;
}

// Tag interface
export interface Tag {
  id: string;
  tagName: string;
}

// Publication interface (Main entity)
export interface Publication {
  id: string;
  isbn: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  language: string;
  numberOfPages: number;
  publicationYear: number;
  edition: string | null;
  coverImageUrl: string | null;
  size: string | null;
  weight: number | null;
  publisher: Publisher;
  authors: Author[];
  categories: Category[];
  tags: Tag[];
  totalItems: number;
  availableItems: number;
}


export interface UpdatePublicationRequest {
  isbn: string;
  title: string;
  description: string | null;
  language: string;
  numberOfPages: number;
  aiTargetAudience: string;
  publicationYear: number;
  edition: string | null;
  size: string | null;
  weight: number | null;
  publisher: string;
  authors: string[];
  tags: string[];
  categories: string[];
}

// Librarian Response
export interface LibrarianPublicationResponse {
  publicationId: string;
  title: string;
  subtitle: string | null;
  authorNames: string[];
  publicationYear: number;
  totalItems: number;
  imageCoverUrl: string;
}

// Newest Publication Response
export interface NewestPublication {
  publicationId: string;
  title: string;
  coverImageUrl: string | null;
  publicationYear: number;
  createdAt: string;
  availableItems: number;
  authorNames: string[];
  ratingAverage: number;
  ratingCount: number;
}

export interface MostBorrowedPublication extends NewestPublication {
  borrowCount: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// Paginated response for publications (Librarian payload)
// API Response wrapper cho Librarian Publication Detail
export interface PublicationDetailResponse {
  publication: {
    id: string;
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
    id: string;
    name: string;
  };
  authors: {
    id: string;
    name: string;
  }[];
  categories: {
    id: string;
    name: string;
  }[];
  tags: {
    id: string;
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

export interface PublicationItem {
  id: string;
  barcode: string;
  branch: string;
  shelf: string;
  status: string;
  condition: string;
  dueDate: string | null;
}

export interface PaginatedPublicationItems {
  content: PublicationItem[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
