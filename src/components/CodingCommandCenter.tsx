import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import styled from "styled-components";

interface FileSystemNode {
  name: string;
  type: "file" | "directory";
  content?: string;
  children?: { [key: string]: FileSystemNode };
}

interface CommandCenterProps {
  onBack?: () => void;
  onHeaderCollapseRequest?: (collapse: boolean) => void;
}

// Virtual file system
const initialFileSystem: { [key: string]: FileSystemNode } = {
  home: {
    name: "home",
    type: "directory",
    children: {
      user: {
        name: "user",
        type: "directory",
        children: {
          "welcome.txt": {
            name: "welcome.txt",
            type: "file",
            content: `Welcome to the Coding Command Center!
            
This is your virtual Linux environment in the browser.
You can use standard commands like:
- ls: list directory contents
- cd: change directory
- cat: display file contents
- pwd: print working directory
- mkdir: create directory
- touch: create file
- echo: write to file
- clear: clear terminal
- help: show available commands

Try typing 'help' to get started!`,
          },
          projects: {
            name: "projects",
            type: "directory",
            children: {
              "README.md": {
                name: "README.md",
                type: "file",
                content: "# My Projects\n\nThis is where your awesome projects live!",
              },
            },
          },
          scripts: {
            name: "scripts",
            type: "directory",
            children: {},
          },
        },
      },
    },
  },
};

// Styled Components
const Container = styled.div`
  width: 100%;
  height: calc(100vh - 100px);
  background: #0d1117;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
`;

const TopBar = styled.div`
  background: #161b22;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #30363d;
`;

const DotButton = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) => props.color};
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const Title = styled.div`
  flex: 1;
  text-align: center;
  color: #8b949e;
  font-size: 0.85rem;
  font-weight: 500;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const TerminalSection = styled.div<{ $width: number }>`
  width: ${(props) => props.$width}%;
  display: flex;
  flex-direction: column;
  background: #0d1117;
  border-right: 1px solid #30363d;
  overflow: hidden;
`;

const EditorSection = styled.div<{ $width: number }>`
  width: ${(props) => props.$width}%;
  display: flex;
  flex-direction: column;
  background: #0d1117;
`;

const Resizer = styled.div`
  width: 4px;
  cursor: col-resize;
  background: #30363d;
  transition: background 0.2s;

  &:hover {
    background: #58a6ff;
  }
`;

const TerminalOutput = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #c9d1d9;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #161b22;
  }

  &::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #484f58;
  }
`;

const OutputLine = styled.div`
  margin-bottom: 0.25rem;
  white-space: pre-wrap;
  word-break: break-word;
`;

const PromptLine = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const Prompt = styled.span`
  color: #58a6ff;
  font-weight: 600;
`;

const CommandText = styled.span`
  color: #7ee787;
`;

const InputContainer = styled.div`
  padding: 0.75rem 1rem;
  background: #161b22;
  border-top: 1px solid #30363d;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #c9d1d9;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 0.9rem;
`;

const EditorHeader = styled.div`
  background: #161b22;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #30363d;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EditorTitle = styled.div`
  color: #8b949e;
  font-size: 0.85rem;
  font-weight: 500;
