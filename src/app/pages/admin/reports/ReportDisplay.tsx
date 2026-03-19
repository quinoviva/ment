// src/app/pages/admin/reports/ReportDisplay.tsx
import React from 'react';
import { TreeData } from '../../utils/storage';
import { ReportStats, ReportChartData } from './utils/reportUtils';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportDisplayProps {
  municipality: string;
  timestamp: Date;
  reportId: string;
  stats: ReportStats | null;
  chartData: ReportChartData | null;
  trees: TreeData[];
}

const COLORS = ['#15803d', '#166534', '#22c55e', '#4ade80', '#86efac', '#1e293b', '#64748b'];

const ReportDisplay: React.FC<ReportDisplayProps> = ({ municipality, timestamp, reportId, stats, chartData }) => {
  const displayStats = stats || { totalTrees: 0, healthiestBarangay: 'N/A', top3Species: ['N/A', 'N/A', 'N/A'] };
  const displayChartData = chartData || { speciesDistribution: [], healthStatusPerBarangay: [] };

  return (
    <div 
      id="report-to-print" 
      style={{ 
        width: '1050px', // Slightly wider for better A4 proportion
        padding: '80px 70px', // Increased padding for "Executive" feel
        backgroundColor: '#ffffff',
        color: '#1e293b',
        fontFamily: "'Inter', 'Segoe UI', 'Helvetica', sans-serif",
        margin: '0 auto',
      }}
    >
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '6px solid #15803d', paddingBottom: '40px', marginBottom: '60px' }}>
        <div style={{ flex: 2 }}>
          <h1 style={{ fontSize: '54px', fontWeight: 900, color: '#15803d', margin: 0, letterSpacing: '-2px', lineHeight: '1' }}>{municipality}</h1>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#475569', margin: '12px 0 0 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Tree Inventory & Environmental Analytics</h2>
        </div>
        <div style={{ flex: 1, textAlign: 'right', fontSize: '15px', color: '#94a3b8', lineHeight: '2' }}>
          <p style={{ margin: 0 }}><strong>DOCUMENT ID:</strong> <span style={{ color: '#475569' }}>{reportId}</span></p>
          <p style={{ margin: 0 }}><strong>DATE ISSUED:</strong> <span style={{ color: '#475569' }}>{timestamp.toLocaleDateString()}</span></p>
          <p style={{ margin: 0 }}><strong>TIME:</strong> <span style={{ color: '#475569' }}>{timestamp.toLocaleTimeString()}</span></p>
        </div>
      </div>

      {/* KPI METRICS - Larger Numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginBottom: '80px' }}>
        <div style={{ background: '#f8fafc', padding: '40px 30px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Total Trees</span>
          <div style={{ fontSize: '72px', fontWeight: 900, color: '#15803d', lineHeight: '1', marginTop: '15px' }}>{displayStats.totalTrees}</div>
        </div>
        <div style={{ background: '#f8fafc', padding: '40px 30px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Top Area</span>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', marginTop: '25px', lineHeight: '1.2' }}>{displayStats.healthiestBarangay}</div>
        </div>
        <div style={{ background: '#f8fafc', padding: '40px 30px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Main Species</span>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', marginTop: '25px', lineHeight: '1.2' }}>{displayStats.top3Species[0]}</div>
        </div>
      </div>

      {/* CHARTS - More Spacing around titles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginBottom: '100px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '30px', padding: '45px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '40px', textAlign: 'center', color: '#334155' }}>Biodiversity Mix</h3>
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie data={displayChartData.speciesDistribution} innerRadius={85} outerRadius={130} paddingAngle={6} dataKey="count" isAnimationActive={false}>
                {displayChartData.speciesDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '30px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '30px', padding: '45px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '40px', textAlign: 'center', color: '#334155' }}>Health Status per Barangay</h3>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={displayChartData.healthStatusPerBarangay}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="barangay" axisLine={false} tickLine={false} fontSize={13} />
              <YAxis axisLine={false} tickLine={false} fontSize={13} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '30px' }} />
              <Bar dataKey="Excellent" stackId="a" fill="#15803d" isAnimationActive={false} />
              <Bar dataKey="Good" stackId="a" fill="#22c55e" isAnimationActive={false} />
              <Bar dataKey="Fair" stackId="a" fill="#eab308" isAnimationActive={false} />
              <Bar dataKey="Poor" stackId="a" fill="#f97316" isAnimationActive={false} />
              <Bar dataKey="Dead" stackId="a" fill="#ef4444" isAnimationActive={false} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SIGNATURE AREA - Clean Spacing */}
      <div style={{ marginTop: '120px', display: 'flex', justifyContent: 'space-between', padding: '0 60px' }}>
        <div style={{ width: '300px', textAlign: 'center' }}>
          <div style={{ borderBottom: '2.5px solid #1e293b', marginBottom: '15px' }}></div>
          <p style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#1e293b' }}>OFFICE IN-CHARGE</p>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>MENRO Forestry Division</p>
        </div>
        <div style={{ width: '300px', textAlign: 'center' }}>
          <div style={{ borderBottom: '2.5px solid #1e293b', marginBottom: '15px' }}></div>
          <p style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#1e293b' }}>MUNICIPAL MAYOR</p>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>LGU Authority</p>
        </div>
      </div>
    </div>
  );
};

export default ReportDisplay;