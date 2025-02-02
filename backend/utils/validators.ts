// Express validator middleware and utilities
// Reference: https://express-validator.github.io/docs/
import { NextFunction, Request, Response } from "express";
import { body, ValidationChain, validationResult } from "express-validator";

/**
 * Custom validation middleware that runs an array of validation chains
 * Executes each validation sequentially and returns errors if any fail
 * @param validations - Array of validation chains to execute
 * @returns Express middleware function
 */
export const validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Execute all validations in parallel for better performance
        await Promise.all(validations.map(validation => validation.run(req)));
        
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        
        // Return 422 Unprocessable Entity status with validation errors
        return res.status(422).json({ errors: errors.array() });
    };
};

/**
 * Login validation rules
 * - Email must be valid format
 * - Password must be at least 6 characters
 */
export const loginValidator = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Please provide a valid email address"),
    body("password")
        .trim()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];

/**
 * Signup validation rules
 * Includes all login validations plus:
 * - Name is required
 */
export const signupValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),
    ...loginValidator
];

/**
 * Chat completion validation rules
 * - Message content cannot be empty
 */
export const chatCompletionValidator = [
    body("message")
        .trim()
        .notEmpty()
        .withMessage("Message content is required"),
];