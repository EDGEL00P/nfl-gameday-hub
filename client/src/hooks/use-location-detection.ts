import { useState, useEffect } from "react";

interface LocationInfo {
  country: string;
  countryCode: string;
  timezone: string;
  currency: string;
  language: string;
}

const COUNTRY_DATA: Record<string, { currency: string; language: string }> = {
  US: { currency: "USD", language: "en" },
  GB: { currency: "GBP", language: "en" },
  AU: { currency: "AUD", language: "en" },
  NZ: { currency: "NZD", language: "en" },
  CA: { currency: "CAD", language: "en" },
  DE: { currency: "EUR", language: "de" },
  FR: { currency: "EUR", language: "fr" },
  ES: { currency: "EUR", language: "es" },
  IT: { currency: "EUR", language: "it" },
  JP: { currency: "JPY", language: "ja" },
  CN: { currency: "CNY", language: "zh" },
  KR: { currency: "KRW", language: "ko" },
  MX: { currency: "MXN", language: "es" },
  BR: { currency: "BRL", language: "pt" },
  IN: { currency: "INR", language: "hi" },
  AE: { currency: "AED", language: "ar" },
  SA: { currency: "SAR", language: "ar" },
};

export function useLocationDetection() {
  const [location, setLocation] = useState<LocationInfo>({
    country: "United States",
    countryCode: "US",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    currency: "USD",
    language: navigator.language.split("-")[0] || "en",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Get timezone from browser
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const language = navigator.language.split("-")[0] || "en";
        
        // Try to get country from timezone
        let countryCode = "US";
        let country = "United States";
        
        // Map common timezones to countries
        if (timezone.includes("Europe/London")) { countryCode = "GB"; country = "United Kingdom"; }
        else if (timezone.includes("Australia")) { countryCode = "AU"; country = "Australia"; }
        else if (timezone.includes("Pacific/Auckland")) { countryCode = "NZ"; country = "New Zealand"; }
        else if (timezone.includes("Europe/Berlin") || timezone.includes("Europe/Munich")) { countryCode = "DE"; country = "Germany"; }
        else if (timezone.includes("Europe/Paris")) { countryCode = "FR"; country = "France"; }
        else if (timezone.includes("Europe/Madrid")) { countryCode = "ES"; country = "Spain"; }
        else if (timezone.includes("Europe/Rome")) { countryCode = "IT"; country = "Italy"; }
        else if (timezone.includes("Asia/Tokyo")) { countryCode = "JP"; country = "Japan"; }
        else if (timezone.includes("Asia/Shanghai") || timezone.includes("Asia/Hong_Kong")) { countryCode = "CN"; country = "China"; }
        else if (timezone.includes("Asia/Seoul")) { countryCode = "KR"; country = "South Korea"; }
        else if (timezone.includes("America/Mexico_City")) { countryCode = "MX"; country = "Mexico"; }
        else if (timezone.includes("America/Sao_Paulo")) { countryCode = "BR"; country = "Brazil"; }
        else if (timezone.includes("Asia/Kolkata")) { countryCode = "IN"; country = "India"; }
        else if (timezone.includes("Asia/Dubai")) { countryCode = "AE"; country = "United Arab Emirates"; }
        else if (timezone.includes("America/Toronto")) { countryCode = "CA"; country = "Canada"; }

        const countryInfo = COUNTRY_DATA[countryCode] || COUNTRY_DATA.US;

        setLocation({
          country,
          countryCode,
          timezone,
          currency: countryInfo.currency,
          language: language || countryInfo.language,
        });
      } catch (error) {
        console.error("Location detection failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    detectLocation();
  }, []);

  return { location, isLoading };
}

// Currency formatter
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

// Time formatter with timezone
export function formatGameTime(date: string, timezone: string): string {
  return new Date(date).toLocaleTimeString(undefined, {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatGameDate(date: string, timezone: string): string {
  return new Date(date).toLocaleDateString(undefined, {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
