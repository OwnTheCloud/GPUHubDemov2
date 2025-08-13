import { ReactNode } from "react";
import { AppBreadcrumb } from "./app-breadcrumb";
import { motion } from "framer-motion";

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function PageWrapper({ children, title, className = "" }: PageWrapperProps) {
  return (
    <motion.div
      className={`flex-1 space-y-4 p-4 md:p-8 pt-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AppBreadcrumb />
      {title && (
        <motion.div
          className="flex items-center justify-between space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </motion.div>
      )}
      {children}
    </motion.div>
  );
}