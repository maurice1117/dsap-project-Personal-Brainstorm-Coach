# 後端開發與測試階段規劃 (Backend Phasing)

為了確保功能穩定並方便逐一測試，我們將後端（API 與 LLM 串接）的開發切分為以下幾個獨立模組與階段。基於專案結構，我們預期使用 **Next.js API Routes (Route Handlers)** 作為後端。

##  Phase 1: 基礎 API 路由與資料驗證 (Basic API Route & Input Validation)(已完成)
**目標**：建立 API 端點，並確保收到的請求資料格式完全正確。
* **實作項目**：
  * 建立 `POST /api/generate-ideas` 路由。
  * 根據 `PROJECT_SPEC.md` 的 **Input Schema** 實作資料驗證（建議使用 `Zod` 或手動驗證）。
  * 若資料格式錯誤，回傳 `400 Bad Request` 與錯誤明細。
* **測試方式**：
  * 使用 Postman、cURL 或寫簡單的測試腳本，發送「符合規格」與「缺少必填欄位」的 JSON。
  * 驗證是否正確回傳 `200 OK` (暫時回傳 mock data) 或 `400 Bad Request`。

## Phase 2: Prompt 組裝邏輯 (Prompt Builder)
**目標**：將前端傳來的使用者偏好，轉換為 LLM 能夠精準理解的 System / User Prompt。
* **實作項目**：
  * 撰寫 **System Prompt**：賦予 LLM 「專業專案教練」的 Persona，並明確規範它必須回傳 `PROJECT_SPEC.md` 中定義的 **Output Schema** (JSON 格式)。
  * 實作轉換邏輯：將 Input JSON 內的欄位（如 `experience_level`, `time_scope`）組裝成易讀的 User Prompt。
* **測試方式**：
  * 寫一個測試腳本調用這個 Prompt Builder 函數，將結果 `console.log` 出來。
  * **不實際呼叫 LLM API**，單純透過肉眼審查生成的字串是否包含所有必要條件，且邏輯通順。

## Phase 3: LLM API 串接與純資料獲取 (LLM API Integration)
**目標**：成功與 OpenAI (或其他 LLM) API 溝通，並取得初步結果。
* **實作項目**：
  * 安裝並設定 OpenAI SDK (或其他對應的 SDK)。
  * 將 Phase 2 產生的 Prompt 送給模型。
  * 設定適當的 `temperature` (建議 0.7 左右以保持創意又不會太失控) 與 `response_format` (若模型支援 JSON mode)。
* **測試方式**：
  * 在環境變數設定 API Key。
  * 使用一組寫死的 Input 呼叫這支 API，確認能從 LLM 拿到文字回應（不論格式是否完美）。

## Phase 4: Output 驗證與例外處理 (Output Validation & Error Handling)
**目標**：確保回傳給前端的資料是安全、穩定且格式一致的。
* **實作項目**：
  * 解析 LLM 回傳的字串 (`JSON.parse`)。
  * 根據 `PROJECT_SPEC.md` 的 **Output Schema** 驗證解析後的物件。
  * 實作錯誤處理：
    * LLM 逾時 (Timeout)
    * API Key 無效或額度不足
    * LLM 回傳非 JSON 格式 (Parsing Error)
  * 當發生錯誤時，統一回傳 `500 Internal Server Error` 及友善的錯誤代碼給前端。
* **測試方式**：
  * **Mock 測試**：故意將 LLM 的回傳 mock 成一段純文字（非 JSON），檢查 API 是否能捕捉錯誤而不會整個伺服器崩潰。
  * 驗證前端拿到的錯誤訊息結構是否一致。

## Phase 5: 重試機制與優化 (Retry & Refinement - 選擇性)
**目標**：提升系統容錯率。
* **實作項目**：
  * 如果 LLM 回傳了格式錯誤的 JSON，程式能在後端自動重試 1-2 次，而不是直接報錯給前端。
* **測試方式**：
  * 故意給 LLM 很模糊的指令讓它輸出錯誤格式，觀察系統是否能觸發重試機制並成功修正。
