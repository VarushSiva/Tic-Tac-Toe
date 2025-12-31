## 🎮 Tic Tac Toe

A modern take on the classic **Tic Tac Toe**, rebuilt in **HTML, CSS, and TypeScript** with a big focus on **keyboard support** and **accessibility-minded UI**.

Originally started as part of [The Odin Project](https://www.theodinproject.com/) curriculum, the project evolved beyond the initial scope to explore better structure, UX polish, and WCAG-inspired improvements.

🎯 **Live Demo:** [Play the Game Here!](https://varushsiva.github.io/Tic-Tac-Toe/)

---

## 🛠️ Technologies Used
- **HTML5** — App Structure
- **CSS3**  — Styles & layout customization
- **TypeScript** — Game logic + UI behavior

---

## 🚀 Features

### Gameplay
- 🆚 **Two-Player Mode** — Player X vs Player O
- 🤖 **Optional AI opponent** — Choose difficulty: *Easy / Medium / Hard*
- 🔄 **Dynamic Board Updates** — DOM-driven UI
- 🏆 **Winner & Draw Detection** — Displays results automatically
- 🧮 **Scoreboard** — Keeps track of each player's wins
- 💡 **Active Player Indicator** — Highlights the current player on the scoreboard
- ↩️ **Undo** — Revert the last played move
- 🔁 **New Round + New Game** — Starts a new round or new game
- ⏱️ **Move timer (optional)** — If time runs out, a move is automatically played

### Modals & UX
- ⌨️ **Keyboard Shortcuts modal** — Quick reference for all controls
- ⚙️ **Settings modal** with:
  - Game settings (Enable Move Timer + Timer Duration)
  - Accessibility settings (Reduce Motion / High Contrast / Larger Text)

### Themes & Visuals
- 🎨 **Multiple themes**: *Default / Halloween / Christmas / Valentines*
- ✨ **Animations (Optional)** — Animation for Winning Combination, Timer and etc. (Can be disabled via **Reduce Motion**)
- 🎨 **Colour Palette** — Displays colours used with their hex codes
- 📱 **Responsive Layout** — Works on Desktop and Mobile

---

## ⌨️ Keyboard Shortcuts

### Game controls
- **Tab** — Next targetable item
- **Arrow Keys** — Navigate between Cells when focused
- **Enter / Space** — Click / Place token
- **B** — Focus the Board
- **Z** — Undo last move
- **N** — New Round
- **R** — New Game (Reset All)

### Interface shortcuts
- **S** — Open settings
- **?** — Open shortcuts help
- **T** — Cycle themes
- **Esc** — Close any Modal

---

## 📁 Project Structure
Tic-Tac-Toe/ 
- │── dist/ 
- │   &emsp;&ensp;└── main.js &emsp;&emsp;&emsp;&emsp;# TS Output file
- │── node_modules/
- │── src/
- │   &emsp;&ensp;└── main.ts &emsp;&emsp;&emsp;&emsp;# Game logic & UI handling
- │── styles/ 
- │   &emsp;&ensp;├── reset.css &emsp;&emsp;&ensp;&ensp;&ensp;# CSS reset for clean baseline 
- │   &emsp;&ensp;└── styles.css &ensp;&ensp;&emsp;&emsp;&nbsp;# Game styling
- │── .gitattributes &emsp;&emsp;&emsp;&emsp;# Git configuration for handling file types  
- │── index.html &emsp;&emsp;&emsp;&emsp;&emsp;# Main HTML file
- │── package-lock.json
- │── package.json
- │── README.md &emsp;&emsp;&emsp;&emsp;# Project documentation
- │── tsconfig.json

---

## 💻 How to Run the Project
To run this project locally:

1. Download or clone the repository:
   ```bash
   git clone https://github.com/VarushSiva/Tic-Tac-Toe.git
   ```
2. Navigate into the project folder:
   ```bash
   cd Tic-Tac-Toe/
   ```
3. Optional - Build TypeScript Locally:
   ```bash
   npm install
   npm run build
   ```
4. Open the index.html file in your browser **or** Right-click and select "**Open with Live Server**" if you have the **Live Server** extension installed for **VS Code**.

---

## 🧩 Version

### **Current Version: 2.0.0**
Major update from the original Odin Project version:

- JavaScript → TypeScript migration
- Keyboard navigation + shortcuts
- Keyboard Shortcuts modal (in-game help menu for controls)
- Settings modal
- Player Setup modal
- Move timer + auto-move when time runs out (random valid move)
- Undo button 
- Themes: Default / Halloween / Christmas / Valentines
- LocalStorage support (persists user settings between sessions)

### Version: 1.0.0
Initial release of the Tic Tac Toe project featuring:

- Two-player Mode
- Winner Animation
- Scoreboard
- Colour Palette
- Active Player Indicator
- Responsive Design

---

## 🚧 Future Improvements

Planned or possible updates include:

- 🌙 Implementing a Dark / Light Mode Toggle
- ✨ Adding Animations for Game ending in a Tie
- 📱 Enhanced Mobile Layout & Accessibility Improvements
- ⚠️ Adding a confirmation modal when resetting the game to prevent accidental resets
- 🔊 Optional sound effects + sound toggle
- 🧠 Improve AI performance/strategy and add more difficulty tuning

---

## 🙏 Acknowledgements

Created as part of [The Odin Project: JavaScript Path](https://www.theodinproject.com/paths/full-stack-javascript/courses/javascript). <br>
Thanks to The Odin Project community for guidance and inspiration.
