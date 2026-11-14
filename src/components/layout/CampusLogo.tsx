import React from 'react';

const campusLogoUrl = new URL('../../../uhm bitmap pak firto.png', import.meta.url).href;

export const CampusLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <img src={campusLogoUrl} alt="Logo Universitas Handayani Makassar" className={className} />
);
