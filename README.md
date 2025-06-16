# リアルタイム人狼ゲーム

このプロジェクトは、リアルタイム通信を用いた人狼ゲームです。複数人のプレイヤーがWebブラウザから参加し、昼と夜のフェーズを繰り返してゲームを進行します。

## 構成

- サーバー: Node.js + Express + Socket.IO
- クライアント: React + Vite + Socket.IO-client

## 起動手順

1. **サーバー**
```bash
cd server
npm install
npm start
```

2. **クライアント**
```bash
cd client
npm install
npm run dev
```

サーバーはデフォルトで `localhost:3000` にて起動します。クライアントは `localhost:5173` にアクセスしてください。

## デプロイ

Render.com または Railway.app で Node.js としてサーバーをホスト可能です。