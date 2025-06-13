import express from "express";

import { authRoute } from "../modules/auth/auth.routes";
import { chatRoute } from "../modules/chat/chat.routes";


import { adminRoute } from "../modules/admin-analysis/admin.analysis.routes";
import { userRoute } from "../modules/user/user.routes";

const router = express.Router();

const moduleRoutes = [
 

  {
    path: "/auth",
    route: authRoute,
  },
  {

    path:"/user",
    route:userRoute
  },
  {
    path: "/chat",
    route: chatRoute,
  },


  {
    path: "/admin-analysis",
    route: adminRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
