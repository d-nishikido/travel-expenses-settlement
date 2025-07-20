# Travel Expenses Settlement System - API Documentation

## Overview

This document describes the REST API for the Travel Expenses Settlement System. The API follows RESTful conventions and returns JSON responses.

## Base URL

- **Development**: `http://localhost:5000/api`
- **Staging**: `https://api-staging.example.com/api`
- **Production**: `https://api.example.com/api`

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Endpoints

### Health Check

#### GET /health

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00Z",
  "version": "1.0.0"
}
```

---

### Authentication

#### POST /auth/login

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "employee",
      "department": "Engineering"
    }
  }
}
```

#### POST /auth/logout

Logout user (invalidate token).

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /auth/me

Get current user information.

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "employee",
    "department": "Engineering"
  }
}
```

---

### Users (Accounting Role Only)

#### GET /users

Get list of all users.

**Headers:** Authorization required (accounting role)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role (employee, accounting)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "employee",
        "department": "Engineering",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

#### POST /users

Create a new user.

**Headers:** Authorization required (accounting role)

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "password": "securepassword123",
  "role": "employee",
  "department": "Marketing"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "456e7890-e89b-12d3-a456-426614174000",
    "email": "newuser@example.com",
    "name": "Jane Smith",
    "role": "employee",
    "department": "Marketing",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

---

### Expense Reports

#### GET /expense-reports

Get expense reports (filtered by user role).

**Headers:** Authorization required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (draft, submitted, approved, rejected, paid)
- `userId` (optional): Filter by user ID (accounting only)

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "789e0123-e89b-12d3-a456-426614174000",
        "title": "Tokyo Business Trip",
        "tripPurpose": "Client meeting and conference",
        "tripStartDate": "2024-01-15",
        "tripEndDate": "2024-01-18",
        "status": "submitted",
        "totalAmount": 1250.50,
        "submittedAt": "2024-01-19T15:30:00Z",
        "user": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "John Doe",
          "email": "john.doe@example.com"
        },
        "itemsCount": 5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

#### GET /expense-reports/:id

Get expense report details with items.

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "789e0123-e89b-12d3-a456-426614174000",
    "title": "Tokyo Business Trip",
    "tripPurpose": "Client meeting and conference",
    "tripStartDate": "2024-01-15",
    "tripEndDate": "2024-01-18",
    "status": "submitted",
    "totalAmount": 1250.50,
    "submittedAt": "2024-01-19T15:30:00Z",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "department": "Engineering"
    },
    "items": [
      {
        "id": "item-001",
        "category": "transportation",
        "description": "Flight to Tokyo",
        "amount": 850.00,
        "expenseDate": "2024-01-15",
        "receiptUrl": "https://example.com/receipts/flight-001.pdf"
      },
      {
        "id": "item-002",
        "category": "accommodation",
        "description": "Hotel stay (3 nights)",
        "amount": 300.50,
        "expenseDate": "2024-01-15",
        "receiptUrl": "https://example.com/receipts/hotel-001.pdf"
      }
    ],
    "approvalHistory": [
      {
        "action": "submitted",
        "userId": "123e4567-e89b-12d3-a456-426614174000",
        "userName": "John Doe",
        "timestamp": "2024-01-19T15:30:00Z",
        "comment": null
      }
    ]
  }
}
```

#### POST /expense-reports

Create a new expense report.

**Headers:** Authorization required

**Request Body:**
```json
{
  "title": "Tokyo Business Trip",
  "tripPurpose": "Client meeting and conference",
  "tripStartDate": "2024-01-15",
  "tripEndDate": "2024-01-18"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "789e0123-e89b-12d3-a456-426614174000",
    "title": "Tokyo Business Trip",
    "tripPurpose": "Client meeting and conference",
    "tripStartDate": "2024-01-15",
    "tripEndDate": "2024-01-18",
    "status": "draft",
    "totalAmount": 0,
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2024-01-19T10:00:00Z"
  }
}
```

#### PUT /expense-reports/:id

Update expense report (only if status is 'draft').

**Headers:** Authorization required

**Request Body:**
```json
{
  "title": "Updated Tokyo Business Trip",
  "tripPurpose": "Updated purpose",
  "tripStartDate": "2024-01-15",
  "tripEndDate": "2024-01-19"
}
```

#### DELETE /expense-reports/:id

