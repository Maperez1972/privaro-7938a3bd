import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Percent, TrendingDown, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/context/LanguageContext";
import { MODEL_PRICES, DEFAULT_MODEL_PRICE_ID, getModelPrice, estimateSavingsUsd, formatSavingsUsd } from "@/lib/model-prices";

interface Props {
  tokensSaved: number;
  compressionRatio: number; // 0..1
  /** Optional override; when omitted the card exposes a model picker */
  pricePerMillion?: number;
}

export const CompressionStatsCard = ({ tokensSaved, compressionRatio, pricePerMillion }: Props) => {
  const { t } = useLanguage();
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_PRICE_ID);
  const effectivePrice = pricePerMillion ?? getModelPrice(modelId).pricePerMillion;
  const pct = Math.round(compressionRatio * 100);
  const usd = estimateSavingsUsd(tokensSaved, effectivePrice);

  return (
    <Card className="border-primary/30 bg-primary/[0.03]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{t("sandbox.compression.title")}</span>
            <Tooltip>
              <TooltipTrigger asChild><Info className="w-3 h-3 text-muted-foreground/50 cursor-help" /></TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px] text-xs">{t("sandbox.compression.tooltip")}</TooltipContent>
            </Tooltip>
          </div>
          {pricePerMillion === undefined && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              {t("sandbox.compression.model")}
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground"
              >
                {MODEL_PRICES.map((m) => (
                  <option key={m.id} value={m.id}>{m.label} (${m.pricePerMillion}/1M)</option>
                ))}
              </select>
            </label>
          )}
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
            <p className="text-2xl font-bold text-foreground">{formatSavingsUsd(usd)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
