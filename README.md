# Asset Management System - ระบบงานทะเบียนครุภัณฑ์

A comprehensive full-stack asset management system with QR code tracking, depreciation calculation, and AI-powered maintenance prediction.

## Features

### Backend (FastAPI)
- **Asset Management**: CRUD operations for fixed assets
- **Depreciation Tracking**: Multiple depreciation methods (straight-line, declining balance)
- **Maintenance Management**: Track preventive, corrective, and predictive maintenance
- **QR Code Generation**: Auto-generate QR codes for each asset
- **Authentication**: JWT-based auth with RBAC (admin, manager, staff roles)
- **AI Predictions**: ML-based maintenance failure prediction

### Frontend (React + TypeScript)
- **Dashboard**: Overview of assets, maintenance, and AI alerts
- **Asset List**: Browse, filter, and manage assets
- **Asset Detail**: View complete asset information with tabs
- **Depreciation**: View depreciation schedules and records
- **Maintenance**: Create and track maintenance records
- **QR Scanner**: Scan asset QR codes with camera
- **Reports**: Analytics and visualizations

### AI Smart Alert
- Predictive maintenance based on asset history
- Confidence scoring for predictions
- Automated alert generation
- Cost estimation for upcoming maintenance

## Tech Stack

**Backend:**
- FastAPI 0.109
- SQLAlchemy 2.0 (async)
- SQLite (asyncite)
- Pydantic 2.5
- JWT (python-jose)
- QR Code (qrcode)
- NumPy for ML

**Frontend:**
- React 18
- TypeScript 5
- Vite 5
- Zustand (state management)
- React Query
- React Router 6
- Recharts (visualizations)
- react-qr-reader

## Project Structure

```
asset_system_phoubon/
├── backend/
│   ├── app/
│   │   ├── api/          # API routers
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── core/         # Config, DB, security
│   │   └── ai/           # ML prediction & alerts
│   ├── requirements.txt
│   └── app/main.py
└── frontend/
    ├── src/
    │   ├── pages/        # Page components
    │   ├── components/   # Reusable components
    │   ├── stores/       # Zustand stores
    │   ├── hooks/        # Custom hooks
    │   ├── lib/          # API client
    │   └── types/        # TypeScript types
    ├── package.json
    └── vite.config.ts
```

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m app.main
# Server runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:3000
```

## Default Credentials
- Username: `admin`
- Password: `admin123`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register user (admin only)
- `GET /api/v1/auth/me` - Get current user

### Assets
- `GET /api/v1/assets` - List assets
- `GET /api/v1/assets/{id}` - Get asset
- `POST /api/v1/assets` - Create asset
- `PUT /api/v1/assets/{id}` - Update asset
- `DELETE /api/v1/assets/{id}` - Delete asset

### Depreciation
- `GET /api/v1/depreciation/schedule/{id}` - Calculate schedule
- `GET /api/v1/depreciation/records/{id}` - Get records
- `POST /api/v1/depreciation/records` - Create record

### Maintenance
- `GET /api/v1/maintenance/records` - List records
- `POST /api/v1/maintenance/records` - Create record
- `PUT /api/v1/maintenance/records/{id}` - Update record
- `GET /api/v1/maintenance/upcoming` - Upcoming maintenance

### QR Codes
- `GET /api/v1/qr/{id}` - Get QR code image
- `GET /api/v1/qr/{id}/base64` - Get base64 QR

### AI Predictions
- `GET /api/v1/ai/alerts` - Get maintenance alerts
- `GET /api/v1/ai/alerts/summary` - Alert summary
- `GET /api/v1/ai/predictions/{id}` - Asset prediction
- `POST /api/v1/ai/alerts/{id}/create-maintenance` - Create from prediction

## RBAC Permissions

| Role | Permissions |
|------|-------------|
| admin | create, read, update, delete, manage_users |
| manager | create, read, update |
| staff | read |

## License

MIT License - ระบบงานทะเบียนครุภัณฑ์
