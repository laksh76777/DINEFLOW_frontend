import React from 'react';
import { Card, CardHeader, CardBody, Badge, Button, PageHeader } from '../components/ui';
import { toast } from '../stores/useToastStore';
import { Layers, Clock, BellRing, UtensilsCrossed, CheckCircle2 } from 'lucide-react';

export const ManagerPreview: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <Badge variant="success" size="sm" dot>
            Floor Operations
          </Badge>
        }
        title="Manager Shift Dashboard"
        description="Monitor table turns, kitchen dispatch times, staff requests, and 86 menu availability."
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<UtensilsCrossed className="w-4 h-4" />}
            onClick={() => toast.warning('Quick 86 Alert', 'Paneer Tikka toggled to Sold Out')}
          >
            Quick 86 Item
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card variant="default">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#211d1a] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#d96236]" />
              <span>Table Floor Status</span>
            </h3>
            <Badge variant="brand" size="sm">
              7 Active
            </Badge>
          </CardHeader>
          <CardBody className="space-y-2 text-xs text-[#4d443c]">
            <div className="flex justify-between p-2 rounded-lg bg-[#fbf9f6] border border-[#e9e3dc]">
              <span className="font-bold text-[#211d1a]">Table 07</span>
              <span className="text-[#d96236] font-mono">Round 2 • Cooking</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#fbf9f6] border border-[#e9e3dc]">
              <span className="font-bold text-[#211d1a]">Table 03</span>
              <span className="text-[#d97706] font-mono">Bill Requested</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#fbf9f6] border border-[#e9e3dc]">
              <span className="font-bold text-[#211d1a]">Table 12</span>
              <span className="text-[#059669] font-mono">Available</span>
            </div>
          </CardBody>
        </Card>

        <Card variant="default">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#211d1a] flex items-center gap-2">
              <BellRing className="w-4 h-4 text-[#d97706]" />
              <span>Pending Service Requests</span>
            </h3>
            <Badge variant="warning" size="sm">
              2 Pending
            </Badge>
          </CardHeader>
          <CardBody className="space-y-2 text-xs text-[#4d443c]">
            <div className="p-2.5 rounded-lg bg-[#fff8e7] border border-[#fde68a] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#b45309]">Table 07: Water Refill</span>
                <p className="text-[11px] text-[#7b726a]">Laksh • 2 mins ago</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toast.success('Acknowledged', 'Server assigned to Table 07')}
              >
                Acknowledge
              </Button>
            </div>
            <div className="p-2.5 rounded-lg bg-[#fff8e7] border border-[#fde68a] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#b45309]">Table 04: Extra Cutlery</span>
                <p className="text-[11px] text-[#7b726a]">Arjun • 4 mins ago</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toast.success('Acknowledged', 'Server assigned to Table 04')}
              >
                Acknowledge
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card variant="default">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#211d1a] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#059669]" />
              <span>Kitchen Pace</span>
            </h3>
            <Badge variant="success" size="sm">
              Optimal
            </Badge>
          </CardHeader>
          <CardBody className="space-y-3 text-xs text-[#4d443c]">
            <div>
              <div className="flex justify-between mb-1 text-[11px] text-[#7b726a]">
                <span>Average Prep Time</span>
                <span className="font-bold text-[#211d1a]">13.5 mins</span>
              </div>
              <div className="w-full bg-[#f5f1ec] h-2 rounded-full overflow-hidden border border-[#e9e3dc]">
                <div className="bg-[#059669] h-full w-[65%]" />
              </div>
            </div>
            <p className="text-[11px] text-[#7b726a]">
              Grill station is operating at 80% capacity. Main kitchen has zero ticket backlog.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
