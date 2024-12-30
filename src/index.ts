import fastify from "fastify";

process.env.PORT ??= "3000";

const app = fastify();

app.get("/", () => {
  return { appName: "SendR" };
});

app.listen({ port: Number(process.env.PORT), host: "0.0.0.0" });
