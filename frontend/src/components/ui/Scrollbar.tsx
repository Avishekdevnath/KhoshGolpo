import React from "react";

type ScrollbarProps = React.HTMLAttributes<HTMLDivElement> & {
  axis?: "y" | "x" | "both";
};

export const Scrollbar = React.forwardRef<HTMLDivElement, ScrollbarProps>(function Scrollbar(
  { axis = "y", className = "", children, ...rest },
  ref,
) {
  const axisClass =
    axis === "both" ? "overflow-auto" : axis === "x" ? "overflow-x-auto" : "overflow-y-auto";

  const base = `scrollbar-thin ${axisClass} ${className}`.trim();

  return (
    <div ref={ref} className={base} {...rest}>
      {children}
    </div>
  );
});

export default Scrollbar;


