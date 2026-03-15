import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shield, Play } from "lucide-react";
import { tokenizePii, PII_PATTERNS } from "@/lib/proxy-client";

const Sandbox = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ sanitized: string; detected: string[] } | null>(null);

  const runScan = () => {
    const { sanitized, detected } = tokenizePii(input);
    setResult({ sanitized, detected });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">PII Sandbox</h1>
      </div>
      <p className="text-muted-foreground">Test the PII detection engine with sample text. No data is sent to any server.</p>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold">Input</h3>
          <Textarea rows={10} placeholder="Paste text containing PII to test detection..." value={input} onChange={e => setInput(e.target.value)} />
          <Button onClick={runScan} disabled={!input.trim()}><Play className="h-4 w-4 mr-2" />Run Detection</Button>
        </Card>
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold">Result</h3>
          {result ? (
            <>
              <div className="flex flex-wrap gap-2">
                {result.detected.length > 0 ? result.detected.map((d, i) => <Badge key={i} variant="destructive">{d}</Badge>) : <Badge variant="secondary">No PII detected</Badge>}
              </div>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap">{result.sanitized}</pre>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">Run detection to see results here.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Sandbox;
