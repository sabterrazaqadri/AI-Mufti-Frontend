import Link from "next/link";

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound-card">
        <span className="notfound-code">404</span>
        <h1 className="notfound-title">Page not found</h1>
        <p className="notfound-text">
          The page you are looking for doesn’t exist. Let’s get you back to asking AI Mufti.
        </p>
        <Link href="/" className="notfound-btn">
          Back to AI Mufti
        </Link>
      </div>
    </div>
  );
}
