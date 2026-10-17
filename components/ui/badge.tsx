import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#1D4ED8] text-white",
        secondary:
          "border-transparent bg-[#F3F4F6] text-[#111827]",
        accent:
          "border-transparent bg-[#F97316] text-white",
        success:
          "border-transparent bg-[#16A34A] text-white",
        warning:
          "border-transparent bg-[#D97706] text-white",
        destructive:
          "border-transparent bg-[#DC2626] text-white",
        outline: "border border-[#E5E7EB] text-[#111827] bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
