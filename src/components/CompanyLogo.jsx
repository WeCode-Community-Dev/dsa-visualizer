
import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const getDomain = (url) => {
  try {
    if (!url) return '';
    const hostname = new URL(url).hostname;
    // Remove common career subdomains to get the root brand domain
    // e.g. careers.google.com -> google.com
    // e.g. www.amazon.jobs -> amazon.jobs (Clearbit handles this well usually, but google.com is safer)
    return hostname.replace(/^(?:www\.|careers\.|jobs\.|corporate\.|about\.|m\.|people\.)+/, '');
  } catch (e) {
    return '';
  }
};

const getGradient = (name) => {
  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-red-500",
    "from-green-500 to-emerald-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-green-500",
  ];
  const charCode = name ? name.charCodeAt(0) : 0;
  return gradients[charCode % gradients.length];
};

const CompanyLogo = ({ company, className, fallbackClassName }) => {
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  const domain = getDomain(company.url);
  
  // Strategy: 
  // 1. Clearbit (Best quality logos)
  // 2. Google Favicon (High reliability fallback)
  const initialSrc = domain ? `https://logo.clearbit.com/${domain}` : '';

  const handleError = (e) => {
    if (attempts === 0 && domain) {
      // Fallback to Google Favicon API
      e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      setAttempts(1);
    } else {
      setError(true);
    }
  };

  if (!domain || error) {
    return (
      <div className={cn(
        "flex items-center justify-center rounded-lg shadow-inner bg-gradient-to-br text-white font-bold",
        getGradient(company.name),
        className,
        fallbackClassName
      )}>
        <span className="text-[50%] leading-none">
          {company.name?.charAt(0).toUpperCase() || <Building2 className="h-1/2 w-1/2" />}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative bg-white p-[10%] rounded-lg overflow-hidden flex items-center justify-center", className)}>
      <img 
        src={attempts === 0 ? initialSrc : `https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
        alt={`${company.name} logo`} 
        className="w-full h-full object-contain"
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
};

export default CompanyLogo;
