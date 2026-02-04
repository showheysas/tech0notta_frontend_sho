# TechNotta AI - フロントエンド

AI搭載の会議管理・文字起こし・Notion同期ツールのフロントエンドアプリケーションです。

## 主な機能

- 📊 **ダッシュボード**: 会議ステータスの概況確認
- 🤖 **Bot参加**: Zoom会議にBotを参加させる
- 📝 **議事録レビュー**: AI生成された議事録の確認・編集
- 💬 **対話型リライト**: チャットでAIに議事録の修正を依頼
- ✅ **承認・通知**: 議事録承認後にSlackへ自動通知
- 🔄 **Notion同期**: 承認済み議事録をNotionデータベースに同期

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 4
- **アイコン**: Lucide React
- **日付処理**: date-fns

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`を作成:

```bash
cp .env.example .env
```

`.env`ファイルを編集:

```env
# API Base URL
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## ビルド

本番用ビルド:

```bash
npm run build
```

本番サーバーの起動:

```bash
npm start
```

## プロジェクト構成

```
frontend_clone/
├── app/                    # Next.js App Router
│   ├── page.tsx           # ホーム画面（ダッシュボード）
│   ├── join/              # Bot参加画面
│   ├── live/              # ライブモニタリング画面
│   ├── review/            # レビュー画面
│   │   └── [id]/
│   │       └── page.tsx   # 議事録レビュー詳細
│   └── history/           # 履歴画面
├── components/            # 再利用可能なコンポーネント
│   ├── ui/               # UIコンポーネント
│   └── layout/           # レイアウトコンポーネント
├── lib/                  # ユーティリティ・型定義
│   ├── types/           # TypeScript型定義
│   └── constants/       # 定数
└── styles/              # グローバルスタイル
```

## 環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `NEXT_PUBLIC_API_URL` | バックエンドAPIのベースURL | `http://127.0.0.1:8000` |

## Azureデプロイ

### Azure Static Web Appsへのデプロイ

1. **Azure Portalでリソース作成**
   - Azure Static Web Appsを作成
   - GitHubリポジトリと連携

2. **環境変数の設定**
   - Azure Portalで環境変数を追加:
     - `NEXT_PUBLIC_API_URL`: バックエンドのURL

3. **自動デプロイ**
   - GitHubにプッシュすると自動的にデプロイされます

## 開発ガイドライン

### コーディング規約

- TypeScriptの型定義を必ず使用
- コンポーネントは関数コンポーネントで実装
- 'use client'ディレクティブを適切に使用

### API呼び出し

すべてのAPI呼び出しは`NEXT_PUBLIC_API_URL`環境変数を使用:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const response = await fetch(`${API_BASE_URL}/api/jobs`);
```

## トラブルシューティング

### APIに接続できない

- バックエンドサーバーが起動しているか確認
- `.env`ファイルの`NEXT_PUBLIC_API_URL`が正しいか確認
- CORSエラーの場合、バックエンドのCORS設定を確認

### ビルドエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

## ライセンス

This project is private and confidential.
