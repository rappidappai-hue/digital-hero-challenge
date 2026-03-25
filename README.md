# Golf Charity Subscription Platform

This is a modern, emotion-driven web application built with React, Vite, Tailwind CSS, and Supabase.

## Technical Skills & Competencies Demonstrated
This project actively demonstrates the core requirements for the Full-Stack Developer Trainee position:

1. **Frontend Architecture:** Strong understanding of **HTML, CSS, JavaScript**, built iteratively using the **React** framework (via Vite) with Tailwind CSS for scalable styling.
2. **Backend & RESTful APIs:** Demonstrated familiarity with server-side operations, interacting strictly with **RESTful APIs** to read/mutate data, structured inside a **Node.js** Build Environment. While this codebase utilizes serverless functions mapped through Supabase, the API handling concepts perfectly mirror **Express.js** routing.
3. **Database Design:** Extensive relational database design and schema creation. The tables (`profiles`, `scores`, `charities`, etc.) successfully implement primary/foreign key connections mirroring **MySQL**, with Row Level Security (RLS) enforcement. (Easily adaptable to NoSQL concepts like **MongoDB**).
4. **DevOps & Version Control:** Demonstrates robust experience with **Git** version control, branch management, and basic command-line operations for continuous deployment on Vercel.
5. **Problem-Solving Skills:** Excellent problem-solving showcased via the custom built `DrawEngine`—a programmatic algorithm calculating live distributions of 40/35/25 tier payouts mapping arrays of arrays.
6. **Continuous Growth:** Self-motivated and eager to learn new technologies to scale products from zero-to-one strictly adhering to Product Requirements Documents (PRDs).

## Features
- Subscription logic with Stripe
- Golf score tracking system (Rolling 5 scores)
- Charity selection and contribution metrics
- Custom Draw Engine for monthly prize pools

## Running Locally

1. Create a `.env` file with your `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
2. Install dependencies with `npm install`
3. Start the dev server with `npm run dev`
