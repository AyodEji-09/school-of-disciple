import { Box, Typography } from "@mui/joy";
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

  return (
    <Box className="w-full py-6">
      <div className="mb-10 text-center px-4">
        <Typography
          level="h3"
          textColor="#001F54"
          sx={{ fontWeight: 700, fontSize: { xs: "1.5rem", md: "2rem" } }}
        >
          Admission Intake Form
        </Typography>
        <Typography
          level="body-sm"
          textColor="#6B7280"
          sx={{ mt: 1, maxWidth: "500px", mx: "auto" }}
        >
          Complete all sections of the form to finalize your registration and
          access the student dashboard.
        </Typography>
      </div>

      <Box className="w-full overflow-x-auto py-4 scrollbar-hide">
        <div className="flex items-start min-w-max px-8 md:px-0 md:justify-center">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.key} className="flex items-start">
                <div
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() => navigate(`/onboarding/${index + 1}`)}
                >
                  {/* Circle with Number */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                      isActive
                        ? "bg-[#001EC5] border-[#001EC5] text-white shadow-md scale-110"
                        : isCompleted
                          ? "bg-[#E0E7FF] border-[#001EC5] text-[#001EC5]"
                          : "bg-white border-gray-300 text-gray-400 group-hover:border-gray-400"
                    }`}
                  >
                    <Typography level="title-md" textColor="inherit">
                      {index + 1}
                    </Typography>
                  </div>

                  {/* Title below */}
                  <div className="mt-3 w-24 md:w-32 text-center">
                    <Typography
                      level="body-xs"
                      className={`font-medium leading-tight ${isActive ? "text-[#001F54] font-bold" : "text-gray-500"}`}
                      sx={{ fontSize: { xs: "10px", md: "12px" } }}
                    >
                      {step.title.replace(/^Section\s\d+:\s/, "")}
                    </Typography>
                  </div>
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 sm:w-12 md:w-20 mt-5 mx-1 sm:mx-2 transition-colors duration-500 ${
                      isCompleted ? "bg-[#001EC5]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Box>
    </Box>
  );
};

export default StepProgressBar;
