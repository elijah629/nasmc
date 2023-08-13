"use client";

import { useEffect, useState } from "react";
import Editor from "./Editor";
import hljs from "highlight.js";
import x86asm from "highlight.js/lib/languages/x86asm";

export default function Compiler() {
	const [code, setCode] = useState<string>();
	const [decompiled, setDecompiled] = useState<string>();
	const [elf, setElf] = useState<string>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		hljs.registerLanguage("x86asm", x86asm);
	}, []);

	return (
		<>
			<Editor
				onChange={setCode}
				language="x86asm"
			/>
			<div className="flex justify-end">
				<button
					onClick={async () => {
						let _elf;
						{
							const response = await fetch("/api/compile", {
								method: "POST",
								body: code
							});
							
							const elf_or_error = await response.text();
							
							{
								if (response.status === 400) {
									setError(elf_or_error);
									return;
								}
								setError(undefined);
							}

							_elf = elf_or_error;
							console.log(_elf.split("").map(x => x.charCodeAt(0)).join(" "));
							setElf(elf_or_error);
						}
						
						let decompiled_unprocessed;
						{
							const response = await fetch("/api/decompile", {
								method: "POST",
								body: _elf
							});

							const decompiled_or_error = await response.text();

							{
								if (response.status === 400) {
									setError(decompiled_or_error);
									return;
								}
								setError(undefined);
							}

							decompiled_unprocessed = decompiled_or_error;
						}

						
						{
							const iOf = decompiled_unprocessed.indexOf(">");
							
							if (iOf === -1) {
								setDecompiled("");
							} else {
								let lines = decompiled_unprocessed.substring(iOf + 3).split("\n");
								let lines2 = lines
								.filter(x => !!x)
								.map(x => x.split("\t"))
								.map(x => [
										parseInt(x[0].trimStart()) + " ",
										x[1],
										hljs.highlight(x[2], {
											language: "x86asm"
										}).value
								].join(" "));
									
								setDecompiled(lines2.join("\n"));
							}
						}
					}}
					className="border-2 border-transparent bg-accent px-3 py-2 text-black outline-none transition active:border-accent active:bg-background active:text-white">
					Compile
				</button>
			</div>
			{error && (
				<>
					<h1>Error:</h1>
					<pre>
						<code className="bg-red-500 bg-opacity-40">
							{error}
						</code>
					</pre>
				</>
			)}

			<h1>Decompiled:</h1>
			<pre>
				<code
					dangerouslySetInnerHTML={{
						__html: decompiled ?? ""
					}}></code>
			</pre>
		</>
	);
}