`;

const EditorActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EditorButton = styled.button`
  padding: 0.25rem 0.75rem;
  background: #238636;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s;

  &:hover {
    background: #2ea043;
  }

  &:disabled {
    background: #30363d;
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const EditorTextarea = styled.textarea`
  flex: 1;
  padding: 1rem;
  background: #0d1117;
  border: none;
  outline: none;
  color: #c9d1d9;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  resize: none;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #161b22;
  }

  &::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #484f58;
  }
`;

const FileExplorer = styled.div`
  padding: 0.5rem;
  background: #161b22;
  border-bottom: 1px solid #30363d;
  max-height: 200px;
  overflow-y: auto;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 0.85rem;
`;

const FileItem = styled.div<{ $isDirectory?: boolean; $isSelected?: boolean }>`
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  color: ${(props) =>
    props.$isDirectory ? "#79c0ff" : props.$isSelected ? "#7ee787" : "#c9d1d9"};
  background: ${(props) => (props.$isSelected ? "#1f6feb20" : "transparent")};
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #1f6feb30;
  }

  &::before {
    content: "${(props) => (props.$isDirectory ? "📁" : "📄")} ";
  }
`;

const CodingCommandCenter: React.FC<CommandCenterProps> = ({
  onBack,
  onHeaderCollapseRequest,
}) => {
  const [output, setOutput] = useState<
    Array<{ type: "command" | "output" | "error"; content: string }>
  >([
    {
      type: "output",
      content: "Welcome to Coding Command Center v1.0.0",
    },
    {
      type: "output",
      content: 'Type "help" for available commands.',
    },
  ]);
  const [input, setInput] = useState("");
  const [currentPath, setCurrentPath] = useState("/home/user");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [fileSystem, setFileSystem] =
    useState<{ [key: string]: FileSystemNode }>(initialFileSystem);
  const [editorContent, setEditorContent] = useState("");
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState(50);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (onHeaderCollapseRequest) {
      onHeaderCollapseRequest(true);
    }
  }, [onHeaderCollapseRequest]);

  const getNodeAtPath = (
    path: string
  ): { node: FileSystemNode | null; parentPath: string; nodeName: string } => {
    const parts = path.split("/").filter(Boolean);
    let current: FileSystemNode | null = null;
    let currentObj: { [key: string]: FileSystemNode } = fileSystem;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (currentObj[part]) {
        current = currentObj[part];
        if (current.type === "directory" && current.children) {
          currentObj = current.children;
        }
      } else {
        return { node: null, parentPath: "", nodeName: "" };
      }
    }

    const parentPath = "/" + parts.slice(0, -1).join("/");
    const nodeName = parts[parts.length - 1] || "";
    return { node: current, parentPath, nodeName };
  };

  const listDirectory = (path: string): string => {
    const { node } = getNodeAtPath(path);
    if (!node) return "ls: cannot access path: No such file or directory";
    if (node.type !== "directory")
      return "ls: cannot access: Not a directory";

    if (!node.children) return "";

    const items = Object.keys(node.children)
      .map((name) => {
        const item = node.children![name];
        return item.type === "directory" ? `${name}/` : name;
      })
      .join("  ");

    return items || "(empty directory)";
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Add to history
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    // Add command to output
    setOutput((prev) => [
      ...prev,
      { type: "command", content: `${currentPath} $ ${trimmed}` },
    ]);

    const [command, ...args] = trimmed.split(" ");

    switch (command) {
      case "help":
        setOutput((prev) => [
          ...prev,
          {
            type: "output",
            content: `Available commands:
  ls [path]          - List directory contents
  cd <path>          - Change directory
  pwd                - Print working directory
  cat <file>         - Display file contents
  mkdir <name>       - Create directory
  touch <name>       - Create file
  echo <text> > <file> - Write to file
  edit <file>        - Open file in editor
  clear              - Clear terminal
  help               - Show this help message`,
          },
        ]);
        break;

      case "clear":
        setOutput([]);
        break;

      case "pwd":
        setOutput((prev) => [...prev, { type: "output", content: currentPath }]);
        break;

      case "ls":
        const lsPath = args[0] ? args[0] : currentPath;
        const fullLsPath = lsPath.startsWith("/")
          ? lsPath
          : `${currentPath}/${lsPath}`.replace("//", "/");
        const lsResult = listDirectory(fullLsPath);
        setOutput((prev) => [...prev, { type: "output", content: lsResult }]);
        break;

      case "cd":
        if (!args[0]) {
          setCurrentPath("/home/user");
        } else {
          let newPath = args[0];
          if (newPath === "..") {
            const parts = currentPath.split("/").filter(Boolean);
            parts.pop();
            newPath = "/" + parts.join("/");
          } else if (!newPath.startsWith("/")) {
            newPath = `${currentPath}/${newPath}`.replace("//", "/");
          }

          const { node } = getNodeAtPath(newPath);
          if (node && node.type === "directory") {
            setCurrentPath(newPath);
          } else {
            setOutput((prev) => [
              ...prev,
              {
                type: "error",
                content: "cd: no such directory: " + args[0],
              },
            ]);
          }
        }
        break;

      case "cat":
        if (!args[0]) {
          setOutput((prev) => [
            ...prev,
            { type: "error", content: "cat: missing file operand" },
          ]);
        } else {
          const catPath = args[0].startsWith("/")
            ? args[0]
            : `${currentPath}/${args[0]}`.replace("//", "/");
          const { node } = getNodeAtPath(catPath);
          if (!node) {
            setOutput((prev) => [
              ...prev,
              { type: "error", content: "cat: no such file: " + args[0] },
            ]);
          } else if (node.type !== "file") {
            setOutput((prev) => [
              ...prev,
              { type: "error", content: "cat: is a directory: " + args[0] },
            ]);
          } else {
            setOutput((prev) => [
              ...prev,
              { type: "output", content: node.content || "" },
            ]);
          }
        }
        break;

      case "mkdir":
        if (!args[0]) {
          setOutput((prev) => [
            ...prev,
            { type: "error", content: "mkdir: missing operand" },
          ]);
        } else {
          const mkdirPath = `${currentPath}/${args[0]}`.replace("//", "/");
          const parts = mkdirPath.split("/").filter(Boolean);
          const dirName = parts.pop()!;
          const parentPath = "/" + parts.join("/");

          const { node: parentNode } = getNodeAtPath(parentPath);
          if (parentNode && parentNode.type === "directory") {
            if (parentNode.children && !parentNode.children[dirName]) {
              const newFS = { ...fileSystem };
              const { node: updatedParent } = getNodeAtPath(parentPath);
              if (updatedParent && updatedParent.children) {
                updatedParent.children[dirName] = {
                  name: dirName,
                  type: "directory",
                  children: {},
                };
                setFileSystem(newFS);
                setOutput((prev) => [
                  ...prev,
                  { type: "output", content: `Created directory: ${dirName}` },
                ]);
              }
            } else {
              setOutput((prev) => [
                ...prev,
                { type: "error", content: "mkdir: directory already exists" },
              ]);
            }
          }
        }
        break;

      case "touch":
        if (!args[0]) {
          setOutput((prev) => [
            ...prev,
            { type: "error", content: "touch: missing file operand" },
          ]);
        } else {
          const touchPath = `${currentPath}/${args[0]}`.replace("//", "/");
          const parts = touchPath.split("/").filter(Boolean);
          const fileName = parts.pop()!;
          const parentPath = "/" + parts.join("/");

          const { node: parentNode } = getNodeAtPath(parentPath);
          if (parentNode && parentNode.type === "directory") {
            if (parentNode.children && !parentNode.children[fileName]) {
              const newFS = { ...fileSystem };
              const { node: updatedParent } = getNodeAtPath(parentPath);
              if (updatedParent && updatedParent.children) {
                updatedParent.children[fileName] = {
                  name: fileName,
                  type: "file",
                  content: "",
                };
                setFileSystem(newFS);
                setOutput((prev) => [
                  ...prev,
                  { type: "output", content: `Created file: ${fileName}` },
                ]);
              }
            } else {
              setOutput((prev) => [
                ...prev,
                { type: "output", content: `File already exists: ${fileName}` },
              ]);
            }
          }
        }
        break;

      case "echo":
        const echoIndex = trimmed.indexOf(">");
        if (echoIndex > -1) {
          const text = trimmed.substring(5, echoIndex).trim();
          const fileName = trimmed.substring(echoIndex + 1).trim();
          const filePath = `${currentPath}/${fileName}`.replace("//", "/");
          const parts = filePath.split("/").filter(Boolean);
          const name = parts.pop()!;
          const parentPath = "/" + parts.join("/");

          const { node: parentNode } = getNodeAtPath(parentPath);
          if (parentNode && parentNode.type === "directory") {
            const newFS = { ...fileSystem };
            const { node: updatedParent } = getNodeAtPath(parentPath);
            if (updatedParent && updatedParent.children) {
              updatedParent.children[name] = {
                name: name,
                type: "file",
                content: text,
              };
              setFileSystem(newFS);
              setOutput((prev) => [
                ...prev,
                { type: "output", content: `Written to ${fileName}` },
              ]);
            }
          }
        } else {
          setOutput((prev) => [
            ...prev,
            { type: "output", content: trimmed.substring(5) },
          ]);
        }
        break;

      case "edit":
        if (!args[0]) {
          setOutput((prev) => [
            ...prev,
            { type: "error", content: "edit: missing file operand" },
          ]);
        } else {
          const editPath = args[0].startsWith("/")
            ? args[0]
            : `${currentPath}/${args[0]}`.replace("//", "/");
          const { node } = getNodeAtPath(editPath);
          if (node && node.type === "file") {
            setCurrentFile(editPath);
            setEditorContent(node.content || "");
            setOutput((prev) => [
              ...prev,
              { type: "output", content: `Opening ${args[0]} in editor...` },
            ]);
          } else if (node && node.type === "directory") {
            setOutput((prev) => [
              ...prev,
              { type: "error", content: "edit: is a directory: " + args[0] },
            ]);
          } else {
            // Create new file
            setCurrentFile(editPath);
            setEditorContent("");
            setOutput((prev) => [
              ...prev,
              {
                type: "output",
                content: `Creating new file ${args[0]} in editor...`,
              },
            ]);
          }
        }
        break;

      default:
        setOutput((prev) => [
          ...prev,
          {
            type: "error",
            content: `Command not found: ${command}. Type "help" for available commands.`,
          },
        ]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const handleSaveFile = () => {
    if (currentFile) {
      const parts = currentFile.split("/").filter(Boolean);
      const fileName = parts.pop()!;
      const parentPath = "/" + parts.join("/");

      const newFS = { ...fileSystem };
      const { node: parentNode } = getNodeAtPath(parentPath);
      if (parentNode && parentNode.type === "directory" && parentNode.children) {
        parentNode.children[fileName] = {
          name: fileName,
          type: "file",
          content: editorContent,
        };
        setFileSystem(newFS);
        setOutput((prev) => [
          ...prev,
          { type: "output", content: `Saved ${currentFile}` },
        ]);
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const containerWidth = window.innerWidth;
        const newWidth = (e.clientX / containerWidth) * 100;
        setLeftWidth(Math.max(20, Math.min(80, newWidth)));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing]);

  const renderFileTree = (
    node: { [key: string]: FileSystemNode },
    path: string,
    depth: number = 0
  ): React.ReactNode => {
    return Object.keys(node).map((key) => {
      const item = node[key];
      const itemPath = `${path}/${key}`.replace("//", "/");
      return (
        <div key={itemPath} style={{ paddingLeft: `${depth * 1}rem` }}>
          <FileItem
            $isDirectory={item.type === "directory"}
            $isSelected={currentFile === itemPath}
            onClick={() => {
              if (item.type === "file") {
                setCurrentFile(itemPath);
                setEditorContent(item.content || "");
              }
            }}
          >
            {key}
          </FileItem>
          {item.type === "directory" &&
            item.children &&
            renderFileTree(item.children, itemPath, depth + 1)}
        </div>
      );
    });
  };

  return (
    <Container>
      <TopBar>
        <DotButton color="#ff5f56" onClick={onBack} title="Close" />
        <DotButton color="#ffbd2e" />
        <DotButton color="#27c93f" />
        <Title>Coding Command Center - {currentPath}</Title>
      </TopBar>

      <MainContent>
        <TerminalSection $width={leftWidth}>
          <TerminalOutput ref={outputRef}>
            {output.map((line, idx) => (
              <OutputLine key={idx}>
                {line.type === "command" && (
                  <PromptLine>
                    <CommandText>{line.content}</CommandText>
                  </PromptLine>
                )}
                {line.type === "output" && (
                  <span style={{ color: "#c9d1d9" }}>{line.content}</span>
                )}
                {line.type === "error" && (
                  <span style={{ color: "#f85149" }}>{line.content}</span>
                )}
              </OutputLine>
            ))}
          </TerminalOutput>
          <InputContainer>
            <Prompt>{currentPath} $</Prompt>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              autoFocus
            />
          </InputContainer>
        </TerminalSection>

        <Resizer onMouseDown={() => setIsResizing(true)} />

        <EditorSection $width={100 - leftWidth}>
          <EditorHeader>
            <EditorTitle>
              {currentFile ? `Editing: ${currentFile}` : "Code Editor"}
            </EditorTitle>
            <EditorActions>
              <EditorButton onClick={handleSaveFile} disabled={!currentFile}>
                Save File
              </EditorButton>
              <EditorButton
                onClick={() => {
                  setCurrentFile(null);
                  setEditorContent("");
                }}
                disabled={!currentFile}
              >
                Close
              </EditorButton>
            </EditorActions>
          </EditorHeader>

          <FileExplorer>
            <div
              style={{
                color: "#8b949e",
                fontSize: "0.75rem",
                marginBottom: "0.5rem",
                fontWeight: 600,
              }}
            >
              FILE EXPLORER
            </div>
            {renderFileTree(fileSystem, "")}
          </FileExplorer>

          <EditorTextarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            placeholder="Select a file or use 'edit filename' command to start editing..."
            spellCheck={false}
          />
        </EditorSection>
      </MainContent>
    </Container>
  );
};

export default CodingCommandCenter;
