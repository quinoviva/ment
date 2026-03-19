// src/app/pages/admin/reports/utils/reportUtils.ts
import { TreeData } from '../../../utils/storage'; // Assuming TreeData is exported

export interface ReportStats {
  totalTrees: number;
  healthiestBarangay: string;
  top3Species: string[];
}

export interface ReportChartData {
  speciesDistribution: { name: string; count: number }[];
  healthStatusPerBarangay: { barangay: string; Excellent: number; Good: number; Fair: number; Poor: number; Dead: number }[];
}

// Helper to extract barangay from address, similar to ReportFilters
const getBarangayFromAddress = (address: string | undefined): string => {
  if (!address) return 'Unknown Barangay';
  const parts = address.split(',');
  if (parts.length > 0) {
    const potentialBarangay = parts[0].trim();
    // Prioritize if it starts with "Barangay ". Otherwise, take the first part before the comma.
    // This heuristic assumes the barangay name is consistently the first component of the address string.
    if (potentialBarangay.toLowerCase().startsWith("barangay ")) {
      return potentialBarangay;
    }
    if (potentialBarangay) { // If the first part is not empty after trim
      return potentialBarangay;
    }
  }
  return 'Unknown Barangay'; // Default if parsing fails or address is just whitespace
};

export const generateReportData = (trees: TreeData[]): { stats: ReportStats; chartData: ReportChartData } => {
  const stats: ReportStats = {
    totalTrees: trees.length,
    healthiestBarangay: 'N/A',
    top3Species: ['N/A', 'N/A', 'N/A'],
  };

  const speciesDistributionMap = new Map<string, number>();
  const healthStatusByBarangayMap = new Map<string, { [key: string]: number }>();
  const healthCountsPerBarangay = new Map<string, { Excellent: number; Good: number; Fair: number; Poor: number; Dead: number }>();

  const healthStatuses = ["Excellent", "Good", "Fair", "Poor", "Dead"];

  trees.forEach(tree => {
    // Species Distribution
    speciesDistributionMap.set(tree.species, (speciesDistributionMap.get(tree.species) || 0) + 1);

    // Health Status per Barangay
    const barangay = getBarangayFromAddress(tree.address);
    if (!healthCountsPerBarangay.has(barangay)) {
      healthCountsPerBarangay.set(barangay, { Excellent: 0, Good: 0, Fair: 0, Poor: 0, Dead: 0 });
    }
    const currentBarangayHealth = healthCountsPerBarangay.get(barangay)!;
    currentBarangayHealth[tree.healthStatus] = (currentBarangayHealth[tree.healthStatus] || 0) + 1;
  });

  // Calculate Top 3 Species
  const sortedSpecies = Array.from(speciesDistributionMap.entries())
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 3)
    .map(([species]) => species);
  stats.top3Species = sortedSpecies.length > 0 ? sortedSpecies : ['N/A', 'N/A', 'N/A'];

  // Calculate Healthiest Barangay
  let maxExcellentPercentage = -1;
  let healthiestBarangayName = 'N/A';

  healthCountsPerBarangay.forEach((counts, barangayName) => {
    const totalTreesInBarangay = Object.values(counts).reduce((sum, count) => sum + count, 0);
    if (totalTreesInBarangay > 0) {
      const excellentCount = counts.Excellent || 0;
      const excellentPercentage = (excellentCount / totalTreesInBarangay) * 100;
      if (excellentPercentage > maxExcellentPercentage) {
        maxExcellentPercentage = excellentPercentage;
        healthiestBarangayName = barangayName;
      }
    }
  });
  stats.healthiestBarangay = healthiestBarangayName;


  // Format data for charts
  const chartData: ReportChartData = {
    speciesDistribution: Array.from(speciesDistributionMap, ([name, count]) => ({ name, count })),
    healthStatusPerBarangay: Array.from(healthCountsPerBarangay, ([barangayName, counts]) => ({
      barangay: barangayName,
      ...counts,
    })),
  };

  return { stats, chartData };
};
