// Timezone utilities

export const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'India (IST)', offset: '+05:30' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: '+04:00' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: '+08:00' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)', offset: '+09:00' },
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: '+01:00' },
  { value: 'America/New_York', label: 'New York (EST)', offset: '-05:00' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)', offset: '-08:00' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)', offset: '+10:00' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)', offset: '+12:00' },
];

const TIMEZONE_STORAGE_KEY = 'app_timezone';

export function getStoredTimezone(): string {
  if (typeof window === 'undefined') return 'Asia/Kolkata';
  return localStorage.getItem(TIMEZONE_STORAGE_KEY) || 'Asia/Kolkata';
}

export function setStoredTimezone(timezone: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TIMEZONE_STORAGE_KEY, timezone);
  }
}

// Ensure date is treated as UTC if it doesn't have timezone info
function ensureUTC(date: Date | string): Date {
  if (typeof date === 'string') {
    // If no timezone indicator (Z or +/-), treat as UTC
    if (!date.endsWith('Z') && !date.match(/[+-]\d{2}:\d{2}$/)) {
      return new Date(date + 'Z');
    }
    return new Date(date);
  }
  return date;
}

export function formatInTimezone(date: Date | string, formatStr: string, timezone?: string): string {
  const tz = timezone || getStoredTimezone();
  const dateObj = ensureUTC(date);
  
  try {
    // Custom formatting for common patterns
    if (formatStr === 'yyyy-MM-dd') {
      return dateObj.toLocaleDateString('en-CA', { timeZone: tz });
    }

    if (formatStr === 'HH:mm') {
      return dateObj.toLocaleTimeString('en-GB', { 
        timeZone: tz, 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }

    if (formatStr === 'hh:mm a') {
      return dateObj.toLocaleTimeString('en-US', { 
        timeZone: tz, 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }

    if (formatStr === 'dd MMM, hh:mm a') {
      const day = dateObj.toLocaleDateString('en-GB', { timeZone: tz, day: '2-digit' });
      const month = dateObj.toLocaleDateString('en-GB', { timeZone: tz, month: 'short' });
      const time = dateObj.toLocaleTimeString('en-US', { 
        timeZone: tz, 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      return `${day} ${month}, ${time}`;
    }

    if (formatStr === 'dd MMM, yyyy') {
      return dateObj.toLocaleDateString('en-GB', { 
        timeZone: tz, 
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }

    // Fallback to basic Intl formatter
    return dateObj.toLocaleString('en-GB', { timeZone: tz });
  } catch (error) {
    console.error('Timezone format error:', error);
    return dateObj.toLocaleString();
  }
}

export function getDateInTimezone(timezone?: string): Date {
  return new Date();
}

export function getDateStringInTimezone(timezone?: string): string {
  const tz = timezone || getStoredTimezone();
  const now = new Date();
  return now.toLocaleDateString('en-CA', { timeZone: tz }); // Returns YYYY-MM-DD format
}

export function getTimeStringInTimezone(timezone?: string): string {
  const tz = timezone || getStoredTimezone();
  const now = new Date();
  return now.toLocaleTimeString('en-GB', { 
    timeZone: tz, 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}
