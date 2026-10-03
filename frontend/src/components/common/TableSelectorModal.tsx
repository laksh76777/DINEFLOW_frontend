import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Users,
  Utensils,
  MapPin,
  X,
  ArrowRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Modal, Button, Badge } from '../ui';
import { tableService, TableItem } from '../../services/tableService';

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const TableSelectorModal: React.FC<TableSelectorModalProps> = ({
  isOpen,
  onClose,
  title = 'Select an Available Table',
  subtitle = 'Choose a restaurant table to simulate scanning its dedicated QR code and start dining.',
}) => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedQrTable, setSelectedQrTable] = useState<TableItem | null>(null);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const data = await tableService.getPublicTables();
      // Filter out any lingering audit/test tables
      const activeTables = (data || []).filter(
        (t) => !t.tableNumber.toUpperCase().startsWith('AUDIT')
      );
      setTables(activeTables);
    } catch (err) {
      console.error('Failed to load tables for modal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTables();
    }
  }, [isOpen]);

  const handleSelectTable = (table: TableItem) => {
    if (!table.qrCode?.token) return;
    onClose();
    navigate(`/q/${table.qrCode.token}`);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#e9e3dc] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#fff4ef] text-[#d96236] flex items-center justify-center border border-[#ffc9b5] shadow-xs">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#211d1a] tracking-tight">{title}</h3>
                <p className="text-xs text-[#7b726a] mt-0.5">{subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#7b726a] hover:text-[#211d1a] hover:bg-[#fbf9f6] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tables Grid */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <RefreshCw className="w-6 h-6 text-[#d96236] animate-spin" />
              <p className="text-xs text-[#7b726a]">Retrieving available restaurant floor tables...</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-sm font-semibold text-[#211d1a]">No active tables found</p>
              <p className="text-xs text-[#7b726a]">Please initialize tables in the Owner floor plan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-1">
              {tables.map((table) => {
                const isAvailable = table.status === 'AVAILABLE';
                return (
                  <div
                    key={table._id}
                    className="p-4 rounded-2xl border border-[#e9e3dc] hover:border-[#d96236] transition-all bg-white hover:shadow-md flex flex-col justify-between gap-4 group"
                  >
                    <div>
                      {/* Top Bar: Table Number & Status */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-black text-base text-[#211d1a] group-hover:text-[#d96236] transition-colors">
                          Table {table.tableNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                            isAvailable
                              ? 'bg-[#e8f6ef] text-[#23865b]'
                              : 'bg-[#fff4ef] text-[#d96236]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAvailable ? 'bg-[#23865b] animate-pulse' : 'bg-[#d96236]'
                            }`}
                          />
                          {table.status}
                        </span>
                      </div>

                      {/* Meta info */}
                      <div className="space-y-1 text-xs text-[#7b726a]">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#a69c93]" />
                          <span>{table.section || 'Dining Area'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#a69c93]" />
                          <span>Seats up to {table.capacity} guests</span>
                        </div>
                      </div>

                      {/* QR Thumbnail */}
                      {table.qrCode?.qrDataUrl && (
                        <div className="mt-3 flex items-center justify-center p-2 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc]">
                          <img
                            src={table.qrCode.qrDataUrl}
                            alt={`QR for Table ${table.tableNumber}`}
                            className="w-24 h-24 object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-[#f4ede6] flex flex-col gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full justify-between"
                        onClick={() => handleSelectTable(table)}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        <span>Dine at {table.tableNumber}</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Preview Fallback */}
          <div className="border-t border-[#e9e3dc] pt-4 flex items-center justify-between text-xs text-[#7b726a]">
            <span>Want to browse food items without occupying a table?</span>
            <button
              onClick={() => {
                onClose();
                navigate('/customer');
              }}
              className="font-bold text-[#d96236] hover:text-[#be4d27] underline flex items-center gap-1"
            >
              <span>Browse Menu in Preview Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
