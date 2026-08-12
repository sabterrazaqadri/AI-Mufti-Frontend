import type { Metadata } from "next";
import SiteHeader from "../../components/SiteHeader";
import ReviewQueue from "./ReviewQueue";

/**
 * Curation queue for the AutoTube content pool.
 *
 * Not a public page: the backend rejects every route behind it unless the caller's
 * verified Better Auth identity is on its ADMIN_EMAILS/ADMIN_USER_IDS allowlist. The
 * noindex here is only so the URL never turns up in search results.
 */
export const metadata: Metadata = {
  title: "Video item review",
  robots: { index: false, follow: false },
};

export default function AdminVideoItemsPage() {
  return (
    <>
      <SiteHeader />
      <ReviewQueue />
    </>
  );
}
