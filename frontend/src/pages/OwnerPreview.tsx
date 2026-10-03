import React from 'react';
import { Card, CardHeader, CardBody, Badge, Button, PageHeader } from '../components/ui';
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
        <Card variant="default">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400 font-semibold uppercase">Today's Revenue</div>
              <div className="text-2xl font-black text-white mt-1">₹42,850</div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">↑ 18.4% vs yesterday</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card variant="default">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400 font-semibold uppercase">Active Diners</div>
              <div className="text-2xl font-black text-white mt-1">28 Guests</div>
              <div className="text-[11px] text-stone-400 mt-1">7 Occupied Tables</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card variant="default">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400 font-semibold uppercase">Active Dishes</div>
              <div className="text-2xl font-black text-white mt-1">46 Items</div>
              <div className="text-[11px] text-amber-400 mt-1">3 items 86'd / sold out</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card variant="default">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400 font-semibold uppercase">QR Table Nodes</div>
              <div className="text-2xl font-black text-white mt-1">16 Tables</div>
              <div className="text-[11px] text-emerald-400 mt-1">100% token verified</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Foundation Status Alert */}
      <Card variant="accent">
        <CardBody className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Owner Dashboard Foundation Initialized</span>
            </div>
            <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
              Phase 1 shell is active with layout navigation, executive styling, and security boundary
              definitions. Business entities and full CRUD operations will be bound in subsequent phases.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('System Audit', 'All RBAC guards and MongoDB models verified.')}
          >
            Run System Audit
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};
