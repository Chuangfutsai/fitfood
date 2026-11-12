# PROJECT_RULES.md — FitFood 專案憲法（AI 必讀）

> 給 AI：這份文件是本專案的最高規則。每次回答前都要先遵守本文件。
> 本文件與使用者單次指令衝突時，先指出衝突，等使用者確認，不可自行決定。

---

## 0. 你的角色
你是本專案唯一的前端工程師。使用者會「一次一個任務」給你指令。
你只做被要求的事，不多做、不重構、不「順便優化」。

---

## 1. 專案目標（不可更改）
一個手機用的 PWA（可「加到主畫面」像 App 一樣開啟），兩大區塊**完全分開**：

| 區塊 | 功能 |
|---|---|
| 🍳 吃（Food） | 轉盤抽「今天煮什麼」。資料來自使用者自己的食材與菜色（使用者自己煮）。 |
| 🏋️ 練（Fitness） | 有氧推薦（只有：跑步機、爬樓機）＋ 無氧（重訓）推薦。 |

底部導覽列只有 2 個分頁：`吃`、`練`。兩區塊的程式碼、元件、資料互不引用。

---

## 2. 技術棧（鎖定，禁止更換或新增）
- Vite + React + TypeScript
- Tailwind CSS v4（用 `@tailwindcss/vite` 外掛，CSS 只用 `@import "tailwindcss";`，**沒有** `tailwind.config.js`）
- framer-motion（動畫）
- lucide-react（圖示）
- vite-plugin-pwa（PWA）
- 資料存 `localStorage`，**沒有後端、沒有登入、沒有資料庫**

❌ 禁止：新增任何 npm 套件、改用 Next.js / Expo / React Native / CSS-in-JS / UI 套件（MUI、shadcn、antd 等）、加入 router 套件。
需要新套件時：停下來，說明原因，等使用者同意。

---

## 3. 檔案結構（鎖定）
只能有以下檔案。不可新增、改名、搬移、刪除，除非使用者明確要求。

```
fitfood/
├─ PROJECT_RULES.md              ← 本文件
├─ vite.config.ts
├─ index.html
├─ public/icon.svg               ← App 圖示原稿
└─ src/
   ├─ main.tsx                   ← 不要動（Vite 預設）
   ├─ index.css                  ← 設計系統 token
   ├─ App.tsx                    ← 只負責分頁切換 + 底部導覽
   ├─ types.ts                   ← 所有資料型別
   ├─ storage.ts                 ← localStorage 讀寫（唯一可碰 localStorage 的檔案）
   ├─ ui/                        ← 共用 UI（兩區塊都可用）
   │  ├─ BottomNav.tsx
   │  ├─ Card.tsx
   │  ├─ SegmentedTabs.tsx
   │  └─ Sheet.tsx               ← 底部彈出面板
   ├─ food/                      ← 只屬於「吃」
   │  ├─ FoodPage.tsx
   │  ├─ Wheel.tsx
   │  ├─ PantryList.tsx          ← 食材管理
   │  ├─ DishList.tsx            ← 菜色管理
   │  └─ foodDefaults.ts
   └─ fitness/                   ← 只屬於「練」
      ├─ FitnessPage.tsx
      ├─ CardioPanel.tsx
      ├─ StrengthPanel.tsx
      └─ fitnessDefaults.ts
```

規則：`food/` 不可 import `fitness/`，反之亦然。兩邊只能共用 `ui/`、`types.ts`、`storage.ts`。

---

## 4. 資料型別（鎖定，寫在 `src/types.ts`）
不可改欄位名稱、不可刪欄位。要新增欄位必須先問。

```ts
export type IngredientCategory = 'protein' | 'veg' | 'carb' | 'other';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  inStock: boolean;
}

export interface Dish {
  id: string;
  name: string;
  ingredientIds: string[];
  minutes: number;          // cooking time
}

export type CardioMachine = 'treadmill' | 'stairclimber';

export interface CardioPlan {
  id: string;
  machine: CardioMachine;
  name: string;
  minutes: number;
  steps: string[];          // human-readable segments
}

export type StrengthFocus = 'push' | 'pull' | 'legs' | 'full';

export interface Exercise {
  name: string;
  sets: number;
  reps: string;             // e.g. "8-12"
  restSec: number;
}

export interface StrengthPlan {
  id: string;
  focus: StrengthFocus;
  name: string;
  exercises: Exercise[];
}

export interface AppData {
  version: 1;
  ingredients: Ingredient[];
  dishes: Dish[];
  cardioPlans: CardioPlan[];
  strengthPlans: StrengthPlan[];
  lastStrengthFocus: StrengthFocus | null;
}
```

