import { NODE_ENV } from "../constant.js";
import { apiErrorHandler } from "../Utils/apiErrorHandler.js";

export const errorMiddleware = (err, req, res, next) => {
      err.statusCode = err.statusCode || 500;
      err.message = err.message || "Internal Server Error";

      if (NODE_ENV === "development") {
            res.status(err.statusCode).json({
                  success: false,
                  error: err,
                  errMessage: err.message,
                  stack: err.stack,
            });
      }

      if (NODE_ENV === "production") {
            // Wrong Mongoose Object ID Error
            if (err.name === "CastError") {
                  const message = `Resource not found. Invalid: ${err.path}`;
                  err = new apiErrorHandler(400, message);
            }

            // Handling Mongoose Validation Error
            if (err.name === "ValidationError") {
                  const message = Object.values(err.errors).map(
                        (value) => value.message
                  );
                  err = new apiErrorHandler(400, message);
            }

            // Handling Mongoose duplicate key errors
            if (err.code === 11000) {
                  const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
                  err = new apiErrorHandler(400, message);
            }

            // Handling wrong JWT error
            if (err.name === "JsonWebTokenError") {
                  const message = "JSON Web Token is invalid. Try Again!!!";
                  err = new apiErrorHandler(400, message);
            }

            // Handling Expired JWT error
            if (err.name === "TokenExpiredError") {
                  const message = "JSON Web Token is expired. Try Again!!!";
                  err = new apiErrorHandler(400, message);
            }

            res.status(err.statusCode).json({
                  success: false,
                  message: err.message,
            });
      }
};