import { Request, Response } from "express";
declare const getRegistration: (req: Request, res: Response) => Promise<void>;
declare const verifyRegistration: (req: Request, res: Response) => Promise<void>;
export { getRegistration, verifyRegistration };
