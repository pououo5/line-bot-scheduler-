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

// 從環境變數讀取訊息與時間（有預設值）
const MESSAGE_TEXT = process.env.MESSAGE_TEXT || "早安 🌞 今天要加油！";
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "0 9 * * *"; 
// 預設每天早上 9 點，cron 格式：分鐘 小時 日 月 星期

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

// 定時任務
cron.schedule(CRON_SCHEDULE, () => {
  if (targetGroupId) {
    client.pushMessage(targetGroupId, {
      type: "text",
      text: MESSAGE_TEXT,
    });
    console.log(`訊息已推送到群組: ${MESSAGE_TEXT}`);
  } else {
    console.log("尚未取得群組 ID");
  }
});

// Render 預設用 10000 port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`LINE Bot 已啟動 on port ${PORT}`);
});
