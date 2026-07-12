# Retail Poster Production Platform (Project Brief)

## Product Vision

Build a web application specifically for supermarkets, hypermarkets,
wholesalers, pharmacies, electronics stores, furniture retailers, and
marketing agencies to create promotional offer posters quickly.

This is **not** a graphic design application like Photoshop or Canva.

It is a **Poster Production System** where professionally designed
templates are uploaded once, and users simply populate them with
products, prices, offer tags, and campaign details.

**Goal:** Reduce poster creation time from **30 to 60 minutes** to
**less than 5 minutes**.

------------------------------------------------------------------------

# Core Workflow

## 1. Campaign Selection

Examples:

-   Great 10 Days
-   Weekend Offer
-   Ramadan Sale
-   Fresh Week
-   Back to School
-   Christmas Sale

------------------------------------------------------------------------

## 2. Template Selection

Templates may include:

-   Portrait
-   Landscape
-   Square
-   A4
-   A3
-   Instagram
-   Facebook
-   WhatsApp Status
-   LED Display

Templates already contain:

-   Background
-   Header
-   Footer
-   Logo
-   Decorative Elements
-   Campaign Graphics
-   Family Images
-   Offer Title

Only the product area remains empty.

------------------------------------------------------------------------

## 3. Product Library

Each product stores:

-   PNG Image
-   Product Name
-   Brand
-   Category
-   SKU
-   Barcode
-   Weight
-   MRP
-   Offer Price
-   Multiple Images
-   Tags

Features:

-   Search
-   Favorites
-   Recently Used
-   Archive
-   Hide Products

------------------------------------------------------------------------

## 4. Product Placement

Drag products onto placeholders.

Features:

-   Drag & Drop
-   Scale
-   Rotate
-   Flip
-   Duplicate
-   Delete
-   Lock
-   Bring Forward
-   Send Backward

------------------------------------------------------------------------

# Smart Placement

-   Snap Grid
-   Smart Guides
-   Auto Center
-   Equal Spacing
-   Safe Margins
-   Distance Indicators

------------------------------------------------------------------------

# Product Controls

-   Scale
-   Position (X/Y)
-   Rotation
-   Opacity
-   Shadow
-   Outline
-   Glow
-   Reflection
-   Crop
-   Mask

------------------------------------------------------------------------

# Price Tag Engine

Unlimited uploadable price tag styles.

Examples:

-   Green
-   Red
-   Yellow
-   Festival
-   Ramadan
-   Christmas
-   Premium
-   Flash Sale
-   Buy 1 Get 1
-   Flat Price

Customization:

-   Color
-   Border
-   Shadow
-   Opacity
-   Gradient
-   Rounded Corners
-   Stroke

------------------------------------------------------------------------

# Price Editor

Support:

-   MRP
-   Offer Price
-   Currency
-   Strike-through
-   Discount %
-   Save Amount
-   Tax Included
-   Extra Free

Automatic calculations:

-   MRP + Discount → Offer Price
-   MRP + Offer Price → Discount %

------------------------------------------------------------------------

# Typography

-   Google Fonts
-   Custom Font Upload
-   Font Size
-   Font Color
-   Outline
-   Shadow
-   Glow
-   Letter Spacing
-   Line Height
-   Alignment

------------------------------------------------------------------------

# Smart Offer Labels

Generate labels such as:

-   BUY 1 GET 1
-   BUY 2 GET 1
-   SAVE ₹50
-   FLAT ₹99
-   LIMITED OFFER
-   NEW ARRIVAL
-   BEST SELLER

------------------------------------------------------------------------

# Layer Manager

Each object becomes a layer.

Supported objects:

-   Product
-   Price
-   Text
-   Badge
-   Logo
-   Shape
-   Sticker

Actions:

-   Rename
-   Lock
-   Hide
-   Duplicate
-   Reorder

------------------------------------------------------------------------

# Campaign Asset Library

Manage reusable assets:

-   Logos
-   Icons
-   Festival Graphics
-   Offer Stickers
-   Decorative Elements
-   Fruits
-   Vegetables
-   Coins
-   Ribbons
-   Sparkles

------------------------------------------------------------------------

# Template Builder

Admin creates templates with editable placeholders.

