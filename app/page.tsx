"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  CreditCard,
  Landmark,
  LineChart,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

type MonthKey = "Dez/2025" | "Jan/2026" | "Fev/2026";

type MonthRow = {
  mes: MonthKey;
  faturamento: number;
  retiradasPF: number;
  banrisulFinal: number;
};

type DreRow = {
  label: string;
  fevValor: number;
  fevPercent: number; // 0-100
  hint?: string;
};

type BankSnapshot = {
  banco: "Banrisul" | "Cresol" | "Stone";
  saldo: number;
  detalhe: string;
  icon: React.ReactNode;
};

type KPI = {
  title: string;
  value: string;
  subtitle: string;
  tone: "neutral" | "good" | "warn" | "bad";
  icon: React.ReactNode;
};

type TabKey =
  | "Resumo"
  | "Multi-banco"
  | "DRE"
  | "Diagnóstico"
  | "Plano 30-60-90"
  | "Crescimento"
  | "Decisões";

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPct(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value / 100);
}

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function TonePill({ tone, text }: { tone: KPI["tone"]; text: string }) {
  const cls =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : tone === "bad"
      ? "bg-rose-50 text-rose-700 border-rose-100"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", cls)}>
      {text}
    </span>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<React.ReactNode>>;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-50">
            {headers.map((h) => (
              <th key={h} className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className={cn("border-b border-slate-100 last:border-b-0", idx % 2 === 1 && "bg-slate-50/40")}>
              {r.map((cell, cidx) => (
                <td key={cidx} className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KpiCard({ kpi }: { kpi: KPI }) {
  const toneCls =
    kpi.tone === "good"
      ? "border-emerald-200 bg-emerald-50/50"
      : kpi.tone === "warn"
      ? "border-amber-200 bg-amber-50/50"
      : kpi.tone === "bad"
      ? "border-rose-200 bg-rose-50/50"
      : "border-slate-200 bg-white";

  return (
    <div className={cn("rounded-2xl border p-5 shadow-sm", toneCls)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{kpi.title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{kpi.value}</p>
          <p className="mt-1 text-sm text-slate-600">{kpi.subtitle}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700">{kpi.icon}</div>
      </div>
    </div>
  );
}

function BankCard({ bank }: { bank: BankSnapshot }) {
  const isNeg = bank.saldo < 0;
  const cls = isNeg ? "border-rose-200 bg-rose-50/50" : "border-emerald-200 bg-emerald-50/50";
  const valueCls = isNeg ? "text-rose-700" : "text-emerald-700";

  return (
    <div className={cn("rounded-2xl border p-5 shadow-sm", cls)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{bank.banco}</p>
          <p className={cn("mt-2 text-2xl font-bold tracking-tight", valueCls)}>{formatBRL(bank.saldo)}</p>
          <p className="mt-1 text-sm text-slate-600">{bank.detalhe}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700">{bank.icon}</div>
      </div>
    </div>
  );
}

export default function RelatorioTeiaEcoPainel() {
  const [tab, setTab] = useState<TabKey>("Resumo");

  // Dados base informados no seu texto (com foco Dez/Jan/Fev e detalhamento de Fev)
  const fluxoTrimestre: MonthRow[] = [
    { mes: "Dez/2025", faturamento: 52100, retiradasPF: 18450, banrisulFinal: 103.32 },
    { mes: "Jan/2026", faturamento: 51500, retiradasPF: 19800, banrisulFinal: -1843.88 },
    { mes: "Fev/2026", faturamento: 54940.79, retiradasPF: 21845.9, banrisulFinal: -3476.27 },
  ];

  const fev = useMemo(
    () => ({
      faturamento: 54940.79,
      cmv: 10456.82,
      impostos: 2258.67,
      despesasFinanceiras: 6342.18,
      parcelasEmprestimos: 1746.89,
      retiradasPF: 21845.9,
      ticketMedio: 28.03,
      clientesMes: 1960,
      kgBuffet: 85.9,
      pontoEquilibrio: 42650.46,
      opCred: 8798, // citado no texto
      banrisulLimite: 3000,
      banrisulSaldoFinal: -3476.27,
      banrisulSobreLimite: 476.27,
      cresolSaldoDevedor: 6819.06, // citado no texto anterior
      stoneSaldoConta: 4468.01, // citado no texto anterior (se quiser ajustar depois, só trocar aqui)
    }),
    []
  );

  const caixaGlobal = useMemo(() => {
    return fev.banrisulSaldoFinal + (-fev.cresolSaldoDevedor) + fev.stoneSaldoConta;
  }, [fev.banrisulSaldoFinal, fev.cresolSaldoDevedor, fev.stoneSaldoConta]);

  const lucroOperacionalAntesRetirada = useMemo(() => {
    return fev.faturamento - fev.cmv - fev.impostos - fev.despesasFinanceiras - fev.parcelasEmprestimos;
  }, [fev]);

  const sobraAposRetiradas = useMemo(() => {
    return lucroOperacionalAntesRetirada - fev.retiradasPF;
  }, [lucroOperacionalAntesRetirada, fev.retiradasPF]);

  const dreFev: DreRow[] = useMemo(
    () => [
      { label: "1) Receita bruta", fevValor: fev.faturamento, fevPercent: 100, hint: "Vendas totais do mês (DigiSat)." },
      { label: "(-) Impostos e taxas", fevValor: -fev.impostos, fevPercent: (fev.impostos / fev.faturamento) * 100 },
      { label: "2) Receita líquida", fevValor: fev.faturamento - fev.impostos, fevPercent: ((fev.faturamento - fev.impostos) / fev.faturamento) * 100 },
      { label: "(-) CMV (insumos/fornecedores)", fevValor: -fev.cmv, fevPercent: (fev.cmv / fev.faturamento) * 100, hint: "Índice excelente para o modelo de buffet." },
      { label: "3) Lucro bruto", fevValor: fev.faturamento - fev.impostos - fev.cmv, fevPercent: ((fev.faturamento - fev.impostos - fev.cmv) / fev.faturamento) * 100 },
      { label: "(-) Parcelas de empréstimos", fevValor: -fev.parcelasEmprestimos, fevPercent: (fev.parcelasEmprestimos / fev.faturamento) * 100 },
      { label: "(-) Despesas financeiras (juros e taxas)", fevValor: -fev.despesasFinanceiras, fevPercent: (fev.despesasFinanceiras / fev.faturamento) * 100, hint: "Principal ralo do mês. Impacto direto no caixa." },
      { label: "4) Resultado do negócio (antes de retiradas)", fevValor: lucroOperacionalAntesRetirada, fevPercent: (lucroOperacionalAntesRetirada / fev.faturamento) * 100 },
      { label: "(-) Retiradas e Pix para PF", fevValor: -fev.retiradasPF, fevPercent: (fev.retiradasPF / fev.faturamento) * 100, hint: "Precisa virar regra: teto + calendário." },
      { label: "5) Sobras após retiradas (resultado final)", fevValor: sobraAposRetiradas, fevPercent: (sobraAposRetiradas / fev.faturamento) * 100 },
    ],
    [fev, lucroOperacionalAntesRetirada, sobraAposRetiradas]
  );

  const banks: BankSnapshot[] = useMemo(
    () => [
      {
        banco: "Banrisul",
        saldo: fev.banrisulSaldoFinal,
        detalhe: `Sobrelimite estimado: ${formatBRL(fev.banrisulSobreLimite)} acima do limite de ${formatBRL(fev.banrisulLimite)}.`,
        icon: <Landmark size={18} />,
      },
      {
        banco: "Cresol",
        saldo: -fev.cresolSaldoDevedor,
        detalhe: "Saldo devedor citado no consolidado. Prioridade: reduzir juros e incidência diária.",
        icon: <Wallet size={18} />,
      },
      {
        banco: "Stone",
        saldo: fev.stoneSaldoConta,
        detalhe: "Saldo em conta citado no consolidado. Ajuste chave: varredura para o banco pagador.",
        icon: <CreditCard size={18} />,
      },
    ],
    [fev]
  );

  const kpis: KPI[] = useMemo(
    () => [
      {
        title: "CMV (Fev)",
        value: formatPct((fev.cmv / fev.faturamento) * 100),
        subtitle: "Cozinha e compras bem controladas.",
        tone: "good",
        icon: <TrendingUp size={18} />,
      },
      {
        title: "Despesas financeiras (Fev)",
        value: formatBRL(fev.despesasFinanceiras),
        subtitle: `${formatPct((fev.despesasFinanceiras / fev.faturamento) * 100)} do faturamento.`,
        tone: "bad",
        icon: <TrendingDown size={18} />,
      },
      {
        title: "Retiradas PF (Fev)",
        value: formatBRL(fev.retiradasPF),
        subtitle: `${formatPct((fev.retiradasPF / fev.faturamento) * 100)} do faturamento.`,
        tone: "warn",
        icon: <Users size={18} />,
      },
      {
        title: "Ticket médio (Fev)",
        value: formatBRL(fev.ticketMedio),
        subtitle: `Base: ${fev.clientesMes.toLocaleString("pt-BR")} clientes/mês.`,
        tone: "neutral",
        icon: <LineChart size={18} />,
      },
    ],
    [fev]
  );

  const tabs: TabKey[] = ["Resumo", "Multi-banco", "DRE", "Diagnóstico", "Plano 30-60-90", "Crescimento", "Decisões"];

  const statusCaixaPill = useMemo(() => {
    if (caixaGlobal < 0) return { tone: "bad" as const, text: "Status: risco de liquidez (caixa global negativo)" };
    if (caixaGlobal < 2000) return { tone: "warn" as const, text: "Status: atenção (caixa global baixo)" };
    return { tone: "good" as const, text: "Status: saudável (caixa global positivo)" };
  }, [caixaGlobal]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Relatório Trimestral Financeiro</h1>
              <p className="mt-1 text-sm text-slate-500">
                Período: Dez/2025 a Fev/2026 | Unidade: Teia Ecológica | Emissão: 02/03/2026
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <TonePill tone={statusCaixaPill.tone} text={statusCaixaPill.text} />
                <TonePill tone="good" text="Eficiência operacional alta (CMV baixo)" />
                <TonePill tone="warn" text="Retiradas e juros pressionando o caixa" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Caixa global (referência Fev)</p>
              <p className={cn("mt-1 text-2xl font-bold tracking-tight", caixaGlobal < 0 ? "text-rose-700" : "text-emerald-700")}>
                {formatBRL(caixaGlobal)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Cálculo: Banrisul + Cresol + Stone (com os saldos citados). Ajuste os valores se mudar no teu extrato.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition",
                  tab === t
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.title} kpi={k} />
          ))}
        </div>

        {/* Content */}
        <div className="mt-6">
          {tab === "Resumo" ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionTitle
                    icon={<BarChart3 size={18} />}
                    title="Resumo executivo"
                    subtitle="O negócio performa bem no operacional, mas perde liquidez por juros, fragmentação e retiradas no timing errado."
                  />
                  <div className="mt-5 space-y-3 text-sm text-slate-700">
                    <p>
                      No trimestre, o faturamento se manteve estável e fevereiro foi o mês mais forte em vendas. O CMV de fevereiro está em nível
                      excelente, indicando gestão de compras e produção muito eficiente.
                    </p>
                    <p>
                      O ponto crítico é o caixa: o Banrisul foi de saldo positivo em dezembro para negativo em janeiro e fevereiro. Isso sinaliza que
                      as saídas somadas (retiradas, juros, empréstimos e pagamentos) estão superando a sobra real e forçando o uso de limite.
                    </p>
                    <p>
                      A correção mais rápida vem de duas mudanças: padronizar o fluxo entre bancos (Stone transfere para o banco pagador) e tornar as
                      retiradas uma regra (teto mensal + calendário fixo), com provisões antes de liberar lucro.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionTitle icon={<ClipboardList size={18} />} title="Evolução do trimestre" subtitle="Dezembro, janeiro e fevereiro (vendas, retiradas e Banrisul)." />
                  <div className="mt-4">
                    <Table
                      headers={["Competência", "Faturamento", "Retiradas PF", "Saldo final Banrisul", "Leitura"]}
                      rows={fluxoTrimestre.map((m) => {
                        const leitura =
                          m.banrisulFinal >= 0
                            ? "Fechou positivo"
                            : m.banrisulFinal < 0 && m.mes === "Jan/2026"
                            ? "Entrou em déficit"
                            : "Déficit crítico";
                        return [
                          <span key="mes" className="font-semibold text-slate-900">
                            {m.mes}
                          </span>,
                          <span key="fat" className="text-slate-900">
                            {formatBRL(m.faturamento)}
                          </span>,
                          <span key="ret" className="text-amber-700 font-semibold">
                            {formatBRL(m.retiradasPF)}
                          </span>,
                          <span key="ban" className={cn("font-semibold", m.banrisulFinal < 0 ? "text-rose-700" : "text-emerald-700")}>
                            {formatBRL(m.banrisulFinal)}
                          </span>,
                          <span key="lei" className="text-slate-600">
                            {leitura}
                          </span>,
                        ];
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionTitle icon={<Target size={18} />} title="Metas rápidas (próximos 14 dias)" subtitle="O que reduz juros e estanca o ciclo do limite." />
                  <ul className="mt-4 space-y-3 text-sm text-slate-700">
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                      Cobrir o sobrelimite do Banrisul ({formatBRL(fev.banrisulSobreLimite)}) para cessar multas e reduzir juros.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                      Criar calendário de retiradas (ex.: dia 05 e dia 20), evitando Pix diários.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-slate-700" />
                      Definir um banco pagador oficial e fazer varredura semanal da Stone para esse banco.
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 shadow-sm text-white">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Mensagem para apresentação</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-100">
                    O restaurante é forte em vendas e margem. O problema não é “vender pouco”. O problema é “pagar caro para existir”:
                    juros, antecipações e retiradas sem regra. Ajustando fluxo entre bancos e disciplina de retirada, o caixa volta a respirar.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {tab === "Multi-banco" ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  icon={<Wallet size={18} />}
                  title="Visão multi-banco"
                  subtitle="Banrisul, Cresol e Stone devem ser tratados como um caixa global. Fragmentação gera juros."
                />

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {banks.map((b) => (
                    <BankCard key={b.banco} bank={b} />
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Leitura do problema de fragmentação</p>
                  <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">O que está acontecendo</p>
                      <p className="mt-2 text-sm text-slate-700">
                        Parte do dinheiro entra via Stone, mas pagamentos e obrigações acabam caindo em Banrisul/Cresol. Se não existe varredura
                        organizada (transferência automática), o banco pagador fica negativo e cobra caro por isso.
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Como corrigir</p>
                      <p className="mt-2 text-sm text-slate-700">
                        Definir um banco pagador oficial (onde saem fornecedores e impostos) e instituir varredura semanal da Stone para esse banco.
                        O objetivo é “caixa limpo” no banco que paga contas, sem depender de limite.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <TonePill tone={caixaGlobal < 0 ? "bad" : "good"} text={`Caixa global (Fev): ${formatBRL(caixaGlobal)}`} />
                    <TonePill tone="warn" text="Se não transferir, o banco pagador vira dívida cara" />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {tab === "DRE" ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  icon={<BarChart3 size={18} />}
                  title="DRE (Fevereiro/2026)"
                  subtitle="Mostra a força operacional e onde o caixa é drenado (juros e retiradas)."
                />

                <div className="mt-5">
                  <Table
                    headers={["Linha", "Valor (Fev)", "% sobre receita", "Observação"]}
                    rows={dreFev.map((r) => [
                      <span key="l" className={cn("font-semibold", r.label.includes("Sobras") ? "text-slate-900" : "text-slate-800")}>
                        {r.label}
                      </span>,
                      <span
                        key="v"
                        className={cn(
                          "font-semibold",
                          r.fevValor < 0 ? "text-rose-700" : r.label.includes("Sobras") || r.label.includes("Resultado do negócio") ? "text-emerald-700" : "text-slate-900"
                        )}
                      >
                        {formatBRL(r.fevValor)}
                      </span>,
                      <span key="p" className="text-slate-700">
                        {formatPct(r.fevPercent)}
                      </span>,
                      <span key="h" className="text-slate-600">
                        {r.hint ?? "-"}
                      </span>,
                    ])}
                  />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resultado antes de retiradas</p>
                    <p className="mt-2 text-xl font-bold text-emerald-700">{formatBRL(lucroOperacionalAntesRetirada)}</p>
                    <p className="mt-1 text-sm text-slate-600">É o que o negócio gera quando você não drena o caixa.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Retiradas PF</p>
                    <p className="mt-2 text-xl font-bold text-amber-700">{formatBRL(fev.retiradasPF)}</p>
                    <p className="mt-1 text-sm text-slate-600">Precisa de teto e calendário para não virar juros.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Sobras após retiradas</p>
                    <p className={cn("mt-2 text-xl font-bold", sobraAposRetiradas < 0 ? "text-rose-300" : "text-emerald-200")}>
                      {formatBRL(sobraAposRetiradas)}
                    </p>
                    <p className="mt-1 text-sm text-slate-200">É o que pode virar caixa real, sem depender de limite.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {tab === "Diagnóstico" ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionTitle
                    icon={<AlertTriangle size={18} />}
                    title="Pontos críticos (o que explica o caixa apertado)"
                    subtitle="Três causas principais: juros, fragmentação e retiradas no timing errado."
                  />

                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
                      <p className="text-sm font-bold text-rose-800">1) Ralo financeiro (juros e taxas)</p>
                      <p className="mt-2 text-sm text-rose-900/90">
                        Em fevereiro, despesas financeiras somaram {formatBRL(fev.despesasFinanceiras)} ({formatPct((fev.despesasFinanceiras / fev.faturamento) * 100)} do faturamento).
                        Isso reduz o caixa sem melhorar produto, operação ou vendas.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
                      <p className="text-sm font-bold text-amber-800">2) Retiradas sem regra e sem provisão</p>
                      <p className="mt-2 text-sm text-amber-900/90">
                        As retiradas e Pix para PF chegaram a {formatBRL(fev.retiradasPF)} em fevereiro. O problema não é só “o valor”, é a
                        frequência e o timing: quando sai antes de impostos, fornecedores e parcelas, o banco vira financiador automático.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-bold text-slate-900">3) Fragmentação Banrisul + Cresol + Stone</p>
                      <p className="mt-2 text-sm text-slate-700">
                        O dinheiro entra em canais diferentes e nem sempre é transferido para o banco pagador no tempo certo. Resultado: o banco
                        que paga contas fica negativo, mesmo existindo dinheiro em outro lugar.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionTitle icon={<LineChart size={18} />} title="O que está saudável" subtitle="O que não precisa ser “consertado” agora." />
                  <ul className="mt-4 space-y-3 text-sm text-slate-700">
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                      CMV em {formatPct((fev.cmv / fev.faturamento) * 100)}: eficiência forte na cozinha e compras.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                      Ticket médio consistente ({formatBRL(fev.ticketMedio)}), com espaço para crescer com bebidas e sobremesas.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                      Vendas do trimestre estáveis e fevereiro acima de dezembro e janeiro.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 shadow-sm text-white">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Frase de fechamento para reunião</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-100">
                    O negócio dá dinheiro. O caixa não aparece porque parte da sobra vira juros e porque as retiradas não seguem uma regra ligada ao
                    caixa global. Corrigindo fluxo e disciplina, a empresa volta a ficar previsível.
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Alertas objetivos (Fev)</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-700">
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                      Banrisul negativo: {formatBRL(fev.banrisulSaldoFinal)} (sobrelimite estimado {formatBRL(fev.banrisulSobreLimite)}).
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                      Crédito curto citado: {formatBRL(fev.opCred)} para sustentar fluxo.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                      Juros e taxas: {formatBRL(fev.despesasFinanceiras)}.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {tab === "Plano 30-60-90" ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  icon={<Target size={18} />}
                  title="Plano 30-60-90"
                  subtitle="Três rotas combináveis. Escolha a que encaixa na realidade do caixa e disciplina do time."
                />

                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Rota 1: saneamento rápido (7 a 14 dias)</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">Objetivo: parar multas e reduzir juros imediatamente</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                      <li>1) Cobrir sobrelimite do Banrisul ({formatBRL(fev.banrisulSobreLimite)}).</li>
                      <li>2) Definir banco pagador oficial e varredura semanal da Stone.</li>
                      <li>3) Reduzir retiradas por 14 dias ou manter mínimo combinado.</li>
                    </ul>
                    <div className="mt-4 rounded-xl border border-rose-200 bg-white p-3 text-sm text-rose-800">
                      Impacto: cai custo de “existir no limite” e reduz o risco de bola de neve.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Rota 2: disciplina de caixa (30 dias)</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">Objetivo: previsibilidade e fim de Pix diário</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                      <li>1) Teto global de retiradas (somando todos os bancos).</li>
                      <li>2) Calendário fixo (ex.: dia 05 e dia 20).</li>
                      <li>3) Provisão semanal: impostos e fornecedores antes de liberar lucro.</li>
                      <li>4) Fechamento semanal: caixa global e custo financeiro.</li>
                    </ul>
                    <div className="mt-4 rounded-xl border border-amber-200 bg-white p-3 text-sm text-amber-800">
                      Impacto: diminui dependência de crédito curto e reduz juros mês a mês.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Rota 3: cortar taxas e antecipação (30 a 60 dias)</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">Objetivo: transformar taxa em caixa</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                      <li>Opção A: cortar antecipação e reorganizar fluxo com provisões.</li>
                      <li>Opção B: modelo híbrido (antecipar só o necessário, com regra).</li>
                      <li>Renegociar taxas e prazos com adquirência e bancos.</li>
                    </ul>
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-3 text-sm text-emerald-800">
                      Impacto: reduz o “imposto invisível” e melhora o caixa sem precisar vender mais.
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-bold text-slate-900">Checklist semanal (simples e obrigatório)</p>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Toda segunda</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        <li>Conferir caixa global (3 bancos).</li>
                        <li>Separar provisão de impostos.</li>
                        <li>Separar provisão de fornecedores.</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Toda sexta</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        <li>Varredura Stone para banco pagador.</li>
                        <li>Checar custo financeiro da semana.</li>
                        <li>Validar se retiradas respeitaram teto e calendário.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {tab === "Crescimento" ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionTitle
                    icon={<Users size={18} />}
                    title="Captação de clientes e aumento de receita"
                    subtitle="Opções práticas para crescer sem depender apenas de aumentar preço do kg."
                  />

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-bold text-slate-900">1) Produto de entrada (volume)</p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        <li>Marmita do dia com quantidade limitada.</li>
                        <li>Combo almoço + bebida com vantagem pequena.</li>
                        <li>Fidelidade simples (ganha bebida ou sobremesa).</li>
                      </ul>
                      <p className="mt-3 text-xs text-slate-500">Meta: aumentar recorrência e encaixar quem não consegue ir ao salão.</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-bold text-slate-900">2) Parcerias locais (previsibilidade)</p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        <li>Convênio com empresas próximas (pagamento quinzenal).</li>
                        <li>Pacote de refeições semanais por equipe.</li>
                        <li>Oferta para clínicas, escritórios e obras.</li>
                      </ul>
                      <p className="mt-3 text-xs text-slate-500">Meta: trazer volume garantido e reduzir oscilação do dia.</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-bold text-slate-900">3) Ticket médio (sem espantar)</p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        <li>Venda sugestiva de bebida (água com gás, suco, refri).</li>
                        <li>Sobremesa do dia com script simples.</li>
                        <li>Café pós-almoço como rotina.</li>
                      </ul>
                      <p className="mt-3 text-xs text-slate-500">Meta: +R$ 2 a +R$ 4 por cliente já muda o mês.</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-bold text-slate-900">4) Comunicação local (rápida e barata)</p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        <li>Google Meu Negócio atualizado (fotos e posts semanais).</li>
                        <li>Cardápio e prato do dia no WhatsApp e Stories.</li>
                        <li>Vantagem limitada em vez de desconto grande.</li>
                      </ul>
                      <p className="mt-3 text-xs text-slate-500">Meta: aumentar fluxo sem mexer em estrutura.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionTitle icon={<Target size={18} />} title="Metas sugeridas (30 dias)" subtitle="Escolha 2 metas para executar e medir." />
                  <Table
                    headers={["Meta", "Como medir", "Alvo", "Observação"]}
                    rows={[
                      ["Aumentar ticket médio", "Ticket médio diário", " +R$ 2,00 a +R$ 4,00", "Foco em bebidas e sobremesa."],
                      ["Criar volume previsível", "Refeições por convênio", "2 empresas parceiras", "Pagamento quinzenal ou semanal."],
                      ["Reduzir custo financeiro", "Taxas e juros do mês", "queda de 20% a 40%", "Cortar antecipação ou modelar híbrido."],
                      ["Diminuir retiradas fora do calendário", "Qtd de Pix fora da regra", "zero", "Sem Pix diário. Regra única."],
                    ].map((r) => r.map((c) => <span key={String(c)} className="text-slate-700">{c}</span>))}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 shadow-sm text-white">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Alavanca mais rápida</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-100">
                    A forma mais rápida de melhorar resultado sem mudar buffet é aumentar ticket médio com bebida e sobremesa, enquanto corta juros.
                    Crescer vendendo mais e continuar pagando juros altos só aumenta o cansaço do caixa.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Dados do mês (para referência)</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    <li>Ticket médio: {formatBRL(fev.ticketMedio)}</li>
                    <li>Clientes/mês: {fev.clientesMes.toLocaleString("pt-BR")}</li>
                    <li>Preço buffet (ref.): {formatBRL(fev.kgBuffet)}/kg</li>
                    <li>Ponto de equilíbrio: {formatBRL(fev.pontoEquilibrio)}</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {tab === "Decisões" ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  icon={<ClipboardList size={18} />}
                  title="Decisões do mês (modelo para registro no Notion)"
                  subtitle="Use como ata mensal. Dá clareza para sócios e vira histórico."
                />

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-bold text-slate-900">Decisão 1: Política de retiradas</p>
                    <p className="mt-2 text-sm text-slate-700">
                      Teto mensal (global) e calendário fixo. Exemplo: retiradas somente dia 05 e dia 20, respeitando provisões de impostos e fornecedores.
                    </p>
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                      Teto sugerido enquanto saneia: <span className="font-bold">{formatBRL(15000)}</span>/mês (ajuste conforme acordo).
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-bold text-slate-900">Decisão 2: Banco pagador oficial</p>
                    <p className="mt-2 text-sm text-slate-700">
                      Definir qual banco paga fornecedores e impostos. Instituir varredura da Stone para o banco pagador 1 vez por semana.
                    </p>
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                      Meta: reduzir despesas financeiras mensalmente e eliminar sobrelimite.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-bold text-slate-900">Decisão 3: Estratégia de crescimento (30 dias)</p>
                    <p className="mt-2 text-sm text-slate-700">
                      Escolher 2 ações: (1) marmita do dia, (2) parceria com empresa local, (3) treino de venda sugestiva, (4) comunicação local.
                    </p>
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                      Indicador: ticket médio + clientes por dia + faturamento semanal.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-bold text-slate-900">Checklist de fechamento semanal</p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-700">
                      <li>Atualizar caixa global (3 bancos).</li>
                      <li>Registrar despesas financeiras da semana.</li>
                      <li>Confirmar provisões (impostos e fornecedores).</li>
                      <li>Validar retiradas dentro da regra.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 shadow-sm text-white">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Nota final</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-100">
                  Se você quiser, eu adapto este componente para aceitar dados dinâmicos (JSON), com campos editáveis, para você só colar os números do
                  extrato e o painel se atualiza automaticamente.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-slate-500">
          <p>
            Observação: este painel foi montado com os valores presentes no teu texto. Se você quiser que eu deixe 100% fiel ao extrato, me manda os
            saldos finais de Cresol e Stone por mês (Dez, Jan e Fev) e eu ajusto a parte multi-banco e a linha de caixa global.
          </p>
        </div>
      </div>
    </div>
  );
}