import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Input,
  Select,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
  EmptyState,
  ErrorState,
  PageHeader,
} from '../components/ui';
import { toast } from '../stores/useToastStore';
import {
  Sparkles,
  Utensils,
  Plus,
  Search,
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const DesignSystemPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  return (
    <div className="space-y-12 pb-16 max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        badge={
          <Badge variant="brand" size="sm" dot>
            DineFlow Design System 1.0
          </Badge>
        }
        title="DineFlow UI Foundation & Component Suite"
        description="A bespoke, modern, luxury restaurant-tech visual identity and reusable component library."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setBtnLoading(true);
              setTimeout(() => {
                setBtnLoading(false);
                toast.success('Components verified!', 'DineFlow UI design system is active.');
              }, 600);
            }}
            isLoading={btnLoading}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Trigger Action
          </Button>
        }
      />

      {/* 1. Brand Color Palette & Identity */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-stone-100 flex items-center gap-2">
          <span>01</span>
          <span className="text-stone-400">/</span>
          <span>Palette & Theme Accents</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-950/40">
            <div className="text-xs font-bold">Brand Orange</div>
            <div className="text-[10px] opacity-80">#F97316</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-600 text-white shadow-lg shadow-amber-950/40">
            <div className="text-xs font-bold">Warm Saffron</div>
            <div className="text-[10px] opacity-80">#D97706</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-950/40">
            <div className="text-xs font-bold">Veg Green</div>
            <div className="text-[10px] opacity-80">#059669</div>
          </div>
          <div className="p-4 rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-950/40">
            <div className="text-xs font-bold">Non-Veg Red</div>
            <div className="text-[10px] opacity-80">#E11D48</div>
          </div>
          <div className="p-4 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-950/40">
            <div className="text-xs font-bold">Station Indigo</div>
            <div className="text-[10px] opacity-80">#4F46E5</div>
          </div>
          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-stone-200">
            <div className="text-xs font-bold">Charcoal Surface</div>
            <div className="text-[10px] text-stone-400">#1C1917</div>
          </div>
        </div>
      </section>

      {/* 2. Reusable Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-stone-100 flex items-center gap-2">
          <span>02</span>
          <span className="text-stone-400">/</span>
          <span>Interactive Buttons</span>
        </h2>
        <Card variant="default">
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Primary Action
              </Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="success" leftIcon={<Check className="w-4 h-4" />}>
                Order Ready
              </Button>
              <Button variant="danger" leftIcon={<AlertCircle className="w-4 h-4" />}>
                Cancel Ticket
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-stone-800/60">
              <Button size="sm" variant="primary">
                Small (sm)
              </Button>
              <Button size="md" variant="primary">
                Medium (md)
              </Button>
              <Button size="lg" variant="primary">
                Large (lg)
              </Button>
              <Button size="md" variant="secondary" isLoading>
                Loading State
              </Button>
              <Button size="md" variant="secondary" disabled>
                Disabled
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* 3. Badges & Dietary Status Indicators */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-stone-100 flex items-center gap-2">
          <span>03</span>
          <span className="text-stone-400">/</span>
          <span>Dietary & Operational Badges</span>
        </h2>
        <Card variant="default">
          <CardBody>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="veg" dot>
                Vegetarian
              </Badge>
              <Badge variant="non-veg" dot>
                Non-Veg
              </Badge>
              <Badge variant="vegan" dot>
                Vegan
              </Badge>
              <Badge variant="brand" dot>
                Table 07 Active
              </Badge>
              <Badge variant="success" dot>
                Ready to Serve
              </Badge>
              <Badge variant="warning" dot>
                Preparing (12m)
              </Badge>
              <Badge variant="danger" dot>
                Bill Pending
              </Badge>
              <Badge variant="station">Grill Station</Badge>
              <Badge variant="neutral">Round 01</Badge>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* 4. Inputs & Select Forms */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-stone-100 flex items-center gap-2">
          <span>04</span>
          <span className="text-stone-400">/</span>
          <span>Form Controls</span>
        </h2>
        <Card variant="default">
          <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Search Menu"
              placeholder="e.g. Truffle Butter Naan..."
              leftIcon={<Search className="w-4 h-4" />}
            />
            <Input
              label="Diner Name"
              placeholder="Laksh"
              defaultValue="Laksh Sharma"
              helperText="Identifies your items in table orders"
            />
            <Select label="Kitchen Station">
              <option value="MAIN_KITCHEN">Main Kitchen</option>
              <option value="GRILL">Grill & Tandoor</option>
              <option value="BEVERAGE">Beverage & Bar</option>
              <option value="DESSERT">Dessert & Pastry</option>
            </Select>
          </CardBody>
        </Card>
      </section>

      {/* 5. Toast Notifications & Interactive Modal */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-stone-100 flex items-center gap-2">
          <span>05</span>
          <span className="text-stone-400">/</span>
          <span>Toasts & Modal Transitions</span>
        </h2>
        <Card variant="default">
          <CardBody className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => toast.success('Order Placed!', 'Round 1 sent to kitchen stations.')}
            >
              Toast Success
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.warning('Special Note', 'Guest requested extra spicy gravy.')}
            >
              Toast Warning
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.error('Payment Error', 'Simulated failure: insufficient demo funds.')}
            >
              Toast Error
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info('Waiter Called', 'Staff has been notified for Table 07.')}
            >
              Toast Info
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Open Demo Modal
            </Button>
          </CardBody>
        </Card>

        {/* Modal Dialog */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="DineFlow Modal System"
          description="Framer Motion spring-animated dialog with backdrop blur"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setModalOpen(false);
                  toast.success('Confirmed!', 'Modal closed gracefully.');
                }}
              >
                Confirm Action
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-sm text-stone-300">
            <p>
              This modal demonstrates the DineFlow modal component. It supports customizable headers,
              body scroll containers, backdrop blur, ESC key dismissal, and custom actions.
            </p>
            <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-800/40 text-orange-300 text-xs">
              ⚡ Real-time updates remain active behind modals using Socket.IO.
            </div>
          </div>
        </Modal>
      </section>

      {/* 6. Data Tables & Skeletons */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-stone-100 flex items-center gap-2">
          <span>06</span>
          <span className="text-stone-400">/</span>
          <span>Data Table & Loading Skeletons</span>
        </h2>
        <Card variant="default">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-200">Simulated Table Registry</h3>
            <Badge variant="brand" size="sm">
              Live Feed
            </Badge>
          </CardHeader>
          <CardBody className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-bold text-white">Table 07</TableCell>
                  <TableCell>4 Guests</TableCell>
                  <TableCell>Main Dining Hall</TableCell>
                  <TableCell>
                    <Badge variant="brand" size="sm" dot>
                      Occupied (#8291)
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold text-white">Table 12</TableCell>
                  <TableCell>6 Guests</TableCell>
                  <TableCell>Patio Terrace</TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm" dot>
                      Available
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Assign
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="pt-4 border-t border-stone-800/60 space-y-2">
              <div className="text-xs text-stone-400 font-semibold">Skeleton Loaders:</div>
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* 7. Empty & Error States */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-stone-100 flex items-center gap-2">
          <span>07</span>
          <span className="text-stone-400">/</span>
          <span>Empty & Error States</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EmptyState
            title="No Active Orders in Queue"
            description="All kitchen station tickets have been prepared and dispatched for service."
            action={
              <Button size="sm" variant="outline">
                Refresh Queue
              </Button>
            }
          />
          <ErrorState
            title="Table QR Connection Failed"
            message="Unable to resolve table token. Please verify if the QR code is active in the registry."
            onRetry={() => toast.info('Retrying connection...')}
          />
        </div>
      </section>
    </div>
  );
};
