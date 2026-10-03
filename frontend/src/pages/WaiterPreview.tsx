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
      <Card variant="accent" className="border-emerald-500/40 bg-emerald-950/20">
        <CardBody className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ConciergeBell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Table 04: Food Ready for Service</span>
                <Badge variant="station" size="sm">
                  Beverage Bar
                </Badge>
              </div>
              <p className="text-xs text-stone-300">2x Fresh Lime Soda • Ready 1m ago</p>
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
            <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-400" />
              <span>Diner Assistance Calls</span>
            </h3>
            <Badge variant="warning" size="sm">
              2 Active
            </Badge>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Table 07</span>
                  <Badge variant="brand" size="sm">
                    Water Refill
                  </Badge>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">Laksh • Requested 2m ago</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Check className="w-3.5 h-3.5 text-emerald-400" />}
                onClick={() => toast.success('Request Handled', 'Water served to Table 07')}
              >
                Complete
              </Button>
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Table 03</span>
                  <Badge variant="danger" size="sm">
                    Bill Requested
                  </Badge>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">Priya • Requested 4m ago</p>
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
            <h3 className="text-sm font-bold text-stone-200">Table Floor Snapshot</h3>
            <Badge variant="neutral" size="sm">
              Section: All
            </Badge>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-stone-950 border border-orange-500/30">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-white font-mono">T-07</span>
                <Badge variant="brand" size="sm">
                  Occupied
                </Badge>
              </div>
              <p className="text-[10px] text-stone-400">3 Diners • Session #8291</p>
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-amber-500/30">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-white font-mono">T-03</span>
                <Badge variant="warning" size="sm">
                  Bill Due
                </Badge>
              </div>
              <p className="text-[10px] text-stone-400">Total: ₹2,450</p>
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-emerald-500/30">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-white font-mono">T-12</span>
                <Badge variant="success" size="sm">
                  Available
                </Badge>
              </div>
              <p className="text-[10px] text-stone-400">Cleaned & Set</p>
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-white font-mono">T-04</span>
                <Badge variant="neutral" size="sm">
                  Serving
                </Badge>
              </div>
              <p className="text-[10px] text-stone-400">Drinks ready</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
