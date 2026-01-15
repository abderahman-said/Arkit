import { SettingsProvider } from "../providers/SettingsProvider";
import "../globals.css";

export const metadata = {
    title: 'Configurable UI System',
    description: 'Runtime Design System Playground',
}

export default function PlaygroundLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <SettingsProvider>{children}</SettingsProvider>
            </body>
        </html>
    )
}
