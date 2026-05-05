# COMMIT_RULES.md

本文件定義本專案的 Git commit 撰寫規則，主要用於引導 coding agent 與開發流程。

目標：
- 每個 commit 都清楚描述一個「進程」
- 能快速看懂這次改了什麼
- 避免模糊、不具意義的訊息（例如：update、fix bug）

---

## 1. 基本格式

請使用以下格式：

<type>: <簡短摘要>

- <做了什麼改動>
- <做了什麼改動>
- <為什麼要做（可選）>

---

## 2. type 定義

請從以下類型中選擇：

- feat     新功能
- fix      修 bug
- refactor 重構（不改功能）
- ui       介面 / 樣式調整
- api      後端 / API / LLM 呼叫
- prompt   prompt / schema / LLM 行為
- flow     問答流程 / 使用流程
- docs     文件
- chore    雜項（設定、套件等）

---

## 3. 撰寫原則

### (1) 一個 commit 只做一件事
不要把多個不相關的改動放在同一個 commit。

✔ 好：
- 做表單流程
- 做 API route

✘ 不好：
- 同時改 UI + API + prompt

---

### (2) 摘要要清楚
摘要（第一行）要讓人一眼知道在做什麼。

✔ 好：
feat: 新增多步驟問答表單

✘ 不好：
update
fix something

---

### (3) 條列具體改動
每一點描述「實際做了什麼」，不要寫太抽象。

✔ 好：
- 建立 StepQuestion 元件
- 加入下一步 / 上一步邏輯
- 儲存使用者回答到 state

✘ 不好：
- 改一些東西
- 優化功能

---

### (4) 可加上原因（建議）
如果有設計考量，可以簡單補一句。

例如：
- 限制 mvp 為 3 項，避免回傳過長內容

---

## 4. 範例

### 範例 1：問答流程

flow: 建立多步驟問答流程

- 新增步驟切換邏輯
- 建立問題元件
- 使用 state 儲存使用者回答

---

### 範例 2：API

api: 新增 generate-ideas API

- 建立 /api/generate-ideas route
- 串接 OpenAI API
- 回傳三個專案提案的 JSON

---

### 範例 3：prompt 調整

prompt: 調整專案生成規則

- 限制輸出為三種不同風格
- 加入時間限制考量
- 限制 mvp 為最多三項

---

### 範例 4：UI

ui: 調整結果卡片樣式

- 改善排版與間距
- 強化標題顯示
- 新增重新生成按鈕

---

## 5. Agent 使用規則

在每完成一個開發步驟後：

1. 總結本次改動
2. 依照本文件生成 commit message
3. 確保內容清楚且不模糊
4. 再進行 commit

---

## 6. 禁止事項

請避免：

- 使用「update」、「fix bug」等模糊描述
- commit 過大（包含太多功能）
- 描述與實際改動不一致