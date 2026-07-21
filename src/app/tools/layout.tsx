import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="page page-tool">{children}</main>
      <SiteFooter />
    </>
  );
}
