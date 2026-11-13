# PROJECT_RULES.md — LinkFit 專案憲法（AI 必讀）

> 本文件是 LinkFit 的共同開發規範。使用者當前任務與明確宣布的規則變更優先於本文件的舊描述。
> 已經明確授權的修改，不得因過時規則再次要求確認；需要修改任務清單以外的檔案時，必須先停下來詢問。
> 工作專案：`/Users/alex/Desktop/fitfood`。開始前先用 `pwd` 確認位置，不要修改其他同名或空白資料夾。

---

## 0. 工作原則

- 標準是「要完整，不是完成」：功能、資料相容性、錯誤處理、多語與驗收都要交付；未完成就如實說明原因。
- 多個 Codex 可以同時修改本專案，每個任務有各自的檔案白名單。
- 只做任務要求的修改，不順便重構、改名、整理格式或修其他問題。
- 不准 commit，也不准自行 push、reset、clean、stash 或還原其他分頁的修改。

## 1. 產品與導覽

LinkFit 是以減脂為主的健康／健身 App，支援網頁 PWA 與 Capacitor iOS App。資料留在裝置本機，沒有登入、後端或雲端資料庫。

底部導覽固定為三頁，預設開啟「今天」：

| 頁面 | 程式代碼 | 職責 |
|---|---|---|
| 今天 | `today` | 今日飲食、營養與訓練狀態總覽及功能入口 |
| 吃 | `food` | 早午晚餐轉盤、食材、食譜、餐點紀錄、目標、本週菜單與購物清單 |
| 練 | `fit` | 本週排程、有氧課表、重訓與訓練紀錄 |

`App.tsx` 負責主資料、三頁切換與頁面載入；`BottomNav.tsx` 負責導覽。不得把導覽改回只有吃／練兩頁。

## 2. 技術棧

- React 19、TypeScript strict、Vite 8。
- Tailwind CSS v4 與 `@tailwindcss/vite`；`src/index.css` 第一行是 `@import "tailwindcss";`，設計 token 定義在 `@theme`。
- framer-motion：動畫；lucide-react：圖示。
- vite-plugin-pwa：網頁離線快取；Capacitor：iOS 原生容器與本機資源。
- Vitest：單元測試；Oxlint：既有 lint 工具。
- localStorage：本機資料儲存；不加入登入、後端或追蹤服務。

實際套件與版本以 `package.json`、`package-lock.json` 為準。未經任務授權，不得新增、更換或升級套件，也不得換成其他框架或 UI 套件。

## 3. 檔案結構與模組邊界

以下依目前專案整理；平行任務可能繼續新增已授權檔案。這是結構說明，不是禁止演進的固定檔案清單；能修改哪些檔案，始終以當次任務白名單為準。

