import React from 'react';

const ClinIQLogo = ({ className = '', style = {} }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 400 500" 
      width="200" 
      height="250"
      className={className}
      style={style}
    >
      {/* Medical cross background */}
      <rect x="140" y="0" width="120" height="400" fill="#FF6B9D"/>
      <rect x="0" y="140" width="400" height="120" fill="#FF6B9D"/>
      
      {/* Heart-shaped stethoscope overlay */}
      {/* Left upper lobe */}
      <path 
        d="M 200,80 Q 170,80 150,100 Q 130,120 140,150" 
        stroke="#FF6B9D" 
        strokeWidth="20" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Right upper lobe */}
      <path 
        d="M 200,80 Q 230,80 250,100 Q 270,120 260,150" 
        stroke="#FF6B9D" 
        strokeWidth="20" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Lower curves */}
      <path 
        d="M 140,150 Q 160,180 180,200 Q 200,220 220,200 Q 240,180 260,150" 
        stroke="#FF6B9D" 
        strokeWidth="20" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Chest piece (left lower curve) */}
      <circle cx="180" cy="200" r="25" fill="#FF6B9D"/>
      <circle cx="180" cy="200" r="12" fill="#ffffff"/>
      {/* Bell (right lower curve) */}
      <circle cx="220" cy="200" r="25" fill="#FF6B9D"/>
      <circle cx="220" cy="200" r="12" fill="#ffffff"/>
      
      {/* CLINIQ text */}
      <text 
        x="200" 
        y="320" 
        fontFamily="Arial, sans-serif" 
        fontSize="48" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="#FF6B9D" 
        letterSpacing="2"
      >
        CLINIQ
      </text>
      
      {/* HEALTHCARE text */}
      <text 
        x="200" 
        y="370" 
        fontFamily="Arial, sans-serif" 
        fontSize="24" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="#FF6B9D" 
        letterSpacing="4"
      >
        HEALTHCARE
      </text>
    </svg>
  );
};

export default ClinIQLogo;
