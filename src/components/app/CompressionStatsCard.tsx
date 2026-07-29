import { Card, CardContent } from "@/components/ui/card";
import { Coins, Percent, TrendingDown, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  tokensSaved: number;
  compressionRatio: number; // 0..1
  /** Optional USD price per 1M tokens for estimated savings */
  pricePerMillion?: number;
}

export const CompressionStatsCard = ({ tokensSaved, compressionRatio, pricePerMillion = 3 }: Props) => {
  const { t } = useLanguage();
  const pct = Math.round(compressionRatio * 100);
  const usd = (tokensSaved / 1_000_000) * pricePerMillion;

  return (
    <Card className="border-primary/30 bg-primary/[0.03]">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Coins className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{t("sandbox.compression.title")}</span>
          <Tooltip>
            <TooltipTrigger asChild><Info className="w-3 h-3 text-muted-foreground/50 cursor-help" /></TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px] text-xs">{t("sandbox.compression.tooltip")}</TooltipContent>
          </Tooltip>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <TrendingDown className="w-3 h-3" /> {t("sandbox.compression.tokensSaved")}
            </div>
            <p className="text-2xl font-bold text-foreground">{tokensSaved.toLocaleString()}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Percent className="w-3 h-3" /> {t("sandbox.compression.ratio")}
            </div>
            <p className="text-2xl font-bold text-emerald-400">−{pct}%</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Coins className="w-3 h-3" /> {t("sandbox.compression.savings")}
            </div>
            <p className="text-2xl font-bold text-foreground">${usd.toFixed(4)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