```text
fitfood/
├─ PROJECT_RULES.md
├─ README.md
├─ package.json
├─ package-lock.json
├─ vite.config.ts
├─ capacitor.config.ts
├─ index.html
├─ tsconfig.json / tsconfig.app.json / tsconfig.node.json
├─ .gitignore / .oxlintrc.json
├─ public/
│  ├─ favicon.svg
│  ├─ icons.svg
│  ├─ dishes/                       # 菜色、早餐與封面照片
│  ├─ fitness/                      # 有氧器材照片
│  └─ fonts/
│     ├─ InterVariable.woff2
│     └─ LICENSE.txt                # Inter OFL 授權
├─ assets/                          # 原始 App 圖示、啟動畫面與設計候選
│  ├─ icon-only.png
│  ├─ splash.png
│  ├─ icon-option-*.png
│  └─ preview-option-*.png
├─ ios/                             # Capacitor iOS 工程與原生資源
│  ├─ App/
│  │  ├─ App/                       # Swift、Info.plist、Assets、storyboards
│  │  ├─ App.xcodeproj/
│  │  └─ CapApp-SPM/
│  ├─ capacitor-cordova-ios-plugins/
│  └─ debug.xcconfig
├─ store/                           # 上架文案、隱私聲明與審查資料
│  ├─ listing.md
│  ├─ privacy-policy.md
│  ├─ app-privacy-answers.md
│  ├─ age-rating-answers.md
│  ├─ review-notes.md
│  └─ screenshot-plan.md
├─ docs/                            # 靜態網站與隱私政策頁
│  ├─ index.html
│  └─ privacy/index.html
└─ src/
   ├─ main.tsx                      # Provider、React 入口、網頁版 SW 註冊
   ├─ App.tsx
   ├─ index.css
   ├─ types.ts                      # 主資料型別，schema v2
   ├─ storage.ts
   ├─ storage.test.ts
   ├─ stats.ts
   ├─ stats.test.ts
   ├─ backup.ts
   ├─ backup.test.ts
   ├─ ui/
   │  ├─ BottomNav.tsx
   │  ├─ Card.tsx
   │  ├─ SegmentedTabs.tsx
   │  ├─ Sheet.tsx
   │  └─ ErrorBoundary.tsx
   ├─ i18n/
   │  ├─ langContext.ts             # 穩定的 Context 與 useLang
   │  ├─ LanguageContext.tsx        # Provider 與語言切換
   │  ├─ strings.ts
   │  ├─ strings.menu.ts
   │  ├─ strings.today.ts
   │  ├─ strings.workout.ts         # strings.*.ts 為模組雙語字串
   │  └─ dataTranslations.ts
   ├─ today/
   │  ├─ TodayPage.tsx
   │  └─ useTodayText.ts
   ├─ food/
   │  ├─ FoodPage.tsx
   │  ├─ Wheel.tsx
   │  ├─ PantryList.tsx
   │  ├─ DishList.tsx
   │  ├─ TodayMeals.tsx
   │  ├─ GoalSheet.tsx
   │  ├─ foodDefaults.ts
   │  ├─ recipes.ts
   │  └─ menu/
   │     ├─ menuTypes.ts
   │     ├─ menuStore.ts
   │     ├─ planWeek.ts
   │     ├─ shoppingList.ts
   │     ├─ useMenuText.ts
   │     └─ menu.test.ts
   └─ fitness/
      ├─ FitnessPage.tsx
      ├─ CardioPanel.tsx
      ├─ StrengthPanel.tsx
      ├─ WeeklyPanel.tsx
      ├─ fitnessDefaults.ts
      ├─ exerciseLibrary.ts
      ├─ exerciseLibrary.test.ts
      └─ workout/
         ├─ types.ts
         ├─ workoutStore.ts
         ├─ workoutUtils.ts
         └─ workout.test.ts
```

- `food/`、`fitness/`、`today/` 各自負責功能；共用 UI、主資料、統計與翻譯可合理引用，不再限制只能共用三個檔案。
- 「今天」總覽可以整合飲食與訓練資料；跨模組共用優先引用型別、資料或純函式，避免頁面元件互相依賴與循環引用。
- 功能模組可以有自己的型別、store、純函式與測試，不要求全部擠進 `types.ts` 或 `storage.ts`。
- `dist/`、依賴目錄與原生同步產物是工具生成內容，不手動修改。未授權不得執行會改動其他白名單外檔案的安裝、原生同步或格式化指令。

## 4. 資料與相容性

### 4.1 主資料

- 主資料由 `src/storage.ts` 管理，localStorage key 固定為 `fitfood:v1`；key 的 v1 與資料的 schema 版本是兩回事。
- `AppData.version` 現在是 `2`。型別以 `src/types.ts` 為準，不在本文件複製容易過時的完整 interface。
- 主資料包含食材、菜色及餐別、有氧／重訓課表、本週排程與打卡、餐點快照、目標、體重紀錄與 `knownDefaultIds`。
- 餐點紀錄保留當下的 `kcal`、`proteinG` 與 `meal`；統計使用快照，不因日後食譜修改而改變歷史數值。
- `useAppData` 支援整個新值及函式型更新；依賴舊狀態的修改使用函式型 setter。儲存副作用放在 effect，不放進 React state updater。

### 4.2 遷移、驗證與預設資料

載入流程：解析 → 依版本逐步 migrations → 逐欄驗證 → 合併新預設資料 → 有變動才寫回。

- 驗證型別、有限數值、合法範圍、日期 key、列舉值、陣列內容與參照 ID；逐筆保留好資料，處理壞資料，不能因一筆錯誤讓整個 App 壞掉。
- `knownDefaultIds` 分別記錄已見過的 ingredients、dishes、cardioPlans 預設 ID。只補從未見過的預設 ID；刪除資料時保留這份追蹤，避免重新整理後復活。
- 沒有 `knownDefaultIds` 的舊資料，以最初的 29 種食材、50 道菜、6 套跑步機／爬樓機課表作已知基準；基準 ID 固定在 migration，不可改用目前全部 defaults 推算。
- JSON 損毀或找不到遷移步驟時，先將原始字串原封不動存到 `fitfood:v1:corrupt-<timestamp>`，最多保留最新 3 份，再允許預設資料取代；備份失敗不得覆寫原始資料。
- 比目前 schema 更新的資料不得降版或覆寫；保留原始內容，顯示錯誤保護並提供匯出。
- localStorage 不可用或空間不足時要處理例外，不能宣稱未成功儲存的操作已持久保存。
- 任務明確授權時可以演進型別、schema 與 migrations；必須保留相容性並補測試，不需要因舊文件寫過「鎖定」而重問。

