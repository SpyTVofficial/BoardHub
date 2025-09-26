
import type { ReactNode } from "react";
import { BoardHubNavigation } from "./BoardHubNavigation";
// Initialize i18n
import "../utils/i18n";

interface Props {
  children: ReactNode;
}

/**
 * A provider wrapping the whole app.
 *
 * You can add multiple providers here by nesting them,
 * and they will all be applied to the app.
 *
 * Note: ThemeProvider is already included in AppWrapper.tsx and does not need to be added here.
 */
export const AppProvider = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-board-neutral-50 via-white to-board-neutral-100">
      <BoardHubNavigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
