import React from 'react';
import { Card, CardHeader, CardBody, Badge, Button, PageHeader } from '../components/ui';
import { toast } from '../stores/useToastStore';
import { ConciergeBell, Check, Utensils, Droplets, Receipt, CheckCircle2 } from 'lucide-react';

export const WaiterPreview: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <Badge variant="success" size="sm" dot>
            Floor Terminal
          </Badge>
        }
        title="Waiter Service Terminal"
        description="Pick up ready dishes from kitchen stations and respond to live diner assistance requests."
      />

      {/* Ready to Serve Alert Banner */}
      <Card variant="accent" className="border-[#a7f3d0] bg-[#ecfdf5]">
        <CardBody className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#a7f3d0] text-[#059669] flex items-center justify-center shadow-xs">
              <ConciergeBell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#211d1a] flex items-center gap-2">
                <span>Table 04: Food Ready for Service</span>
                <Badge variant="station" size="sm">
                  Beverage Bar
                </Badge>
              </div>
              <p className="text-xs text-[#065f46]">2x Fresh Lime Soda • Ready 1m ago</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="success"
            leftIcon={<Check className="w-4 h-4" />}
            onClick={() => toast.success('Food Served', 'Marked Table 04 items as SERVED')}
          >
            Mark Served
          </Button>
        </CardBody>
      </Card>

      {/* Grid of Tables & Service Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Active Guest Requests */}
        <Card variant="default">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#211d1a] flex items-center gap-2">
              <Droplets className="w-4 h-4 text-[#d96236]" />
              <span>Diner Assistance Calls</span>
            </h3>
            <Badge variant="warning" size="sm">
              2 Active
            </Badge>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="p-3 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#211d1a] flex items-center gap-2">
                  <span>Table 07</span>
                  <Badge variant="brand" size="sm">
                    Water Refill
                  </Badge>
                </div>
                <p className="text-[11px] text-[#7b726a] mt-0.5">Laksh • Requested 2m ago</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Check className="w-3.5 h-3.5 text-[#059669]" />}
                onClick={() => toast.success('Request Handled', 'Water served to Table 07')}
              >
                Complete
              </Button>
            </div>

            <div className="p-3 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#211d1a] flex items-center gap-2">
                  <span>Table 03</span>
                  <Badge variant="danger" size="sm">
                    Bill Requested
                  </Badge>
                </div>
                <p className="text-[11px] text-[#7b726a] mt-0.5">Priya • Requested 4m ago</p>
              </div>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Receipt className="w-3.5 h-3.5" />}
                onClick={() => toast.info('Bill Ready', 'Table 03 digital bill verified')}
              >
                Present Bill
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Live Table Grid Snapshot */}
        <Card variant="default">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#211d1a]">Table Floor Snapshot</h3>
            <Badge variant="neutral" size="sm">
              Section: All
            </Badge>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-[#fff4ef] border border-[#ffc9b5]">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-[#be4d27] font-mono">T-07</span>
                <Badge variant="brand" size="sm">
                  Occupied
                </Badge>
              </div>
              <p className="text-[10px] text-[#7b726a]">3 Diners • Session #8291</p>
            </div>

            <div className="p-3 rounded-xl bg-[#fff8e7] border border-[#fde68a]">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-[#b45309] font-mono">T-03</span>
                <Badge variant="warning" size="sm">
                  Bill Due
                </Badge>
              </div>
              <p className="text-[10px] text-[#7b726a]">Total: ₹2,450</p>
            </div>

            <div className="p-3 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0]">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-[#059669] font-mono">T-12</span>
                <Badge variant="success" size="sm">
                  Available
                </Badge>
              </div>
              <p className="text-[10px] text-[#7b726a]">Cleaned & Set</p>
            </div>

            <div className="p-3 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc]">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-[#4d443c] font-mono">T-04</span>
                <Badge variant="neutral" size="sm">
                  Serving
                </Badge>
              </div>
              <p className="text-[10px] text-[#7b726a]">Drinks ready</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
