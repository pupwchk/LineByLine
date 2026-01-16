import { Home, Clock, User, Ticket } from "lucide-react";

type NavItem = "home" | "waiting" | "orders" | "mypage";

interface BottomNavProps {
  active: NavItem;
  onChange: (item: NavItem) => void;
  hasActiveWaiting?: boolean;
  hasActiveOrders?: boolean;
}

export function BottomNav({ active, onChange, hasActiveWaiting, hasActiveOrders }: BottomNavProps) {
  const items = [
    { id: "home" as const, icon: Home, label: "홈", hasIndicator: false },
    { id: "waiting" as const, icon: Clock, label: "대기", hasIndicator: hasActiveWaiting },
    { id: "orders" as const, icon: Ticket, label: "식권", hasIndicator: hasActiveOrders },
    { id: "mypage" as const, icon: User, label: "MY", hasIndicator: false },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50"
      data-testid="bottom-nav"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex flex-col items-center justify-center w-20 h-full gap-1 transition-colors ${
              active === item.id
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
            data-testid={`nav-${item.id}`}
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.hasIndicator && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
