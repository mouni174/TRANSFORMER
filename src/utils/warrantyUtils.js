// Reusable 1-Year Warranty Calculation and Status Utility

/**
 * Calculates warranty expiry date exactly 1 calendar year from service date.
 * Avoids timezone manipulation by using pure string YYYY-MM-DD calendar math.
 * Handles Feb 29 leap year transition safely (Feb 29 -> Feb 28 of non-leap year).
 *
 * @param {string} serviceDateStr - Date string in YYYY-MM-DD format
 * @returns {string} Expiry date string in YYYY-MM-DD format
 */
export const calculateWarrantyExpiry = (serviceDateStr) => {
  if (!serviceDateStr) return '';

  const parts = serviceDateStr.split('-');
  if (parts.length !== 3) return '';

  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10);
  let day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return '';

  const targetYear = year + 1;

  // Handle Feb 29 leap year transition
  if (month === 2 && day === 29) {
    const isTargetLeapYear =
      (targetYear % 4 === 0 && targetYear % 100 !== 0) || targetYear % 400 === 0;
    if (!isTargetLeapYear) {
      day = 28;
    }
  }

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');

  return `${targetYear}-${mm}-${dd}`;
};

/**
 * Determines warranty status based on calendar date difference with today.
 *
 * ACTIVE: Expiry is > 30 days away OR expiry date is today (daysLeft >= 31 || daysLeft === 0).
 * EXPIRING_SOON: Expiry is within the next 30 days and has not expired (1 <= daysLeft <= 30).
 * EXPIRED: Expiry date is before today (daysLeft < 0).
 *
 * @param {string} warrantyExpiryDateStr - Date string in YYYY-MM-DD format
 * @returns {{ status: string, label: string, daysLeft: number, daysText: string, badgeClass: string }}
 */
export const getWarrantyStatus = (warrantyExpiryDateStr) => {
  if (!warrantyExpiryDateStr) {
    return {
      status: 'NO_WARRANTY',
      label: 'No Warranty',
      daysLeft: 0,
      daysText: 'No warranty record',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  }

  const parts = warrantyExpiryDateStr.split('-');
  if (parts.length !== 3) {
    return {
      status: 'INVALID',
      label: 'Invalid Date',
      daysLeft: 0,
      daysText: 'Invalid Date',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  }

  // Current calendar date at midnight
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Expiry calendar date at midnight
  const expYear = parseInt(parts[0], 10);
  const expMonth = parseInt(parts[1], 10) - 1; // 0-indexed
  const expDay = parseInt(parts[2], 10);
  const expiryDate = new Date(expYear, expMonth, expDay);

  const diffTime = expiryDate.getTime() - today.getTime();
  const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    const daysSince = Math.abs(daysLeft);
    return {
      status: 'EXPIRED',
      label: 'Expired Warranty',
      daysLeft,
      daysText: `${daysSince} day${daysSince === 1 ? '' : 's'} expired`,
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
    };
  } else if (daysLeft === 0) {
    return {
      status: 'ACTIVE',
      label: 'Active Warranty (Expires Today)',
      daysLeft: 0,
      daysText: 'Expires Today',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  } else if (daysLeft >= 1 && daysLeft <= 30) {
    return {
      status: 'EXPIRING_SOON',
      label: 'Expiring Soon',
      daysLeft,
      daysText: `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  } else {
    // daysLeft >= 31
    return {
      status: 'ACTIVE',
      label: 'Active Warranty',
      daysLeft,
      daysText: `Active (${daysLeft} days left)`,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
};

/**
 * Formats YYYY-MM-DD string into human-readable format like "12 Sep 2027".
 */
export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const d = new Date(year, month, day);
  if (isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
