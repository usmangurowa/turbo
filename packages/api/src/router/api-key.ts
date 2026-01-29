import { Hono } from "hono";

import type { AppContext } from "../context";

const app = new Hono<AppContext>();

export default app;
