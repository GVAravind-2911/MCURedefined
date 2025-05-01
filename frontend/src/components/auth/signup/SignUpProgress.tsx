export default function SignUpProgress({ currentStep }) {
	return (
		<div className="signup-progress">
			<div className={`progress-step ${currentStep >= 1 ? "active" : ""}`}>
				1
			</div>
			<div className="progress-line" />
			<div className={`progress-step ${currentStep >= 2 ? "active" : ""}`}>
				2
			</div>
			<div className="progress-line" />
			<div className={`progress-step ${currentStep >= 3 ? "active" : ""}`}>
				3
			</div>
		</div>
	);
}
