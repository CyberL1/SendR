import fastifyWebsocket from "@fastify/websocket";
import fastify from "fastify";
import { readdirSync } from "fs";

process.env.PORT ??= "3000";

const app = fastify();
app.register(fastifyWebsocket);

const routes = readdirSync(`${import.meta.dirname}/routes`);

for (const file of routes) {
  const cleanRoute = file.split(".")[0];
  const routePath = cleanRoute == "index" ? "/" : `/${cleanRoute}`;

  console.log(`Loading route: ${routePath}`);
  app.register((await import(`./routes/${file}`)).default, {
    prefix: routePath,
  });
}

app.listen({ port: Number(process.env.PORT), host: "0.0.0.0" });
