import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsChart = ({ reviews }) => {
  const hasReviews = reviews && reviews.length > 0;

  if (!hasReviews) {
    return (
      <div className="w-full h-64 md:h-72 flex flex-col items-center justify-center p-6 text-center rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800">
        <div className="p-3 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 mb-3 border border-primary-500/20">
          <LineElement className="w-6 h-6 hidden" />
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Review History Recorded Yet</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">
          Perform a code review or audit a GitHub repository to generate your live quality, security, and performance trajectory.
        </p>
        <a 
          href="/code-review" 
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white transition-all shadow-sm shadow-primary-500/20"
        >
          Analyze First Code Snippet
        </a>
      </div>
    );
  }

  // Sort real reviews chronologically ascending for the timeline
  const sortedReviews = [...reviews].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const labels = sortedReviews.map((r, idx) => {
    if (r.createdAt && typeof r.createdAt === 'string' && r.createdAt.includes('T')) {
      return new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return r.createdAt || `Review #${idx + 1}`;
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Overall Quality',
        data: sortedReviews.map(r => r.score ?? r.overallScore ?? 0),
        borderColor: 'rgb(14, 165, 233)', // Primary cyan/blue 500
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Security Score',
        data: sortedReviews.map(r => r.securityScore ?? 0),
        borderColor: 'rgb(168, 85, 247)', // Purple 500
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.35,
      },
      {
        label: 'Performance Score',
        data: sortedReviews.map(r => r.performanceScore ?? 0),
        borderColor: 'rgb(16, 185, 129)', // Emerald 500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.35,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8', // slate-400
          font: {
            size: 11,
            weight: '600'
          },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)' // faint slate grid
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 }
        }
      }
    }
  };

  return (
    <div className="w-full h-64 md:h-72 relative">
      <Line options={options} data={data} />
    </div>
  );
};

export default AnalyticsChart;
