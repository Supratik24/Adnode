# 🎯 Adnode — Decentralized Advertising

**Adnode** is a Web3 advertising network where advertisers pay for attention, and hosts/viewers earn crypto for displaying or engaging with ads. Like BAT, but fully decentralized, Polygon‑powered, with AI verification and on‑chain payouts. SideShift auto‑swaps rewards to the recipient’s preferred asset.

---

## ✨ What Adnode Does

| Role | Description |
|------|-------------|
| 📢 **Advertisers** | Rent on‑chain ad slots and fund campaigns in MATIC/USDC (or ERC‑20). |
| 🖥️ **Hosts** | Mint NFT ad slots, embed a small snippet on sites/dApps, and earn from impressions. |
| 👀 **Viewers** | Earn micro‑rewards for verified views and interactions. |
| 💸 **Payouts** | Split automatically (default 70% Host / 20% Viewer / 10% Treasury) and can be auto‑swapped via SideShift. |

---

## 🔄 How It Works

1. **Advertiser** submits ad creative + budget → Smart contract escrows funds.
2. **Host’s site** loads the embed snippet → fetches ad creative to display.
3. A **verified view** occurs → backend calls `payView` on‑chain.
4. **Contract** splits payment: Host, Viewer, Treasury.
5. **Optional:** Recipients swap rewards using SideShift API.

---

## 👥 User Roles

- **Advertiser** — Creates campaigns, funds them, tracks performance.
- **Host** (Developer / Website Owner) — Mints ad‑slot NFT, embeds snippet, earns payouts.
- **Viewer** — Connects wallet; verified attention earns micro‑rewards.

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| ⛓️ **Blockchain** | Polygon (Amoy testnet / Mainnet) |
| 📜 **Contracts** | Solidity, Hardhat, OpenZeppelin |
| 🌐 **Frontend** | Next.js (App Router), Tailwind, RainbowKit, wagmi, viem, Ethers v6, Zustand, React Query |
| 🗄️ **Data** | MongoDB (users, campaigns, placements, analytics) |
| 📊 **Indexing** | The Graph (subgraph placeholder included) |
| 💱 **Payments / Swap** | SideShift API (quotes + orders) |
| 🤖 **AI** | Verification API stub ready for provider integration |

---

## 🚀 Deployed (Amoy Testnet)

| Contract | Address |
|----------|---------|
| **AdSlotNFT** | `0x5771b9368a1d5beB88861b7bb4C44c467966058f` |
| **Ad Manager** | `0xA5F95992d40782f3844e7B8BA5117fe05c4E530f` |

> ⚠️ Add these to the web app `.env` before running locally.

---

## 📁 Repo Layout

| Folder | Description |
|--------|-------------|
| 📂 `contracts/` | Hardhat project, Solidity contracts, deploy script |
| 📂 `web/` | Next.js app (advertiser + host dashboards, API routes) |
| 📂 `subgraph/` | The Graph notes (placeholder) |

---

## ⚡ Quick Start (Dev)

### 1️⃣ Contracts (Polygon Amoy)

- Create `.env` in `contracts/`:
  - `ALCHEMY_POLYGON_RPC=...`
  - `POLYGON_PRIVATE_KEY=0x...`
  - `ADNODE_TREASURY=0xYourTreasury`
- Then run:
  ```bash
  npx hardhat compile
  npx hardhat run scripts/deploy.ts --network amoy
  ```
- Save the printed contract addresses.

### 2️⃣ Web App

- Create `.env.local` in `web/` with:
  - `NEXT_PUBLIC_SLOT_ADDRESS=...`
  - `NEXT_PUBLIC_MANAGER_ADDRESS=...`
  - `NEXT_PUBLIC_WALLETCONNECT_ID=demo` (or your WalletConnect ID)
  - `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
  - `POLYGON_RPC=...` (Amoy RPC)
  - `SERVER_SIGNER_KEY=0x<low_priv_dev_key_with_test_MATIC>`
  - `SIDESHIFT_API_KEY=<your_sideshift_api_key>`
  - `MONGO_URL=mongodb+srv://...`
  - `MONGO_DB=adnode` _(optional, defaults to `adnode`)_
  - `WEB_SECRET=...` _(long random string for signing tokens)_
- Run:
  ```bash
  cd web && npm run dev
  ```

### 3️⃣ Use It

| Action | Where |
|--------|--------|
| Host flow | `/host` → mint ad slot → copy embed snippet |
| Advertiser flow | `/advertiser` → create + fund a campaign |
| Test payout | `POST /api/payView` with `{ id, viewer, nonce }` |
| Leaderboard | `/leaderboard` (top hosts/advertisers + platform stats) |
| Transaction history | `/transactions` (requires sign‑in) |
| Profile & wallet | `/settings` (requires sign‑in) |

---

## 📋 Recent Web App Changes

- Switched Wagmi/RainbowKit to Polygon Amoy and added a **NetworkStatus** pill.
- Reusable **toast** system (Zustand) for success/error/info across pages.
- MongoDB-backed APIs and dashboards:
  - `/api/leaderboard` + `/leaderboard` — top hosts/advertisers and global stats.
  - `/api/transactions` + `/transactions` — per‑user transaction history and summary.
  - `/api/user/update` + `/settings` — display name, wallet address, password.
- In‑memory **rate limiting** for sensitive API routes.
- UI polish: skeleton loaders, analytics charts, toasts, line‑clamp utilities.

---

## 🔒 Production Hardening

- Replace server‑side signer with user‑signed tx flows or a secure backend.
- Add robust AI moderation and fraud detection before paying views.
- Move view verification to an oracle/attestation flow.
- Build a real subgraph and analytics dashboard.
- Add allowlisting, rate limits, and signature checks to API routes.

---

## 🛡 Security Notes

- Treat private keys as secrets; rotate any exposed keys.
- Use separate keys for deployer, treasury, and server.
- Consider multisig or timelocks for treasury and config changes.

---

Made with 💜 by the Adnode team
