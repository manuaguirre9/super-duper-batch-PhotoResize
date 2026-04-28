# PhotoResize 📸

**PhotoResize** is a high-performance, local-first web application designed for batch photo cropping and resizing. Built with a focus on visual excellence and professional ergonomics, it allows photographers and creators to process multiple images simultaneously entirely within the browser.

![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![MaterialUI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white)

## ✨ Key Features

- **🚀 Batch Processing**: Import dozens of photos via drag-and-drop and process them all in one session.
- **🎨 Interactive Canvas Editor**: 
  - Smooth **Zoom-to-Pointer** (Miro/Figma style).
  - Intuitive Panning and Rotation.
  - Horizontal and Vertical Flipping.
- **🔍 Workspace Padding (Dimmed Overflow)**: See exactly what's being cropped with a semi-transparent preview of the area outside the crop box.
- **📏 Resolution Mastery**:
  - Extensive Presets (Social Media, Print, Web).
  - Custom resolution with **Locked Aspect Ratio** support.
- **📐 Visual Guides**: Toggleable Rule of Thirds, Grid, and Center Lines for perfect composition.
- **🔄 Drag-and-Drop Reordering**: Organize your export queue easily by dragging thumbnails in the carousel.
- **⌨️ Pro Shortcuts**:
  - `Arrows`: Navigate between photos.
  - `+/-`: Zoom in/out.
  - `R`: Rotate 90°.
- **🔒 Privacy First**: All image processing happens locally on your device. No photos are ever uploaded to a server.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **UI Architecture**: [Material UI v6](https://mui.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Image Engine**: Native HTML5 Canvas API
- **Interactions**: [dnd-kit](https://dndkit.com/) for reordering and custom pointer logic for the editor.

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/PhotoResize.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run in development mode**:
   ```bash
   npm run dev
   ```
4. **Build for production**:
   ```bash
   npm run build
   ```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
