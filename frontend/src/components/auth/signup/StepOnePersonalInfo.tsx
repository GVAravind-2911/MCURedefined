export default function StepOnePersonalInfo({
	data,
	onChange,
	onNext,
	onCancel,
	error,
}) {
	const handleSubmit = (e) => {
		e.preventDefault();
		onNext(e);
	};

	return (
		<form onSubmit={handleSubmit} className="auth-form">
			<h2 className="step-title">Personal Info</h2>

			<div className="form-group">
				<label htmlFor="name">Full Name</label>
				<input
					id="name"
					name="name"
					type="text"
					value={data.name}
					onChange={onChange}
					required
					placeholder="John Doe"
				/>
			</div>

			{error && <div className="error-message">{error}</div>}

			<div className="form-buttons">
				<button onClick={onCancel} className="back-button" type="button">
					Cancel
				</button>
				<button type="submit" className="next-button">
					Next
				</button>
			</div>
		</form>
	);
}
