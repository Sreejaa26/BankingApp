import { FunctionalComponent, h } from "preact";
import { useState } from "preact/hooks";
import "oj-c/input-text";
import "oj-c/input-password";
import "ojs/ojbutton";

export interface RegistrationDetails {
  fullName: string;
  email: string;
  mobile: string;
  username: string;
  password: string;
}

interface RegisterProps {
  onRegister: (details: RegistrationDetails) => Promise<void> | void;
  onShowLogin: () => void;
}

type ValueChangedEvent = CustomEvent<{ value: string | null | undefined }>;

export const Register: FunctionalComponent<RegisterProps> = ({
  onRegister,
  onShowLogin
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitRegistration = async () => {
    if (!fullName.trim() || !email.trim() || !mobile.trim() || !username.trim()) {
      setError("Complete all personal and account details.");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (mobile.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (password.length < 8) {
      setError("Create a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!acceptedTerms) {
      setError("Accept the terms and privacy policy to continue.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onRegister({
        fullName: fullName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        username: username.trim(),
        password
      });
    } catch {
      setError("We could not create your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main class="login-page register-page">
      <section class="login-story register-story" aria-label="Northstar registration introduction">
        <div class="login-story__glow login-story__glow--one" />
        <div class="login-story__glow login-story__glow--two" />

        <div class="brand brand--light">
          <span class="brand-mark" aria-hidden="true">N</span>
          <span><strong>Northstar</strong><small>Digital Banking</small></span>
        </div>

        <div class="login-story__content">
          <span class="security-pill">Simple, secure onboarding</span>
          <h1>Your financial future starts here.</h1>
          <p>
            Create your digital banking profile in a few steps and securely
            manage every part of your financial life.
          </p>

          <div class="registration-steps" aria-label="Registration benefits">
            <div><span>01</span><p><strong>Create your profile</strong><small>Tell us how to reach you.</small></p></div>
            <div><span>02</span><p><strong>Secure your access</strong><small>Choose a unique username and password.</small></p></div>
            <div><span>03</span><p><strong>Start banking</strong><small>Open your personalized dashboard.</small></p></div>
          </div>
        </div>

        <p class="login-story__footer">
          Your information is protected with bank-grade security and encryption.
        </p>
      </section>

      <section class="login-panel register-panel">
        <div class="login-card register-card">
          <div class="mobile-brand brand">
            <span class="brand-mark" aria-hidden="true">N</span>
            <span><strong>Northstar</strong><small>Digital Banking</small></span>
          </div>

          <div class="login-heading">
            <span class="welcome-icon" aria-hidden="true">＋</span>
            <p class="page-eyebrow">Open your profile</p>
            <h2>Register for digital banking</h2>
            <p>Enter your details to create secure online access.</p>
          </div>

          <form class="login-form register-form" onSubmit={(event) => {
            event.preventDefault();
            void submitRegistration();
          }}>
            <div class="register-form__grid">
              <oj-c-input-text
                labelHint="Full name"
                value={fullName}
                required={true}
                autocomplete="name"
                placeholder="Enter your full name"
                userAssistanceDensity="compact"
                onvalueChanged={(event: ValueChangedEvent) => setFullName(event.detail.value ?? "")}
              />
              <oj-c-input-text
                labelHint="Email address"
                value={email}
                required={true}
                autocomplete="email"
                placeholder="name@example.com"
                userAssistanceDensity="compact"
                onvalueChanged={(event: ValueChangedEvent) => setEmail(event.detail.value ?? "")}
              />
              <oj-c-input-text
                labelHint="Mobile number"
                value={mobile}
                required={true}
                autocomplete="tel"
                placeholder="Enter 10-digit number"
                userAssistanceDensity="compact"
                onvalueChanged={(event: ValueChangedEvent) => setMobile(event.detail.value ?? "")}
              />
              <oj-c-input-text
                labelHint="Username"
                value={username}
                required={true}
                autocomplete="username"
                placeholder="Choose a username"
                userAssistanceDensity="compact"
                onvalueChanged={(event: ValueChangedEvent) => setUsername(event.detail.value ?? "")}
              />
              <oj-c-input-password
                labelHint="Password"
                value={password}
                required={true}
                autocomplete="new-password"
                placeholder="Minimum 8 characters"
                maskIcon="visible"
                userAssistanceDensity="compact"
                onvalueChanged={(event: ValueChangedEvent) => setPassword(event.detail.value ?? "")}
              />
              <oj-c-input-password
                labelHint="Confirm password"
                value={confirmPassword}
                required={true}
                autocomplete="new-password"
                placeholder="Re-enter your password"
                maskIcon="visible"
                userAssistanceDensity="compact"
                onvalueChanged={(event: ValueChangedEvent) => setConfirmPassword(event.detail.value ?? "")}
              />
            </div>

            <p class="password-note">Use at least 8 characters and avoid personal information.</p>

            <label class="terms-check">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.currentTarget.checked)}
              />
              <span>I agree to the <a href="#/terms">Terms of Service</a> and <a href="#/privacy">Privacy Policy</a>.</span>
            </label>

            {error && <div class="form-error" role="alert">{error}</div>}

            <oj-button
              class="login-button"
              chroming="callToAction"
              disabled={isSubmitting}
              onojAction={() => void submitRegistration()}
            >
              {isSubmitting ? "Creating profile…" : "Create secure profile"}
            </oj-button>
          </form>

          <div class="register-prompt auth-switch">
            <span>Already registered?</span>
            <button class="auth-link" type="button" onClick={onShowLogin}>Sign in</button>
          </div>
        </div>
      </section>
    </main>
  );
};
