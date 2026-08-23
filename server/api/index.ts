import { createApp } from "../src/app.js";

const app = createApp();

export default function handler(
  req: Parameters<typeof app.handle>[0],
  res: Parameters<typeof app.handle>[1],
) {
  app(req, res);
}
