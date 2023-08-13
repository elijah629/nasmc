import Compiler from "@/components/Compiler";

export default function Home() {
	return (
		<>
			<p>
				Compile x86 online quickly. Uses{" "}
				<code className="inline-code">nasm -felf32 -Werror</code> and{" "}
				<code className="inline-code">objdump -M intel -d</code> on the
				server.
			</p>
			<Compiler />
		</>
	);
}
