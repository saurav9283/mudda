const express = require("express");
const { MongoClient } = require("mongodb"); 
const cors = require("cors");
const ffmpeg = require("fluent-ffmpeg");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const mongoURI = "mongodb+srv://saurav9283:Saurav2002@cluster0.cccveve.mongodb.net/?retryWrites=true&w=majority";

// Connect to MongoDB using MongoClient
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware to ensure MongoDB connection is established before handling requests
app.use(async (req, res, next) => {
  try {
    if (!client.isConnected()) {
      await client.connect();
    }
    req.dbClient = client;
    next();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/compress", async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    // Hypothetical function to compress the video using fluent-ffmpeg
    const compressedVideoPath = await compressVideo(videoUrl);

    // Save the compressed video path to MongoDB
    const db = req.dbClient.db();
    const collection = db.collection("compressed_videos");
    await collection.insertOne({ path: compressedVideoPath });

    res.json({ message: "Video compressed and saved successfully", compressedVideoPath });
  } catch (error) {
    console.error("Error compressing and saving video:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function compressVideo(videoUrl) {
  return new Promise((resolve, reject) => {
    // Use fluent-ffmpeg to compress the video
    ffmpeg(videoUrl)
      .output("output_compressed.mp4") // Output file name
      .on("end", () => {
        console.log("Compression finished");
        resolve("output_compressed.mp4");
      })
      .on("error", (err) => {
        console.error("Error during compression:", err);
        reject(err);
      })
      .run();
  });
}

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
