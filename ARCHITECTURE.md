# Architecture - PK B2B Orders Desktop App

## System Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                         WINDOWS DESKTOP APP                           │
│                    (Electron + React + Vite)                          │
└───────────────────────────────────────────────────────────────────────┘
                                  │
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   ELECTRON    │      │     PRELOAD      │      │      REACT       │
│ MAIN PROCESS  │◄────►│     SCRIPT       │◄────►│    RENDERER      │
│  (Node.js)    │ IPC  │  (IPC Bridge)    │ Safe │  (Browser)       │
│               │      │                  │ APIs │                  │
└───────────────┘      └──────────────────┘      └──────────────────┘
```

---

## Component Architecture

### 1. Electron Main Process (electron/main.cjs)

```
┌──────────────────────────────────────────────────────────┐
│               ELECTRON MAIN PROCESS                       │
│              (Node.js Backend)                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐    ┌──────────────────┐            │
│  │ BrowserWindow  │    │  System Tray     │            │
│  │ Management     │    │  Integration     │            │
│  │                │    │                  │            │
│  │ • Create       │    │ • Icon           │            │
│  │ • Show/Hide    │    │ • Menu           │            │
│  │ • Minimize     │    │ • Show/Hide      │            │
│  │ • Close        │    │ • Quit           │            │
│  └────────────────┘    └──────────────────┘            │
│                                                          │
│  ┌────────────────────────────────────────┐            │
│  │     Windows Notification Handler       │            │
│  │                                         │            │
│  │  IPC: 'show-notification'              │            │
│  │  ↓                                      │            │
│  │  new Notification({                    │            │
│  │    title, body, icon, urgency          │            │
│  │  }).show();                             │            │
│  └────────────────────────────────────────┘            │
│                                                          │
│  ┌────────────────────────────────────────┐            │
│  │     App Lifecycle Management           │            │
│  │                                         │            │
│  │  • app.whenReady()                     │            │
│  │  • app.on('activate')                  │            │
│  │  • app.on('before-quit')               │            │
│  │  • app.on('window-all-closed')         │            │
│  └────────────────────────────────────────┘            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2. Preload Script (electron/preload.js)

```
┌──────────────────────────────────────────────────────────┐
│                PRELOAD SCRIPT                            │
│           (Secure IPC Bridge)                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  contextBridge.exposeInMainWorld('electron', {          │
│                                                          │
│    showNotification(title, body) {                      │
│      ┌──────────────────────────────────────┐          │
│      │  ipcRenderer.invoke(                 │          │
│      │    'show-notification',              │          │
│      │    { title, body }                   │          │
│      │  )                                    │          │
│      └──────────────────────────────────────┘          │
│    },                                                    │
│                                                          │
│    isElectron: true,                                    │
│    platform: process.platform                           │
│  });                                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
         │                                    ▲
         │ Exposes Safe API                   │
         ▼                                    │ Calls IPC
┌────────────────────────┐    ┌──────────────────────────┐
│   Renderer Process     │    │   Main Process           │
│   window.electron.*    │    │   IPC Handlers           │
└────────────────────────┘    └──────────────────────────┘
```

### 3. React Renderer Process (src/)

