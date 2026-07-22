# Royal Ethnica Project Understanding

## Project Overview

After going through the Royal Ethnica project, I understood that this is an AI-based ethnic fashion web application mainly focused on improving the online saree shopping experience.

The project combines normal e-commerce features with AI and 3D technologies to make online shopping more interactive for users.

## Tech Stack I Observed

Frontend:

* React with TypeScript is used for building the user interface.
* Components are separated properly for better maintenance.
* Tailwind CSS is used for styling and creating a responsive UI.

3D:

* Three.js with React Three Fiber is used for creating the 3D saree visualization.
* It provides a 360-degree interactive saree viewing experience.

AI:

* Gemini API integration is provided for AI-related features like recommendations and styling assistance.

## Folder Structure Understanding

src/components:

This folder contains the main UI modules of the project.

Some important components I explored:

1. VirtualFittingRoom.tsx

This component handles the virtual try-on experience.

Current features:

* User photo upload
* AI try-on workflow UI
* Body measurement section
* Generated look preview

I observed that the UI flow was already created well. Some parts were simulation-based, so I started exploring how real AI detection can be integrated.

2. SareeCanvas3D.tsx

This component handles the 3D saree view.

My understanding:

* It uses Three.js concepts.
* It creates a 3D scene.
* It supports rotation and interactive viewing.
* Different body styles and saree visualization concepts are handled here.

3. AIStylistDrawer.tsx

This component focuses on AI styling assistance where users can get fashion-related suggestions.

## Work I Explored

I mainly focused on the Virtual Try-On module.

Existing flow:

User uploads image
→ AI processing animation
→ Generated preview

I researched how this can be improved by adding real body detection.

Improvement idea:

Integrating MediaPipe Pose Detection:

User Image
→ Detect body landmarks
→ Identify shoulder and body positions
→ Place saree based on detected points

I started implementing the first step where the uploaded image is processed using MediaPipe to detect human body landmarks.

## Improvements That Can Be Added

1. Real AI Virtual Try-On

Currently, the try-on experience can be improved by connecting actual pose detection and garment overlay.

Possible approach:

* MediaPipe Pose Detection
* Body landmark detection
* Dynamic saree positioning

2. Better 3D Experience

Future improvements:

* Adding real GLB/GLTF saree models
* More realistic cloth movement
* Better material textures

3. Personalized Recommendations

AI can recommend sarees based on:

* User preferences
* Occasion
* Color choices
* Previous selections

## My Learning From This Project

By exploring this project, I learned:

* How a React TypeScript project is structured.
* How large applications are divided into components.
* Basics of Three.js integration.
* How AI features are connected with frontend applications.
* How virtual try-on systems work internally.

As my next step, I want to improve the existing AI try-on feature by converting the simulation workflow into a more functional AI-based experience.
