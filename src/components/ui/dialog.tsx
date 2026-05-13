"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

type RadixProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T>;

type DialogTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};
const DialogTriggerBase = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  DialogTriggerProps
>((props, ref) => (
  <DialogPrimitive.Trigger ref={ref} {...(props as RadixProps<typeof DialogPrimitive.Trigger>)} />
));
DialogTriggerBase.displayName = DialogPrimitive.Trigger.displayName;

type DialogTriggerComponent = React.ForwardRefExoticComponent<
  DialogTriggerProps & React.RefAttributes<HTMLButtonElement>
>;
const DialogTrigger = DialogTriggerBase as DialogTriggerComponent;

const DialogPortal = DialogPrimitive.Portal;

type DialogOverlayProps = React.HTMLAttributes<HTMLDivElement> & { forceMount?: true };
const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
      {...({
        ref,
        className: cn(
          "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          className,
        ),
        ...props,
      } as unknown as RadixProps<typeof DialogPrimitive.Overlay>)}
    />
  ),
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

type DialogCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};
const DialogClose = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Close>, DialogCloseProps>(
  (props, ref) => <DialogPrimitive.Close ref={ref} {...(props as RadixProps<typeof DialogPrimitive.Close>)} />,
);
DialogClose.displayName = DialogPrimitive.Close.displayName;

type DialogTitleProps = React.HTMLAttributes<HTMLHeadingElement>;
const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title
      {...({
        ref,
        className: cn("text-lg font-semibold leading-none tracking-tight", className),
        ...props,
      } as unknown as RadixProps<typeof DialogPrimitive.Title>)}
    />
  ),
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

type DialogDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    {...({
      ref,
      className: cn("text-sm text-muted-foreground", className),
      ...props,
    } as unknown as RadixProps<typeof DialogPrimitive.Description>)}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

function hasDialogDescription(node: React.ReactNode): boolean {
  return React.Children.toArray(node).some((child) => {
    if (!React.isValidElement(child)) return false;
    if (child.type === DialogDescription) return true;
    const nested = (child.props as { children?: React.ReactNode }).children;
    return nested != null && hasDialogDescription(nested);
  });
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className,
      )}
      {...(props as RadixProps<typeof DialogPrimitive.Content>)}
    >
      {!hasDialogDescription(children) && (
        <DialogDescription className="sr-only">Dialog content.</DialogDescription>
      )}
      {children}
      <DialogClose className="absolute right-4 top-4 cursor-pointer rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogClose>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
