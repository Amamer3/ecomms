"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;

/** Radix + React 19 typings omit some DOM props; cast at the primitive boundary. */
type RadixProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T>;

type SheetTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};
const SheetTrigger = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Trigger>,
  SheetTriggerProps
>((props, ref) => (
  <SheetPrimitive.Trigger ref={ref} {...(props as RadixProps<typeof SheetPrimitive.Trigger>)} />
));
SheetTrigger.displayName = SheetPrimitive.Trigger.displayName;

const SheetPortal = SheetPrimitive.Portal;

type SheetOverlayProps = React.HTMLAttributes<HTMLDivElement> & { forceMount?: true };
const SheetOverlay = React.forwardRef<HTMLDivElement, SheetOverlayProps>(
  ({ className, ...props }, ref) => (
    <SheetPrimitive.Overlay
      {...({
        ref,
        className: cn(
          "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          className,
        ),
        ...props,
      } as unknown as RadixProps<typeof SheetPrimitive.Overlay>)}
    />
  ),
);
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

type SheetCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};
const SheetClose = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Close>, SheetCloseProps>(
  (props, ref) => <SheetPrimitive.Close ref={ref} {...(props as RadixProps<typeof SheetPrimitive.Close>)} />,
);
SheetClose.displayName = SheetPrimitive.Close.displayName;

interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps & React.HTMLAttributes<HTMLDivElement>
>(({ side = "right", className, children, "aria-describedby": ariaDescribedBy, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      aria-describedby={ariaDescribedBy}
      {...(props as RadixProps<typeof SheetPrimitive.Content>)}
    >
      <SheetClose className="absolute right-4 top-4 cursor-pointer rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetClose>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

type SheetTitleProps = React.HTMLAttributes<HTMLHeadingElement>;
const SheetTitle = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Title>, SheetTitleProps>(
  ({ className, ...props }, ref) => (
    <SheetPrimitive.Title
      {...({
        ref,
        className: cn("text-lg font-semibold text-foreground", className),
        ...props,
      } as unknown as RadixProps<typeof SheetPrimitive.Title>)}
    />
  ),
);
SheetTitle.displayName = SheetPrimitive.Title.displayName;

type SheetDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;
const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  SheetDescriptionProps
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    {...({
      ref,
      className: cn("text-sm text-muted-foreground", className),
      ...props,
    } as unknown as RadixProps<typeof SheetPrimitive.Description>)}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
