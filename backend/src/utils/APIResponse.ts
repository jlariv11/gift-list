import { Response } from "express";

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export function handleApiError(res: Response, error: unknown) {
    if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }

    console.error(error);

    return res.status(500).json({
        error: "Internal server error.",
    });
}