```
┌──────────────────────────────────────────────────────────┐
│                  REACT RENDERER                          │
│               (Browser Environment)                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────┐            │
│  │         App.jsx (Root)                 │            │
│  │                                         │            │
│  │  ┌──────────────────────────────────┐ │            │
│  │  │       Orders.jsx                 │ │            │
│  │  │                                   │ │            │
│  │  │  ┌─────────────────────────────┐ │ │            │
│  │  │  │  useOrderNotification()     │ │ │            │
│  │  │  │                              │ │ │            │
│  │  │  │  • startPolling()           │ │ │            │
│  │  │  │  • stopPolling()            │ │ │            │
│  │  │  │  • checkForNewOrders()      │ │ │            │
│  │  │  │  • audioRef                 │ │ │            │
│  │  │  │  • latestOrderIdRef         │ │ │            │
│  │  │  └─────────────────────────────┘ │ │            │
│  │  │                                   │ │            │
│  │  │  useEffect(() => {                │ │            │
│  │  │    startPolling(refresh, 5000);  │ │            │
│  │  │    return () => stopPolling();   │ │            │
│  │  │  }, []);                          │ │            │
│  │  └──────────────────────────────────┘ │            │
│  │                                         │            │
│  └────────────────────────────────────────┘            │
│                                                          │
│  ┌────────────────────────────────────────┐            │
│  │         API Service (api.js)           │            │
│  │                                         │            │
│  │  orderAPI.getOrders()                  │            │
│  │    ↓                                    │            │
│  │  GET /orders/                          │            │
│  │    ↓                                    │            │
│  │  Returns: [{ order_id, ... }]         │            │
│  └────────────────────────────────────────┘            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Order Notification Flow

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Component Mount & Initialization                   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
    ┌──────────────────────────────────────────┐
    │  Orders.jsx useEffect() triggers         │
    │  startPolling(refreshOrders, 5000)       │
    └──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Initial Load (First Poll)                          │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
    ┌──────────────────────────────────────────┐
    │  API Call: GET /orders/                  │
    │  Returns: [{ order_id: "ORD-001", ... }] │
    └──────────────────────────────────────────┘
                        │
                        ▼
    ┌──────────────────────────────────────────┐
    │  checkForNewOrders()                     │
    │  isFirstLoad = true                      │
    │  ↓                                        │
    │  Store: latestOrderId = "ORD-001"        │
    │  Skip notification (first load)          │
    │  isFirstLoad = false                     │
    └──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Continuous Polling (Every 5 Seconds)               │
└─────────────────────────────────────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │   setInterval Loop    │
            │   (5000ms)            │
            └───────────┬───────────┘
                        │
                        ▼
    ┌──────────────────────────────────────────┐
    │  Poll #1: GET /orders/                   │
    │  Response: [{ order_id: "ORD-001" }]     │
    │  Compare: "ORD-001" === "ORD-001" ✅     │
    │  Result: No change, skip notification    │
    └──────────────────────────────────────────┘
                        │
                    Wait 5s
                        │
                        ▼
    ┌──────────────────────────────────────────┐
    │  Poll #2: GET /orders/                   │
    │  Response: [{ order_id: "ORD-001" }]     │
    │  Compare: "ORD-001" === "ORD-001" ✅     │
    │  Result: No change, skip notification    │
    └──────────────────────────────────────────┘
                        │
                    Wait 5s
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: New Order Detected! 🔔                             │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
    ┌──────────────────────────────────────────┐
    │  Poll #3: GET /orders/                   │
    │  Response: [{ order_id: "ORD-002" }]     │
    │  Compare: "ORD-002" !== "ORD-001" ❌     │
    │  Result: NEW ORDER DETECTED!             │
    └──────────────────────────────────────────┘
                        │
            ┌───────────┼───────────┐
            │           │           │
            ▼           ▼           ▼
    ┌────────────┐ ┌────────────┐ ┌────────────┐
    │  Channel 1 │ │  Channel 2 │ │  Channel 3 │
    └────────────┘ └────────────┘ └────────────┘
            │           │           │
            ▼           ▼           ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   🔊 AUDIO   │ │ 💻 DESKTOP   │ │  🎉 TOAST    │
│ NOTIFICATION │ │ NOTIFICATION │ │ NOTIFICATION │
├──────────────┤ ├──────────────┤ ├──────────────┤
│              │ │              │ │              │
│ audioRef     │ │ window       │ │ showToast(   │
│  .current    │ │  .electron   │ │   message,   │
│  .play()     │ │  .show       │ │   'success'  │
│              │ │  Notification│ │ )            │
│              │ │  (...)       │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
            │           │           │
            └───────────┼───────────┘
                        │
                        ▼
    ┌──────────────────────────────────────────┐
    │  Update stored ID:                       │
    │  latestOrderId = "ORD-002"              │
    └──────────────────────────────────────────┘
                        │
                        ▼
            Continue polling every 5s...
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND API                          │
│              https://pkb2backend.myimc.in                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                  HTTP GET /orders/
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API SERVICE (api.js)                     │
│                                                             │
│  orderAPI.getOrders() {                                    │
│    return apiClient.get('/orders/')                        │
│  }                                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                     useFetchData()
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   ORDERS.JSX COMPONENT                      │
│                                                             │
│  const ordersResult = useFetchData(                        │
│    'orders',                                               │
│    () => orderAPI.getOrders(),                            │
│    [refreshKey]                                            │
│  );                                                         │
│                                                             │
│  const orders = ordersResult.data;  ← Array of orders     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ Pass to hook
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            USE ORDER NOTIFICATION HOOK                      │
│                                                             │
│  useOrderNotification(orders, showToast) {                 │
│                                                             │
│    useEffect(() => {                                       │
│      checkForNewOrders();  ← Triggered on orders change   │
│    }, [orders]);                                           │
│                                                             │
│    startPolling(refresh, 5000);  ← Start interval         │
│                                                             │
│    Compare: orders[0].order_id vs latestOrderIdRef        │
│  }                                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                  New order detected?
                           │
                   ┌───────┴───────┐
                   │  YES          │  NO
                   ▼               ▼
         ┌──────────────┐   ┌─────────────┐
         │   NOTIFY!    │   │  Continue   │
         │   🔔💻🎉    │   │  polling    │
         └──────────────┘   └─────────────┘
```

