export function calculateAge(datePlanted: string): string {
  if (!datePlanted) return "";
  
  const planted = new Date(datePlanted);
  const now = new Date();
  
  // Calculate difference in milliseconds
  const diffTime = now.getTime() - planted.getTime();
  if (diffTime < 0) return "Not yet planted";
  
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  }
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''}`;
  }
  
  const diffMonths = (now.getFullYear() - planted.getFullYear()) * 12 + (now.getMonth() - planted.getMonth());
  if (diffMonths < 12) {
    const months = diffMonths <= 0 ? 0 : diffMonths;
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  
  const diffYears = now.getFullYear() - planted.getFullYear();
  const monthDiff = now.getMonth() - planted.getMonth();
  const dayDiff = now.getDate() - planted.getDate();
  
  let exactYears = diffYears;
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    exactYears--;
  }
  
  return `${exactYears} year${exactYears !== 1 ? 's' : ''}`;
}

export function calculateAgeInYears(datePlanted: string): number {
  if (!datePlanted) return 0;
  const planted = new Date(datePlanted);
  const now = new Date();
  let diffYears = now.getFullYear() - planted.getFullYear();
  const monthDiff = now.getMonth() - planted.getMonth();
  const dayDiff = now.getDate() - planted.getDate();
  
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    diffYears--;
  }
  return diffYears > 0 ? diffYears : 0;
}
