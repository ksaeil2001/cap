import React from "react";

interface AlertProps {
  type?: "info" | "warning" | "danger";
  children: React.ReactNode;
  className?: string;
}

const typeStyles = {
  info: "bg-blue-100 text-blue-800 border-blue-300",
  warning: "bg-yellow-100 text-yellow-900 border-yellow-300",
  danger: "bg-red-100 text-red-900 border-red-400",
};

const typeIcons = {
  info: "ℹ️",
  warning: "⚠️",
  danger: "🔺",
};

export const AlertCustom: React.FC<AlertProps> = ({
  type = "info",
  children,
  className = "",
}) => (
  <div
    role="alert"
    aria-live="assertive"
    className={`border-l-4 px-4 py-3 my-2 rounded-md flex items-center gap-2 shadow-sm ${typeStyles[type]} ${className}`}
  >
    <span role="img" aria-label={type}>
      {typeIcons[type]}
    </span>
    <span className="font-medium">{children}</span>
  </div>
);

export default AlertCustom;