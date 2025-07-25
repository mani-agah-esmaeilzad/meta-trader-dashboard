# MetaTrader Dashboard API Documentation

## مستندات API برای اتصال به داشبورد MetaTrader

این مستندات شامل تمامی endpoints و schemas موردنیاز برای پیاده‌سازی API با Python است.

## Base URL
```
https://your-api-domain.com/api
```

## Authentication
همه درخواست‌ها (به جز login) نیاز به header زیر دارند:
```
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints

### POST /auth/login
ورود کاربر به سیستم

**Request Body:**
```json
{
  "accountNumber": "string",    // شماره حساب MetaTrader
  "password": "string",         // رمز عبور
  "server": "string"           // نام سرور MetaTrader
}
```

**Response Success (200):**
```json
{
  "success": true,
  "token": "string",           // JWT token برای authentication
  "message": "Login successful",
  "accountInfo": {
    "accountNumber": "string",
    "name": "string",
    "server": "string",
    "balance": 10000.50,
    "equity": 10250.75,
    "margin": 1500.00,
    "freeMargin": 8750.75,
    "marginLevel": 683.38,
    "profit": 250.25,
    "currency": "USD",
    "leverage": 1000,
    "company": "MetaQuotes Ltd."
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response Error (401):**
```json
{
  "success": false,
  "error": {
    "code": 401,
    "message": "Invalid credentials",
    "details": "Account number or password is incorrect"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### POST /auth/logout
خروج کاربر از سیستم

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 2. Account Information Endpoints

### GET /account/info
دریافت اطلاعات کلی حساب

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accountNumber": "string",
    "name": "string",
    "server": "string",
    "balance": 10000.50,
    "equity": 10250.75,
    "margin": 1500.00,
    "freeMargin": 8750.75,
    "marginLevel": 683.38,
    "profit": 250.25,
    "currency": "USD",
    "leverage": 1000,
    "company": "MetaQuotes Ltd."
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 3. Position Endpoints

### GET /positions
دریافت لیست پوزیشن‌های باز

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "ticket": 123456,
      "symbol": "XAUUSD",
      "type": "BUY",
      "volume": 0.10,
      "openPrice": 2025.50,
      "currentPrice": 2028.75,
      "profit": 32.50,
      "swap": -5.20,
      "commission": -10.00,
      "openTime": "2024-01-15T10:30:00Z",
      "stopLoss": 2020.00,
      "takeProfit": 2035.00,
      "comment": "Manual trade"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET /positions/summary
دریافت خلاصه پوزیشن‌ها به تفکیک نماد

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "XAUUSD",
      "netVolume": 0.05,          // حجم خالص (مثبت = BUY، منفی = SELL)
      "netType": "BUY",           // BUY | SELL | NEUTRAL
      "totalProfit": 125.50,
      "totalSwap": -15.75,
      "totalCommission": -25.00,
      "positionCount": 3
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 4. History Endpoints

### GET /history/trades
دریافت تاریخچه معاملات بسته شده

**Query Parameters:**
- `from`: تاریخ شروع (ISO 8601 format) - اختیاری
- `to`: تاریخ پایان (ISO 8601 format) - اختیاری  
- `limit`: تعداد رکورد (پیش‌فرض: 50) - اختیاری
- `symbol`: فیلتر بر اساس نماد - اختیاری

**Example:** `/history/trades?from=2024-01-01T00:00:00Z&to=2024-01-15T23:59:59Z&limit=100`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "ticket": 123450,
      "symbol": "GBPUSD",
      "type": "BUY",
      "volume": 0.30,
      "openPrice": 1.2650,
      "closePrice": 1.2680,
      "profit": 90.00,
      "swap": -2.50,
      "commission": -5.00,
      "openTime": "2024-01-14T09:00:00Z",
      "closeTime": "2024-01-14T15:30:00Z",
      "comment": "Take profit"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 5. Market Data Endpoints

### GET /market/symbols
دریافت لیست نمادهای موجود

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "XAUUSD",
      "description": "Gold vs US Dollar",
      "bid": 2028.45,
      "ask": 2028.75,
      "spread": 0.30,
      "digits": 2,
      "point": 0.01,
      "lotSize": 100,
      "marginRequired": 1000.00
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET /market/prices
دریافت قیمت‌های آنی نمادها

**Query Parameters:**
- `symbols`: لیست نمادها جدا شده با کاما (مثال: XAUUSD,EURUSD,GBPUSD)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "XAUUSD",
      "bid": 2028.45,
      "ask": 2028.75,
      "last": 2028.60,
      "volume": 1250,
      "time": "2024-01-15T10:30:00Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 6. WebSocket Connection برای Real-time Updates

### WebSocket URL
```
wss://your-api-domain.com/ws
```

### Connection
پس از اتصال، token را ارسال کنید:
```json
{
  "type": "AUTHENTICATE",
  "token": "your-jwt-token"
}
```

### Message Types دریافتی

#### Account Update
```json
{
  "type": "ACCOUNT_UPDATE",
  "data": {
    "balance": 10000.50,
    "equity": 10250.75,
    "margin": 1500.00,
    "freeMargin": 8750.75,
    "marginLevel": 683.38,
    "profit": 250.25
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Position Update
```json
{
  "type": "POSITION_UPDATE",
  "data": {
    "ticket": 123456,
    "currentPrice": 2029.15,
    "profit": 36.50,
    "swap": -5.25
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Price Update
```json
{
  "type": "PRICE_UPDATE",
  "data": {
    "symbol": "XAUUSD",
    "bid": 2029.10,
    "ask": 2029.40,
    "time": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Trade Update (معامله جدید یا بسته شده)
```json
{
  "type": "TRADE_UPDATE",
  "data": {
    "action": "OPEN",
    "position": {
      "ticket": 123458,
      "symbol": "EURUSD",
      "type": "BUY",
      "volume": 0.50,
      "openPrice": 1.0855,
      "currentPrice": 1.0855,
      "profit": 0.00,
      "swap": 0.00,
      "commission": -5.00,
      "openTime": "2024-01-15T10:30:00Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 7. Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - درخواست نامعتبر |
| 401 | Unauthorized - احراز هویت نشده |
| 403 | Forbidden - دسترسی غیرمجاز |
| 404 | Not Found - یافت نشد |
| 429 | Too Many Requests - تعداد درخواست‌ها زیاد |
| 500 | Internal Server Error - خطای سرور |
| 503 | Service Unavailable - سرویس در دسترس نیست |

---

## 8. Rate Limiting
- محدودیت: 100 درخواست در دقیقه برای هر کاربر
- Headers پاسخ شامل:
  - `X-RateLimit-Limit`: حد مجاز درخواست
  - `X-RateLimit-Remaining`: درخواست‌های باقی‌مانده
  - `X-RateLimit-Reset`: زمان reset (Unix timestamp)

---

## 9. Security Notes

1. **HTTPS**: همه endpoints باید از HTTPS استفاده کنند
2. **Token Expiry**: JWT tokens مدت اعتبار 24 ساعته دارند
3. **Input Validation**: تمامی ورودی‌ها باید اعتبارسنجی شوند
4. **Rate Limiting**: برای جلوگیری از abuse
5. **CORS**: تنظیم مناسب برای frontend domain

---

## 10. Implementation Notes برای Python

### پیشنهادات برای پیاده‌سازی:

1. **Framework**: FastAPI یا Flask
2. **WebSocket**: python-socketio یا FastAPI WebSocket
3. **MetaTrader Connection**: MetaTrader5 package
4. **Database**: PostgreSQL یا MySQL برای ذخیره تاریخچه
5. **Authentication**: PyJWT برای JWT tokens
6. **Real-time Updates**: Background tasks برای نظارت بر تغییرات

### Example Python Structure:
```python
# endpoints.py
@app.post("/api/auth/login")
async def login(credentials: LoginRequest):
    # Connect to MetaTrader
    # Validate credentials
    # Return JWT token

@app.get("/api/positions")
async def get_positions(token: str = Depends(verify_token)):
    # Get positions from MetaTrader
    # Return formatted data

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Handle real-time updates
    pass
```

این API به گونه‌ای طراحی شده که بتواند به راحتی با MetaTrader 5 ارتباط برقرار کرده و داده‌های real-time را به frontend ارسال کند.