import React from 'react';
import { Card, CardBody, Badge, Button, PageHeader } from '../components/ui';
import { toast } from '../stores/useToastStore';
import { TrendingUp, Users, Utensils, QrCode, Sparkles, Plus } from 'lucide-react';

export const OwnerPreview: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <Badge variant="brand" size="sm" dot>
            Single Restaurant Authority
          </Badge>
        }
        title="Owner Executive Overview"
        description="Comprehensive control over restaurant profile, menus, floor tables, kitchen stations, and analytics."
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => toast.success('New Table Added', 'QR token automatically generated.')}
          >
            Create Table & QR
          </Button>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-[#7b726a] font-semibold uppercase tracking-wider">Today's Revenue</div>
              <div className="text-2xl font-black text-[#211d1a] mt-1">₹42,850</div>
              <div className="text-[11px] text-[#059669] font-semibold mt-1">↑ 18.4% vs yesterday</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#fff4ef] border border-[#d96236]/20 text-[#d96236] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-[#7b726a] font-semibold uppercase tracking-wider">Active Diners</div>
              <div className="text-2xl font-black text-[#211d1a] mt-1">28 Guests</div>
              <div className="text-[11px] text-[#7b726a] mt-1">7 Occupied Tables</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#f0f9ff] border border-[#0284c7]/20 text-[#0284c7] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-[#7b726a] font-semibold uppercase tracking-wider">Active Dishes</div>
              <div className="text-2xl font-black text-[#211d1a] mt-1">46 Items</div>
              <div className="text-[11px] text-[#d97706] mt-1">3 items 86'd / sold out</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#fff8e7] border border-[#d89a20]/20 text-[#d89a20] flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-[#7b726a] font-semibold uppercase tracking-wider">QR Table Nodes</div>
              <div className="text-2xl font-black text-[#211d1a] mt-1">16 Tables</div>
              <div className="text-[11px] text-[#059669] mt-1">100% token verified</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] border border-[#059669]/20 text-[#059669] flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Foundation Status Alert */}
      <div className="p-6 rounded-2xl bg-[#fff4ef] border border-[#d96236]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-[#be4d27] mb-1">
            <Sparkles className="w-4 h-4 text-[#d96236]" />
            <span>Owner Dashboard Foundation Initialized</span>
          </div>
          <p className="text-xs text-[#7b726a] max-w-2xl leading-relaxed">
            Phase 1 shell is active with layout navigation, executive styling, and security boundary
            definitions. Business entities and full CRUD operations are live and bound.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info('System Audit', 'All RBAC guards and MongoDB models verified.')}
        >
          Verify Health
        </Button>
      </div>
    </div>
  );
};
