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
			<body className={firacode.className}>{children}</body>
		</html>
	);
}
