# Wanderlust Major Project - Deep Dive Explanation

This document provides a comprehensive and deep explanation of all the files and directories in your major project, **Wanderlust**. This is a full-stack web application built using the MERN stack (MongoDB, Express.js, Node.js) with EJS for templating, integrating various third-party services like Mapbox, Cloudinary, and Google Gemini AI.

## 1. Root Configuration Files

- **`app.js`**: The main entry point of your application. It initializes the Express server, connects to the MongoDB database (via Mongoose), configures middleware (like `method-override` for PUT/DELETE requests, `express-session` for sessions, and `connect-flash` for flash messages). It also sets up Passport.js for authentication and mounts all the routers (`/listings`, `/listings/:id/reviews`, `/`, `/trips`).
- **`package.json` & `package-lock.json`**: These files manage the project's dependencies, such as `express`, `mongoose`, `ejs`, `@google/generative-ai`, `passport`, and `cloudinary`. It specifies the Node version required and acts as the blueprint for installing necessary packages.
- **`.env`**: Stores sensitive environment variables such as `ATLASDB_URL` (MongoDB Atlas URI), `SECRET` (session secret), `MAP_TOKEN` (Mapbox API key for geocoding), `GEMINI_API_KEY` (Google Gemini AI key), and Cloudinary credentials.
- **`cloudConfig.js`**: Configures the `cloudinary` and `multer-storage-cloudinary` packages. It connects your application to your Cloudinary account to handle image uploads for listings.
- **`middleware.js`**: Contains reusable middleware functions. Common examples include `isLoggedIn` (checks if a user is authenticated), `isOwner` (checks if the current user owns a listing), `validateListing`/`validateReview` (Joi validation middlewares), and `isTripOwner` for the new AI trip planner.
- **`schema.js`**: Contains Joi validation schemas (e.g., `listingSchema`, `reviewSchema`, `tripSchema`). This ensures that data coming from client-side forms is strictly validated before reaching your controllers or database.

## 2. Models (`/models` directory)
This directory contains the Mongoose schemas that define the structure of your database collections.

- **`listing.js`**: Defines the `Listing` model. It stores properties for accommodations, such as `title`, `description`, `image` (URL and filename from Cloudinary), `price`, `location`, `country`, `geometry` (GeoJSON from Mapbox for the map), `owner` (refers to a User), and an array of `reviews`.
- **`review.js`**: Defines the `Review` model, containing a `comment`, `rating` (1-5), `createdAt` timestamp, and the `author` (refers to a User).
- **`user.js`**: Defines the `User` model using `passport-local-mongoose`. It automatically adds `username` and `password` fields with hashing and salting, and you defined an `email` field.
- **`itinerary.js`**: Defines the newly added `Itinerary` model for the AI Trip Planner. It stores the `destination`, `startDate`, `endDate`, `budgetTier`, a nested array of `days` with specific `activities`, and an optional `suggestedListing` linking to a real accommodation in your database.

## 3. Routes (`/routes` directory)
These files use `express.Router()` to group related routes together, keeping `app.js` clean.

- **`listing.js`**: Handles routes related to accommodations: GET `/` (index), GET `/new` (new form), POST `/` (create), GET `/:id` (show), GET `/:id/edit` (edit form), PUT `/:id` (update), and DELETE `/:id` (delete).
- **`review.js`**: Handles routes for reviews on a specific listing: POST `/` (create review) and DELETE `/:reviewId` (delete review).
- **`user.js`**: Handles authentication routes: GET/POST `/signup`, GET/POST `/login`, and GET `/logout`.
- **`trips.js`**: Handles the AI Trip Planner routes: GET `/new` (trip form), POST `/` (generate itinerary via Gemini), GET `/:id` (show itinerary), and GET `/` (index of user's trips).

## 4. Controllers (`/controllers` directory)
Controllers contain the actual business logic for the routes, adhering to the MVC (Model-View-Controller) architecture.

- **`listings.js`**: Contains logic to fetch all listings (with search/filtering), create a new listing (including calling Mapbox to get coordinates), update a listing (handling new image uploads), and delete a listing.
- **`reviews.js`**: Logic to push a new review into a listing's `reviews` array and remove a review from both the database and the listing array.
- **`users.js`**: Logic to register a new user, log them in using Passport's local strategy, log them out, and handle redirects back to the page they were trying to access before logging in.
- **`trips.js`**: The core of the AI feature. It takes form input, calls the Gemini utility, calculates costs, matches the AI's destination and budget to real `Listing` documents in the database, saves the `Itinerary`, and renders it to the user.

## 5. Utilities (`/utils` directory)
Helper classes and functions.

- **`generateItinerary.js`**: An isolated module that connects to the Google Gemini API (`gemini-3.5-flash`). It uses strict prompt engineering to force the AI to return a structured JSON response detailing a day-by-day itinerary based on user inputs.
- **`ExpressError.js`**: A custom error class extending the built-in `Error` class to include a `statusCode` and `message`.
- **`wrapAsync.js`**: A utility function that wraps asynchronous route handlers to catch promise rejections and pass them to the Express error-handling middleware, eliminating the need for repetitive `try...catch` blocks.

## 6. Views (`/views` directory)
Contains the EJS (Embedded JavaScript) templates that render the frontend HTML.

- **`layouts/`**: Contains the `boilerplate.ejs` which acts as the master template. It includes the Navbar, Footer, Flash messages, and main content body for all pages.
- **`includes/`**: Reusable UI components like `navbar.ejs`, `footer.ejs`, and `flash.ejs`.
- **`listings/`**: Views for accommodations (`index.ejs`, `show.ejs`, `new.ejs`, `edit.ejs`). The `show.ejs` file notably includes the Mapbox map rendering and the "Plan a trip around this stay" button.
- **`trips/`**: Views for the AI planner (`new.ejs` form, `show.ejs` accordion layout for days, `index.ejs` dashboard).
- **`users/`**: Views for authentication (`signup.ejs`, `login.ejs`).

## 7. Other Directories
- **`public/`**: Contains static assets served to the client, such as custom CSS (`style.css`), client-side JavaScript (e.g., Mapbox initialization scripts, form validation scripts), and images.
- **`init/`**: Usually contains `data.js` and `index.js` scripts used to initially seed the MongoDB database with sample listings to get the project started.
- **`uploads/`**: A local directory that might have been used for storing uploaded images before migrating to Cloudinary.

## Architecture Summary
The Wanderlust project follows a strict **MVC (Model-View-Controller)** pattern. When a user requests a URL, the request hits **`app.js`**, goes through the designated **Router (`routes/`)**, is processed by the **Controller (`controllers/`)** which interacts with the **Database (`models/`)**, and finally renders an **EJS Template (`views/`)** back to the user.

The newly integrated **AI Trip Planner** respects this structure, utilizing a modular utility (`utils/generateItinerary.js`) to keep the controller clean, and cross-references AI suggestions with actual database listings to provide a highly interactive and practical user experience.
