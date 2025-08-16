# modot

A clean, modern, and efficient markdown editor designed for a seamless writing experience.

**Live Site:** [**modot-sny.vercel.app**](https://modot-sny.vercel.app)

---

## Key Features

modot is built with a focus on speed, convenience, and a polished user interface.

### Live Preview with GitHub Styling
- **Real-time Rendering**: See your markdown rendered as HTML instantly as you type.
- **Authentic GitHub Preview**: The preview pane uses the official `github-markdown-light.css` stylesheet, ensuring that what you see is exactly how it will look on GitHub.

### Efficient Workflow
- **Keyboard Shortcut**: Quickly toggle between **Edit** and **Preview** modes using the intuitive `Ctrl+M` (or `Cmd+M` on macOS) shortcut. This works globally, no matter where your focus is.
- **Download with Custom Name**: Easily save your work by entering a custom filename and downloading the `.md` file directly from the header.

### Smart Caching
- **Never Lose Your Work**: Your content is automatically saved to your browser's local storage, so you can close the tab and come back to it later.
- **Consistent Starting Point**: While your content is always saved, the editor defaults to **Edit** mode on every reload for a predictable and consistent user experience.

### Flexible Layouts
- **Multiple View Modes**: Switch between a focused **Edit** mode, a clean **Preview** mode, or a productive **Side-by-Side** view to suit your needs.
- **Resizable Panes**: In side-by-side mode, simply drag the central divider to adjust the pane sizes.

---

## Tech Stack

- **Backend**: Flask
- **Editor Core**: Monaco Editor (the engine behind VS Code)
- **Markdown Parsing**: Marked.js
- **Security**: DOMPurify
- **Deployment**: Vercel

---

## Future Work

This project is actively being developed. Here are some of the features planned for the future:

-   **User Authentication & Cloud Storage**: Allowing users to sign in and save their files to a personal, cloud-based account.
-   **Extended Keyboard Shortcuts**: Introducing more shortcuts for formatting (bold, italics, lists) and other actions.
-   **AI Summarizer Integration**: Adding a feature to automatically generate a summary of the markdown document using AI.
-   **Folder System**: Implementing a file and folder system for users to organize their documents within the application.