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
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (data.password) {
			checkPasswordStrength(data.password);
		}
	}, []);

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-5 relative z-1 max-h-[90vh] overflow-y-auto"
		>
			<h2 className="text-center text-2xl font-bold text-white mb-6 uppercase tracking-wide [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]">Set Password</h2>

			<div className="flex flex-col gap-2">
				<label htmlFor="password" className="text-sm text-white font-medium font-[BentonSansRegular,Arial,sans-serif]">Password</label>
				<div className="relative w-full">
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
						className="w-full p-3 pr-24 bg-[rgba(255,255,255,0.05)] border border-solid border-[rgba(255,255,255,0.1)] rounded-md text-base text-white transition-all duration-300 ease-in-out placeholder:text-[rgba(255,255,255,0.4)] placeholder:[-webkit-text-fill-color:rgba(255,255,255,0.4)] focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_2px_rgba(236,29,36,0.25)] [-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#1a1a1a_inset]"
					/>
					<button
						type="button"
						onClick={generatePassword}
						className="absolute right-16 top-1/2 -translate-y-1/2 bg-transparent border-none p-1.5 text-[rgba(255,255,255,0.7)] cursor-pointer text-sm transition-colors duration-200 flex items-center hover:text-[#ec1d24]"
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
							<title>Generate Password</title>
							<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
							<line x1="16" y1="8" x2="2" y2="22" />
							<line x1="17.5" y1="15" x2="9" y2="15" />
						</svg>
					</button>
					<button
						type="button"
						onClick={() => setShowPassword((prev) => !prev)}
						className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none py-1 px-2 text-[#ec1d24] cursor-pointer text-sm font-medium flex items-center rounded transition-all duration-200 ease-in-out hover:bg-[rgba(236,29,36,0.1)] focus:outline-none focus:shadow-[0_0_0_2px_rgba(236,29,36,0.25)]"
						tabIndex={-1}
						aria-label={showPassword ? "Hide password" : "Show password"}
					>
						{showPassword ? "Hide" : "Show"}
					</button>
				</div>

				{/* Password strength indicator */}
				{data.password && (
					<div className="mt-2 text-sm">
						<div className="mt-2 font-medium flex items-center">
							{passwordStrength.label && (
								<>
									<span
										className={`inline-block w-3 h-3 rounded-full mr-1.5 ${
											passwordStrength.label === "Weak"
												? "bg-[#ef4444]"
												: passwordStrength.label === "Fair"
													? "bg-[#f59e0b]"
													: passwordStrength.label === "Good"
														? "bg-[#22c55e]"
														: "bg-[#10b981]"
										}`}
									/>
									<span className="text-white">{`${passwordStrength.label} password`}</span>
								</>
							)}
						</div>
						<div className="h-1 w-full bg-[rgba(255,255,255,0.1)] rounded my-2 overflow-hidden">
							<div
								className={`h-full rounded transition-all duration-300 ${
									passwordStrength.label === "Weak"
										? "w-1/4 bg-[#ef4444]"
										: passwordStrength.label === "Fair"
											? "w-1/2 bg-[#f59e0b]"
											: passwordStrength.label === "Good"
												? "w-3/4 bg-[#22c55e]"
												: passwordStrength.label === "Strong"
													? "w-full bg-[#10b981]"
													: "w-0"
								}`}
							/>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<div className={`flex items-center ${passwordStrength.requirements.length ? "text-[#22c55e]" : "text-[rgba(255,255,255,0.5)]"}`}>
								<span className="mr-1 inline-flex items-center justify-center">
									{passwordStrength.requirements.length ? "✓" : "○"}
								</span>
								<span>At least 8 characters</span>
							</div>
							<div className={`flex items-center ${passwordStrength.requirements.uppercase ? "text-[#22c55e]" : "text-[rgba(255,255,255,0.5)]"}`}>
								<span className="mr-1 inline-flex items-center justify-center">
									{passwordStrength.requirements.uppercase ? "✓" : "○"}
								</span>
								<span>Uppercase letter</span>
							</div>
							<div className={`flex items-center ${passwordStrength.requirements.lowercase ? "text-[#22c55e]" : "text-[rgba(255,255,255,0.5)]"}`}>
								<span className="mr-1 inline-flex items-center justify-center">
									{passwordStrength.requirements.lowercase ? "✓" : "○"}
								</span>
								<span>Lowercase letter</span>
							</div>
							<div className={`flex items-center ${passwordStrength.requirements.number ? "text-[#22c55e]" : "text-[rgba(255,255,255,0.5)]"}`}>
								<span className="mr-1 inline-flex items-center justify-center">
									{passwordStrength.requirements.number ? "✓" : "○"}
								</span>
								<span>Number</span>
							</div>
							<div className={`flex items-center col-span-2 ${passwordStrength.requirements.special ? "text-[#22c55e]" : "text-[rgba(255,255,255,0.5)]"}`}>
								<span className="mr-1 inline-flex items-center justify-center">
									{passwordStrength.requirements.special ? "✓" : "○"}
								</span>
								<span>Special character (!@#$%^&*)</span>
							</div>
						</div>
					</div>
				)}
			</div>

			<div className="flex flex-col gap-2">
				<label htmlFor="confirmPassword" className="text-sm text-white font-medium font-[BentonSansRegular,Arial,sans-serif]">Confirm Password</label>
				<div className="relative w-full">
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
						className="w-full p-3 pr-20 bg-[rgba(255,255,255,0.05)] border border-solid border-[rgba(255,255,255,0.1)] rounded-md text-base text-white transition-all duration-300 ease-in-out placeholder:text-[rgba(255,255,255,0.4)] placeholder:[-webkit-text-fill-color:rgba(255,255,255,0.4)] focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_2px_rgba(236,29,36,0.25)] [-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#1a1a1a_inset]"
					/>
					<button
						type="button"
						onClick={() => setShowConfirmPassword((prev) => !prev)}
						className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none py-1 px-2 text-[#ec1d24] cursor-pointer text-sm font-medium flex items-center rounded transition-all duration-200 ease-in-out hover:bg-[rgba(236,29,36,0.1)] focus:outline-none focus:shadow-[0_0_0_2px_rgba(236,29,36,0.25)]"
						tabIndex={-1}
						aria-label={showConfirmPassword ? "Hide password" : "Show password"}
					>
						{showConfirmPassword ? "Hide" : "Show"}
					</button>
				</div>
				{data.password &&
					data.confirmPassword &&
					data.password !== data.confirmPassword && (
						<div className="text-[#ef4444] text-sm mt-2 flex items-center">
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
								className="mr-1 align-middle"
							>
								<title>Password Mismatch</title>
								<circle cx="12" cy="12" r="10" />
								<line x1="12" y1="8" x2="12" y2="12" />
								<line x1="12" y1="16" x2="12.01" y2="16" />
							</svg>
							Passwords don&apos;t match
						</div>
					)}
			</div>

			{error && <div className="p-3 bg-[rgba(239,68,68,0.1)] border border-solid border-[rgba(239,68,68,0.3)] rounded-md text-[#ef4444] text-sm">{error}</div>}

			<div className="flex gap-4 mt-6">
				<button onClick={onBack} className="flex-[0.4] block w-full bg-transparent border border-solid border-[rgba(255,255,255,0.3)] text-white py-2.5 rounded-md cursor-pointer transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] hover:-translate-y-0.5" type="button">
					Back
				</button>
				<button
					type="submit"
					disabled={
						isLoading ||
						data.password !== data.confirmPassword ||
						!data.password
					}
					className={`flex-[0.6] p-3 bg-[#ec1d24] text-white border-none rounded-md text-base font-medium cursor-pointer transition-all duration-300 relative overflow-hidden hover:enabled:bg-[#d81921] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_12px_rgba(0,0,0,0.15)] disabled:opacity-70 disabled:cursor-not-allowed ${isLoading ? "text-transparent after:content-[''] after:absolute after:w-5 after:h-5 after:top-1/2 after:left-1/2 after:-mt-2.5 after:-ml-2.5 after:rounded-full after:border-2 after:border-transparent after:border-t-white after:animate-spin" : ""}`}
				>
					{isLoading ? "Creating Account..." : "Create Account"}
				</button>
			</div>
		</form>
	);
}
