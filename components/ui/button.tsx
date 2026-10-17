import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#F97316] text-white hover:bg-[#EA580C] active:bg-[#C2410C]",
        primary:
          "bg-[#1D4ED8] text-white hover:bg-[#1E40AF] active:bg-[#1E3A8A]",
        secondary:
          "bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB] active:bg-[#D1D5DB]",
        outline:
          "border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F3F4F6] active:bg-[#E5E7EB]",
        ghost:
          "text-[#111827] hover:bg-[#F3F4F6] active:bg-[#E5E7EB]",
        destructive:
          "bg-[#DC2626] text-white hover:bg-[#B91C1C] active:bg-[#991B1B]",
        link: "text-[#1D4ED8] underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[48px] px-5 py-3",
        sm: "min-h-[40px] px-3 py-2 text-sm rounded-lg",
        lg: "min-h-[52px] px-6 py-3.5 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
