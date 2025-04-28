export default function ResetEmailSent({ email, onBack }) {
  return (
    <div className="fade-transition fade-in reset-success">
      <h2>Check Your Email</h2>
      <p>
        We've sent a password reset link to <span className="email-highlight">{email}</span>.
      </p>
      <p className="reset-info">
        Please check your inbox and click the link to reset your password. 
        If you don't see it, check your spam folder.
      </p>
      
      <button 
        onClick={onBack}
        className="back-button"
        type="button"
      >
        Back to Sign In
      </button>
    </div>
  );
}