---

## Build Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SOURCE CODE                             │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │    React     │  │   Electron   │  │   Config     │    │
│  │    (src/)    │  │  (electron/) │  │   Files      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                   npm run dist
                           │
           ┌───────────────┼───────────────┐
           ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│   VITE BUILD         │      │  ELECTRON BUILDER    │
│   (vite build)       │      │  (electron-builder)  │
│                      │      │                      │
│  • Compiles React   │      │  • Packages Electron │
│  • Bundles assets   │      │  • Creates installer │
│  • Optimizes code   │      │  • Adds resources    │
│  • Outputs to dist/ │      │  • Signs app         │
└──────────────────────┘      └──────────────────────┘
           │                               │
           └───────────────┬───────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  BUILD OUTPUT (dist/)                       │
│                                                             │
│  PK B2B Orders Setup 1.0.0.exe                             │
│                                                             │
│  Contains:                                                  │
│  • Electron runtime (~150 MB)                              │
│  • React app (bundled)                                     │
│  • Node.js modules                                         │
│  • App resources (icon, sound)                             │
│  • NSIS installer wrapper                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
└─────────────────────────────────────────────────────────────┘

    ┌────────────────────────────────────────────────┐
    │           ELECTRON MAIN PROCESS                │
    │            (Full Node.js Access)               │
    │                                                 │
    │  ✅ File system access                         │
    │  ✅ Operating system APIs                      │
    │  ✅ Native notifications                       │
    │  ✅ System tray                                │
    └────────────────────┬───────────────────────────┘
                         │
                    IPC Bridge
                         │
    ┌────────────────────┴───────────────────────────┐
    │            PRELOAD SCRIPT                      │
    │         (Context Isolation)                    │
    │                                                 │
    │  contextBridge.exposeInMainWorld()            │
    │                                                 │
    │  ⚠️ Only expose safe APIs                     │
    │  ⚠️ Validate all inputs                       │
    │  ⚠️ No direct Node.js access                  │
    └────────────────────┬───────────────────────────┘
                         │
                  Safe APIs Only
                         │
    ┌────────────────────┴───────────────────────────┐
    │         REACT RENDERER PROCESS                 │
    │          (Browser Environment)                 │
    │                                                 │
    │  ❌ No Node.js access                          │
    │  ❌ No require()                               │
    │  ❌ No file system                             │
    │  ✅ Only browser APIs                          │
    │  ✅ Only exposed electron APIs                 │
    └────────────────────────────────────────────────┘