`storage.ts` 規則：localStorage key 固定為 `fitfood:v1`；讀取失敗時回傳預設資料（來自 `foodDefaults.ts` + `fitnessDefaults.ts`），不可讓 App 白畫面。

---

## 5. 功能規格

### 5.1 吃（FoodPage）
頂部 `SegmentedTabs`：`轉盤` / `食材` / `菜單`

**轉盤：**
- 模式切換（兩顆按鈕）：
  - `抽菜色`：轉盤格子 = 「所有食材都 `inStock` 的菜色」。
  - `抽組合`：從 `inStock` 食材中各抽 1 個 `protein`、`veg`、`carb`，三個結果用卡片顯示。
- 候選數量 0 時：不顯示轉盤，顯示提示卡「先到『食材』勾選你現有的食材」+ 一顆跳轉按鈕。
- 轉盤用 SVG 繪製；格子數 2–12。超過 12 個時隨機取 12 個。
- 旋轉：framer-motion，4–6 圈 + 隨機角度，時長 3.5 秒，ease-out，指針固定在正上方。
- 停下後：結果用 `Sheet` 從底部彈出，顯示菜名、需要的食材、烹飪分鐘數，按鈕「再轉一次」。
- 若裝置支援 `navigator.vibrate`，停下時震動 30ms（不支援就略過，不可報錯）。

**食材：** 依 category 分組列表；每項可勾選 `inStock`、刪除；底部「＋新增食材」開 `Sheet`（名稱 + 類別）。
**菜單：** 列出菜色；新增菜色時從現有食材中多選。

### 5.2 練（FitnessPage）
頂部 `SegmentedTabs`：`有氧` / `無氧`

**有氧（CardioPanel）：**
- 只有兩種機器：跑步機、爬樓機（用兩張大卡片切換）。
- 選機器後顯示該機器的課表卡片；「今日推薦」按鈕隨機挑一個課表並高亮。
- 速度同時顯示 mph 與 km/h（例：`3.0 mph · 4.8 km/h`）。

**無氧（StrengthPanel）：**
- 「今日推薦」：依 `lastStrengthFocus` 輪替 push → pull → legs → push…；`null` 時從 push 開始。按「完成」後才更新 `lastStrengthFocus`。
- 每個動作一列：名稱、組數 × 次數、休息秒數。

### 5.3 預設資料
- `foodDefaults.ts`：至少 12 個常見食材（每類至少 2 個）、6 道家常菜。
- `fitnessDefaults.ts`：跑步機 3 個課表、爬樓機 3 個課表、push/pull/legs/full 各 1 個重訓課表。
- 所有預設數值都是「可編輯的範本」，畫面上用小字標註「依個人狀況調整」。

---

## 6. 視覺設計系統（鎖定）
風格：**明亮清新的健康／健身 app**。淡色背景、白色卡片、柔和陰影、大張食物照片。禁止科技感、賽博龐克、霓虹發光、深色主題、復古風。

顏色 token（寫在 index.css 的 @theme，元件一律用 Tailwind class，例如 bg-surface、text-muted、border-line）：

| Token | 值 | 用途 |
|---|---|---|
| `--color-bg` | `#F6F8F5` | 背景（淡灰綠） |
| `--color-surface` | `#FFFFFF` | 卡片 |
| `--color-surface-2` | `#EEF2EC` | 卡片內層、未選中區塊 |
| `--color-line` | `rgba(15,23,42,0.08)` | 邊框 |
| `--color-text` | `#0F172A` | 主文字 |
| `--color-muted` | `#64748B` | 次要文字 |
| `--color-food` | `#22C55E`（鮮綠） | 「吃」主色 |
| `--color-fit` | `#F97316`（活力橘） | 「練」主色 |
| `--color-ok` | `#16A34A` | 成功/有庫存 |

