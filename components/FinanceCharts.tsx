"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Transaction } from "@prisma/client";

interface FinanceChartsProps {
  transactions: Transaction[];
}

// Новая неоновая палитра для темной темы
const COLORS = [
  "#6366f1", // Indigo
  "#06b6d4", // Cyan
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#10b981", // Emerald
];

export default function FinanceCharts({ transactions }: FinanceChartsProps) {
  // 1. Данные для круговой диаграммы (Расходы по категориям)
  const expenseByCategory = transactions
    .filter((t) => t.type === "expense" && t.status === "paid")
    .reduce((acc: any, curr) => {
      const cat = curr.category || "Прочее";
      const existing = acc.find((item: any) => item.name === cat);
      if (existing) {
        existing.value += Math.abs(curr.amount);
      } else {
        acc.push({ name: cat, value: Math.abs(curr.amount) });
      }
      return acc;
    }, []);

  // 2. Данные для сравнения Доход vs Расход
  const incomeTotal = transactions
    .filter((t) => t.type === "income" && t.status === "paid")
    .reduce((acc, t) => acc + t.amount, 0);

  const expenseTotal = transactions
    .filter((t) => t.type === "expense" && t.status === "paid")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const summaryData = [
    { name: "Баланс", Доход: incomeTotal, Расход: expenseTotal },
  ];

  // Кастомный стиль тултипа для темной темы
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm font-bold"
              style={{ color: entry.color || entry.fill }}
            >
              {entry.name}: {entry.value.toLocaleString()} ₽
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Секция: Расходы по категориям */}
      <div className="bg-[#0f172a]/40 p-8 rounded-[2.5rem] border border-white/5 flex flex-col group hover:border-white/10 transition-all">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></span>
          Распределение затрат
        </h3>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseByCategory}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {expenseByCategory.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="outline-none focus:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                formatter={(value) => (
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Секция: Баланс операций */}
      <div className="bg-[#0f172a]/40 p-8 rounded-[2.5rem] border border-white/5 flex flex-col group hover:border-white/10 transition-all">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
          Сравнение потоков
        </h3>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaryData} barGap={12}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.03)"
              />
              <XAxis dataKey="name" hide />
              <YAxis
                tick={{ fontSize: 10, fill: "#475569", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.02)" }}
                content={<CustomTooltip />}
              />
              <Legend
                iconType="circle"
                formatter={(value) => (
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="Доход"
                fill="#10b981"
                radius={[12, 12, 12, 12]}
                barSize={40}
                className="drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]"
              />
              <Bar
                dataKey="Расход"
                fill="#f43f5e"
                radius={[12, 12, 12, 12]}
                barSize={40}
                className="drop-shadow-[0_0_8px_rgba(244,63,94,0.2)]"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
