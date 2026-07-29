import { FunctionalComponent, h } from "preact";
import { useState } from "preact/hooks";
import "oj-c/input-text";
import "oj-c/input-password";
import "ojs/ojbutton";

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void> | void;
}

type ValueChangedEvent = CustomEvent<{ value: string | null | undefined }>;

export const Login: FunctionalComponent<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitLogin = async () => {
    if (!username.trim() || !password) {
      setError("Enter both your username and password.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onLogin(username.trim(), password);
    } catch {
      setError("We could not sign you in. Check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main class="login-page">
      <section class="login-story" aria-label="Northstar Bank introduction">
        <div class="login-story__glow login-story__glow--one" />
        <div class="login-story__glow login-story__glow--two" />

        <div class="brand brand--light">
          <span class="brand-mark" aria-hidden="true">
            N
          </span>
          <span>
            <strong>Northstar</strong>
            <small>Digital Banking</small>
          </span>
        </div>

        <div class="login-story__content">
          <span class="security-pill">Secure digital banking</span>
          <h1>Move forward with confidence.</h1>
          <p>
            See your complete financial picture, move money safely, and stay in
            control—wherever the day takes you.
          </p>

          <div class="trust-row">
            <div>
              <strong>24/7</strong>
              <span>Account access</span>
            </div>
            <div>
              <strong>256-bit</strong>
              <span>Encryption</span>
            </div>
            <div>
              <strong>Instant</strong>
              <span>Alerts</span>
            </div>
          </div>
        </div>

        <p class="login-story__footer">
          Your security is our priority. We will never ask for your password by
          email or phone.
        </p>
      </section>

      <section class="login-panel">
        <div class="login-card">
          <div class="mobile-brand brand">
            <span class="brand-mark" aria-hidden="true">
              N
            </span>
            <span>
              <strong>Northstar</strong>
              <small>Digital Banking</small>
            </span>
          </div>

          <div class="login-heading">
            <span class="welcome-icon" aria-hidden="true">
              →
            </span>
            <p class="page-eyebrow">Welcome back</p>
            <h2>Sign in to online banking</h2>
            <p>Enter your credentials to securely access your accounts.</p>
          </div>

          <form
            class="login-form"
            onSubmit={(event) => {
              event.preventDefault();
              void submitLogin();
            }}
          >
            <oj-c-input-text
              labelHint="Username"
              value={username}
              required={true}
              autocomplete="username"
              placeholder="Enter your username"
              userAssistanceDensity="compact"
              onvalueChanged={(event: ValueChangedEvent) =>
                setUsername(event.detail.value ?? "")
              }
            />

            <oj-c-input-password
              labelHint="Password"
              value={password}
              required={true}
              autocomplete="current-password"
              placeholder="Enter your password"
              maskIcon="visible"
              userAssistanceDensity="compact"
              onvalueChanged={(event: ValueChangedEvent) =>
                setPassword(event.detail.value ?? "")
              }
            />

            <div class="login-options">
              <label>
                <input type="checkbox" /> Remember username
              </label>
              <a href="#/forgot-password">Forgot password?</a>
            </div>

            {error && (
              <div class="form-error" role="alert">
                {error}
              </div>
            )}

            <oj-button
              class="login-button"
              chroming="callToAction"
              disabled={isSubmitting}
              onojAction={() => void submitLogin()}
            >
              {isSubmitting ? "Signing in…" : "Sign in securely"}
            </oj-button>
          </form>

          <div class="register-prompt">
            <span>New to digital banking?</span>
            <a href="#/register">Register now</a>
          </div>

          <div class="login-support">
            <span aria-hidden="true">☎</span>
            <p>
              Need help? <strong>Call 1800 000 000</strong>
              <small>Available 24 hours a day</small>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