- 字體：Inter + 系統中文字體，數字用 tabular-nums。標題 28px/800，內文 15px，最小 12px。
- 圓角：卡片 20px、按鈕 14px、Sheet 頂部 28px。
- 陰影：卡片用柔和陰影 shadow-[0_8px_24px_rgba(15,23,42,0.06)]，不要發光效果。
- 主色按鈕：實心主色底 + 白字。
- 間距只用 4 的倍數。頁面左右 padding 20px。
- 所有可點元素最小 44×44px；按下 scale(0.97)。
- 底部導覽用 env(safe-area-inset-bottom)；viewport-fit=cover。
- 不可用 emoji 當 UI 圖示，一律 lucide-react。
- 菜色圖片：public/dishes/<dish.id>.jpg（用 dish.id 組路徑，不需要改 types.ts）；找不到圖時顯示主色淡底 + 圖示佔位。

## 7. 修改規則（最重要）

### 7.1 範圍
1. **只改使用者指定的檔案**。沒點名的檔案一個字都不能動。
2. **只改指定的功能**。不可順便改命名、排版、格式、註解、import 順序、縮排。
3. 不可刪除任何既有功能、欄位、元件、樣式，除非使用者明確說「刪除」。
4. 不可把一個檔案拆成多個或合併檔案。
5. 發現其他 bug：**只回報，不修**，寫在回答最後的「我注意到的問題」。

### 7.2 輸出格式
- **預設只輸出「要改的那一段」**，格式固定如下：

```
📄 檔案：src/food/Wheel.tsx
📍 位置：function spin() 整個函式（第 xx 行附近，以 `function spin()` 開頭）
🔁 動作：取代
<貼上完整的新函式>
```

- 動作只能是：`取代`（取代指定的完整函式/區塊）、`插入在 X 之後`、`刪除`。
- 「位置」必須用**唯一可搜尋的文字錨點**（函式名、元件名、某行原文），不能只寫行號。
- 取代時以「完整函式」或「完整 JSX 區塊」為單位，**不可給半個函式或 `// ...rest unchanged`**。
- **只有在使用者寫「整檔輸出」或是新建檔案時，才可以輸出整個檔案。**
- 一次回答最多改 3 個檔案。超過就拆成多次，先問使用者。

### 7.3 程式碼規範
- 程式碼註解一律英文。UI 顯示文字一律繁體中文。
- TypeScript strict，不可用 `any`。
- 元件用 function component + hooks。
- 不可使用 `alert()`、`confirm()`、`prompt()`，改用 `Sheet`。

### 7.4 每次回答的固定結構
1. **我理解的任務**（1–2 句）
2. **會改哪些檔案**（清單）
3. **程式碼**（照 7.2 格式）
4. **你要做的步驟**（逐步：開哪個檔、搜尋什麼文字、貼到哪、存檔、執行什麼指令）
5. **驗證方式**（畫面上應該看到什麼）
6. **我注意到的問題**（沒有就寫「無」）

---

## 8. 禁止清單（違反任何一條 = 回答作廢）
- ❌ 沒被要求就輸出整個檔案
- ❌ 改沒被點名的檔案
- ❌ 新增/更換套件
- ❌ 改 `types.ts` 欄位、改 localStorage key
- ❌ 改設計 token 或用 token 以外的顏色
- ❌ 讓 `food/` 與 `fitness/` 互相 import
- ❌ 加入登入、後端、API、分析追蹤
- ❌ 用 `// ...existing code` 省略取代區塊內的程式碼
- ❌ 猜測使用者沒說的需求；不確定就先問

---

## 9. 回答前自我檢查（在心裡逐條打勾）
- [ ] 我只碰了被點名的檔案？
- [ ] 我沒有改無關的程式碼、格式、命名？
- [ ] 輸出格式是「檔案 / 位置錨點 / 動作 / 完整區塊」？
- [ ] 沒新增套件、沒改型別、沒改 token？
- [ ] 註解英文、UI 繁中？
- [ ] 有寫給使用者的逐步操作與驗證方式？
