import { useState, useEffect } from "react";

export default function StepThreeSetPassword({
	data,
	onChange,
	onSubmit,
	onBack,
	error,
	isLoading,
}) {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [passwordStrength, setPasswordStrength] = useState({
		score: 0,
		label: "",
		requirements: {
			length: false,
			uppercase: false,
			lowercase: false,
			number: false,
			special: false,
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(e);
	};

	const handlePasswordChange = (e) => {
		const newPassword = e.target.value;

		// Pass the value to parent component's onChange handler
		onChange(e);

		// Also update our local password strength state
		checkPasswordStrength(newPassword);
	};

	const checkPasswordStrength = (password) => {
		// Define requirements with regex patterns
		const requirements = {
			length: password.length >= 8,
			uppercase: /[A-Z]/.test(password),
			lowercase: /[a-z]/.test(password),
			number: /[0-9]/.test(password),
			special: /[^A-Za-z0-9]/.test(password),
		};

		// Calculate score (1 point for each met requirement)
		const metRequirements = Object.values(requirements).filter(Boolean).length;

		// Determine strength label
		let label = "";
		if (password.length === 0) {
			label = "";
		} else if (metRequirements <= 2) {
			label = "Weak";
		} else if (metRequirements === 3) {
			label = "Fair";
		} else if (metRequirements === 4) {
			label = "Good";
		} else {
			label = "Strong";
		}

		setPasswordStrength({
			score: metRequirements,
			label,
			requirements,
		});
	};

	// Generate a strong password
	const generatePassword = () => {
		const lowercase = "abcdefghijklmnopqrstuvwxyz";
		const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const numbers = "0123456789";
		const special = "!@#$%^&*()_+=-{}[]|:;<>,.?";

		const allChars = lowercase + uppercase + numbers + special;
		let password = "";

		// Ensure at least one character from each character set
		password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
		password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
		password += numbers.charAt(Math.floor(Math.random() * numbers.length));
		password += special.charAt(Math.floor(Math.random() * special.length));

		// Add more random characters to reach length of 12
		for (let i = 0; i < 8; i++) {
			password += allChars.charAt(Math.floor(Math.random() * allChars.length));
		}

		// Shuffle the password
		password = password
			.split("")
			.sort(() => 0.5 - Math.random())
			.join("");

		// Create synthetic events to pass to onChange for both fields
		const passwordEvent = {
			target: {
				name: "password",
				value: password,
			},
		};

		const confirmEvent = {
			target: {
				name: "confirmPassword",
				value: password,
			},
		};

		// Update both password and confirm password
		onChange(passwordEvent);
		onChange(confirmEvent);
		checkPasswordStrength(password);
	};

	// Initialize password strength check on component mount
	useEffect(() => {
		if (data.password) {
			checkPasswordStrength(data.password);
		}
	}, []);

	return (
		<form
			onSubmit={handleSubmit}
			className="auth-form"
			style={{ maxHeight: "90vh", overflowY: "auto" }}
		>
			<h2 className="step-title">Set Password</h2>

			<div className="form-group">
				<label htmlFor="password">Password</label>
				<div className="password-input-wrapper password-suggestion-wrapper">
					<input
						id="password"
						name="password"
						type={showPassword ? "text" : "password"}
						value={data.password}
						onChange={handlePasswordChange}
						required
						autoComplete="new-password"
						minLength={8}
						placeholder="Create a strong password"
						className="password-input"
					/>
					<button
						type="button"
						onClick={generatePassword}
						className="suggest-password-btn"
						tabIndex={-1}
						aria-label="Generate strong password"
						title="Generate strong password"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
							<line x1="16" y1="8" x2="2" y2="22"></line>
							<line x1="17.5" y1="15" x2="9" y2="15"></line>
						</svg>
					</button>
					<button
						type="button"
						onClick={() => setShowPassword((prev) => !prev)}
						className="password-toggle-btn"
						tabIndex={-1}
						aria-label={showPassword ? "Hide password" : "Show password"}
					>
						{showPassword ? "Hide" : "Show"}
					</button>
				</div>

				{/* Password strength indicator */}
				{data.password && (
					<div
						className={`password-strength strength-${passwordStrength.label.toLowerCase()}`}
					>
						<div
							className="strength-label"
							style={{ marginTop: "8px", fontWeight: "500" }}
						>
							{passwordStrength.label && (
								<>
									<span
										style={{
											display: "inline-block",
											width: "12px",
											height: "12px",
											borderRadius: "50%",
											backgroundColor:
												passwordStrength.label === "Weak"
													? "#ef4444"
													: passwordStrength.label === "Fair"
														? "#f59e0b"
														: passwordStrength.label === "Good"
															? "#22c55e"
															: "#10b981",
											marginRight: "6px",
										}}
									></span>
									{`${passwordStrength.label} password`}
								</>
							)}
						</div>
						<div className="strength-bar" style={{ margin: "8px 0" }}>
							<div className="strength-bar-fill"></div>
						</div>
						<div
							className="password-requirements"
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "8px",
							}}
						>
							<div
								className={`requirement ${passwordStrength.requirements.length ? "met" : "not-met"}`}
							>
								<span className="requirement-icon">
									{passwordStrength.requirements.length ? "✓" : "○"}
								</span>
								<span>At least 8 characters</span>
							</div>
							<div
								className={`requirement ${passwordStrength.requirements.uppercase ? "met" : "not-met"}`}
							>
								<span className="requirement-icon">
									{passwordStrength.requirements.uppercase ? "✓" : "○"}
								</span>
								<span>Uppercase letter</span>
							</div>
							<div
								className={`requirement ${passwordStrength.requirements.lowercase ? "met" : "not-met"}`}
							>
								<span className="requirement-icon">
									{passwordStrength.requirements.lowercase ? "✓" : "○"}
								</span>
								<span>Lowercase letter</span>
							</div>
							<div
								className={`requirement ${passwordStrength.requirements.number ? "met" : "not-met"}`}
							>
								<span className="requirement-icon">
									{passwordStrength.requirements.number ? "✓" : "○"}
								</span>
								<span>Number</span>
							</div>
							<div
								className={`requirement ${passwordStrength.requirements.special ? "met" : "not-met"}`}
								style={{ gridColumn: "1 / -1" }}
							>
								<span className="requirement-icon">
									{passwordStrength.requirements.special ? "✓" : "○"}
								</span>
								<span>Special character (!@#$%^&*)</span>
							</div>
						</div>
					</div>
				)}
			</div>

			<div className="form-group">
				<label htmlFor="confirmPassword">Confirm Password</label>
				<div className="password-input-wrapper">
					<input
						id="confirmPassword"
						name="confirmPassword"
						type={showConfirmPassword ? "text" : "password"}
						value={data.confirmPassword}
						onChange={onChange}
						required
						autoComplete="new-password"
						minLength={8}
						placeholder="Confirm your password"
						className="password-input"
					/>
					<button
						type="button"
						onClick={() => setShowConfirmPassword((prev) => !prev)}
						className="password-toggle-btn"
						tabIndex={-1}
						aria-label={showConfirmPassword ? "Hide password" : "Show password"}
					>
						{showConfirmPassword ? "Hide" : "Show"}
					</button>
				</div>
				{data.password &&
					data.confirmPassword &&
					data.password !== data.confirmPassword && (
						<div
							className="password-mismatch"
							style={{
								color: "#ef4444",
								fontSize: "0.85rem",
								marginTop: "0.5rem",
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								style={{ marginRight: "4px", verticalAlign: "middle" }}
							>
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="12" y1="8" x2="12" y2="12"></line>
								<line x1="12" y1="16" x2="12.01" y2="16"></line>
							</svg>
							Passwords don't match
						</div>
					)}
			</div>

			{error && <div className="error-message">{error}</div>}

			<div className="form-buttons" style={{ marginTop: "1.5rem" }}>
				<button onClick={onBack} className="back-button" type="button">
					Back
				</button>
				<button
					type="submit"
					disabled={
						isLoading ||
						data.password !== data.confirmPassword ||
						!data.password
					}
					className={isLoading ? "loading" : ""}
				>
					{isLoading ? "Creating Account..." : "Create Account"}
				</button>
			</div>
		</form>
	);
}
