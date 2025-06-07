import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { PieChart, BarChart, RefreshCw } from "lucide-react";
import rockImg from "../assets/rock.png";
import paperImg from "../assets/paper.png";
import scissorsImg from "../assets/scissors.png";

interface EntityDistributionProps {
  className?: string;
}

export const EntityDistribution: React.FC<EntityDistributionProps> = ({
  className = "",
}) => {
  const { entities } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartType, setChartType] = React.useState<"pie" | "bar">("pie");

  // Filter for only alive entities
  const aliveEntities = entities.filter((e) => e.isAlive);

  // Entity type counts
  const rockCount = aliveEntities.filter((e) => e.type === "rock").length;
  const paperCount = aliveEntities.filter((e) => e.type === "paper").length;
  const scissorsCount = aliveEntities.filter(
    (e) => e.type === "scissors"
  ).length;

  // Draw the charts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (chartType === "pie") {
      drawPieChart(ctx);
    } else {
      drawBarChart(ctx);
    }
  }, [entities, rockCount, paperCount, scissorsCount, chartType]);

  const drawPieChart = (ctx: CanvasRenderingContext2D) => {
    const centerX = canvasRef.current!.width / 2;
    const centerY = canvasRef.current!.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Data for the pie chart
    const data = [
      { label: "Rocks", value: rockCount, color: "#ef4444" },
      { label: "Papers", value: paperCount, color: "#3b82f6" },
      { label: "Scissors", value: scissorsCount, color: "#eab308" },
    ].filter((item) => item.value > 0);

    const total = data.reduce((sum, item) => sum + item.value, 0);

    // No data case
    if (total === 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "14px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No entities to display", centerX, centerY);
      return;
    }

    // Draw slices
    let startAngle = 0;
    data.forEach((item) => {
      const sliceAngle = (2 * Math.PI * item.value) / total;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = item.color;
      ctx.fill();

      // Draw slice label
      if (item.value / total > 0.05) {
        // Only draw label if slice is big enough
        const labelAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

        ctx.fillStyle = "white";
        ctx.font = "bold 12px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.value.toString(), labelX, labelY);
      }

      startAngle += sliceAngle;
    });

    // Draw a white circle in the middle for a donut chart
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fill();

    // Draw total in the center
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total.toString(), centerX, centerY - 10);

    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("Entities", centerX, centerY + 10);
  };

  const drawBarChart = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current!;
    const width = canvas.width;
    const height = canvas.height;

    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Set up bar data
    const data = [
      {
        label: "Rock",
        value: rockCount,
        color: "#ef4444",
      },
      {
        label: "Paper",
        value: paperCount,
        color: "#3b82f6",
      },
      {
        label: "Scissors",
        value: scissorsCount,
        color: "#eab308",
      },
    ];

    // Find the maximum value for scaling
    const maxValue = Math.max(rockCount, paperCount, scissorsCount);

    // No data case
    if (maxValue === 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "14px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No entities to display", width / 2, height / 2);
      return;
    }

    // Calculate bar width and spacing
    const barCount = data.length; // One bar per category
    const barWidth = (chartWidth - (barCount + 1) * 10) / barCount;

    // Draw the bars
    data.forEach((item, index) => {
      const x = padding.left + index * 2 * (barWidth + 10) + 15;

      // Bar
      const height = (item.value / maxValue) * chartHeight;
      const y = height - padding.bottom - height;

      ctx.fillStyle = item.color;
      ctx.fillRect(x, y, barWidth, height);

      // Draw values on top of bars if they're tall enough
      if (height > 20) {
        ctx.fillStyle = "white";
        ctx.font = "bold 10px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);
      }

      // Draw category label
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.label, x + barWidth / 2, height - padding.bottom + 15);
    });
  };

  return (
    <motion.div
      className={`entity-distribution ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-semibold">Entity Distribution</h3>
        <div className="flex gap-1">
          <motion.button
            className={`p-1 rounded ${
              chartType === "pie"
                ? "bg-white/20"
                : "bg-white/5 hover:bg-white/10"
            }`}
            onClick={() => setChartType("pie")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <PieChart size={16} />
          </motion.button>
          <motion.button
            className={`p-1 rounded ${
              chartType === "bar"
                ? "bg-white/20"
                : "bg-white/5 hover:bg-white/10"
            }`}
            onClick={() => setChartType("bar")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <BarChart size={16} />
          </motion.button>
        </div>
      </div>

      <div className="chart-container relative">
        <canvas
          ref={canvasRef}
          width={280}
          height={200}
          className="w-full h-auto"
        ></canvas>

        {aliveEntities.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <RefreshCw size={24} className="mx-auto mb-2 opacity-50" />
              <div className="text-sm">No entities to display</div>
            </div>
          </div>
        )}
      </div>

      <div className="stats grid grid-cols-2 gap-2 mt-2">
        <div className="bg-white/5 p-2 rounded">
          <div className="text-xs text-blue-300 mb-1">Entity Counts</div>
          <div className="flex justify-between text-xs">
            <span className="flex items-center">
              <img src={rockImg} className="w-4 h-4 mr-1" alt="Rock" />{" "}
              {rockCount}
            </span>
            <span className="flex items-center">
              <img src={paperImg} className="w-4 h-4 mr-1" alt="Paper" />{" "}
              {paperCount}
            </span>
            <span className="flex items-center">
              <img src={scissorsImg} className="w-4 h-4 mr-1" alt="Scissors" />{" "}
              {scissorsCount}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
