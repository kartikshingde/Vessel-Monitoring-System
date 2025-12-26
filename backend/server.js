require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const vesselRoutes = require("./routes/vesselRoutes");
const userRoutes = require('./routes/userRoutes');

const app = express();

connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/vessels", vesselRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vessels', vesselRoutes);
app.use('/api/users', userRoutes); 

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    version: "1.0.0",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "/ Route not found",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});
