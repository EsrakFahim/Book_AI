import cors from "cors";
// CORS configuration
const allowedOrigins = [
      "http://localhost:3000",
      // Add more origins here
];

const corsOptions = {
      origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin || allowedOrigins.includes(origin)) {
                  callback(null, true);
            } else {
                  callback(new Error("Not allowed by CORS"));
            }
      },
      credentials: true, // Allow cookies to be sent
      optionsSuccessStatus: 200, // For legacy browser support
};

export default cors(corsOptions);