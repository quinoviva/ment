// src/app/pages/admin/reports/ReportFilters.tsx
import React from 'react';
import { TreeData } from '../../utils/storage'; // Assuming TreeData is exported

interface ReportFiltersProps {
  filters: {
    barangay: string;
    species: string;
    healthStatus: string;
  };
  onFilterChange: (newFilters: { barangay: string; species: string; healthStatus: string }) => void;
  allTrees: TreeData[];
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ filters, onFilterChange, allTrees }) => {
  const uniqueSpecies = [...new Set(allTrees.map(tree => tree.species).filter(Boolean))].sort();
  const uniqueHealthStatuses = ["Excellent", "Good", "Fair", "Poor", "Dead"];
  // Function to extract barangay from address string
  const extractBarangay = (address: string | undefined): string => {
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

  const extractUniqueBarangays = (trees: TreeData[]): string[] => {
    const barangaySet = new Set<string>();
    trees.forEach(tree => {
      const barangay = extractBarangay(tree.address);
      barangaySet.add(barangay);
    });
    return Array.from(barangaySet).sort();
  };

  const uniqueBarangays = extractUniqueBarangays(allTrees);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-100 rounded-lg shadow-inner">
      <div>
        <label htmlFor="barangay" className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
        <select
          id="barangay"
          name="barangay"
          value={filters.barangay}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-forest-green focus:border-forest-green"
        >
          <option value="">All Barangays</option>
          {uniqueBarangays.map(barangay => (
            <option key={barangay} value={barangay}>{barangay}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-1">Species</label>
        <select
          id="species"
          name="species"
          value={filters.species}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-forest-green focus:border-forest-green"
        >
          <option value="">All Species</option>
          {uniqueSpecies.map(species => (
            <option key={species} value={species}>{species}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="healthStatus" className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
        <select
          id="healthStatus"
          name="healthStatus"
          value={filters.healthStatus}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-forest-green focus:border-forest-green"
        >
          <option value="">All Statuses</option>
          {uniqueHealthStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ReportFilters;
