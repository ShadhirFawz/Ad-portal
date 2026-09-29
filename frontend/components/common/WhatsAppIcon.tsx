import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppIconProps {
  className?: string;
  size?: number;
  width?: number;
  height?: number;
}

export default function WhatsAppIcon({
  className = "",
  size = 16,
}: WhatsAppIconProps) {
  return <FaWhatsapp size={size} className={className} />;
}
