import cluster from 'cluster';
import os from 'os';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
      console.log(`🧠 Primary ${process.pid} is running`);
      console.log(`🔧 Forking ${numCPUs} workers...`);

      for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
      }

      cluster.on('exit', (worker, code, signal) => {
            console.log(`☠️ Worker ${worker.process.pid} died`);
            cluster.fork(); // Optional: restart dead worker
      });
} else {
      // Run the actual server inside the worker
      import('./index.js');
}
