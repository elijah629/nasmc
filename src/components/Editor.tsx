"use client";

import "highlight.js/styles/atom-one-dark.css";
import { HighlightResult } from "highlight.js";
import hljs from "highlight.js/lib/core";
import x86asm from "highlight.js/lib/languages/x86asm";
import { useEffect, useRef, useState } from "react";

export default function Editor(props: {
	language: string;
	onChange: (value: string) => void;
}) {
	const [code, setCode] = useState("");
	const [highlighted, setHighlighted] = useState<HighlightResult>();
	const highlighted_elem = useRef<HTMLElement>(null);

	const { onChange, language } = props;

	useEffect(() => {
		hljs.registerLanguage("x86asm", x86asm);
	}, []);

	useEffect(() => {
		setHighlighted(
			hljs.highlight(code, {
				language: language
			})
		);
		onChange(code);
	}, [code, onChange, language]);

	function update_scroll(target: HTMLElement) {
		if (highlighted_elem.current) {
			const highlighted = highlighted_elem.current;

			highlighted.scrollTop = target.scrollTop;
			highlighted.scrollLeft = target.scrollLeft;
		}
	}

	return (
		<>
			<div className="grid">
				<textarea
					rows={code.split("\n").length}
					placeholder="Type some x86"
					className="z-10 col-start-1 row-start-1 w-full resize-none overflow-auto whitespace-nowrap bg-transparent p-5 -tracking-[.02em] text-transparent caret-white outline-none"
					autoCapitalize="false"
					autoCorrect="false"
					spellCheck="false"
					onScroll={e =>
						update_scroll(
							e.target as HTMLTextAreaElement
						)
					}
					onKeyDown={e => {
						let element = e.target as HTMLTextAreaElement;
						let code = element.value;
						if (e.key === "Tab") {
							e.preventDefault();

							const before_tab = code.substring(0, element.selectionStart);
							const after_tab = code.substring(element.selectionEnd);

							const cursor_pos = element.selectionEnd + 1;
							element.value = before_tab + "\t" + after_tab;
							
							// Move cursor
							element.selectionStart = cursor_pos;
							element.selectionEnd = cursor_pos;

							setCode(element.value);
							update_scroll(element);
						} else if (e.key === "/" && e.ctrlKey) {
							e.preventDefault();

							const lines = element.value.split("\n");
							const lines_after_cursor = element.value.substring(element.selectionStart).split("\n").length;
							const total_lines = lines.length;
							const current_line_idx = total_lines - lines_after_cursor;
							const current_line = lines[current_line_idx];
							
							const start_of_code = current_line.length - current_line.trimStart().length;
							const COMMENT = ";";

							if (current_line[start_of_code] === COMMENT) {	
								lines[current_line_idx] = current_line.substring(0, start_of_code) + current_line.substring(start_of_code + COMMENT.length + 1);
							} else {
								lines[current_line_idx] = current_line.substring(0, start_of_code) + COMMENT + " " + current_line.substring(start_of_code);
							}
							
							element.value = lines.join("\n");

							setCode(element.value);
							update_scroll(element);
						}

					}}
					onChange={({ target }) => {
						setCode(target.value);
						update_scroll(target);
					}}></textarea>
				<pre className="col-start-1 row-start-1 w-full overflow-auto">
					<code
						ref={highlighted_elem}
						className="code-block min-h-[65.6px] overflow-auto"
						dangerouslySetInnerHTML={{
							__html:
								(highlighted?.value.endsWith("\n")
									? highlighted?.value + " "
									: highlighted?.value) ?? " "
						}}></code>
				</pre>
			</div>
		</>
	);
}

// function update(text) {
//   let result_element = document.querySelector("#highlighting-content");
//   // Handle final newlines (see article)
//   if(text[text.length-1] == "\n") {
//     text += " ";
//   }
//   // Update code
//   result_element.innerHTML = text.replace(new RegExp("&", "g"), "&amp;").replace(new RegExp("<", "g"), "&lt;"); /* Global RegExp */
//   // Syntax Highlight
//   Prism.highlightElement(result_element);
// }

// function sync_scroll(element) {
//   /* Scroll result to scroll coords of event - sync with textarea */
//   let result_element = document.querySelector("#highlighting");
//   // Get and set x and y
//   result_element.scrollTop = element.scrollTop;
//   result_element.scrollLeft = element.scrollLeft;
// }

// function check_tab(element, event) {
//   let code = element.value;
//   if(event.key == "Tab") {
//     /* Tab key pressed */
//     event.preventDefault(); // stop normal
//     let before_tab = code.slice(0, element.selectionStart); // text before tab
//     let after_tab = code.slice(element.selectionEnd, element.value.length); // text after tab
//     let cursor_pos = element.selectionStart + 1; // where cursor moves after tab - moving forward by 1 char to after tab
//     element.value = before_tab + "\t" + after_tab; // add tab char
//     // move cursor
//     element.selectionStart = cursor_pos;
//     element.selectionEnd = cursor_pos;
//     update(element.value); // Update text to include indent
//   }
// }
