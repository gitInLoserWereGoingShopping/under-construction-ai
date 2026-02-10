# Coding Command Center

A virtual Linux terminal and code editor accessible through your browser, deployable on Vercel.

## Overview

The Coding Command Center provides a full-featured virtual Linux environment that you can access from anywhere. It feels like logging into a real virtual machine, complete with a command-line terminal and integrated code editor.

## Features

### Terminal Emulator
- **Command Line Interface**: Full Linux-like terminal with prompt and command history
- **Command History Navigation**: Use arrow keys (↑/↓) to navigate through previous commands
- **Virtual File System**: Complete directory structure with files and folders
- **Real-time Output**: Immediate feedback for all commands

### Supported Commands

| Command | Description | Example |
|---------|-------------|---------|
| `help` | Show available commands | `help` |
| `ls [path]` | List directory contents | `ls`, `ls projects` |
| `cd <path>` | Change directory | `cd projects`, `cd ..` |
| `pwd` | Print working directory | `pwd` |
| `cat <file>` | Display file contents | `cat welcome.txt` |
| `mkdir <name>` | Create directory | `mkdir myfolder` |
| `touch <name>` | Create file | `touch script.js` |
| `echo <text> > <file>` | Write to file | `echo Hello > test.txt` |
| `edit <file>` | Open file in editor | `edit mycode.js` |
| `clear` | Clear terminal | `clear` |

### Code Editor
- **Split-Pane Interface**: Terminal on left, editor on right
- **File Explorer**: Visual tree view of all files and directories
- **Syntax Support**: Monospace font optimized for code
- **Save Functionality**: Save edited files back to virtual file system
- **Click to Open**: Click any file in the explorer to open in editor
- **Resizable Panels**: Drag the divider to adjust panel sizes

### User Interface
- **GitHub Dark Theme**: Professional dark color scheme
- **Mac-Style Controls**: Red, yellow, and green window buttons
- **Responsive Design**: Works on desktop and tablet devices
- **Smooth Animations**: Polished transitions and interactions

## Usage

### Accessing the Command Center

1. Navigate to the Under Construction AI homepage
2. Enter the daily access code (displayed for demo purposes)
3. Click on the "Coding Command Center" tile in the Feature Dashboard
4. Start typing commands in the terminal!

### Working with Files

#### Creating a File
```bash
# Create a new JavaScript file
touch myapp.js

# Open it in the editor
edit myapp.js
```

#### Editing and Saving
1. Type your code in the editor panel
2. Click the "Save File" button
3. Verify with `cat myapp.js` in the terminal

#### Creating Directories
```bash
# Create a new directory
mkdir src

# Navigate into it
cd src

# Create files inside
touch index.js
```

### Example Workflow

```bash
# List current directory
ls

# Create a project structure
mkdir myproject
cd myproject
mkdir src
touch src/app.js
touch README.md

# Edit the main file
edit src/app.js

# (Type your code in the editor)
# Click Save File

# View your code
cat src/app.js

# Navigate back
cd ..
pwd
```

## Technical Details

### Architecture
- **React Component**: Built as a self-contained React component
- **State Management**: Uses React hooks (useState, useRef, useEffect)
- **Styled Components**: CSS-in-JS styling with styled-components
- **Virtual File System**: In-memory JSON structure for files and directories
- **Deep Cloning**: Proper state immutability with deep cloning

### File System Structure
```
/home
  └── /user
      ├── welcome.txt
      ├── /projects
      │   └── README.md
      └── /scripts
```

### Keyboard Shortcuts
- **↑ (Up Arrow)**: Previous command in history
- **↓ (Down Arrow)**: Next command in history
- **Enter**: Execute command

## Deployment

The Coding Command Center is fully compatible with Vercel and requires no special configuration:

```bash
npm run build
```

The component is automatically included in the Next.js build and will be deployed with the rest of the application.

## Future Enhancements

Potential features for future development:
- [ ] Syntax highlighting in the editor
- [ ] Multiple tabs/files open simultaneously
- [ ] File upload/download functionality
- [ ] Collaboration features (shared sessions)
- [ ] More Linux commands (grep, find, rm, mv, cp)
- [ ] Code execution for supported languages
- [ ] Terminal themes and customization
- [ ] Persistent storage (save to localStorage or backend)

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ⚠️ Works but keyboard may be limited

## Contributing

To add new commands:

1. Open `src/components/CodingCommandCenter.tsx`
2. Add a new case in the `executeCommand` switch statement
3. Implement the command logic
4. Update the help text

Example:
```typescript
case "mycommand":
  setOutput((prev) => [
    ...prev,
    { type: "output", content: "Command executed!" },
  ]);
  break;
```

## License

Part of the Under Construction AI project.
