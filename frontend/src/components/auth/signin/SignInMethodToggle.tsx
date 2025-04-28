export default function SignInMethodToggle({ current, onChange }) {
    return (
      <div className="signin-method-toggle">
        <button
          type="button"
          className={current === "email" ? "active" : ""}
          onClick={() => onChange("email")}
        >
          Email
        </button>
        <button
          type="button"
          className={current === "username" ? "active" : ""}
          onClick={() => onChange("username")}
        >
          Username
        </button>
      </div>
    );
  }