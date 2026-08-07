import proxy from "express-http-proxy";
import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../../shared/types.js";

export const proxyWithUser = (serviceUrl: string, options: proxy.ProxyOptions = {}): RequestHandler => {
  return proxy(serviceUrl, {
    ...options,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      const req = srcReq as AuthenticatedRequest;

      if (req.user) {
        proxyReqOpts.headers = proxyReqOpts.headers ?? {};
        proxyReqOpts.headers["x-user-id"] = req.user.userId;
      }

      if (options.proxyReqOptDecorator) {
        return options.proxyReqOptDecorator(proxyReqOpts, srcReq);
      }
      return proxyReqOpts;
    },
  });
};