### 4.3 功能模組與備份

| Key | 用途與管理位置 |
|---|---|
| `fitfood:v1` | 主資料，`storage.ts`，schema v2 |
| `fitfood:menu:v1` | 本週菜單／購物清單，`food/menu/menuStore.ts` |
| `fitfood:workouts:v1` | 重訓紀錄，`fitness/workout/workoutStore.ts` |
| `fitfood:lang` | 語言偏好，獨立於 AppData |
| `fitfood:v1:before-restore` | 主資料還原前的安全副本 |
| `fitfood:v1:corrupt-<timestamp>` | 損毀主資料的原始副本 |

- 功能模組可以管理自己的 localStorage key，並非只有 `storage.ts` 能存取 localStorage。
- 每個模組必須有明確版本、逐欄驗證、讀寫例外保護與測試；壞 JSON、非法欄位或單筆損毀不能造成 App 崩潰。不要清掉其他模組的 key，也不要使用 `localStorage.clear()` 作修復。
- `backup.ts` 負責主資料備份的純函式，匯入使用與主資料相同的遷移及驗證。還原前預覽、確認、保存舊資料並提供復原。
- 新增獨立模組資料時，必須說明是否已納入匯出／匯入；不要把只備份 AppData 的檔案宣稱成包含所有模組。
- ErrorBoundary 的恢復畫面不能依賴可能已壞掉的 Provider；依本機語言設定顯示繁中／英文，直接讀取原始儲存內容匯出。

## 5. 現有功能基準

- 吃頁有轉盤、本週菜單、食材、菜色管理；「抽組合」已移除，不得自行加回。
- 轉盤依早餐／午餐／晚餐與庫存篩選：0 道顯示空狀態、1 道直接顯示菜卡、2～3 道重複排成 6 格、4 道以上最多 8 格。指針格子必須與結果一致。
- 記錄餐點後保留食譜 Sheet，防止同一次操作重複記錄，提供復原；TodayMeals 支援收合／展開、刪除及復原。
- 菜單與詳情維持完整菜名；轉盤英文可以使用專用短名。自訂菜與食材缺翻譯時顯示原名，不能顯示空白或 key。
- 練頁有本週、有氧、無氧；8 種有氧器材為跑步機、爬樓機、橢圓機、飛輪、臥式健身車、划船機、風扇車、滑雪機。
- 器材使用橫向選擇列；保留每種器材的推薦與課表。不要自行更改已確認的時間、阻力、速度、組數等數值。
- 重訓動作一列一個，不能把全部動作塞成同一行；進行中的訓練與紀錄由 workout 模組管理。
- 今日總覽、本週菜單、購物清單與重訓模組可能由其他平行任務更新；本節不能作為回退別人新功能的理由。

## 6. 視覺設計系統

風格：**明亮清新的健康／健身 App**。淡色背景、白色卡片、柔和陰影、清楚的照片與資訊層次。禁止科技感、賽博龐克、霓虹發光、深色主題與復古風。

顏色定義在 `src/index.css` 的 `@theme`，元件用 Tailwind class，如 `bg-surface`、`text-muted`、`border-line`，不寫死色碼、不使用舊的 `var(--bg)` 名稱。

| Token | 值 | 用途 |
|---|---|---|
| `--color-bg` | `#F6F8F5` | 淡灰綠背景 |
| `--color-surface` | `#FFFFFF` | 白色卡片 |
| `--color-surface-2` | `#EEF2EC` | 內層與未選中區塊 |
| `--color-line` | `rgba(15,23,42,0.08)` | 邊框 |
| `--color-text` | `#0F172A` | 主文字 |
| `--color-muted` | `#64748B` | 次要文字 |
| `--color-food` | `#22C55E` | 吃，鮮綠 |
| `--color-fit` | `#F97316` | 練，活力橘 |
| `--color-ok` | `#16A34A` | 成功與有庫存 |

轉盤與裝飾沿用下列 token，每個名稱均以 `--color-` 為前綴：

| 底色 token | 值 | 文字 token | 值 |
|---|---|---|---|
| `tomato` | `#F7C1C1` | `tomato-ink` | `#791F1F` |
| `carrot` | `#FAC775` | `carrot-ink` | `#633806` |
| `corn` | `#FCE9A8` | `corn-ink` | `#633806` |
| `lettuce` | `#C0DD97` | `lettuce-ink` | `#27500A` |
| `eggplant` | `#CECBF6` | `eggplant-ink` | `#3C3489` |
| `mint` | `#9FE1CB` | `mint-ink` | `#085041` |
| `radish` | `#F4C0D1` | `radish-ink` | `#72243E` |
| `broccoli` | `#97C459` | `broccoli-ink` | `#173404` |

