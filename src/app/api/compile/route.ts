import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { await_or_else } from "../utils";

export async function POST(request: NextRequest) {
	const body = await request.text();
	let id = path.join("/tmp", uuid());
	const fin = id + ".asm";
	const fout = id + ".out";
	await fs.writeFile(fin, body);

	const nasm = spawn(path.join(process.cwd(), "src/assets/lnasm"), [
		"-felf32",
		"-Werror",
		fin,
		"-o",
		fout
	]);

	let nasm_stderr = "";
	nasm.stderr.on("data", x => (nasm_stderr += x));

	const data = new Promise<string>(async (resolve, reject) => {
		nasm.on("exit", async code => {
			await fs.rm(fin);

			if (code != 0) {
				return reject(nasm_stderr.replaceAll(fin, "file.asm"));
			}
			
			const elf = fs.readFile(fout, {
				"encoding": "binary"
			});
			
			await fs.rm(fout);
		
			return resolve(elf);
		});
	});

	return await_or_else<NextResponse<any>, string>(
		data.then(x => new NextResponse(x)),
		x => new NextResponse(x!, { status: 400 })
	);
}
