# Component Inventory
## **THE NAGRIK** — Civic Literacy Initiative

This document outlines the standard UI components required for the frontend application.

---

## 1. Global Layout

### Navbar
- **Props:** `transparentMode` (boolean)
- **Variants:** Default (White bg), Transparent (Hero overlap)
- **States:** Default, Scrolled (Shrinks padding), Mobile Menu Open

### Footer
- **Props:** None
- **Variants:** Default (Dark bg)
- **States:** Newsletter Submit Loading, Success, Error

### Section Heading
- **Props:** `title` (string), `subtitle` (string), `alignment` ('left' | 'center')
- **Variants:** Standard, Editorial (Large Serif)
- **States:** Visible, Scroll-Revealed

---

## 2. Content Cards

### Article Card
- **Props:** `article` (Object), `featured` (boolean)
- **Variants:** Standard (Vertical image), Featured (Horizontal, larger text)
- **States:** Default, Hover (Image scales slightly, title color shifts)

### Project Card
- **Props:** `project` (Object)
- **Variants:** Default
- **States:** Default, Hover (Border emphasis, CTA appears)

### Category Card
- **Props:** `category` (Object)
- **Variants:** Default
- **States:** Default, Hover (Shadow increases, icon scales)

---

## 3. Specialized UI

### Timeline
- **Props:** `events` (Array)
- **Variants:** Vertical (Desktop), Compact (Mobile)
- **States:** Inactive, Active (As user scrolls past)

### Gallery
- **Props:** `images` (Array)
- **Variants:** Grid, Masonry
- **States:** Loading, Loaded, Image Clicked (Opens Lightbox)

### FAQ Accordion
- **Props:** `items` (Array)
- **Variants:** Default
- **States:** Collapsed, Expanded (Smooth height transition)

---

## 4. Primitives & Inputs

### Buttons
- **Props:** `variant`, `size`, `isLoading`, `disabled`, `icon`
- **Variants:** Primary (Terracotta), Secondary (Outline), Ghost (Text only)
- **States:** Default, Hover, Active/Pressed, Disabled, Loading (Spinner)

### Forms & Inputs
- **Props:** `label`, `error`, `type`, `placeholder`
- **Variants:** Text Input, Textarea
- **States:** Default (Bottom border only), Focused (Border expands/darkens), Error (Red border + text), Disabled

### Select / Dropdown
- **Props:** `options`, `value`, `onChange`
- **Variants:** Standard
- **States:** Closed, Open, Selected

### Modal
- **Props:** `isOpen`, `onClose`, `title`
- **Variants:** Standard, Full-screen (Image Lightbox)
- **States:** Hidden, Entering (Fade + Scale up), Visible, Exiting

### Toast Notification
- **Props:** `type`, `message`, `duration`
- **Variants:** Success, Error, Info
- **States:** Entering (Slide up), Visible, Exiting (Slide down)