Placeholder types:

-   Product
-   Price
-   Title
-   Badge
-   Logo

Each placeholder can define:

-   Allowed object type
-   Size limits
-   Rotation permissions
-   Character limits
-   Alignment rules

------------------------------------------------------------------------

# Asset Manager

-   Folder Organization
-   Categories
-   Campaign Collections
-   Favorites
-   Bulk Upload
-   ZIP Upload
-   Version History

------------------------------------------------------------------------

# AI Features

## AI Background Removal

Convert JPG product images into transparent PNGs.

## AI Auto Crop

Automatically:

-   Trim transparent pixels
-   Center product
-   Scale correctly

## AI Product Detection

Recognize:

-   Bottle
-   Box
-   Packet
-   Soap
-   Rice Bag
-   Can
-   Fruit
-   Vegetable

Apply optimized scaling.

------------------------------------------------------------------------

# Export Engine

Formats:

-   PNG
-   JPEG
-   PDF
-   TIFF
-   WebP

Quality:

-   72 DPI
-   150 DPI
-   300 DPI
-   600 DPI
-   Lossless PNG

------------------------------------------------------------------------

# Batch Export

Generate multiple formats simultaneously:

-   Instagram
-   Facebook
-   Story
-   A4
-   A3
-   LED Display

------------------------------------------------------------------------

# Multi Size Support

Automatically adapt templates to:

-   Instagram Post
-   Story
-   WhatsApp Status
-   A3 Poster
-   LED Banner

------------------------------------------------------------------------

# Bulk Poster Generator

Upload an Excel sheet containing products and prices.

Automatically generate hundreds of posters from one template.

------------------------------------------------------------------------

# Product Database

Each product maintains:

-   Price
-   Brand
-   Category
-   Barcode
-   SKU
-   Supplier
-   Stock

Price updates automatically reflect wherever the product is used.

------------------------------------------------------------------------

# Version History

Every save creates a version.

Users can restore previous versions at any time.

------------------------------------------------------------------------

# Cloud Storage

Store:

-   Projects
-   Templates
-   Products
-   Assets
-   Exports

------------------------------------------------------------------------

# Search

Search by:

-   Product Name
-   Brand
-   SKU
-   Barcode
-   Category
-   Price
-   Campaign
-   Tags

------------------------------------------------------------------------

# Keyboard Shortcuts

-   Copy / Paste
-   Duplicate
-   Delete
-   Undo / Redo
-   Arrow Move
-   Shift Move
-   Zoom
-   Fit Screen

------------------------------------------------------------------------

# Performance Goals

-   Smooth editing
-   Support hundreds of assets
-   Fast rendering
-   Background export processing

------------------------------------------------------------------------

# Technology Stack

## Frontend

-   Next.js
-   React
-   TypeScript
-   Konva.js
-   Tailwind CSS
-   Zustand
-   React DnD
-   Framer Motion

## Backend

-   NestJS
-   PostgreSQL
-   Prisma
-   Redis

## Storage

-   AWS S3 or MinIO

## Image Processing

-   Sharp
-   Canvas API
-   ImageMagick
-   Web Workers

## Authentication

-   Clerk or Auth.js
-   Role Based Access Control

------------------------------------------------------------------------

# Future Roadmap

-   ERP Integration
-   WooCommerce Integration
-   Shopify Integration
-   Barcode Scanner
-   AI Layout Suggestions
-   Dynamic Pricing
-   Multi-language Support
-   White Label Platform
-   Template Marketplace
-   QR Code Generator
-   Print-ready CMYK Workflow
-   API Integrations

------------------------------------------------------------------------

# MVP Roadmap

## Phase 1

-   Authentication
-   Template Upload
-   Product Library
-   Drag & Drop
-   Product Positioning
-   Price Editing
-   Price Tag Selection
-   Font Customization
-   High Quality Export
-   Save Projects

## Phase 2

-   Smart Guides
-   Layer Management
-   Asset Manager
-   Template Builder
-   Bulk Upload
-   Undo / Redo

## Phase 3

-   AI Background Removal
-   AI Auto Crop
-   AI Product Detection
-   Excel-based Bulk Poster Generation
-   WooCommerce & Shopify Sync
-   Version History
-   Batch Export
