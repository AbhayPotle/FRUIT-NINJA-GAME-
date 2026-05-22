<div align="center">
  <img src="assets/gesture_icon.png" alt="Fruit Ninja Gesture" width="150" />
  <h1>🥷 AI-Powered Fruit Ninja 🍉</h1>
  <p><strong>A zero-latency, hand-gesture controlled browser game built with MediaPipe, HTML5 Canvas, and Vibe Coding.</strong></p>
  
  [![Made with MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-blue?style=for-the-badge&logo=google)](https://mediapipe.dev/)
  [![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-orange?style=for-the-badge&logo=html5)](https://developer.mozilla.org/)
  [![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-yellow?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/)
  [![Vibe Coding](https://img.shields.io/badge/Built_with-Vibe_Coding-8A2BE2?style=for-the-badge&logo=codeigniter&logoColor=white)](#)
</div>

---

## 🌟 Overview

Welcome to the **AI-Powered Fruit Ninja**! This is a modern, premium web-based recreation of the classic arcade game. Instead of using a mouse or touchscreen, you control the game **entirely with your hand movements in front of your webcam**.

The game leverages **MediaPipe** for lightning-fast, real-time computer vision directly in your browser. 

## ✨ Features

- **✋ Advanced Hand Tracking**: Uses your index finger as the blade. We map your finger tip to the screen with zero lag.
- **🗡️ Strict Gesture Control**: The blade only activates when you form a strict "Pointing Gesture" (Index extended, others folded), avoiding accidental slices.
- **🔥 Realistic Canvas Physics**: Custom physics engine for gravity, object trajectories, and precise line-to-circle collision detection.
- **🍉 Combos & Particle Effects**: Chain multiple slices together for combo multipliers and beautiful neon particle explosions.
- **💣 Bombs & High Scores**: Watch out for bombs! Your high score is persisted locally in the browser.
- **🎨 Premium 3D UI**: Features a sleek glassmorphism interface, custom typography, glowing UI elements, and a cinematic 3D Dojo background upon game over.

## 🕹️ How to Play

1. **Start the Game**: Once the AI model loads, click **PLAY NOW**.
2. **Make the Gesture**: Hold your hand up to your webcam and make a **pointing gesture** (extend ONLY your index finger).
3. **Slice!**: Move your pointing finger across the screen to slice the falling fruits.
4. **Avoid Bombs**: Slicing a black bomb will instantly end the game!

<div align="center">
  <img src="assets/gameover_bg.png" alt="Game Over Dojo" width="600" style="border-radius: 10px; border: 2px solid #FF3366;" />
  <p><em>The cinematic 3D Game Over screen</em></p>
</div>

## 🛠️ Local Installation

Since the game requires webcam access, modern browsers require it to be served over a secure origin (`https`) or `localhost`.

1. Clone this repository:
   ```bash
   git clone https://github.com/AbhayPotle/FRUIT-NINJA-GAME-.git
   cd FRUIT-NINJA-GAME-
   ```
2. Start a local server:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## 🚀 Live Demo

[Play the game here!](https://comforting-biscochitos-566a7e.netlify.app) 

---
<div align="center">
  <p>Built with ❤️ by Abhay Potle using <strong>Vibe Coding</strong> 🚀</p>
</div>
[vercel link!](https://fruit-ninja-game-two.vercel.app/)
