export default function StepTwoAccountDetails({
	data,
	onChange,
	onNext,
	onBack,
	error,
}) {
	const handleSubmit = (e) => {
		e.preventDefault();
		onNext(e);
	};

	return (
		<form onSubmit={handleSubmit} className="auth-form">
			<h2 className="step-title">Account Details</h2>

			<div className="form-group">
				<label htmlFor="email">Email Address</label>
				<input
					id="email"
					name="email"
					type="email"
					value={data.email}
					onChange={onChange}
					required
					placeholder="you@example.com"
				/>
			</div>

			<div className="form-group">
				<label htmlFor="username">Username</label>
				<input
					id="username"
					name="username"
					type="text"
					value={data.username}
					onChange={onChange}
					required
					placeholder="cooluser123"
				/>
			</div>

			{error && <div className="error-message">{error}</div>}

			<div className="form-buttons">
				<button onClick={onBack} className="back-button" type="button">
					Back
				</button>
				<button type="submit" className="next-button">
					Next
				</button>
			</div>
		</form>
	);
}
