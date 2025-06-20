import "dotenv/config";
import express from "express";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import { Server } from "socket.io";
import cors from "cors";
import { db } from "./firebase.js";
import { createServer } from "node:http";
import Redis from "ioredis";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 9000;

app.use(cors());

// Initialize Redis client
const redis = new Redis("rediss://default:ATrxAAIjcDFlZDBlYzgyNTc4MDI0NmU1YmUxMTU2NThjOGI3YjgxNXAxMA@notable-elephant-15089.upstash.io:6379");

// Create a Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("subscribe", (channel) => {
    console.log("Subscribing to channel: ", channel);
    socket.join(channel);
  });
  console.log("Client connected: ", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const ecsClient = new ECSClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
  },
});

const config = {
  CLUSTER: "arn:aws:ecs:ap-south-1:835975842698:cluster/builder-cluster",
  TASK: "arn:aws:ecs:ap-south-1:835975842698:task-definition/builder-task:5",
};

app.use(express.json());
app.get("/", async (req, res) => {
  res.json({ message: "API Server Running..." });
});

app.post("/project", async (req, res) => {
  const { userId, gitURL } = req.body;
  if (!userId || !gitURL) {
    return res.status(400).json({ error: "User ID and Git URL are required!" });
  }

  const snapshot = await db
    .collection("projects")
    .where("gitURL", "==", gitURL)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  const deployedProject = await snapshot.docs.find(
    (doc) => doc.data().deployUrl != null
  );

  if (deployedProject) {
    return res.status(409).json({
      error: "Project already deployed!",
      url: deployedProject.data().deployUrl,
    });
  } else {
    try {
      const docRef = db.collection("projects").doc(); // auto-ID
      await docRef.set({
        userId,
        gitURL,
        deployUrl: null,

        createdAt: new Date(),
      });

      return res
        .status(200)
        .json({ message: "Project created successfully", id: docRef.id });
    } catch (error) {
      return res.status(400).json({ error: "Project Id is required!" });
    }
  }
});

app.post("/deploy", async (req, res) => {
  try {
    const { projectId, gitURL } = req.body;
    if (!projectId || !gitURL) {
      return res
        .status(400)
        .json({ error: "Prject ID and Git URL are required!" });
    }
    const projectRef = db.collection("projects").doc(projectId);

    const command = new RunTaskCommand({
      cluster: config.CLUSTER,
      taskDefinition: config.TASK,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: "ENABLED",
          subnets: [
            "subnet-009911b1799a8962a",
            "subnet-09488d0c635566955",
            "subnet-04c625007cfa73dd7",
          ],
          securityGroups: ["sg-0f5c90513eee2cd79"],
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: "builder-image",
            environment: [
              { name: "GIT_REPOSITORY__URL", value: gitURL },
              { name: "PROJECT_ID", value: projectId },
              ,
            ],
          },
        ],
      },
    });
    await ecsClient.send(command);

    await streamLogsToClients(projectId);

    const user = getGitUser(gitURL);
    const newUrl = `https://vercel-clone-30.s3.ap-south-1.amazonaws.com/${user.username}/${user.repoName}/index.html`;
    await projectRef.update({
      deployUrl: newUrl,
      updatedAt: new Date(),
    });
    return res.status(200).json({
      message: "Project deploy successfully",
      uri: newUrl,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: error,
    });
  }
});

function getGitUser(url) {
  const result = url.split("github.com/")[1];
  const parts = result.split("/");
  const username = parts[0];
  const repoName = parts[1].replace(".git", "");

  return { username, repoName };
}
async function streamLogsToClients(PROJECT_ID) {
  const streamKey = `logs:${PROJECT_ID}`;
  let lastId = "$";
  console.log("started Log function");
  while (true) {
    try {
      const result = await redis.xread(
        "BLOCK",
        0,
        "STREAMS",
        streamKey,
        lastId
      );

      if (result) {
        const [[key, entries]] = result;
        console.log("result", result);
        for (const [id, fields] of entries) {
          lastId = id;
          console.log("lastId", lastId);

          // Extract log message
          const log = fields[1];
          console.log(log); // fields is like ["log", "message here"]
          io.to(PROJECT_ID).emit("log", { log });
          console.log("**************************************");
          // Send to all connected WebSocket clients
          if (log == "Done") {
            return resolve();
          }
        }
      } else {
        console.log("not found log");
        io.to(PROJECT_ID).emit("log", "not found log");

        return resolve();
      }
    } catch (err) {
      console.error("Error reading from Redis stream:", err);
      return resolve();
    }
  }
}

server.listen(PORT, () => console.log(`API Server Running..${PORT}`));
