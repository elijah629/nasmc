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
			<h1>Code:</h1>
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
							
							if (response.status === 400) {
								setError(elf_or_error);
								return;
							}

							_elf = elf_or_error;
							setElf(elf_or_error);
						}
						
						let decompiled_unprocessed;
						{
							const response = await fetch("/api/decompile", {
								method: "POST",
								body: _elf
							});

							const decompiled_or_error = await response.text();

							if (response.status === 400) {
								setError(decompiled_or_error);
								return;
							}
							decompiled_unprocessed = decompiled_or_error;
						}
					
						setError(undefined);
						
						{
							const iOf = decompiled_unprocessed.indexOf(">");
							
							if (iOf === -1) {
								setDecompiled("");
							} else {
								let lines = decompiled_unprocessed.substring(iOf + 3);
								setDecompiled(lines);
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
						<code className="code-block bg-red-500 bg-opacity-40">
							{error}
						</code>
					</pre>
				</>
			)}

			{decompiled &&
			<><h1>Decompiled:</h1>
				<code className="code-block">
					<table  className="w-full">
						
						<tbody>{decompiled.split("\n").filter(x => !!x)
							.map(x => x.split("\t"))
							.map((x, i) => {
								let addr_trimmed = x[0].trimStart();
								let address = addr_trimmed.substring(0, addr_trimmed.length - 1);
								
								return <tr key={i}>
									<td className="hljs-number">{address}</td> {/* Address */}
									<td className="hljs-number">{x[1].trimEnd()}</td> {/* Instruction hex */}
									<td dangerouslySetInnerHTML={{
										__html: hljs.highlight(x[2], {
											language: "x86asm"
										}).value
									}}></td> {/* HLJSed Code */}
								</tr>;
							})}
						</tbody>
							</table>
					</code>
			</>}
		</>
	);
}
