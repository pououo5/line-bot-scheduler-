import express from "express";
import line from "@line/bot-sdk";
import cron from "node-cron";

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);
const app = express();

let targetGroupId = ""; // 用來存群組 ID

// Webhook：接收群組訊息，抓取群組 ID
app.post("/webhook", line.middleware(config), (req, res) => {
  req.body.events.forEach((event) => {
    if (event.source.type === "group") {
      targetGroupId = event.source.groupId;
      console.log("抓到群組 ID:", targetGroupId);
    }
  });
  res.send("OK");
});

// 每天早上 9 點自動發訊息
cron.schedule("0 9 * * *", () => {
  if (targetGroupId) {
    client.pushMessage(targetGroupId, {
      type: "text",
      text: "早安 🌞 今天要加油！",
    });
    console.log("訊息已推送到群組");
  } else {
    console.log("尚未取得群組 ID");
  }
});

// Render 預設用 10000 port，保險起見也用 process.env.PORT
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`LINE Bot 已啟動 on port ${PORT}`);
});
