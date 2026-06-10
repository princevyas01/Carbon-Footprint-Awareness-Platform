'use client';

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Tabs from '../ui/Tabs';
import TransportTab from './TransportTab';
import FoodTab from './FoodTab';
import EnergyTab from './EnergyTab';
import ShoppingTab from './ShoppingTab';
import TravelTab from './TravelTab';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'food', label: 'Food', icon: '🍽️' },
  { id: 'energy', label: 'Energy', icon: '⚡' },
  { id: 'shopping', label: 'Shopping', icon: '📦' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
];

export default function LogModal({ isOpen, onClose }: LogModalProps) {
  const [activeTab, setActiveTab] = useState('transport');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'transport':
        return <TransportTab onSuccess={onClose} />;
      case 'food':
        return <FoodTab onSuccess={onClose} />;
      case 'energy':
        return <EnergyTab onSuccess={onClose} />;
      case 'shopping':
        return <ShoppingTab onSuccess={onClose} />;
      case 'travel':
        return <TravelTab onSuccess={onClose} />;
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Activity Footprint">
      <div className="space-y-6">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <div id={`tabpanel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
          {renderTabContent()}
        </div>
      </div>
    </Modal>
  );
}
