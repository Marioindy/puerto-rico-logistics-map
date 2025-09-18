"use client";

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight,
  Info,
  Settings,
  Eye,
  MapPin,
  Database,
  Monitor,
  X
} from 'lucide-react';
import type { FacilityBox, FacilityVariable, SelectedPin } from '@/types/facilities';

interface FacilityInfoPanelProps {
  selectedPin: SelectedPin | null;
  onClose: () => void;
  isVisible: boolean;
}

const iconMap = {
  Info,
  Settings,
  Eye,
  MapPin,
  Database,
  Monitor
};

const colorMap = {
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  green: 'bg-green-500/20 text-green-300 border-green-500/40',
  orange: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  red: 'bg-red-500/20 text-red-300 border-red-500/40',
  gray: 'bg-gray-500/20 text-gray-300 border-gray-500/40'
};

const FacilityInfoPanel: React.FC<FacilityInfoPanelProps> = ({ 
  selectedPin, 
  onClose, 
  isVisible 
}) => {
  const [expandedBoxes, setExpandedBoxes] = useState<Record<string, boolean>>({});

  const toggleBox = (boxId: string) => {
    setExpandedBoxes(prev => ({
      ...prev,
      [boxId]: !prev[boxId]
    }));
  };

  const renderVariable = (variable: FacilityVariable) => {
    const IconComponent = variable.icon ? iconMap[variable.icon as keyof typeof iconMap] : null;
    const colorClass = variable.color ? colorMap[variable.color as keyof typeof colorMap] : 'bg-slate-500/20 text-slate-300 border-slate-500/40';

    if (variable.type === 'nested' && variable.subVariables) {
      return (
        <div key={variable.key} className="space-y-2">
          <h4 className="text-sm font-medium text-slate-200">{variable.label}</h4>
          <div className="space-y-2 pl-4">
            {variable.subVariables.map(subVar => (
              <div key={subVar.key} className={`flex items-center gap-2 rounded-lg border p-2 ${colorClass}`}>
                {IconComponent && <IconComponent className="h-4 w-4" />}
                <span className="text-xs font-medium">{subVar.label}:</span>
                <span className="text-xs">{subVar.value}</span>
                {subVar.unit && <span className="text-xs opacity-70">{subVar.unit}</span>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={variable.key} className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-b-0">
        <span className="text-sm text-slate-300">{variable.label}</span>
        <span className="text-sm text-slate-100 font-medium">
          {variable.value}
          {variable.unit && <span className="text-xs text-slate-400 ml-1">{variable.unit}</span>}
        </span>
      </div>
    );
  };

  const renderBox = (box: FacilityBox) => {
    const isExpanded = expandedBoxes[box.id];
    const IconComponent = iconMap[box.icon as keyof typeof iconMap] || Info;
    const colorClass = colorMap[box.color as keyof typeof colorMap] || 'bg-slate-500/20 text-slate-300 border-slate-500/40';

    return (
      <div key={box.id} className="border border-slate-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleBox(box.id)}
          className={`w-full flex items-center justify-between p-3 ${colorClass} hover:opacity-80 transition-opacity`}
        >
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4" />
            <span className="text-sm font-medium">{box.title}</span>
          </div>
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        
        {isExpanded && (
          <div className="p-3 bg-slate-900/50 space-y-2">
            {box.variables.map(renderVariable)}
          </div>
        )}
      </div>
    );
  };

  if (!isVisible || !selectedPin?.data) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 w-96 max-h-[calc(100vh-2rem)] bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div>
          <h2 className="text-lg font-semibold text-white">{selectedPin.data.title}</h2>
          <p className="text-sm text-slate-400">{selectedPin.data.type}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
        <div className="p-4 space-y-3">
          {selectedPin.data.boxes.map(renderBox)}
        </div>
      </div>
    </div>
  );
};

export default FacilityInfoPanel;