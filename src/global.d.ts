type ApiResponse<T> = {
    data: {
        docs: T[];
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        limit: number;
        nextPage: number;
        page: number;
        previousPage: null;
        totalDocs: number;
        totalPages: number;
    };
    message: string;
};

type ApiResponseN<T> = {
    data?: T;
    message: string;
};