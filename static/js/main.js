import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/+esm';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked@5.1.2/lib/marked.esm.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.es.js';

const init = () => {
  // --- Robust localStorage fallback if Storehouse is unavailable ---
  if (!window.Storehouse) {
    window.Storehouse = {
      getItem(ns, key) { try { return localStorage.getItem(`${ns}:${key}`); } catch { return null; } },
      setItem(ns, key, val) { try { localStorage.setItem(`${ns}:${key}`, val); } catch {} },
    };
  }

  const NAMESPACE = 'com.markdownlivepreview';
  const KEY_LAST_STATE = 'last_state';
  const KEY_SPLIT_RATIO = 'split_ratio';
  const KEY_VIEW_MODE = 'view_mode';

  const defaultInput = `# modot

Welcome to your new streamlined Markdown editor!

## Core Features
- **Live Preview**: See your rendered Markdown as you type.
- **Resizable Panes**: Drag the central divider to adjust the view.
- **Syntax Highlighting**: Powered by the Monaco Editor (the engine behind VS Code).
- **GitHub Flavored Markdown**: Uses the 'marked' library for accurate rendering.
- **Security**: DOMPurify is used to sanitize HTML output, preventing XSS attacks.
- **Layout Modes**: Switch between Edit, Preview, and Side-by-Side views.
`;

  const editorPane = document.getElementById('edit');
  const previewPane = document.getElementById('preview');
  const divider = document.getElementById('split-divider');
  const wrapper = document.getElementById('editor-wrapper');
  const btnToggleView = document.getElementById('btn-toggle-view');
  const btnSideBySide = document.getElementById('btn-side-by-side');
  const filenameInput = document.getElementById('filename-input');
  const btnDownload = document.getElementById('btn-download');

  self.MonacoEnvironment = {
    getWorker() { return new Proxy({}, { get: () => () => {} }); }
  };

  let editor;

  const setupEditor = () => {
    editor = monaco.editor.create(document.querySelector('#editor'), {
      value: '',
      fontSize: 14,
      language: 'markdown',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: false,
      scrollbar: { vertical: 'visible', horizontal: 'visible' },
      wordWrap: 'on',
      hover: { enabled: false },
      quickSuggestions: false,
      suggestOnTriggerCharacters: false,
      folding: false,
      theme: 'vs'
    });

    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      render(value);
      saveContent(value);
    });

    return editor;
  };

  const render = (markdown) => {
    const options = { headerIds: false, mangle: false, gfm: true, breaks: true };
    const html = marked.parse(markdown, options);
    const sanitized = DOMPurify.sanitize(html);
    document.getElementById('output').innerHTML = sanitized;
  };

  const loadContent = () => window.Storehouse.getItem(NAMESPACE, KEY_LAST_STATE);
  const saveContent = (content) => window.Storehouse.setItem(NAMESPACE, KEY_LAST_STATE, content);

  const loadRatio = () => {
    const v = window.Storehouse.getItem(NAMESPACE, KEY_SPLIT_RATIO);
    const n = Number(v);
    return Number.isFinite(n) && n > 0 && n < 1 ? n : 0.5;
  };
  const saveRatio = (r) => window.Storehouse.setItem(NAMESPACE, KEY_SPLIT_RATIO, String(r));

  const applyRatio = (ratio) => {
    const rect = wrapper.getBoundingClientRect();
    const dividerW = divider.getBoundingClientRect().width || 4;
    const available = Math.max(0, rect.width - dividerW);
    const MIN = 120;
    const leftPx = Math.max(MIN, Math.min(available - MIN, ratio * available));
    
    editorPane.style.width = leftPx + 'px';
    previewPane.style.width = (available - leftPx) + 'px';

    if (editor) requestAnimationFrame(() => editor.layout());
  };

  const setupDivider = () => {
    let isDragging = false;
    let ratio = loadRatio();
    applyRatio(ratio);

    const onPointerDown = (e) => {
      e.preventDefault();
      isDragging = true;
      divider.setPointerCapture(e.pointerId);
      document.body.classList.add('dragging');
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const rect = wrapper.getBoundingClientRect();
      const dividerW = divider.getBoundingClientRect().width || 4;
      const available = Math.max(0, rect.width - dividerW);
      if (available === 0) return;
      const offsetX = e.clientX - rect.left;
      const MIN = 120;
      const leftPx = Math.max(MIN, Math.min(available - MIN, offsetX));
      ratio = leftPx / available;
      applyRatio(ratio);
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      document.body.classList.remove('dragging');
      saveRatio(ratio);
    };

    divider.addEventListener('pointerdown', onPointerDown);
    divider.addEventListener('pointermove', onPointerMove);
    divider.addEventListener('pointerup', endDrag);
    divider.addEventListener('pointercancel', endDrag);
    divider.addEventListener('dblclick', () => {
      ratio = 0.5;
      applyRatio(ratio);
      saveRatio(ratio);
    });
    window.addEventListener('resize', () => applyRatio(loadRatio()));
  };

  /** Sets the view mode for the editor. */
  const setViewMode = (mode) => {
    wrapper.classList.remove('mode-edit', 'mode-preview');
    btnSideBySide.classList.remove('active');

    if (mode === 'edit') {
      wrapper.classList.add('mode-edit');
      btnToggleView.textContent = 'Preview';
    } else if (mode === 'preview') {
      wrapper.classList.add('mode-preview');
      btnToggleView.textContent = 'Edit';
    } else { // side-by-side
      btnToggleView.textContent = 'Edit';
      btnSideBySide.classList.add('active');
      applyRatio(loadRatio());
    }
    
    if (editor) {
        requestAnimationFrame(() => editor.layout());
    }
    
    window.Storehouse.setItem(NAMESPACE, KEY_VIEW_MODE, mode);
  };

  const handleToggleClick = () => {
    const isPreview = wrapper.classList.contains('mode-preview');
    const isEdit = wrapper.classList.contains('mode-edit');
    
    if (isPreview) {
      setViewMode('edit');
    } else if (isEdit) {
      setViewMode('preview');
    } else { // Is in side-by-side mode
      setViewMode('edit');
    }
  };

  const handleDownload = () => {
    if (!editor) return;

    const content = editor.getValue();
    let filename = filenameInput.value.trim();

    if (!filename) {
      filename = 'Untitled.md';
    }

    if (!filename.toLowerCase().endsWith('.md')) {
      filename += '.md';
    }

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const setupButtons = () => {
    btnToggleView.addEventListener('click', handleToggleClick);
    btnSideBySide.addEventListener('click', () => setViewMode('side-by-side'));
    btnDownload.addEventListener('click', handleDownload);
  };

  const setupKeyboardShortcuts = () => {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault(); 
        handleToggleClick(); 
      }
    }, true);
  };

  applyRatio(loadRatio());
  setupEditor();

  const lastContent = loadContent();
  const initialContent = lastContent !== null ? lastContent : defaultInput.replace(/^\s+/gm, '');
  editor.setValue(initialContent);
  render(initialContent);

  setupDivider();
  setupButtons();
  setupKeyboardShortcuts();
  
  setViewMode('side-by-side'); // Default to side-by-side view
  
  wrapper.classList.add('initialized');
};

window.addEventListener('load', init);
