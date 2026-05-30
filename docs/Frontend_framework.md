# 前端開發與測試階段規劃 (Frontend Phasing)

為了確保 UI 體驗流暢且邏輯不會互相干擾，我們將前端（使用者介面與狀態管理）的開發切分為以下幾個獨立模組與階段。預期使用 **React / Next.js (App Router)** 搭配 **Tailwind CSS**。

## Phase 1: 靜態 UI 刻版與基礎元件 (Static UI & Components)
**目標**：完成所有畫面的視覺骨架，不涉及複雜邏輯。
* **實作項目**：
  * **首頁 (Landing Page)**：產品介紹與「開始發想」按鈕。
  * **問答表單 (Q&A Form)**：設計選擇題、多選題或輸入框的 UI 元件。
  * **專案卡片 (Project Card)**：根據 `PROJECT_SPEC.md` 的 Output Schema，設計能展示標題、簡介、技術棧 (Tags)、MVP 清單的卡片。
  * **載入中畫面 (Loading State)**：設計 Skeleton 骨架屏或 Spinner（因為 LLM 生成需要時間）。
* **測試方式**：
  * 將寫死的假資料 (Mock Data) 傳入專案卡片元件。
  * 透過瀏覽器開發者工具，切換不同螢幕尺寸（手機、平板、電腦），確認 RWD 排版不會破版。

## Phase 2: 狀態管理與問答流程控制 (State Management & Flow Control)
**目標**：讓使用者能順利填寫表單，並將資料整理成後端需要的格式。
* **實作項目**：
  * 使用 `useState` 或 `react-hook-form` 管理表單狀態。
  * 實作多步驟切換邏輯（如：上一題、下一題），或單頁式表單的滾動。
  * 實作前端欄位驗證（必填項目不可為空）。
  * 在最後一步，將收集到的資料轉換為完全符合 `PROJECT_SPEC.md` 中 **Input Schema** 的 JSON 物件。
* **測試方式**：
  * 在「送出」按鈕的 onClick 事件中，把整理好的 JSON `console.log` 出來。
  * 確認切換題目、填寫、清空選項等互動都順暢無 Bug。

## Phase 3: API 串接與非同步狀態 (API Integration & Async State)
**目標**：將前端表單與後端 API 對接，並處理漫長的等待時間。
* **實作項目**：
  * 實作 `fetch` 或 `axios` 呼叫 `/api/generate-ideas`。
  * 綁定狀態：點擊送出後，切換至 Loading 畫面；收到回應後，切換至結果展示畫面。
* **測試方式**：
  * 啟動本地後端伺服器進行串接測試（若後端尚未完成，可先用 `setTimeout` 模擬 5 秒的延遲與假的 API 回應）。
  * 觀察 Loading 動畫是否如預期出現並消失。

## Phase 4: 資料渲染與細節互動 (Data Rendering & Interaction)(已完成)
**目標**：完美呈現 LLM 生成的內容，並提供使用者進一步的操作。
* **實作項目**：
  * 將 API 拿到的真實 `projects` 陣列，動態 mapping 到 Phase 1 做的「專案卡片」元件上。
  * 處理內容過長時的截斷 (Truncate) 或是展開/收合 (Accordion) 效果（例如「詳細 MVP 規劃」預設收合）。
  * 實作「重新生成 (Regenerate)」或「修改條件」按鈕邏輯。
* **測試方式**：
  * 確保不管 LLM 吐出多長或多短的文字，卡片高度跟排版都能自適應。
  * 點擊重新生成能順利回到表單或再次觸發 API。

## Phase 5: 錯誤處理與邊界情況 (Error Handling & Edge Cases)
**目標**：提升產品的強健度 (Robustness)，處理各種意外狀況。
* **實作項目**：
  * 實作全域或局部的錯誤提示元件 (Toast 或 Alert)。
  * 處理以下情境並給予友善提示：
    * 網路斷線 (Offline)
    * API Timeout (等太久沒回應)
    * 後端回傳 400 或 500 錯誤
* **測試方式**：
  * 在瀏覽器的 Network 面板模擬 "Offline"，點擊送出看是否會顯示「請檢查網路連線」。
  * 手動將 API 網址打錯，確認 UI 不會出現 White Screen of Death (白畫面崩潰)，並能顯示「系統發生錯誤，請重試」。
