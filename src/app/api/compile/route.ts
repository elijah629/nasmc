import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

async function await_or_else<T, E = any>(
	promise: Promise<T>,
	or_else: (reason?: E) => T
): Promise<T> {
	let x;
	await promise.then(t => (x = t)).catch(reason => (x = or_else(reason)));

	return x!;
}

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

			const objdump = spawn(path.join(process.cwd(), "src/assets/objdump"), [
				"-M",
				"intel",
				"-d",
				fout
			]);

			let dump = "";
			objdump.stdout.on("data", x => (dump += x));

			let objdump_stderr = "";
			objdump.stderr.on("data", x => (objdump_stderr += x));

			objdump.on("exit", async code => {
				await fs.rm(fout);

				if (code != 0) {
					return reject(objdump_stderr);
				}

				return resolve(dump);
			});
		});
	});

	return await_or_else<NextResponse<any>, string>(
		data.then(x => new NextResponse(x)),
		x => NextResponse.json(x!, { status: 400 })
	);
}