Security Settings (electron/main.cjs):
┌────────────────────────────────────────────────────┐
│  webPreferences: {                                 │
│    contextIsolation: true,      ← Required         │
│    nodeIntegration: false,      ← Required         │
│    enableRemoteModule: false,   ← Required         │
│    preload: './preload.js'      ← Safe bridge     │
│  }                                                  │
└────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT                              │
└─────────────────────────────────────────────────────────────┘

    npm run dev:electron
           │
           ▼
    ┌────────────┐      ┌────────────┐
    │   Vite     │      │  Electron  │
    │   Server   │◄────►│   Window   │
    │            │ Live │            │
    │ :5173      │ Load │ DevTools   │
    └────────────┘      └────────────┘
         ▲
         │ Hot Module
         │ Replacement
         ▼
    Source Code Changes


┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION                               │
└─────────────────────────────────────────────────────────────┘

    npm run dist
           │
           ▼
    ┌────────────────────────────────┐
    │    Build Process               │
    │                                │
    │  1. vite build → dist/        │
    │  2. electron-builder          │
    │     └→ packages dist/         │
    │     └→ creates installer      │
    └────────────────┬───────────────┘
                     │
                     ▼
    ┌────────────────────────────────┐
    │  PK B2B Orders Setup.exe       │
    └────────────────┬───────────────┘
                     │
                Install
                     │
                     ▼
    ┌────────────────────────────────┐
    │   C:\Program Files\            │
    │   PK B2B Orders\               │
    │   └── PK B2B Orders.exe        │
    └────────────────────────────────┘
                     │
                     ▼
    ┌────────────────────────────────┐
    │   Desktop Shortcut             │
    │   Start Menu Shortcut          │
    │   System Tray Icon             │
    └────────────────────────────────┘
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                         │
└─────────────────────────────────────────────────────────────┘

    ┌────────────────────────────────────────────┐
    │         DESKTOP FRAMEWORK                  │
    │         Electron 42.5.0                    │
    │         • Chromium                          │
    │         • Node.js                           │
    │         • V8 Engine                         │
    └────────────────┬───────────────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────────────┐
    │          UI FRAMEWORK                      │
    │          React 19.2.5                      │
    │          • JSX                              │
    │          • Hooks                            │
    │          • Components                       │
    └────────────────┬───────────────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────────────┐
    │         BUILD TOOL                         │
    │         Vite 8.0.10                        │
    │         • Fast HMR                          │
    │         • ES Modules                        │
    │         • Optimized builds                  │
    └────────────────┬───────────────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────────────┐
    │         PACKAGING                          │
    │         electron-builder 26.15.3           │
    │         • NSIS installer                    │
    │         • Code signing                      │
    │         • Auto updates                      │
    └────────────────────────────────────────────┘
```

---

## File System Architecture

```
Application Installation:
┌────────────────────────────────────────────────────┐
│  C:\Program Files\PK B2B Orders\                   │
│  ├── PK B2B Orders.exe        ← Main executable   │
│  ├── resources\                                    │
│  │   ├── app.asar             ← Bundled app       │
│  │   └── app.asar.unpacked    ← Native modules    │
│  ├── locales\                  ← Chromium locales │
│  └── [Electron runtime files]                     │
└────────────────────────────────────────────────────┘

User Data:
┌────────────────────────────────────────────────────┐
│  C:\Users\[Username]\AppData\Roaming\             │
│  └── PK B2B Orders\                                │
│      ├── Cache\                                    │
│      ├── Local Storage\                            │
│      └── logs\                                     │
└────────────────────────────────────────────────────┘
```

---

**Architecture designed for:**
- ✅ Security (Context Isolation)
- ✅ Performance (Optimized polling)
- ✅ Reliability (Error handling)
- ✅ Maintainability (Clean separation)
- ✅ Scalability (Modular design)

---

**Version**: 1.0.0  
**Last Updated**: June 24, 2026
