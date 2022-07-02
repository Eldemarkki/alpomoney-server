import { build } from "./app";

build({
  logger: true
}).then(server => {
  server.listen({ host: "0.0.0.0", port: 3000 }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening on ${address}`);
  });
}).catch(err => console.error(err));
