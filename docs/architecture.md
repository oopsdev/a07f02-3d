---
title: A07F02 3D 模型架構
date: 2026-10-14
version: 1.1.0
---

# 系統架構

單一靜態 HTML 檔，沒有後端與資料庫。所有平面資料（牆、門窗、房間、樑、家具）以常數寫在頁面的 module script 裡，單位為公分，座標沿用 Sweet Home 3D 檔（x 向東、y 向南）。使用者的設定存在瀏覽器 localStorage。

## 架構圖

```mermaid
flowchart LR
  A[index.html] --> B[平面資料常數 WALLS ROOMS BEAMS PARTS]
  A --> C[UI 面板 依區域分組的選單與滑桿]
  B --> D[建模函式 buildWall buildBeams buildJoinery box ell]
  C --> E[狀態 partition kitchen living diningMode beamMode]
  E --> D
  E --> K[localStorage 設定存檔]
  K --> E
  D --> F[three.js Scene]
  F --> G[WebGLRenderer 與陰影]
  F --> H[CSS2DRenderer 文字標籤]
  C --> W[室內漫遊 walk]
  W --> F
  I[jsDelivr three 0.160.0] --> A
  J[GitHub Pages] --> A
```

## 流程圖

```mermaid
flowchart TD
  S[開啟頁面] --> L[載入 three.js 與字型]
  L --> M[建立地板 花台 固定設備 洞洞板]
  M --> R[rebuild 依剖切高度與隔間狀態產生牆 樑 弧形天花板]
  R --> T[buildTV buildLayout buildDining]
  T --> P[loadSettings 套用上次的設定]
  P --> U[render loop]
  U --> V{使用者操作}
  V -->|切換隔間 腰牆 樑| R
  V -->|切換家具擺法| T
  V -->|陽光滑桿| X[更新太陽位置與色溫]
  V -->|進入室內| Y[漫遊模式 完整牆高 顯示天花板 停用 OrbitControls]
  Y -->|點畫面| Z[碰撞檢查後走到目標點]
  Z --> U
  Y -->|離開室內| R
  X --> U
  V -->|旋轉縮放| U
```

## 資料模型

沒有資料庫，因此沒有 ER Diagram。主要資料結構：

| 常數 | 內容 |
|---|---|
| WALL_H / SLAB_T / WALL_TOP | 室內淨高 330、樓板厚 15、牆頂 345 |
| BEAM_TOP / BEAM_BOTTOM | 樑頂（與牆頂切齊）、樑底離地（暫定 270） |
| WALLS | 牆中心線、厚度、外牆面方向、開口（門窗位置、窗台、楣樑、門窗形式） |
| BEAMS | 樑的平面範圍；ext 表示在外牆以外、用外牆磚材質 |
| PARAPETS / PLANTERS / SHAFTS / CANOPY | 女兒牆、花台、管道間與柱、陽台弧形天花板 |
| ROOMS / FLOOR_PATCHES | 房間地板矩形、材質、尺寸與面積；牆下補片與門檻 |
| PARTS | 臥室一可切換玻璃隔間的牆段 |
| LAYOUTS / DINING / TV / SOFA / COFFEE / VITRINE | 家具配置與 IKEA 尺寸 |
| CARPCAB / ENTRY_CAB / PEGBOARD | 木作吊櫃、玄關櫃、洞洞板 |
| SETTINGS_KEY | localStorage 設定存檔的鍵（逐欄位驗證後套用） |
