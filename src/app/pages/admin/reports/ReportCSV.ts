// src/app/pages/admin/reports/ReportCSV.ts
import { TreeData } from "../../../utils/storage";

export const exportToCSV = (trees: TreeData[]) => {
  const headers = ['Species', 'ID', 'Participants', 'Health Status', 'Age', 'Date Planted', 'Address', 'Date Added', 'Added By'];
  
  const rows = trees.map(tree => [
    tree.species,
    tree.id,
    `"${tree.name.replace(/"/g, '""')}"`,
    tree.healthStatus,
    tree.age,
    tree.datePlanted || 'N/A',
    `"${tree.address?.replace(/"/g, '""') || ''}"`, // Escape commas in address
    tree.dateAdded,
    tree.addedBy
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n'); // Use \n instead of a literal line break

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `MENRO_Export_${new Date().toLocaleDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};