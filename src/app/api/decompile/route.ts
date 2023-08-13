import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { await_or_else } from "../utils";

export async function POST(request: NextRequest) {
	const elf = await request.text();

    const tempfile = path.join("/tmp", uuid());
    await fs.writeFile(tempfile, elf, {"encoding": "binary"});
    
    const objdump = spawn(path.join(process.cwd(), "src/assets/objdump"), [
        "-M",
        "intel",
        "-d",
        tempfile
    ]);
    
    let dump = "";
    objdump.stdout.on("data", x => (dump += x));

    let objdump_stderr = "";
    objdump.stderr.on("data", x => (objdump_stderr += x));

    const data = new Promise<string>(async (resolve, reject) => {
        objdump.on("exit", async code => {
            await fs.rm(tempfile);

			if (code != 0) {
				return reject(objdump_stderr);
			}

			return resolve(dump);
		});
	});

	return await_or_else<NextResponse<any>, string>(
		data.then(x => new NextResponse(x)),
		x => new NextResponse(x!, { status: 400 })
	);
}
