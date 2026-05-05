# Interactive Project Ideation Coach - PRD

## 1. Product Overview
「互動式專案發想教練」是一個網頁應用程式，旨在幫助學生與開發者將模糊的點子轉化為具體、可執行的專案計畫。透過一系列的情境式提問，系統會分析使用者的興趣、技能與時間限制，並利用 LLM 生成三個不同風格的專案提案與技術建議。

## 2. Goal
- 幫助使用者跨越「不知道要做什麼專案」的障礙。
- 提供高度個人化的專案推薦，而非千篇一律的標籤篩選結果。
- 直接給予具體的技術架構與 MVP（最小可行產品）建議，加速進入開發階段。

## 3. Target Users
- **學生**：需要完成期末專題，但缺乏實務經驗來定義專案範圍的人。
- **初階開發者**：想要豐富作品集，需要有亮點且符合自身技術棧的專案。
- **業餘愛好者 / Hacker**：參加黑客松或週末專案，需要快速收斂點子的人。

## 4. Core User Flow
1. **進入首頁**：了解產品價值並點擊「開始發想」。
2. **問答引導 (Q&A)**：回答 4-5 個關於興趣、技能程度、目標與時間限制的問題。
3. **等待生成**：系統將回答組裝成 Prompt，向 LLM 請求生成專案。
4. **瀏覽提案**：查看三個不同風格（如：實用型、創意型、複雜型）的專案卡片。
5. **深入了解與行動**：點擊感興趣的專案，查看詳細的技術架構建議、MVP 規劃與適合/不適合的原因。如有需要可重新生成。

## 5. MVP Scope
- 固定的前端引導式問答流程（表單）。
- 後端 API 串接 LLM (如 OpenAI) 進行 Prompt 處理與回應解析。
- 三種風格的專案點子生成與展示（卡片介面）。
- 專案詳細資訊展示（技術棧、MVP、難度評估）。

## 6. Functional Requirements
- **前端介面**：需具備流暢的表單填寫體驗與結果展示畫面。
- **狀態管理**：記錄使用者在每一步驟的回答。
- **Prompt 工程**：確保 LLM 能夠穩定輸出符合預期格式（JSON）的內容。
- **錯誤處理**：當 LLM 逾時或回傳格式錯誤時，需有適當的重試機制或友善提示。

## 7. Non-Goals
- 不做使用者帳號登入系統（降低使用門檻）。
- 不做歷史紀錄儲存（重整後資料即消失）。
- 不做專案的實際程式碼生成（專注於「發想」階段）。
- 不做多人協作發想功能。

## 8. Input / Output Schema
**Input (給 LLM 的資料範例)**：
```json
{
  "project_context": "course_final",
  "interests": ["web_development", "ai_tools"],
  "experience_level": "intermediate",
  "focus_skills": ["frontend", "api_integration"],
  "preferred_tech": ["React", "Node.js"],
  "time_scope": {
    "duration_weeks": 4,
    "hours_per_week": 8
  },
  "constraints": [
    "prefer_web_app",
    "must_be_demoable",
    "avoid_heavy_ml_training"
  ],
  "goal": "build something technically challenging but still feasible for a final project",
  "user_notes": "希望有互動感，最好可以在線上 demo"
}
```

**Output (LLM 回傳的資料結構)**：
```json
{
  "projects": [
    {
      "style": "practical",
      "title": "個人化學習路徑追蹤器",
      "one_liner": "幫助使用者規劃與追蹤學習進度的互動式網站。",
      "summary": "使用者可以建立學習目標、拆解任務，並透過視覺化方式查看進度與下一步建議。",
      "why_it_fits": "符合你對網頁開發與 AI 工具的興趣，也能練到 React 與 API 串接。",
      "potential_concerns": "若加入太多 AI 推薦或後端功能，4 週內可能會太趕。",
      "difficulty": "medium",
      "tech_stack": ["React", "Node.js", "Express"],
      "mvp": [
        "建立學習目標與任務列表",
        "顯示進度追蹤介面",
        "提供簡單的推薦或提醒功能"
      ],
      "reasoning_tags": ["web-app", "interactive", "practical", "demoable"]
    }
  ]
}
```

## 9. Success Criteria
- **功能可用性**：使用者能順利走完流程，且系統穩定回傳 3 個專案點子。
- **解析成功率**：LLM 回傳的 JSON 格式 100% 能夠被前端正確解析並渲染，不出現破版。
- **體驗流暢度**：從填寫完成到看到結果的等待時間需控制在 10 秒內（取決於 LLM 回應速度）。

## 10. Open Questions
- **LLM 模型選擇**：要使用 OpenAI 的哪一個模型（如 `gpt-4o-mini`）以平衡生成速度、品質與成本？
- **問答的數量與形式**：幾個問題能達到最好的個人化效果，同時不讓使用者失去耐心？（暫定 4-5 題選擇/多選題）