import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { ParsedPurchaseItem, ParsedPurchaseOrder } from "../types/purchase";
import type { DateRange } from "../types/ui";
import PageLayout from "../components/PageLayout";
import EmptyState from "../components/EmptyState";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { REPORTS } from "../utils/reports";
import {
  answerQuestion,
  detectAnomalies,
  generateRecommendations,
  generateReportSummary,
  generateSpendInsights,
  CHAT_SUGGESTIONS,
  type UrgencyLevel,
} from "../utils/analytics";
import {
  AlertTriangleIcon,
  AlertCircleIcon,
  BotIcon,
  BrainCircuitIcon,
  ChevronDownIcon,
  InfoIcon,
  LightbulbIcon,
  Loader2Icon,
  MessageSquareTextIcon,
  RefreshCwIcon,
  SendIcon,
  SparklesIcon,
  TrendingUpIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react";

interface AnalyticsInsightsProps {
  items: ParsedPurchaseItem[];
  allItems: ParsedPurchaseItem[];
  poItems: ParsedPurchaseOrder[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface ChatMessage {
  id: number;
  role: "user" | "ai";
  content: string;
  sources: string[];
  followUp?: string;
}

const REPORT_PATHS: Record<string, string> = {
  "purchase-summary": "/summary",
  "by-supplier": "/by-supplier",
  ranking: "/ranking",
  quality: "/quality",
  delivery: "/delivery",
  scorecard: "/scorecard",
  "price-history": "/price-history",
  variance: "/variance",
  "material-cost": "/material-cost",
  "price-alert": "/price-alert",
  "lead-time": "/lead-time",
  "outstanding-po": "/outstanding-po",
  "open-po": "/open-po",
  "closed-po": "/closed-po",
};

interface SectionHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  count?: number;
  accent?: "teal" | "amber" | "red" | "blue";
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  count,
  accent = "teal",
}: SectionHeaderProps) {
  const accentClasses: Record<string, string> = {
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${accentClasses[accent]}`}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {count !== undefined && count > 0 && (
        <Badge variant="secondary" className="ml-auto shrink-0">
          {count}
        </Badge>
      )}
    </div>
  );
}

const URGENCY_STYLES: Record<
  UrgencyLevel,
  { badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Info: {
    badge:
      "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
    icon: InfoIcon,
  },
  Perhatian: {
    badge:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    icon: AlertCircleIcon,
  },
  Urgent: {
    badge: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    icon: AlertTriangleIcon,
  },
};

function SourceLink({ reportId }: { reportId: string }) {
  const path = REPORT_PATHS[reportId];
  const report = REPORTS.find((r) => r.id === reportId);
  if (!path || !report) return null;
  const Icon = report.icon;
  return (
    <Link
      to={path}
      className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
    >
      <Icon className="size-3" />
      {report.name}
    </Link>
  );
}

export default function AnalyticsInsights({
  items,
  allItems,
  poItems,
  dateRange,
  onDateRangeChange,
}: AnalyticsInsightsProps) {
  const recommendations = useMemo(
    () => generateRecommendations(items, allItems),
    [items, allItems],
  );
  const anomalies = useMemo(
    () => detectAnomalies(items, allItems),
    [items, allItems],
  );
  const spendInsights = useMemo(() => generateSpendInsights(items), [items]);

  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [pendingSummary, setPendingSummary] = useState<string | null>(null);

  const dateRangeRef = useRef(dateRange);
  useEffect(() => {
    dateRangeRef.current = dateRange;
  }, [dateRange]);

  useEffect(() => {
    setSummaries({});
  }, [dateRange.start, dateRange.end]);

  const handleGenerateSummary = (reportId: string) => {
    if (pendingSummary) return;
    const targetStart = dateRange.start;
    const targetEnd = dateRange.end;
    setPendingSummary(reportId);
    window.setTimeout(() => {
      const current = dateRangeRef.current;
      if (
        current.start?.getTime() !== targetStart?.getTime() ||
        current.end?.getTime() !== targetEnd?.getTime()
      ) {
        setPendingSummary(null);
        return;
      }
      setSummaries((prev) => ({
        ...prev,
        [reportId]: generateReportSummary(reportId, items, poItems),
      }));
      setPendingSummary(null);
    }, 450);
  };

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const nextIdRef = useRef(1);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const handleSend = (raw: string) => {
    const question = raw.trim();
    if (!question || thinking) return;
    setMessages((prev) => [
      ...prev,
      { id: nextIdRef.current++, role: "user", content: question, sources: [] },
    ]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      const answer = answerQuestion(question, items, allItems);
      setMessages((prev) => [
        ...prev,
        {
          id: nextIdRef.current++,
          role: "ai",
          content: answer.text,
          sources: answer.sources,
          followUp: answer.followUp,
        },
      ]);
      setThinking(false);
    }, 600);
  };

  const hasData = items.length > 0;

  return (
    <PageLayout
      title="Analytics & AI Insights"
      subtitle="Insight otomatis, deteksi anomali, dan analisis pengeluaran dari data purchasing."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      {!hasData && (
        <EmptyState
          icon={AlertTriangleIcon}
          title="Tidak ada data pada rentang tanggal ini"
          description="Ubah rentang tanggal untuk melihat insight, atau buka Chat dengan Aurora untuk menanyakan seluruh data."
        />
      )}

      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <SectionHeader
            icon={SparklesIcon}
            title="Rekomendasi Keputusan"
            description="Rekomendasi actionable dari gabungan seluruh laporan, diurutkan berdasarkan urgensi."
            count={recommendations.length}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {recommendations.map((rec) => {
              const style = URGENCY_STYLES[rec.level];
              const Icon = style.icon;
              return (
                <Card key={rec.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold leading-snug">
                        {rec.title}
                      </CardTitle>
                      <Badge
                        className={`shrink-0 gap-1 font-medium ${style.badge}`}
                      >
                        <Icon className="size-3.5" />
                        {rec.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-2 text-sm text-muted-foreground">
                    <p>{rec.message}</p>
                  </CardContent>
                  <CardFooter className="border-t p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Laporan :</span>
                      <SourceLink reportId={rec.sourceReportId} />
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
            {recommendations.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  Tidak ada rekomendasi untuk rentang tanggal ini.
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader
            icon={TrendingUpIcon}
            title="Deteksi Anomali"
            description="Penyimpangan signifikan dari pola historis: harga, volume, frekuensi, dan keterlambatan."
            count={anomalies.length}
            accent="red"
          />
          <div className="flex flex-col gap-3">
            {anomalies.map((anomaly) => {
              const style = URGENCY_STYLES[anomaly.severity];
              const Icon = style.icon;
              return (
                <Card key={anomaly.id}>
                  <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:gap-3">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${style.badge}`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">
                          {anomaly.title}
                        </h3>
                        <Badge className={`gap-1 font-medium ${style.badge}`}>
                          {anomaly.severity === "Urgent"
                            ? "Urgent"
                            : "Perhatian"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {anomaly.message}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Laporan :</span>
                        <SourceLink reportId={anomaly.sourceReportId} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {anomalies.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  Tidak ada anomali signifikan terdeteksi pada rentang tanggal
                  ini.
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader
            icon={WalletIcon}
            title="Analisis Pengeluaran & Potensi Hemat"
            description="Peluang konsolidasi order, single-sourcing, dan efisiensi biaya administrasi."
            count={spendInsights.length}
            accent="blue"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {spendInsights.map((insight) => (
              <Card key={insight.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold leading-snug">
                    <LightbulbIcon className="size-4 shrink-0 text-amber-500 dark:text-amber-400" />
                    {insight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-2 text-sm text-muted-foreground">
                  <p>{insight.message}</p>
                  {insight.estimatedSaving > 0 && (
                    <p className="mt-2 text-sm font-medium text-teal-600 dark:text-teal-400">
                      Estimasi potensi hemat: Rp{" "}
                      {insight.estimatedSaving.toLocaleString("id-ID")}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="border-t p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Laporan :</span>
                    <SourceLink reportId={insight.sourceReportId} />
                  </div>
                </CardFooter>
              </Card>
            ))}
            {spendInsights.length === 0 && (
              <Card className="border-dashed lg:col-span-2">
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  Tidak ada peluang penghematan signifikan pada rentang tanggal
                  ini.
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader
            icon={BrainCircuitIcon}
            title="Ringkasan AI per Submenu"
            description="Ringkasan otomatis per laporan berdasarkan rentang tanggal aktif. Generate on-demand — tidak menghabiskan resource saat filter berubah."
          />
          <div className="flex flex-col gap-2">
            {REPORTS.map((report, idx) => {
              const Icon = report.icon;
              const isGenerating = pendingSummary === report.id;
              const hasSummary = summaries[report.id] !== undefined;
              return (
                <Card key={report.id}>
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleGenerateSummary(report.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="w-6 shrink-0 text-xs font-medium text-muted-foreground">
                          {idx + 1}.
                        </span>
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
                          <Icon className="size-4 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold">
                            {report.name}
                          </h3>
                          <p className="truncate text-xs text-muted-foreground">
                            {report.description}
                          </p>
                        </div>
                        <ChevronDownIcon
                          className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                            hasSummary ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isGenerating ? (
                        <Badge variant="secondary" className="shrink-0 gap-1">
                          <Loader2Icon className="size-3 animate-spin" />
                          Menganalisis...
                        </Badge>
                      ) : hasSummary ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 shrink-0 gap-1 text-xs"
                          onClick={() => handleGenerateSummary(report.id)}
                        >
                          <RefreshCwIcon className="size-3" />
                          Regenerasi
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 shrink-0 gap-1 text-xs"
                          onClick={() => handleGenerateSummary(report.id)}
                        >
                          <SparklesIcon className="size-3 text-teal-600 dark:text-teal-400" />
                          Generate Insight
                        </Button>
                      )}
                    </div>
                    {hasSummary && (
                      <div className="border-t px-4 py-3 pl-13">
                        <p className="text-sm text-muted-foreground">
                          {summaries[report.id]}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      <Button
        onClick={() => setChatOpen(true)}
        className="fixed right-4 bottom-4 z-40 h-12 gap-2 rounded-full px-5 shadow-lg"
      >
        <MessageSquareTextIcon className="size-5" />
        <span className="hidden sm:inline">Tanya Aurora</span>
      </Button>

      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2">
              <BotIcon className="size-4 text-teal-600 dark:text-teal-400" />
              AI Assistant Personal : Aurora
            </SheetTitle>
            <SheetDescription>
              Hi! Saya Aurora, asisten AI pribadi dari Ridho Aulia Mahqoma
              Angkat. Saat ini fitur saya masih belum sempurna dan masih dalam
              tahap pengembangan. <br /> Silahkan tanya apa saja tentang data
              purchasing. Jawaban dihitung dari data asli; sebutkan bulan/tahun
              untuk scope khusus, atau gunakan filter tanggal aktif.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">
                  Contoh pertanyaan:
                </p>
                {CHAT_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSend(suggestion)}
                    className="rounded-lg border border-dashed px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[85%] flex-col gap-1 ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border bg-card text-card-foreground"
                    }`}
                  >
                    {message.role === "ai" && (
                      <BotIcon className="size-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
                    )}
                    <span>{message.content}</span>
                    {message.role === "user" && (
                      <UserIcon className="size-3.5 shrink-0" />
                    )}
                  </div>
                  {message.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1 px-1">
                      {message.sources.map((sourceId) => (
                        <SourceLink key={sourceId} reportId={sourceId} />
                      ))}
                    </div>
                  )}
                  {message.role === "ai" && message.followUp && (
                    <button
                      type="button"
                      onClick={() => handleSend(message.followUp ?? "")}
                      className="rounded-lg border border-dashed px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-teal-500/50 hover:text-teal-600 dark:hover:text-teal-400"
                    >
                      <SparklesIcon className="mr-1 inline size-3" />
                      Pertanyaan rekomendasi : {message.followUp}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border bg-card px-3 py-2 text-sm text-muted-foreground">
                  <Loader2Icon className="size-3.5 animate-spin" />
                  Menganalisis data...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex items-center gap-2 border-t p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend(input);
              }}
              placeholder="Tulis pertanyaan..."
              className="h-10"
            />
            <Button
              size="icon"
              className="size-10 shrink-0"
              onClick={() => handleSend(input)}
              disabled={!input.trim() || thinking}
            >
              <SendIcon className="size-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
