---
title: A07F02 3D 模型架構
date: 2026-10-13
version: 1.0.0
---

# 系統架構

單一靜態 HTML 檔，沒有後端與資料庫。所有平面資料（牆、門窗、房間、家具）以常數寫在頁面的 module script 裡，單位為公分，座標沿用 Sweet Home 3D 檔（x 向東、y 向南）。

## 架構圖

```mermaid
flowchart LR
  A[index.html] --> B[平面資料常數 WALLS ROOMS PARTS]
  A --> C[UI 面板 按鈕與滑桿]
  B --> D[建模函式 buildWall buildJoinery box ell]
  C --> E[狀態 partition kitchen living diningMode]
  E --> D
  D --> F[three.js Scene]
  F --> G[WebGLRenderer 與陰影]
  F --> H[CSS2DRenderer 文字標籤]
  I[jsDelivr three 0.160.0] --> A
  J[GitHub Pages] --> A
```

## 流程圖

```mermaid
flowchart TD
  S[開啟頁面] --> L[載入 three.js 與字型]
  L --> M[建立地板 花台 底板 固定設備]
  M --> R[rebuild 依剖切高度與隔間狀態產生牆]
  R --> T[buildTV buildLayout buildDining]
  T --> U[render loop]
  U --> V{使用者操作}
  V -->|切換隔間或腰牆| R
  V -->|切換家具擺法| T
  V -->|陽光滑桿| W[更新太陽位置與色溫]
  W --> U
  V -->|旋轉縮放| U
```

## 資料模型

沒有資料庫，因此沒有 ER Diagram。主要資料結構：

| 常數 | 內容 |
|---|---|
| WALLS | 牆中心線、厚度、開口（門窗位置、窗台、楣樑、門窗形式） |
| PARAPETS / PLANTERS / SHAFTS | 女兒牆、花台、管道間 |
| ROOMS | 房間地板矩形、材質、尺寸與面積 |
| PARTS | 臥室一可切換玻璃隔間的牆段 |
| LAYOUTS / DINING / TV / SOFA / COFFEE | 家具配置與 IKEA 尺寸 |
