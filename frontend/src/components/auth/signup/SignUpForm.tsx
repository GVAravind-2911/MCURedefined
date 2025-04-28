import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { nameSchema, emailSchema, usernameSchema, passwordSchema } from "@/lib/auth/validation-schemas";
import SignUpProgress from "./SignUpProgress";
import StepOnePersonalInfo from "./StepOnePersonalInfo";
import StepTwoAccountDetails from "./StepTwoAccountDetails";
import StepThreeSetPassword from "./StepThreeSetPassword";

export default function SignUpForm({ onCancel }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [signUpStep, setSignUpStep] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      if (signUpStep === 1) {
        nameSchema.parse(signUpData.name);
      } else if (signUpStep === 2) {
        emailSchema.parse(signUpData.email);
        usernameSchema.parse(signUpData.username);
      }

      // Smooth transition between steps
      setTransitioning(true);
      setTimeout(() => {
        setSignUpStep(prev => prev + 1);
        setTransitioning(false);
      }, 300);

    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else {
        setError("Validation failed");
      }
    }
  };

  const handlePrevStep = () => {
    setError("");
    setTransitioning(true);
    setTimeout(() => {
      setSignUpStep(prev => Math.max(1, prev - 1));
      setTransitioning(false);
    }, 300);
  };

  async function handleSignUp(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      passwordSchema.parse(signUpData.password);
      
      if (signUpData.password !== signUpData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const resp = await authClient.signUp.email({
        email: signUpData.email,
        password: signUpData.password,
        name: signUpData.name,
        username: signUpData.username
      });
      
      if (resp?.error) {
        throw new Error(resp.error.message || "Signup failed");
      }

      const signInResult = await authClient.signIn.email({
        email: signUpData.email,
        password: signUpData.password,
      });

      if (signInResult?.error) {
        throw new Error("Sign in failed after registration");
      }

      router.push("/");
      router.refresh();

    } catch (error) {
      console.error("Signup error:", error);
      setError(error instanceof Error ? error.message : "Error creating user");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <SignUpProgress currentStep={signUpStep} />
      
      <div className={`fade-transition ${transitioning ? "fade-out" : "fade-in"}`}>
        {signUpStep === 1 && (
          <StepOnePersonalInfo
            data={signUpData}
            onChange={handleSignUpChange}
            onNext={handleNextStep}
            onCancel={() => {
              onCancel();
              setSignUpStep(1);
            }}
            error={error}
          />
        )}
        
        {signUpStep === 2 && (
          <StepTwoAccountDetails
            data={signUpData}
            onChange={handleSignUpChange}
            onNext={handleNextStep}
            onBack={handlePrevStep}
            error={error}
          />
        )}
        
        {signUpStep === 3 && (
          <StepThreeSetPassword
            data={signUpData}
            onChange={handleSignUpChange}
            onSubmit={handleSignUp}
            onBack={handlePrevStep}
            error={error}
            isLoading={isLoading}
          />
        )}
      </div>
    </>
  );
}
  