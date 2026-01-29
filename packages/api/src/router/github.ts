import { Hono } from "hono";

import type { AppContext } from "../context";

const githubRouter = new Hono<AppContext>();

export default githubRouter;
