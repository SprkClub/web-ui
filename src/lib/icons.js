/**
 * Hugeicons Icon Helper
 * 
 * Centralized icon imports and helper functions for using Hugeicons
 * throughout the application.
 * 
 * Reference: https://hugeicons.com/react-icons
 */

import { HugeiconsIcon } from "@hugeicons/react";
import {
  // Navigation & UI
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
  Image01Icon,
  Home01Icon,
  Search01Icon,
  Notification01Icon,
  UserIcon,
  ArrowUp01Icon,
  Medal01Icon,
  ZapIcon,
  Settings01Icon,
  Edit01Icon,
  // Social
  TwitterIcon,
} from "@hugeicons/core-free-icons";

/**
 * Icon component wrapper with default props
 */
export function Icon({ icon, size = 20, color = "currentColor", className = "", ...props }) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color}
      className={className}
      {...props}
    />
  );
}

/**
 * Pre-configured icon components for common use cases
 */
export const Icons = {
  // Navigation
  ArrowRight: (props) => <Icon icon={ArrowRight01Icon} {...props} />,
  ArrowLeft: (props) => <Icon icon={ArrowLeft01Icon} {...props} />,
  Close: (props) => <Icon icon={Cancel01Icon} {...props} />,
  Image: (props) => <Icon icon={Image01Icon} {...props} />,
  Home: (props) => <Icon icon={Home01Icon} {...props} />,
  Search: (props) => <Icon icon={Search01Icon} {...props} />,
  Notification: (props) => <Icon icon={Notification01Icon} {...props} />,
  User: (props) => <Icon icon={UserIcon} {...props} />,
  TrendingUp: (props) => <Icon icon={ArrowUp01Icon} {...props} />,
  Medal: (props) => <Icon icon={Medal01Icon} {...props} />,
  Zap: (props) => <Icon icon={ZapIcon} {...props} />,
  Settings: (props) => <Icon icon={Settings01Icon} {...props} />,
  Edit: (props) => <Icon icon={Edit01Icon} {...props} />,

  // Heart icon (custom SVG)
  Heart: ({ size = 20, className = "", ...props }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),

  // Live streaming icon (custom SVG)
  Live: ({ size = 20, className = "", ...props }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
  ),

  // Social
  Twitter: (props) => <Icon icon={TwitterIcon} {...props} />,
};

// Export individual icons for direct use
export {
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
  Image01Icon,
  Home01Icon,
  Search01Icon,
  Notification01Icon,
  UserIcon,
  ArrowUp01Icon,
  Medal01Icon,
  ZapIcon,
  Settings01Icon,
  Edit01Icon,
  TwitterIcon,
};



