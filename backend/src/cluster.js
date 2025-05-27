import cluster from "cluster";
import os from "os";
import { startServer } from "./index.js";

const numCPUs = os.cpus().length;
const PORT = process.env.PORT || 5050;

if (cluster.isPrimary) {
      console.log(`🧠 Primary ${process.pid} is running`);
      console.log(`🔧 Forking ${numCPUs} workers...`);
      for (let i = 0; i < numCPUs; i++) cluster.fork();

      cluster.on("exit", (worker, code, signal) => {
            console.log(`☠️ Worker ${worker.process.pid} died`);
            cluster.fork(); // Restart dead worker
      });
} else {
      startServer();
}