- 字型：本機 Inter → PingFang TC → Noto Sans TC → system-ui → sans-serif；中文字使用系統備援。數字用 `tabular-nums`。
- Inter 以獨立 `/fonts/InterVariable.woff2` 載入，`font-display: swap`，保留 preload、OFL 授權及 WOFF2 離線快取；不使用 `?inline` 或 base64 膨脹 CSS。
- 標題基準 28px／800，英文長標題可用 24px；內文 15px，最小 12px。
- 圓角：卡片 20px、封面 24px、按鈕 14px、Sheet 頂部 28px。
- 卡片陰影固定為 `shadow-[0_8px_24px_rgba(15,23,42,0.06)]`；其中陰影色碼是允許的例外，不改成發光效果。
- 主色按鈕是實心 `bg-food`／`bg-fit` 搭配 `text-white`。允許既有的白字、白色分隔線與照片遮罩用途，不新增其他硬編碼顏色。
- 主色選中框覆蓋 Card 預設框時用 `border-2! border-fit!` 等 Tailwind v4 後綴寫法。
- 間距原則為 4 的倍數；頁面左右 padding 20px。背景由 body 統一處理，頁面 main 不再加 `bg-bg`。
- 點擊區域最小 44×44px，按壓回饋採 `scale(0.97)`；動態與版面不得造成文字重疊或溢出。
- 頂部、底部保留安全區，使用 `env(safe-area-inset-top)`、`env(safe-area-inset-bottom)` 與 `viewport-fit=cover`。
- 主內容與 Sheet 保持手機閱讀寬度，Sheet 使用 `mx-auto max-w-[480px]`。
- UI 圖示使用 lucide-react，不用 emoji 代替。
- 菜色圖片為 `/dishes/<dish.id>.jpg`，器材圖片為 `/fitness/<machine>.jpg`；載入失敗使用主色淡底及圖示佔位。
- 現有未符合設計規範的區域，只在任務授權時修改，不得以此為由擴大範圍。

## 7. 修改與回報規則

### 7.1 任務白名單與平行作業

1. 只准改任務列出的檔案，包括新增、刪除、改名及搬移。沒有「單次最多改幾個檔案」的限制。
2. 讀取範圍遵守當次任務；允許讀取不代表允許修改。
3. 需要改白名單外的檔案時，先停下該項修改並詢問，說明檔案、原因與最小必要變更；編譯錯誤也不能自行擴權。
4. 已明確授權的型別、資料結構、設計或功能變更，直接在授權範圍內完成，不重複詢問。
5. 編輯前確認工作目錄、Git 狀態與最新內容，採必要的局部修改；不要用過期內容整檔覆蓋別人的工作。
6. 不覆寫、刪除、回退其他分頁的變更；尤其不得因自己的任務未授權而清除別人的未追蹤檔案。
7. 不准 commit。Git 狀態可以包含其他任務的修改，回報時分清本次實際修改與原有／其他分頁的修改。
8. 不改無關命名、import 排序、縮排、格式或功能。其他問題只回報，不順便修復。

### 7.2 寫檔與程式碼輸出

- 使用者要求直接修改專案時，實際修改授權檔案並驗證，不再要求使用者手動複製貼上。
- 使用者要求片段輸出時，列出檔案、唯一可搜尋的定位錨點、動作，以及完整替換區塊；不能只給行號或半個函式。
- 使用者要求整檔輸出、重寫文件或新建檔案時，可以提供完整內容；其他情況不無故重寫整檔。
- 不用 `// ...existing code` 或 `// ...rest unchanged` 省略替換區塊內必要內容。
- 輸出格式依當次任務要求，不為套用舊固定格式而延誤已授權的工作。

### 7.3 程式碼與多語

- 程式碼註解用英文；TypeScript 維持 strict，不用 `any` 規避型別問題。
- 一般元件使用 function component 與 hooks；ErrorBoundary 可使用 React class component。
- 所有介面文字、單位、錯誤、空狀態及無障礙標籤都支援 `zh-Hant` 與 `en`，不加入簡體中文。
- 文字從 `t()`、資料翻譯函式或模組翻譯包裝取得；允許 `strings.*.ts`、`useMenuText()`、`useTodayText()` 等既有分工，不把文案硬寫進 JSX。
- ErrorBoundary 的雙語恢復文字必須能在 Provider 壞掉時運作，不強制使用 `useLang()`。
- `langContext.ts` 保持與 `strings`、`dataTranslations` 分離，避免熱更新破壞 Context 身分。
- 日期、星期與時間依語言用 `Intl` 格式化；日期 key 使用當地日期，注意跨午夜及週界。
- 不使用 `alert()`、`confirm()`、`prompt()`，使用既有 Sheet 或應用內確認介面。

