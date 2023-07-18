import { Request, Response } from "express";
declare const getAuthentication: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Verify the authentication response.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
declare const verifyAuthentication: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export { getAuthentication, verifyAuthentication };
