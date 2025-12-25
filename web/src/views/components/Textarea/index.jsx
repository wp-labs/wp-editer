import { useRef } from 'react';

function Textarea(props) {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + '\t' + value.substring(end);

      textarea.value = newValue;
      textarea.selectionStart = textarea.selectionEnd = start + 1;

      if (props.onChange) {
        props.onChange({
          target: { value: newValue },
        });
      }
    } else if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  return (
    <textarea
      ref={textareaRef}
      {...props}
      onKeyDown={handleKeyDown}
    />
  );
}

export default Textarea;
