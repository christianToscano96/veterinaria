import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PawPrint, Loader2, Mail, Lock } from "lucide-react";
import theme from "../lib/theme";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Elements */}
      <div style={styles.bgGradient1} />
      <div style={styles.bgGradient2} />

      <div style={styles.card}>
        {/* Brand Header */}
        <div style={styles.brandSection}>
          <div style={styles.logoContainer}>
            <PawPrint size={28} color={theme.onPrimaryContainer} />
          </div>
          <h1 style={styles.brandTitle}>Veterinaria Pandy</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email">
              Email Address
            </label>
            <div style={styles.inputWrapper}>
              <Mail size={20} style={styles.inputIcon} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label} htmlFor="password">
                Password
              </label>
              <a href="#" style={styles.forgotLink}>
                Forgot Password?
              </a>
            </div>
            <div style={styles.inputWrapper}>
              <Lock size={20} style={styles.inputIcon} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={styles.submitButton}
          >
            {isLoading ? (
              <Loader2
                size={20}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>Or sign in with</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Social Login - Placeholder for future OAuth */}
        <div style={styles.socialButtons}>
          <button style={styles.socialButton} disabled title="Coming soon">
            <span style={{ fontSize: "20px" }}>G</span>
            <span>Google</span>
          </button>
          <button style={styles.socialButton} disabled title="Coming soon">
            <span style={{ fontSize: "20px" }}>M</span>
            <span>Microsoft</span>
          </button>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            New to the practice?
            <a href="#" style={styles.footerLink}>
              {" "}
              Request Access
            </a>
          </p>
        </div>
        <code style={{ fontSize: "12px", color: "#9e18a6" }}>
          admin@vetclinic.com / Password1
        </code>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; font-family: 'Manrope', sans-serif; }
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: theme.background,
    position: "relative",
    overflow: "hidden",
  },
  bgGradient1: {
    position: "absolute",
    top: "-10%",
    right: "-5%",
    width: "500px",
    height: "500px",
    background: `${theme.primary}0D`,
    borderRadius: "50%",
    filter: "blur(100px)",
  },
  bgGradient2: {
    position: "absolute",
    bottom: "-10%",
    left: "-5%",
    width: "400px",
    height: "400px",
    background: `${theme.secondary}0D`,
    borderRadius: "50%",
    filter: "blur(100px)",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "40px 48px",
    boxShadow: "0 20px 40px rgba(56, 45, 54, 0.06)",
    border: `1px solid ${theme.outlineVariant}1A`,
    position: "relative",
    zIndex: 10,
  },
  brandSection: {
    textAlign: "center" as const,
    marginBottom: "40px",
  },
  logoContainer: {
    background: theme.primaryContainer,
    padding: "12px",
    borderRadius: "12px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
    boxShadow: `0 8px 24px ${theme.primary}4D`,
  },
  brandTitle: {
    fontSize: "24px",
    fontWeight: 800,
    color: theme.onSurface,
    letterSpacing: "-0.02em",
    marginBottom: "24px",
  },
  welcomeTitle: {
    fontSize: "28px",
    fontWeight: 800,
    color: theme.onSurface,
    letterSpacing: "-0.02em",
    marginBottom: "8px",
  },
  welcomeSubtitle: {
    color: theme.onSurfaceVariant,
    fontSize: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },
  errorBox: {
    padding: "12px",
    background: theme.errorContainer,
    color: theme.onErrorContainer,
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: theme.onSurfaceVariant,
    marginLeft: "4px",
  },
  forgotLink: {
    fontSize: "12px",
    fontWeight: 700,
    color: theme.primary,
    textDecoration: "none",
  },
  inputWrapper: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute" as const,
    left: "0",
    color: theme.outline,
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "12px 0 12px 36px",
    background: "transparent",
    border: "none",
    borderBottom: `2px solid ${theme.outlineVariant}`,
    fontSize: "15px",
    color: theme.onSurface,
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  submitButton: {
    width: "100%",
    padding: "16px",
    background: theme.primary,
    color: theme.onPrimary,
    fontSize: "15px",
    fontWeight: 700,
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "16px",
    transition: "all 0.2s",
    boxShadow: `0 8px 24px ${theme.primary}40`,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    marginTop: "32px",
    marginBottom: "24px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: theme.outlineVariant,
  },
  dividerText: {
    padding: "0 16px",
    fontSize: "12px",
    fontWeight: 700,
    color: theme.outline,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
  },
  socialButtons: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  socialButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    border: `1px solid ${theme.outlineVariant}`,
    borderRadius: "12px",
    background: "transparent",
    color: theme.onSurface,
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  footer: {
    marginTop: "40px",
    textAlign: "center" as const,
  },
  footerText: {
    color: theme.onSurfaceVariant,
    fontSize: "14px",
  },
  footerLink: {
    color: theme.primary,
    fontWeight: 700,
    textDecoration: "none",
  },
  designElements: {
    marginTop: "32px",
    display: "flex",
    justifyContent: "center",
    gap: "32px",
    opacity: 0.5,
  },
  designItem: {
    textAlign: "center" as const,
  },
  designLabel: {
    fontSize: "10px",
    fontWeight: 700,
    color: theme.outline,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
  },
  designLine: {
    height: "1px",
    width: "32px",
    background: theme.outlineVariant,
    marginTop: "4px",
    marginLeft: "auto",
    marginRight: "auto",
  },
};

export default LoginPage;
