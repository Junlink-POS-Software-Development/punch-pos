"use client";

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom, #f8fafc, #e2e8f0)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <img
        src="/punch-icon-512.png"
        alt="PUNCH POS"
        width={96}
        height={96}
        style={{ marginBottom: "1.5rem", opacity: 0.8 }}
      />
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 900,
          color: "#1e293b",
          margin: "0 0 0.5rem",
          letterSpacing: "-0.025em",
        }}
      >
        You&apos;re Offline
      </h1>
      <p
        style={{
          fontSize: "1rem",
          color: "#64748b",
          maxWidth: "24rem",
          lineHeight: 1.6,
          margin: "0 0 2rem",
        }}
      >
        This page hasn&apos;t been cached yet. Connect to the internet and visit
        this page once — then it will be available offline.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "0.75rem 2rem",
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          fontWeight: 600,
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseOver={(e) =>
          ((e.target as HTMLButtonElement).style.backgroundColor = "#1d4ed8")
        }
        onMouseOut={(e) =>
          ((e.target as HTMLButtonElement).style.backgroundColor = "#2563eb")
        }
      >
        Try Again
      </button>
    </div>
  );
}
