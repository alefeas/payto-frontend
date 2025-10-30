import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeatureCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  onClick?: () => void;
  badge?: string | number;
  size?: "default" | "small";
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  onClick,
  badge,
  size = "default",
}: FeatureCardProps) {
  const isSmall = size === "small";

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 relative"
      onClick={onClick}
    >
      {badge !== undefined && badge !== null && badge !== "" && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-6 min-w-6 rounded-full flex items-center justify-center px-2"
        >
          {badge}
        </Badge>
      )}
      <CardContent className={isSmall ? "p-4" : "p-6"}>
        <div className={`flex ${isSmall ? "flex-col items-center text-center space-y-3" : "items-start space-x-4"}`}>
          <div className="p-3 rounded-lg bg-gradient-to-br from-[#002bff] via-[#0078ff] to-[#0000d4]">
            <Icon className={`${isSmall ? "h-5 w-5" : "h-6 w-6"} text-white`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${isSmall ? "text-sm" : "mb-1"}`}>{title}</h3>
            {description && (
              <p className={`text-muted-foreground ${isSmall ? "text-xs" : "text-sm"}`}>
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

