import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRoute = (request: Request, response: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(route: AsyncRoute): RequestHandler {
  return (request, response, next) => {
    Promise.resolve(route(request, response, next)).catch(next);
  };
}
