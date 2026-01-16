import { Check, Circle } from "lucide-react";

interface TimelineStep {
  label: string;
  status: "complete" | "current" | "pending";
}

interface WaitingTimelineProps {
  steps: TimelineStep[];
}

export function WaitingTimeline({ steps }: WaitingTimelineProps) {
  return (
    <div className="space-y-0" data-testid="waiting-timeline">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                step.status === "complete"
                  ? "bg-primary text-primary-foreground"
                  : step.status === "current"
                  ? "bg-primary/20 border-2 border-primary"
                  : "bg-muted border-2 border-border"
              }`}
            >
              {step.status === "complete" ? (
                <Check className="w-3.5 h-3.5" />
              ) : step.status === "current" ? (
                <Circle className="w-2 h-2 fill-primary text-primary" />
              ) : null}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-0.5 h-8 ${
                  step.status === "complete" ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
          <div className="pb-8 last:pb-0">
            <p
              className={`text-sm font-medium ${
                step.status === "complete"
                  ? "text-foreground"
                  : step.status === "current"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
