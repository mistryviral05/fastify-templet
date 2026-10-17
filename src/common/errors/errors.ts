import { StatusCodes } from "http-status-codes";

import errCodes from "@/common/errors/codes";

class AppErr extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    constructor(statusCode: number, code: string, message: string) {
        super(message);
        this.name = "AppErr";
        this.code = code;
        this.statusCode = statusCode;
    }
}

class NotFoundErr extends AppErr {
    constructor(message: string) {
        super(StatusCodes.NOT_FOUND, errCodes.notFound, message);
    }
}
class ForbiddenErr extends AppErr {
    constructor() {
        super(
            StatusCodes.FORBIDDEN,
            errCodes.forbidden,
            "You do not have access to this resource.",
        );
        this.name = "ForbiddenErr";
    }
}

export { AppErr, NotFoundErr, ForbiddenErr };
