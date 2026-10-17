export interface ErrDetail {
    field: string;
    message: string;
}

export interface ErrResponseEnvelope {
    error: {
        code: string;
        message: string;
        request_id: string;
        details?: ErrDetail[];
    };
}
