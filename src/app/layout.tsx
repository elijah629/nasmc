import "./globals.css";
import { Fira_Code } from "next/font/google";

export const metadata = {};

const firacode = Fira_Code({
	subsets: ["latin"]
});

export default function RootLayout({
	children
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={firacode.className}>
				<div className="h-full bg-background -tracking-[.02em] overflow-auto text-white sm:p-10">
					<header className="site-header">
						<span>nasmc</span>
					</header>
					<main className="mt-4 flex flex-col gap-2 p-2 sm:p-0">
						{children}
					</main>
				</div>
			</body>
		</html>
	);
}
