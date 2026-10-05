# ⚡ NSE & BSE Index F&O Market Dashboard & Surveillance Engine

[![Live Dashboard](https://img.shields.io/badge/Live_Dashboard-GitHub_Pages-brightgreen?style=for-the-badge&logo=github)](https://rishabhjain777.github.io/sm_market_index/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Broker API](https://img.shields.io/badge/Broker_API-Kotak_Neo-E31837?style=for-the-badge)](https://www.kotaksecurities.com)
[![Coverage](https://img.shields.io/badge/Universe-NSE_%26_BSE_Indices-6366F1?style=for-the-badge)](#-target-universe)

An automated analytics, surveillance, and high-conviction signal engine designed specifically for the **National Stock Exchange (NSE)** and **Bombay Stock Exchange (BSE)** benchmark derivatives segment.

The pipeline streams live spot quotes, futures curves, and options chains through the **Kotak Neo API**, computes derivatives metrics (Basis Spread, Put-Call Ratio, Max Pain, ATM Straddles, Floor Trader Pivots), compiles a dark-mode interactive dashboard, publishes to **GitHub Pages**, and triggers multi-channel alerts via **Telegram** and **Email**.

---

## 🌐 Public Live Dashboard

The interactive dashboard is compiled and synchronized to GitHub:
👉 **[https://rishabhjain777.github.io/sm_market_index/](https://rishabhjain777.github.io/sm_market_index/)**

---

## 🎯 Target Index Universe

| Exchange | Index Symbol | Instrument Name | Spot Ticker | F&O Segment | Strike Step | Lot Size |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: |
| **NSE** | `NIFTY` | NIFTY 50 Benchmark | `Nifty 50` | `nse_fo` (`FUTIDX`, `OPTIDX`) | 50 | 65 |
| **NSE** | `BANKNIFTY` | BANK NIFTY | `Nifty Bank` | `nse_fo` (`FUTIDX`, `OPTIDX`) | 100 | 30 |
| **NSE** | `FINNIFTY` | NIFTY Financial Services | `Nifty Fin Service` | `nse_fo` (`FUTIDX`, `OPTIDX`) | 50 | 60 |
| **NSE** | `MIDCPNIFTY` | NIFTY Midcap Select | `NIFTY MID SELECT` | `nse_fo` (`FUTIDX`, `OPTIDX`) | 25 | 120 |
| **NSE** | `NIFTYNXT50` | NIFTY Next 50 | `Nifty Next 50` | `nse_fo` (`FUTIDX`, `OPTIDX`) | 100 | 25 |
| **NSE** | `INDIA_VIX` | India Volatility Index | `INDIA VIX` | `nse_cm` (Market Fear Gauge) | — | 1 |
| **BSE** | `SENSEX` | BSE SENSEX 30 | `SENSEX` | `bse_fo` (`IF`, `IO`) | 100 | 20 |
| **BSE** | `BANKEX` | BSE BANKEX | `BANKEX` | `bse_fo` (`IF`, `IO`) | 100 | 30 |

---

## 🏗️ Architecture & Pipeline Flow

The execution cycle runs during market hours (**09:15 to 15:30 IST**, Monday through Friday) under a persistent watchdog supervisor:

```
Run_Index_Market.bat
       │
       ▼
supervisor.py (CrashLoopBackOff Watchdog & Process Supervisor)
       │
       ▼
run_market.py (Automated Execution Cycle)
       ├── 1. security_universe.py
       │      └── Downloads NSE FO, BSE FO, NSE CM scrip masters; maps tokens & strikes
       │
       ├── 2. market_metadata.py
       │      ├── Fetches live spot quotes (OHLC, LTP, Change)
       │      ├── Fetches near, next, and far-month Index Futures (OI, VWAP, Basis)
       │      ├── Brackets ATM ± 5 strikes and fetches Call/Put options batch quotes
       │      ├── Computes Put-Call Ratio (PCR), Max Pain, and ATM Straddle cost
       │      └── Calculates Classic Floor Trader Pivots (P, R1-R3, S1-S3)
       │
       ├── 3. signal_engine.py
       │      ├── Evaluates Price vs OI quadrants (LONG, SHORT, COVER, UNWIND)
       │      ├── Scores transition persistence and assigns Composite Conviction Score (0-10)
       │      └── Registers High-Conviction setups (Score >= 8.5) and tracks ±0.5% Movers
       │
       ├── 4. dashboard.py
       │      ├── Generates responsive dark-mode HTML shell & modular tabs
       │      └── Outputs html/index.html and html/market_dashboard.html
       │
       ├── 5. Alert Dispatcher
       │      ├── telegram_notifier.py (Rich HTML trade alerts)
       │      └── email_notifier.py (Gmail SMTP SSL formatted dispatches)
       │
       └── 6. github_uploader.py
              ├── Commits HTML bundle to rishabhjain777/sm_market_index via REST API
              └── Ensures GitHub Pages is active at https://rishabhjain777.github.io/sm_market_index/
```

---

## 📊 Analytics & Derivative Formulas

### 1. F&O Quadrants
* **Long Buildup (`LONG`)**: Price $\uparrow$ + Open Interest $\uparrow$ (Bullish position accumulation)
* **Short Buildup (`SHORT`)**: Price $\downarrow$ + Open Interest $\uparrow$ (Bearish position accumulation)
* **Short Covering (`COVER`)**: Price $\uparrow$ + Open Interest $\downarrow$ (Bearish traders covering shorts)
* **Long Unwinding (`UNWIND`)**: Price $\downarrow$ + Open Interest $\downarrow$ (Bullish traders closing longs)

### 2. Basis Spread & Cost of Carry
$$\text{Basis} = \text{Near Future LTP} - \text{Spot LTP}$$
$$\text{Basis \%} = \left(\frac{\text{Basis}}{\text{Spot LTP}}\right) \times 100$$
* **Premium**: Basis $> 0$ (Bullish momentum / positive cost of carry)
* **Discount**: Basis $< 0$ (Bearish sentiment / backwardation)

### 3. Put-Call Ratio (PCR) & Max Pain
$$\text{PCR} = \frac{\sum \text{Put Open Interest (Active Strikes)}}{\sum \text{Call Open Interest (Active Strikes)}}$$
* $\text{PCR} \ge 1.20$: **Bullish / Strong Put writing support**
* $\text{PCR} \le 0.80$: **Bearish / Strong Call writing resistance**
* **Max Pain Strike**: Strike price where option sellers encounter minimum aggregate cash payout.

### 4. Classic Floor Trader Pivots
* Central Pivot: $P = \frac{\text{High} + \text{Low} + \text{Close}}{3}$
* $R_1 = 2P - \text{Low} \quad | \quad S_1 = 2P - \text{High}$
* $R_2 = P + (\text{High} - \text{Low}) \quad | \quad S_2 = P - (\text{High} - \text{Low})$
* $R_3 = \text{High} + 2(P - \text{Low}) \quad | \quad S_3 = \text{Low} - 2(\text{High} - P)$

---

## 🚀 Quickstart & Usage

### 1. Requirements
Ensure Python 3.10+ and required packages are installed:
```powershell
pip install -r requirements.txt
```

### 2. One-Click Market Execution
Double-click:
```
Run_Index_Market.bat
```
Or launch directly from terminal:
```powershell
python python/run_market.py
```

### 3. Manual Single Cycle Test
To run a single diagnostic pipeline pass and update GitHub immediately:
```powershell
python python/run_market.py --once
```

### 4. Open Dashboard
To launch the live dashboard in your default browser:
```powershell
powershell -ExecutionPolicy Bypass -File launch_dashboard.ps1
```

### 5. Stop Execution
To stop all runner and supervisor processes cleanly:
```
Stop_Index_Market.bat
```

---

## 📁 Repository Structure

```
Index-Analysis/
├── .gitignore
├── requirements.txt
├── README.md
├── Run_Index_Market.bat
├── Stop_Index_Market.bat
├── launch_dashboard.ps1
├── python/
│   ├── paths.py               # Centralized path manager
│   ├── neo_connection.py      # Kotak Neo API SDK connection & TOTP auto-login
│   ├── error_logger.py        # Centralized resilient execution & error logging
│   ├── security_universe.py   # Synchronizes NSE & BSE index derivative tokens
│   ├── market_metadata.py     # Live quotes, futures curve, options chain, PCR, pivots
│   ├── signal_engine.py       # Quadrants, conviction scoring, movers engine
│   ├── dashboard.py           # HTML dashboard compiler
│   ├── github_uploader.py     # GitHub REST API sync & Pages host
│   ├── telegram_notifier.py   # Telegram HTML alert integration
│   ├── email_notifier.py      # SMTP SSL email alerts
│   ├── callmebot_notifier.py  # Voice calls & WhatsApp notifications
│   ├── run_market.py          # Market hours scheduler & pipeline loop
│   └── supervisor.py          # Watchdog supervisor process
├── html/
│   ├── index.html             # Main dashboard shell
│   ├── market_dashboard.html  # Standalone dashboard
│   ├── css/
│   │   └── dashboard.css      # Dark mode styling & animations
│   ├── js/
│   │   └── dashboard.js       # Tabs, live countdown, table search & sorting
│   └── tabs/
│       ├── market.html        # Overview matrix
│       ├── futures.html       # Futures curve & basis
│       ├── options.html       # Option chain & PCR
│       ├── pivots.html        # Floor trader pivots
│       ├── movers.html        # High conviction trades & movers
│       └── analyzer.html      # 360° index analyzer
├── json/                      # State & metadata caches
├── csv/                       # Historical intraday tick logs
└── logs/                      # Error & runner execution logs
```
