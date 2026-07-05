"use client";

interface ProgressStep {
  label: string;
  description: string;
}

interface ProgressStepsProps {
  steps: ProgressStep[];
  activeIndex: number;
  complete?: boolean;
}

export default function ProgressSteps({ steps, activeIndex, complete }: ProgressStepsProps) {
  return (
    <ol className="progress-steps" aria-label="Conversion progress">
      {steps.map((step, index) => {
        const state = complete || index < activeIndex ? "done" : index === activeIndex ? "active" : "pending";

        return (
          <li className={`progress-step progress-step-${state}`} key={step.label}>
            <span className="progress-step-marker" aria-hidden="true">
              {state === "done" ? "✓" : index + 1}
            </span>
            <span>
              <span className="progress-step-label">{step.label}</span>
              <span className="progress-step-description">{step.description}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
