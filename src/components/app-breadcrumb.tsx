import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export function AppBreadcrumb() {
  const location = useLocation();
  const pathname = location.pathname;

  // Map of routes to breadcrumb labels
  const routeMap: Record<string, string> = {
    "/": "Home",
    "/universal-supply": "Universal Supply",
    "/investigation-signals": "Investigation Signals",
    "/execution-signals": "Execution Signals",
    "/datacenters": "Datacenters",
    "/stamps": "Stamps",
    "/demand-ids": "Demand IDs",
    "/gpu-topology": "GPU Topology",
  };

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];
    
    // Always add home
    items.push({
      label: "Home",
      href: "/",
      icon: <Home className="h-4 w-4" />,
    });

    if (pathname === "/") {
      return items;
    }

    // Handle signal routes (grouped under CO+I or CSCP)
    if (pathname.includes("investigation-signals") || pathname.includes("execution-signals")) {
      items.push({
        label: "CO+I Signals",
        href: "/investigation-signals",
      });
    } else if (pathname.includes("datacenters") || pathname.includes("stamps") || pathname.includes("demand-ids")) {
      items.push({
        label: "CSCP Signals",
        href: "/datacenters",
      });
    }

    // Add current page
    const currentLabel = routeMap[pathname];
    if (currentLabel && currentLabel !== "Home") {
      items.push({
        label: currentLabel,
      });
    }

    return items;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on home page
  }

  return (
    <motion.nav
      className="flex items-center space-x-1 text-sm text-muted-foreground mb-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <motion.div
            key={item.label}
            className="flex items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1" />
            )}
            
            {isLast ? (
              <span className={cn(
                "font-medium text-foreground flex items-center gap-1",
                "px-2 py-1 rounded-md bg-accent"
              )}>
                {item.icon}
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href!}
                className={cn(
                  "hover:text-foreground transition-colors flex items-center gap-1",
                  "px-2 py-1 rounded-md hover:bg-accent/50"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )}
          </motion.div>
        );
      })}
    </motion.nav>
  );
}