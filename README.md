# RentItOut Backend API

RentItOut is a peer-to-peer rental platform backend that enables users to rent items for specific periods, manage pricing, bookings, logistics, and more. This backend is built using Node.js, Express.js, Sequelize, and MySQL with a clean MVC architecture and RESTful APIs.

---

## Table of Contents

1. [Features Overview](#features-overview)  
2. [Authentication System](#authentication-system)  
3. [Item Listings for Rent](#item-listings-for-rent)  
4. [Rental Management and Pricing Rules](#rental-management-and-pricing-rules)  
5. [Revenue Model](#revenue-model)  
6. [Trust, Safety, and Verification](#trust-safety-and-verification)  
7. [Insurance and Damage Protection](#insurance-and-damage-protection)  
8. [User Experience and Recommendations](#user-experience-and-recommendations)  
9. [Logistics Management](#logistics-management)  
10. [Setup and Running](#setup-and-running)  

---

## Features Overview

- User registration, login, password reset with JWT-based authentication and role management.  
- Browse, search, and filter rentable items with category-based sorting.  
- Manage pricing rules including seasonal discounts and owner-specific rules.  
- Calculate revenue, platform fees (10%), and reward points system for discounts.  
- Trust and safety via ratings, reviews, and email notifications.  
- Insurance records tied to bookings for user protection.  
- Personalized recommendations based on booking history.  
- Full logistics management with pickup/delivery, pricing, and notifications.

---

## Authentication System

- **Endpoints:**  
  - `POST /register` - Register a new user (password hashed with bcrypt).  
  - `POST /login` - Login and receive JWT token.  
  - `POST /request-password-reset` - Request password reset token via email.  
  - `POST /reset-password` - Reset password with valid token.

- Passwords are stored securely with bcrypt hashing.  
- JWT tokens manage sessions and enforce role-based access control.

---

## Item Listings for Rent

- **Endpoints:**  
  - `GET /api/items` - Retrieve all items.  
  - `GET /api/items/:id` - Retrieve item by ID.  
  - `GET /api/items/filter` - Filter items by category, price, availability.

- Items are categorized and sorted based on user preferences and frequency of bookings.

---

## Rental Management and Pricing Rules

- Owners and admins can create, update, delete, and view pricing rules.  
- Pricing rules affect item rental costs based on duration, seasonality, or discounts.

- **Endpoints:**  
  - `POST /add_pricing_rule`  
  - `GET /list_pricing_rules`  
  - `GET /getPricingRuleById/:id`  
  - `PUT /update_pricing_rule/:id`  
  - `DELETE /deletePricingRule/:id`

---

## Revenue Model

- Platform charges 10% fee on total rental price.  
- Users earn 5 points per rental hour, redeemable for discounts.  
- Functions calculate discounts, total price, fees, and update user points.

---

## Trust, Safety, and Verification

- Users can leave ratings and reviews on items.  
- Ratings below 3 trigger email notifications to item owners.  
- Admins can moderate and delete any review.

- **Endpoints:**  
  - `POST /Review`  
  - `DELETE /deletereview`  
  - `DELETE /admindeleteReview`  
  - `GET /allReviews`  
  - `PUT /updatereview`  
  - `GET /getRatingsByItemId`

---

## Insurance and Damage Protection

- Each booking requires insurance info (validated ID number).  
- Admins can view or delete insurance records.

- **Endpoints:**  
  - `GET /insurance`  
  - `GET /insurance/:user_id`  
  - `DELETE /insurance`

---

## User Experience and Recommendations

- Tracks user booking categories and prioritizes those items in listings.  
- Improves relevancy of item suggestions per user preferences.

---

## Logistics Management

- Create, update, view, and delete logistics records for pickups and deliveries.  
- Calculates delivery fees based on distance.  
- Supports payment (Visa, cash) and sends notifications on status changes.

- **Endpoints:**  
  - `POST /logistics/create`  
  - `GET /logistics`  
  - `GET /logistics/:id`  
  - `GET /logistics/user/:userId`  
  - `GET /logistics/status/:status`  
  - `PUT /logistics/:id`  
  - `POST /logistics/pay`  
  - `DELETE /logistics/:id`

---

## Setup and Running 
1. **Clone the repository:**  
   ```bash
   git clone https://github.com/your-username/rentitout-backend.git
   cd rentitout-backend
