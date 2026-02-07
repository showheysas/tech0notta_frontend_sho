# Azure発行プロファイルの設定手順

## 問題
GitHub Actionsでデプロイ時に以下のエラーが発生：
```
Deployment Failed, Error: No credentials found. Add an Azure login action before this action.
```

## 原因
GitHubリポジトリに `AZURE_FRONTEND_PUBLISH_PROFILE` シークレットが設定されていない

## 解決手順

### 1. Azureポータルで発行プロファイルをダウンロード

1. https://portal.azure.com にアクセス
2. 検索バーで `app-002-tech0notta-frontend-dev` を検索
3. App Serviceを開く
4. 左メニューまたは上部の「発行プロファイルの取得」ボタンをクリック
5. `.PublishSettings` ファイルがダウンロードされる

### 2. GitHubにシークレットを追加

1. https://github.com/showheysas/tech0notta_frontend_sho/settings/secrets/actions にアクセス
2. 「New repository secret」ボタンをクリック
3. 以下を入力：
   - **Name**: `AZURE_FRONTEND_PUBLISH_PROFILE`
   - **Value**: ダウンロードした `.PublishSettings` ファイルをテキストエディタで開き、内容全体をコピー＆ペースト
4. 「Add secret」ボタンをクリック

### 3. GitHub Actionsを再実行

シークレット追加後、以下のいずれかを実行：
- 新しいコミットをプッシュ
- GitHubのActionsタブで失敗したワークフローの「Re-run all jobs」をクリック

## 注意事項

- 発行プロファイルには認証情報が含まれるため、絶対にコードにコミットしないこと
- GitHubのSecretsに保存することで安全に管理できる
- 発行プロファイルは定期的に更新される可能性があるため、デプロイエラーが発生した場合は再取得して更新する

## 現在のワークフロー設定

ワークフローファイル: `.github/workflows/deploy.yml`

```yaml
name: Deploy Frontend to Azure App Service

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v3
        with:
          app-name: app-002-tech0notta-frontend-dev
          publish-profile: ${{ secrets.AZURE_FRONTEND_PUBLISH_PROFILE }}
          package: .

      - name: Notify on failure
        if: failure()
        run: echo "Deployment failed! Check the logs."
```

## 変更履歴

- 2026-02-07: `frontend_sho_v2` から `frontend_sho_clone` 用にパス設定を修正
- `paths` フィルターを削除し、mainブランチへのすべてのプッシュでトリガー
- `working-directory` を削除し、リポジトリルートで動作するように変更
- シークレット名を `AZUREAPPSERVICE_PUBLISHPROFILE_8BECFC3DC8E94F4D8FD42D78936D72E7` に修正
