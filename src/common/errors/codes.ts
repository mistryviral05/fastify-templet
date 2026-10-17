const _errCodes = {
    notFound: "not_found",
    forbidden: "access_denied",
    internalErr: "internal_error",
    validationErr: "validation_error",
};

const errCodes = Object.freeze(_errCodes);
export default errCodes;
