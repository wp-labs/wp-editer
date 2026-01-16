import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { CodeJar } from 'codejar';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
import styles from './CodeJarEditor.module.css';

const highlight = (editor) => {
  const code = editor.textContent;
  editor.innerHTML = Prism.highlight(code, Prism.languages.javascript, 'javascript');
};

const CodeJarEditor = forwardRef((props, ref) => {
  const editorRef = useRef(null);
  const jarRef = useRef(null);
   const lineNumberRef = useRef(null);

  const updateLineNumbers = (code = '') => {
    const total = Math.max(1, code.split(/\r\n|\n/).length);
    if (lineNumberRef.current) {
      lineNumberRef.current.textContent = Array.from(
        { length: total },
        (_, idx) => `${idx + 1}`,
      ).join('\n');
    }
  };

  const syncScroll = () => {
    if (lineNumberRef.current && editorRef.current) {
      lineNumberRef.current.scrollTop = editorRef.current.scrollTop;
    }
  };

  useImperativeHandle(ref, () => ({
    getValue: () => jarRef.current?.toString() || '',
    setValue: (value) => {
      if (jarRef.current) {
        jarRef.current.updateCode(value || '');
      }
    },
  }));

  useEffect(() => {
    if (!editorRef.current) return;

    const jar = CodeJar(editorRef.current, highlight, { tab: '  ' });
    
    // 添加智能括号跳过功能
    const handleKeyDown = (e) => {
      const closingChars = [')', ']', '}', '"', "'"];
      if (closingChars.includes(e.key)) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const nextChar = range.endContainer.textContent?.[range.endOffset];
          
          // 如果下一个字符就是要输入的字符，跳过而不是插入
          if (nextChar === e.key) {
            e.preventDefault();
            range.setStart(range.endContainer, range.endOffset + 1);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    };

    editorRef.current.addEventListener('keydown', handleKeyDown);
    editorRef.current.addEventListener('scroll', syncScroll);

    jar.updateCode(props.value || '');
    updateLineNumbers(props.value || '');
    jar.onUpdate((code) => {
      props.onChange?.(code);
      updateLineNumbers(code);
    });

    jarRef.current = jar;

    return () => {
      editorRef.current?.removeEventListener('keydown', handleKeyDown);
      editorRef.current?.removeEventListener('scroll', syncScroll);
      jar.destroy();
    };
  }, []);

  useEffect(() => {
    if (jarRef.current && props.value !== undefined) {
      try {
        const pos = jarRef.current.save();
        if (pos) {
          jarRef.current.updateCode(props.value || '');
          jarRef.current.restore(pos);
        } else {
          jarRef.current.updateCode(props.value || '');
        }
      } catch (e) {
        jarRef.current.updateCode(props.value || '');
      }
      updateLineNumbers(props.value || '');
    }
  }, [props.value]);

  return (
    <div className={`${styles.editor} ${props.className || ''}`}>
      <pre
        className={styles.gutter}
        aria-hidden
        ref={lineNumberRef}
      />
      <div
        ref={editorRef}
        className={styles.code}
      />
    </div>
  );
});

export default CodeJarEditor;
