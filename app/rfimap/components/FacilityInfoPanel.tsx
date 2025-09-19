"use client";

// Facility Info Panel - Detailed information display for selected map facilities
// Features: expandable sections, typed variables, color-coded icons, responsive design

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
import type { FacilityBoxZ, FacilityVariableZ, SelectedPinZ } from '@/lib/content/schema';

interface FacilityInfoPanelProps {
  selectedPin: SelectedPinZ | null;
  onClose: () => void;
  isVisible: boolean;
}

// Icon mapping for facility data visualization
const iconMap = {
  Info,
  Settings,
  Eye,
  MapPin,
  Database,
  Monitor
};

// Color scheme mapping for facility data boxes
const colorMap = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  gray: 'bg-gray-50 text-gray-700 border-gray-200',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200'
};

const FacilityInfoPanel: React.FC<FacilityInfoPanelProps> = ({
  selectedPin,
  onClose,
  isVisible
}) => {
  // Track which information boxes are expanded
  const [expandedBoxes, setExpandedBoxes] = useState<Record<string, boolean>>({});

  // Toggle expansion state for facility information boxes
  const toggleBox = (boxId: string) => {
    setExpandedBoxes(prev => ({
      ...prev,
      [boxId]: !prev[boxId]
    }));
  };

  // Render individual facility variable with appropriate formatting
  const renderVariable = (variable: FacilityVariableZ) => {
    const IconComponent = variable.icon ? iconMap[variable.icon as keyof typeof iconMap] : null;
    const colorClass = variable.color ? colorMap[variable.color as keyof typeof colorMap] : 'bg-gray-50 text-gray-700 border-gray-200';

    // Handle nested variables (sub-categories)
    if (variable.type === 'nested' && variable.subVariables) {
      return (
        <div key={variable.key} className="space-y-2">
          <h4 className="text-sm font-medium text-gray-800">{variable.label}</h4>
          <div className="space-y-2 pl-4">
            {variable.subVariables.map((subVar: FacilityVariableZ) => (
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

    // Render standard variable in key-value format
    return (
      <div key={variable.key} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
        <span className="text-sm text-gray-600">{variable.label}</span>
        <span className="text-sm text-gray-900 font-medium">
          {variable.value}
          {variable.unit && <span className="text-xs text-gray-500 ml-1">{variable.unit}</span>}
        </span>
      </div>
    );
  };

  // Render expandable facility information box
  const renderBox = (box: FacilityBoxZ) => {
    const isExpanded = expandedBoxes[box.id];
    const IconComponent = iconMap[box.icon as keyof typeof iconMap] || Info;
    const colorClass = colorMap[box.color as keyof typeof colorMap] || 'bg-gray-50 text-gray-700 border-gray-200';

    return (
      <div key={box.id} className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Clickable header to expand/collapse */}
        <button
          onClick={() => toggleBox(box.id)}
          className={`w-full flex items-center justify-between p-3 ${colorClass} hover:opacity-80 transition-opacity`}
        >
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4" />
            <span className="text-sm font-medium">{box.title}</span>
          </div>
          {/* Expand/collapse indicator */}
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {/* Expandable content area with facility variables */}
        {isExpanded && (
          <div className="p-3 bg-gray-50/50 space-y-2">
            {box.variables.map(renderVariable)}
          </div>
        )}
      </div>
    );
  };

  // Early return if panel should not be visible or no facility selected
  if (!isVisible || !selectedPin?.data) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Panel header with facility title and close button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{selectedPin.data.title}</h2>
          <p className="text-sm text-gray-600">{selectedPin.data.type}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close facility info panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable content area with facility information boxes */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {selectedPin.data.boxes.map(renderBox)}
        </div>
      </div>
    </div>
  );
};

export default FacilityInfoPanel;