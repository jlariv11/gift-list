import { Request, Response, NextFunction } from "express";
import { auth } from "express-oauth2-jwt-bearer";

export const validateAccessToken = auth({
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    audience: process.env.AUTH0_AUDIENCE,
});

export function optionalAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authorization = req.get("Authorization");

    // No token provided → continue as guest
    if (!authorization) {
        return next();
    }

    // Token provided → validate it
    return validateAccessToken(req, res, next);
}