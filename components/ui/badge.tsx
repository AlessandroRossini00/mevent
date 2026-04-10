import * as React from "react";

function Badge({ className, ...props }) {
  return (
    <div
      className={
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border-transparent bg-amber-400 text-blue-100 shadow hover:bg-amber-800/80"
      }
      {...props}
    />
  );
}

export { Badge };
