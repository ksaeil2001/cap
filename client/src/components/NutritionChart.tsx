import React from 'react';
import Plot from 'react-plotly.js';

interface NutritionData {
  calories: { actual: number; target: number };
  protein: { actual: number; target: number };
  carbs: { actual: number; target: number };
  fat: { actual: number; target: number };
  budget: { actual: number; target: number };
}

interface NutritionChartProps {
  nutritionData: NutritionData;
}

const NutritionChart: React.FC<NutritionChartProps> = ({ nutritionData }) => {
  // 게이지 차트용 데이터 (각 영양소별 달성률)
  const caloriePercentage = Math.round((nutritionData.calories.actual / nutritionData.calories.target) * 100);
  const proteinPercentage = Math.round((nutritionData.protein.actual / nutritionData.protein.target) * 100);
  const carbsPercentage = Math.round((nutritionData.carbs.actual / nutritionData.carbs.target) * 100);
  const fatPercentage = Math.round((nutritionData.fat.actual / nutritionData.fat.target) * 100);
  const budgetPercentage = Math.round((nutritionData.budget.actual / nutritionData.budget.target) * 100);

  const gaugeData1 = [
    {
      type: 'indicator',
      mode: 'gauge+number+delta',
      value: caloriePercentage,
      domain: { x: [0, 1], y: [0, 1] },
      title: { text: "칼로리 달성률 (%)", font: { size: 14 } },
      delta: { reference: 100 },
      gauge: {
        axis: { range: [null, 150] },
        bar: { color: caloriePercentage > 100 ? "#EF4444" : "#3B82F6" },
        steps: [
          { range: [0, 50], color: "#F0F9FF" },
          { range: [50, 80], color: "#DBEAFE" },
          { range: [80, 100], color: "#93C5FD" }
        ],
        threshold: {
          line: { color: "#1D4ED8", width: 4 },
          thickness: 0.75,
          value: 100
        }
      }
    }
  ];

  const gaugeData2 = [
    {
      type: 'indicator',
      mode: 'gauge+number+delta',
      value: proteinPercentage,
      domain: { x: [0, 1], y: [0, 1] },
      title: { text: "단백질 달성률 (%)", font: { size: 14 } },
      delta: { reference: 100 },
      gauge: {
        axis: { range: [null, 150] },
        bar: { color: proteinPercentage > 100 ? "#EF4444" : "#8B5CF6" },
        steps: [
          { range: [0, 50], color: "#FAF5FF" },
          { range: [50, 80], color: "#E9D5FF" },
          { range: [80, 100], color: "#C4B5FD" }
        ],
        threshold: {
          line: { color: "#7C3AED", width: 4 },
          thickness: 0.75,
          value: 100
        }
      }
    }
  ];

  const gaugeData3 = [
    {
      type: 'indicator',
      mode: 'gauge+number+delta',
      value: carbsPercentage,
      domain: { x: [0, 1], y: [0, 1] },
      title: { text: "탄수화물 달성률 (%)", font: { size: 14 } },
      delta: { reference: 100 },
      gauge: {
        axis: { range: [null, 150] },
        bar: { color: carbsPercentage > 100 ? "#EF4444" : "#F59E0B" },
        steps: [
          { range: [0, 50], color: "#FFFBEB" },
          { range: [50, 80], color: "#FEF3C7" },
          { range: [80, 100], color: "#FCD34D" }
        ],
        threshold: {
          line: { color: "#D97706", width: 4 },
          thickness: 0.75,
          value: 100
        }
      }
    }
  ];

  const gaugeData4 = [
    {
      type: 'indicator',
      mode: 'gauge+number+delta',
      value: fatPercentage,
      domain: { x: [0, 1], y: [0, 1] },
      title: { text: "지방 달성률 (%)", font: { size: 14 } },
      delta: { reference: 100 },
      gauge: {
        axis: { range: [null, 150] },
        bar: { color: fatPercentage > 100 ? "#EF4444" : "#10B981" },
        steps: [
          { range: [0, 50], color: "#F0FDF4" },
          { range: [50, 80], color: "#D1FAE5" },
          { range: [80, 100], color: "#6EE7B7" }
        ],
        threshold: {
          line: { color: "#059669", width: 4 },
          thickness: 0.75,
          value: 100
        }
      }
    }
  ];

  const budgetGaugeData = [
    {
      type: 'indicator',
      mode: 'gauge+number+delta',
      value: budgetPercentage,
      domain: { x: [0, 1], y: [0, 1] },
      title: { text: "예산 사용률 (%)", font: { size: 16 } },
      delta: { reference: 100 },
      gauge: {
        axis: { range: [null, 150] },
        bar: { color: budgetPercentage > 100 ? "#EF4444" : "#10B981" },
        steps: [
          { range: [0, 50], color: "#F0FDF4" },
          { range: [50, 80], color: "#FEF3C7" },
          { range: [80, 100], color: "#FEE2E2" }
        ],
        threshold: {
          line: { color: "#DC2626", width: 4 },
          thickness: 0.75,
          value: 100
        }
      }
    }
  ];

  // 바 차트용 데이터
  const barData = [
    {
      x: ['칼로리', '단백질', '탄수화물', '지방'],
      y: [
        nutritionData.calories.actual,
        nutritionData.protein.actual,
        nutritionData.carbs.actual,
        nutritionData.fat.actual
      ],
      name: '현재',
      type: 'bar',
      marker: {
        color: ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981']
      }
    },
    {
      x: ['칼로리', '단백질', '탄수화물', '지방'],
      y: [
        nutritionData.calories.target,
        nutritionData.protein.target,
        nutritionData.carbs.target,
        nutritionData.fat.target
      ],
      name: '목표',
      type: 'bar',
      marker: {
        color: ['#93C5FD', '#C4B5FD', '#FCD34D', '#6EE7B7']
      }
    }
  ];

  const gaugeLayout = {
    height: 200,
    margin: { t: 40, b: 0, l: 0, r: 0 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)'
  };

  const barLayout = {
    title: {
      text: '영양소 현재 vs 목표',
      font: { size: 16, color: '#374151' }
    },
    xaxis: { title: { text: '영양소' } },
    yaxis: { title: { text: '수치' } },
    height: 350,
    margin: { t: 50, b: 50, l: 50, r: 50 },
    barmode: 'group',
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)'
  };

  const budgetGaugeLayout = {
    height: 250,
    margin: { t: 40, b: 0, l: 0, r: 0 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)'
  };

  return (
    <div className="space-y-6">
      {/* 영양소별 게이지 차트 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg">
          <Plot
            data={gaugeData1}
            layout={gaugeLayout}
            style={{ width: '100%', height: '200px' }}
            config={{ displayModeBar: false, responsive: true }}
          />
          <div className="text-center text-sm text-gray-600 pb-2">
            {nutritionData.calories.actual.toFixed(0)} / {nutritionData.calories.target.toFixed(0)} kcal
          </div>
        </div>

        <div className="bg-white rounded-lg">
          <Plot
            data={gaugeData2}
            layout={gaugeLayout}
            style={{ width: '100%', height: '200px' }}
            config={{ displayModeBar: false, responsive: true }}
          />
          <div className="text-center text-sm text-gray-600 pb-2">
            {nutritionData.protein.actual.toFixed(0)} / {nutritionData.protein.target.toFixed(0)} g
          </div>
        </div>

        <div className="bg-white rounded-lg">
          <Plot
            data={gaugeData3}
            layout={gaugeLayout}
            style={{ width: '100%', height: '200px' }}
            config={{ displayModeBar: false, responsive: true }}
          />
          <div className="text-center text-sm text-gray-600 pb-2">
            {nutritionData.carbs.actual.toFixed(0)} / {nutritionData.carbs.target.toFixed(0)} g
          </div>
        </div>

        <div className="bg-white rounded-lg">
          <Plot
            data={gaugeData4}
            layout={gaugeLayout}
            style={{ width: '100%', height: '200px' }}
            config={{ displayModeBar: false, responsive: true }}
          />
          <div className="text-center text-sm text-gray-600 pb-2">
            {nutritionData.fat.actual.toFixed(0)} / {nutritionData.fat.target.toFixed(0)} g
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 바 차트 - 현재 vs 목표 */}
        <div className="bg-white rounded-lg p-4">
          <Plot
            data={barData}
            layout={barLayout}
            style={{ width: '100%', height: '350px' }}
            config={{ displayModeBar: false, responsive: true }}
          />
        </div>

        {/* 예산 게이지 차트 */}
        <div className="bg-white rounded-lg p-4">
          <Plot
            data={budgetGaugeData}
            layout={budgetGaugeLayout}
            style={{ width: '100%', height: '250px' }}
            config={{ displayModeBar: false, responsive: true }}
          />
          <div className="text-center mt-2 text-sm text-gray-600">
            ₩{nutritionData.budget.actual.toLocaleString()} / ₩{nutritionData.budget.target.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionChart;