# User Authentication API – Postman Testing Guide

## Base URL
```
http://127.0.0.1:8000/api/auth/
```

---

## 1. User Registration

**Endpoint:**  
`POST /register/`

**Description:**  
Register a new user with username, email, password, role, and department.

**Request Example:**
- Method: POST
- URL: `http://127.0.0.1:8000/api/auth/register/`
- Body: (Select "raw" and "JSON" in Postman)
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "StrongPassword123!",
  "password2": "StrongPassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "inventory_manager",
  "department": "Inventory"
}
```

**Expected Response:**
- Status: 201 Created
- Body: User details (without password)

---

## 2. User Login (JWT Token Obtain)

**Endpoint:**  
`POST /login/`

**Description:**  
Obtain JWT access and refresh tokens.

**Request Example:**
- Method: POST
- URL: `http://127.0.0.1:8000/api/auth/login/`
- Body: (raw, JSON)
```json
{
  "username": "john_doe",
  "password": "StrongPassword123!"
}
```

**Expected Response:**
- Status: 200 OK
- Body:
```json
{
  "refresh": "<refresh_token>",
  "access": "<access_token>"
}
```

---

## 3. Token Refresh

**Endpoint:**  
`POST /token/refresh/`

**Description:**  
Obtain a new access token using a valid refresh token.

**Request Example:**
- Method: POST
- URL: `http://127.0.0.1:8000/api/auth/token/refresh/`
- Body: (raw, JSON)
```json
{
  "refresh": "<refresh_token>"
}
```

**Expected Response:**
- Status: 200 OK
- Body:
```json
{
  "access": "<new_access_token>"
}
```

---

## 4. User Profile (View & Update)

**Endpoint:**  
`GET /profile/` (view)  
`PUT /profile/` (update)

**Description:**  
View or update the authenticated user's profile.

**Request Example (View):**
- Method: GET
- URL: `http://127.0.0.1:8000/api/auth/profile/`
- Headers:
  - `Authorization: Bearer <access_token>`

**Expected Response:**
- Status: 200 OK
- Body: User profile details

**Request Example (Update):**
- Method: PUT
- URL: `http://127.0.0.1:8000/api/auth/profile/`
- Headers:
  - `Authorization: Bearer <access_token>`
- Body: (raw, JSON)
```json
{
  "first_name": "Johnny",
  "last_name": "Doe"
}
```

**Expected Response:**
- Status: 200 OK
- Body: Updated user profile

---

## 5. Logout (JWT Blacklist)

**Endpoint:**  
`POST /logout/`

**Description:**  
Blacklist a refresh token (logout user).

**Request Example:**
- Method: POST
- URL: `http://127.0.0.1:8000/api/auth/logout/`
- Headers:
  - `Authorization: Bearer <access_token>`
- Body: (raw, JSON)
```json
{
  "refresh": "<refresh_token>"
}
```

**Expected Response:**
- Status: 205 Reset Content

---

## Notes for Testers

- Always use the correct `Authorization: Bearer <access_token>` header for protected endpoints.
- Use the access token for short-lived requests; use the refresh token to obtain a new access token when expired.
- Roles available: `"admin"`, `"inventory_manager"`, `"hr"`, `"sales"`.
- Passwords must be strong (Django's default validators apply).
- If you get a 401 Unauthorized, check your token or login again. 