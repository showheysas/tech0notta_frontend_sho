# Frontend Sho v2

TechNotta AIの議事録管理システムのフロントエンドアプリケーション。

## Technology Stack

- **Framework**: Next.js 16.1.4 (App Router)
- **UI Library**: React 19.0.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Date Handling**: date-fns 4.1.0
- **Testing**: Jest 29, React Testing Library, fast-check
- **Deployment**: Azure App Service for Linux (Node 20 LTS)

## Getting Started

### Prerequisites

- Node.js 20 LTS
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing

```bash
# Run tests in watch mode
npm test

# Run tests once with coverage
npm run test:coverage

# Run property-based tests only
npm run test:properties

# Run tests in CI mode
npm run test:ci
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Environment Variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_API_URL=https://app-002-tech0notta-backend-dev.azurewebsites.net
```

## Project Structure

```
frontend_sho_v2/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (dashboard)
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── layout/             # Layout components
│   ├── ui/                 # UI components
│   └── upload/             # Upload components
├── lib/                    # Utilities and types
│   ├── types/              # TypeScript types
│   │   └── meeting.ts      # Meeting types
│   ├── constants/          # Constants
│   │   └── upload.ts       # Upload constants
│   ├── api/                # API clients
│   └── validation/         # Validation functions
├── __tests__/              # Test files
└── public/                 # Static assets
```

## Features

- ファイルアップロード機能（音声・動画対応）
- 処理状態のリアルタイム可視化
- 同期済み議事録の閲覧・修正
- Notion統合
- レスポンシブデザイン
- アクセシビリティ対応

## License

Private