### 7.4 回報

回報實際完成內容、實際修改的完整路徑、驗證結果與證據、Git 狀態及未完成原因。不要將未執行的測試或未觀察的畫面宣稱為通過。

使用者說「不用寫程式碼」時可以簡短回答，不套用程式碼輸出格式。需要全文、完整測試輸出或其他證據時，依當次任務提供。

## 8. 飲食限制與隱私

### 8.1 飲食限制（永久適用）

食材、預設菜色、食譜、翻譯及生成圖片都必須遵守：

- 不吃魚與任何海鮮，包含蠔油、魚露、蝦米、柴魚等配料或調味。
- 不吃豆腐與其他豆製品，包含豆干、豆皮等；**醬油可以使用**。
- 不吃任何菇類，包含香菇粉等加工調味。
- 不得為了簡化食譜、圖片或翻譯而偷偷替換成禁止食材；份量、調味、步驟與圖片的主要配料要一致。

### 8.2 隱私與離線

- 不准加入任何會連到外部伺服器的資源或 SDK，包括外部字型、CDN 腳本、遠端圖片、分析、廣告、追蹤、遙測或錯誤上傳。
- 字型、照片、圖示及執行所需資源隨專案本機提供；官方資源下載是開發階段的取得方式，不是讓使用者開 App 時連到官方伺服器。
- 既有教學搜尋連結只在使用者主動點擊後開啟，不預載、不內嵌播放器、不在背景請求，也不自動傳送個人紀錄或目標資料。
- 備份使用本機檔案下載、系統分享或使用者選檔；不得加入背景雲端同步。
- Service Worker 只在正式網頁版註冊，`main.tsx` 是唯一註冊點；開發模式與 Capacitor 原生環境不註冊。PWA 保持 `injectRegister: null`。
- Workbox 必須涵蓋所需離線資源；目前 `globPatterns` 為 `['**/*.{js,css,html,woff2}']`。不要只因本機 HTTP 快取命中就宣稱離線支援完整。
- 上架隱私聲明必須與實際行為一致；新增權限、資料傳輸或儲存方式須有明確任務授權。

## 9. 品質與驗收

- **要完整，不是完成。** 不默默跳過驗收、不降低標準、不只讓畫面看似能動。
- 新增或修改邏輯要有對應單元測試，涵蓋正常、邊界、錯誤與舊資料情境；測試要保留在專案，不得靠刪除或跳過測試取得通過。
- 程式變更交付前，`npm test` 與 `npm run build` 都必須通過且沒有警告；不得提高 chunk 警告門檻或關閉檢查來掩蓋問題。
- 如驗證被其他平行任務擋住，回報完整錯誤與所在檔案；不要越界修復，也不要宣稱整體通過。
- 介面驗收附上 **390px 寬、繁中與英文**的實際截圖，覆蓋本次變更涉及的頁面、Sheet、空狀態與錯誤狀態；需要首屏驗證時用 390×844。
- 檢查英文長文、數字、分頁、chip、按鈕及轉盤標籤不溢出、不重疊，不顯示翻譯 key。
- 資料變更驗證重新整理、舊資料遷移、損毀資料、重複操作與復原；不能只測全新資料。
- 離線驗證先完成資源快取，再斷網重新開啟；字型除 `document.fonts.check('16px Inter')` 外也確認 Inter 已載入及快取來源。
- 純文件任務依該任務驗收，不虛構 UI 截圖；使用者明確改用程式驗證取代截圖時，遵守其指示並附實際輸出。
- 完成後檢查 diff 與 `git status --short`，確認本次沒有越界修改、遺留測試注入或暫存程式。

## 10. 交付前自我檢查

- [ ] 工作位置正確，已讀取最新內容並保留其他分頁的修改。
- [ ] 本次只修改任務白名單，沒有 commit。
- [ ] 資料有驗證與相容性處理，不覆寫未備份的損毀資料或未來版本。
- [ ] 設計 token、圓角、陰影、飲食限制及隱私要求均符合。
- [ ] 繁中／英文完整，錯誤與空狀態可理解且可恢復。
- [ ] 必要單元測試與 build 通過、無警告；所需 390px 截圖或替代證據已附上。
- [ ] 回報均為事實，未完成項目與阻礙已明確列出。