Delete expense report (only if status is 'draft').

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "message": "Expense report deleted successfully"
}
```

#### POST /expense-reports/:id/submit

Submit expense report for approval.

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "789e0123-e89b-12d3-a456-426614174000",
    "status": "submitted",
    "submittedAt": "2024-01-19T15:30:00Z"
  }
}
```

#### POST /expense-reports/:id/approve

Approve expense report (accounting role only).

**Headers:** Authorization required (accounting role)

**Request Body:**
```json
{
  "comment": "Approved - all receipts verified"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "789e0123-e89b-12d3-a456-426614174000",
    "status": "approved",
    "approvedAt": "2024-01-20T10:00:00Z",
    "approvedBy": "456e7890-e89b-12d3-a456-426614174000"
  }
}
```

#### POST /expense-reports/:id/reject

Reject expense report (accounting role only).

**Headers:** Authorization required (accounting role)

**Request Body:**
```json
{
  "comment": "Missing receipt for accommodation"
}
```

#### POST /expense-reports/:id/pay

Mark expense report as paid (accounting role only).

**Headers:** Authorization required (accounting role)

**Request Body:**
```json
{
  "comment": "Payment processed via bank transfer"
}
```

---

### Expense Items

#### GET /expense-reports/:reportId/items

Get expense items for a report.

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "item-001",
      "category": "transportation",
      "description": "Flight to Tokyo",
      "amount": 850.00,
      "expenseDate": "2024-01-15",
      "receiptUrl": "https://example.com/receipts/flight-001.pdf",
      "createdAt": "2024-01-19T10:15:00Z"
    }
  ]
}
```

#### POST /expense-reports/:reportId/items

Add expense item to report.

**Headers:** Authorization required

**Request Body:**
```json
{
  "category": "transportation",
  "description": "Flight to Tokyo",
  "amount": 850.00,
  "expenseDate": "2024-01-15",
  "receiptUrl": "https://example.com/receipts/flight-001.pdf"
}
```

#### PUT /expense-reports/:reportId/items/:id

Update expense item.

**Headers:** Authorization required

#### DELETE /expense-reports/:reportId/items/:id

Delete expense item.

**Headers:** Authorization required

---

### Reports (Accounting Role Only)

#### GET /reports/summary

Get summary statistics.

**Headers:** Authorization required (accounting role)

**Query Parameters:**
- `startDate` (optional): Start date for filtering (YYYY-MM-DD)
- `endDate` (optional): End date for filtering (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReports": 150,
    "totalAmount": 125000.50,
    "statusBreakdown": {
      "draft": 20,
      "submitted": 15,
      "approved": 80,
      "rejected": 10,
      "paid": 25
    },
    "categoryBreakdown": {
      "transportation": 65000.00,
      "accommodation": 35000.00,
      "meal": 20000.00,
      "other": 5000.50
    }
  }
}
```

#### GET /reports/export

Export reports data.

**Headers:** Authorization required (accounting role)

**Query Parameters:**
- `format`: Export format (csv, pdf)
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `status` (optional): Filter by status

**Response:** File download

---

## Data Models

### User
```json
{
  "id": "string (UUID)",
  "email": "string",
  "name": "string",
  "role": "employee | accounting",
  "department": "string",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### Expense Report
```json
{
  "id": "string (UUID)",
  "userId": "string (UUID)",
  "title": "string",
  "tripPurpose": "string",
  "tripStartDate": "string (YYYY-MM-DD)",
  "tripEndDate": "string (YYYY-MM-DD)",
  "status": "draft | submitted | approved | rejected | paid",
  "totalAmount": "number",
  "submittedAt": "string (ISO 8601) | null",
  "approvedAt": "string (ISO 8601) | null",
  "approvedBy": "string (UUID) | null",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### Expense Item
```json
{
  "id": "string (UUID)",
  "expenseReportId": "string (UUID)",
  "category": "transportation | accommodation | meal | other",
  "description": "string",
  "amount": "number",
  "receiptUrl": "string | null",
  "expenseDate": "string (YYYY-MM-DD)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### Approval History
```json
{
  "id": "string (UUID)",
  "expenseReportId": "string (UUID)",
  "action": "submitted | approved | rejected | paid",
  "userId": "string (UUID)",
  "comment": "string | null",
  "createdAt": "string (ISO 8601)"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **File upload endpoints**: 10 requests per hour per user

## Changelog

### v1.0.0 (2024-01-20)
- Initial API release
- Basic CRUD operations for expense reports
- User authentication and authorization
- Approval workflow
- Export functionality