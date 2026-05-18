import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white" data-testid="site-layout">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
