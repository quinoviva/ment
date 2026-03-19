// src/app/pages/admin/reports/ReportGenerator.tsx
import React, { useState, useEffect } from 'react';
import { storage, TreeData } from "../../../utils/storage";
import ReportFilters from './ReportFilters';
import ReportDisplay from './ReportDisplay';
import { generateReportData, ReportStats, ReportChartData } from './utils/reportUtils';
import { generatePDF } from './ReportPDF'; 
import { exportToCSV } from './ReportCSV'; 
import { toast } from 'sonner';

const ReportGenerator: React.FC = () => {
  const [allTrees, setAllTrees] = useState<TreeData[]>([]);
  const [filteredTrees, setFilteredTrees] = useState<TreeData[]>([]);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [chartData, setChartData] = useState<ReportChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [filters, setFilters] = useState({
    barangay: '',
    species: '',
    healthStatus: '',
  });

  const municipalityName = "MENRO Pototan";

  useEffect(() => {
    const fetchTrees = async () => {
      try {
        setLoading(true);
        const trees = await storage.getTrees();
        setAllTrees(trees);
        setFilteredTrees(trees);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load database.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrees();
  }, []);

  useEffect(() => {
    let result = [...allTrees];
    if (filters.barangay) {
      result = result.filter(t => t.address?.toLowerCase().includes(filters.barangay.toLowerCase()));
    }
    if (filters.species && filters.species !== 'All') {
      result = result.filter(t => t.species === filters.species);
    }
    if (filters.healthStatus && filters.healthStatus !== 'All') {
      result = result.filter(t => t.healthStatus === filters.healthStatus);
    }
    setFilteredTrees(result);
  }, [filters, allTrees]);

  useEffect(() => {
    if (filteredTrees.length > 0) {
      const { stats, chartData: processed } = generateReportData(filteredTrees);
      setReportStats(stats);
      setChartData(processed);
    }
  }, [filteredTrees]);

  const handleDownloadPDF = async () => {
    if (!reportStats) return;
    setIsGenerating(true);
    toast.loading("Preparing document...", { id: 'pdf' });
    
    const success = await generatePDF("report-to-print", municipalityName, new Date());
    
    if (success) {
      toast.success("PDF Downloaded", { id: 'pdf' });
    } else {
      toast.error("Generation failed. Check for oklch colors in your CSS.", { id: 'pdf' });
    }
    setIsGenerating(false);
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-green-700 font-bold">Accessing Firestore...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Tree Inventory Reports</h1>
        <div className="flex gap-3">
          <button 
            disabled={isGenerating || filteredTrees.length === 0}
            onClick={handleDownloadPDF}
            className="bg-green-700 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-800 disabled:bg-slate-300 transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
          <button 
            onClick={() => exportToCSV(filteredTrees)}
            className="bg-slate-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-slate-700 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <ReportFilters filters={filters} onFilterChange={setFilters} allTrees={allTrees} />
      </div>

      {filteredTrees.length > 0 ? (
        /* The container below is styled explicitly to help the PDF engine */
        <div 
          id="report-to-print" 
          className="bg-white p-6 rounded-lg shadow-sm"
          style={{ backgroundColor: '#ffffff', color: '#000000' }} 
        >
          <ReportDisplay
            municipality={municipalityName}
            timestamp={new Date()}
            reportId={`REP-${Date.now().toString().slice(-6)}`}
            stats={reportStats}
            chartData={chartData}
            trees={filteredTrees}
          />
        </div>
      ) : (
        <div className="p-20 text-center border-2 border-dashed rounded-xl border-slate-200">
          <p className="text-slate-400">No data found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;