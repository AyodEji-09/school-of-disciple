import { useNavigate } from "react-router-dom";

interface Step {
  key: string;
  title: string;
}

interface StepProgressBarProps {
  steps: Step[];
  currentStep: number;
}

const StepProgressBar = ({ steps, currentStep }: StepProgressBarProps) => {
  const navigate = useNavigate();
  const formatTitle = (title?: string) =>
    (title || "").replace(/^Section\s\d+:\s/, "");

  const activeTitle = formatTitle(steps[currentStep]?.title);
  const nextTitle =
    currentStep < steps.length - 1
      ? formatTitle(steps[currentStep + 1]?.title)
      : null;

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const progressFraction = (currentStep + 1) / steps.length;
  const strokeDashoffset = circumference * (1 - progressFraction);

  return (
    <div className="w-full py-4 sm:py-6">
      <div className="mb-6 sm:mb-10 text-center px-2">
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-navy tracking-tight">
          Admission Intake Form
        </h1>
        <p className="font-sans text-slate text-sm sm:text-base mt-2 max-w-xl mx-auto leading-relaxed">
          Complete all sections of the form to finalize your registration and
          access the student dashboard.
        </p>
      </div>

      {/* Mobile circular progress stepper */}
      <div className="sm:hidden bg-surface-container-lowest border border-bordergray rounded-card p-4 shadow-sm flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg
            className="w-16 h-16 -rotate-90"
            viewBox="0 0 64 64"
            aria-hidden="true"
          >
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="5"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="#1B2A5C"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
            />
          </svg>
          <span className="absolute font-sans font-bold text-xs text-navy">
            {currentStep + 1} of {steps.length}
          </span>
        </div>

        <div className="min-w-0 flex-1 text-left">
          <p className="font-serif font-bold text-navy text-lg leading-snug truncate">
            {activeTitle}
          </p>
          <p className="font-sans text-xs text-[#52525B] mt-1 truncate">
            {nextTitle ? `Next: ${nextTitle}` : "Final step: Review & Submit"}
          </p>
        </div>
      </div>

      {/* Tablet & Desktop horizontal stepper */}
      <div className="hidden sm:flex items-start justify-center w-full py-2">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const shortTitle = step.title.replace(/^Section\s\d+:\s/, "");

          return (
            <div key={step.key} className="flex items-start">
              <button
                type="button"
                onClick={() => navigate(`/onboarding/${index + 1}`)}
                className="flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-sans text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-navy border-navy text-on-primary shadow-sm"
                      : isCompleted
                        ? "bg-gold/15 border-gold text-navy"
                        : "bg-surface-container-lowest border-bordergray text-slate group-hover:border-navy/40 group-hover:text-navy"
                  }`}
                >
                  {index + 1}
                </div>

                <div className="mt-2.5 w-24 md:w-32 text-center px-1">
                  <span
                    className={`block font-sans text-xs leading-snug ${
                      isActive
                        ? "text-navy font-semibold"
                        : isCompleted
                          ? "text-charcoal font-medium"
                          : "text-slate font-normal"
                    }`}
                  >
                    {shortTitle}
                  </span>
                </div>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-8 md:w-16 lg:w-20 mt-5 mx-1 transition-colors ${
                    isCompleted ? "bg-gold" : "bg-bordergray"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgressBar;
