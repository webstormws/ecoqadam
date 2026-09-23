import { useState } from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { botApi } from "@/api/endpoints";
import { Button } from "@/components/ui";
import { useDidMount } from "@/hooks/useDidMount";

/**
 * "Telegram orqali kirish" — opens a chat with the bot.
 * In the bot, the user presses START → shares phone → gets a one-time
 * login link (/auth/telegram?token=...), which TelegramCallback exchanges
 * for JWT tokens.
 */
export default function TelegramLoginButton() {
  const [botUser, setBotUser] = useState<string | null>(null);

  useDidMount(() => {
    botApi
      .config()
      .then((c) => setBotUser(c.bot_username))
      .catch(() => setBotUser(null));
  });

  return (
    <Button
      variant="outline"
      type="button"
      onClick={() => botUser && window.open(`https://t.me/${botUser}`, "_blank")}
    >
      <MessageCircle className="h-4 w-4" />
      Telegram orqali kirish
      <ArrowUpRight className="h-4 w-4" />
    </Button>
  );
}