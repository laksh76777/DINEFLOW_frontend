import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  AlertCircle,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { Button, Card, CardBody, Badge, Input, ErrorState } from '../components/ui';
import { tableService, ResolveTableResponse } from '../services/tableService';
import { sessionService } from '../services/sessionService';
import { toast } from '../stores/useToastStore';

export const CustomerWelcomePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableData, setTableData] = useState<ResolveTableResponse['data'] | null>(null);

  // Guest onboarding state
  const [displayName, setDisplayName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinedSessionData, setJoinedSessionData] = useState<any>(null);

  // 1. Resolve table QR token on load
  const resolveToken = async () => {
    if (!token) {
      setError('Missing table QR token');
      setLoading(false);
      return;
    }

    setLoading(false);
    try {
      setLoading(true);
      const data = await tableService.resolveQrToken(token);
      setTableData(data);

      // Check if user already joined this session previously on this browser
      const savedTempId = localStorage.getItem(`dineflow_temp_member_${token}`);
      const savedName = localStorage.getItem(`dineflow_name_${token}`);
      if (savedName) setDisplayName(savedName);

      if (data.activeSession && savedTempId) {
        // Automatically link back to existing joined state
        const member = data.existingMembers.find((m) => m.temporaryMemberId === savedTempId);
        if (member) {
          localStorage.setItem('dineflow_active_session', data.activeSession.id);
          localStorage.setItem('dineflow_table_number', data.table.tableNumber);
          localStorage.setItem('dineflow_session_number', data.activeSession.sessionNumber);
          localStorage.setItem('dineflow_member_id', member.temporaryMemberId);
          localStorage.setItem('dineflow_member_name', member.displayName);
          localStorage.setItem('dineflow_qr_token', token);
          setJoinedSessionData({
            session: data.activeSession,
            currentMember: member,
            members: data.existingMembers,
            table: data.table,
            restaurant: data.restaurant,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unable to resolve table QR code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    resolveToken();
  }, [token]);

  // 2. Handle joining the session
  const handleJoinTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !token) {
      toast.error('Name Required', 'Please enter your name to join the table');
      return;
    }

    setIsJoining(true);
    try {
      const existingTempId = localStorage.getItem(`dineflow_temp_member_${token}`) || undefined;
      const result = await sessionService.joinSession(token, displayName.trim(), existingTempId);

      // Store temporary member identity and session in localStorage
      localStorage.setItem(`dineflow_temp_member_${token}`, result.currentMember.temporaryMemberId);
      localStorage.setItem(`dineflow_name_${token}`, result.currentMember.displayName);
      localStorage.setItem('dineflow_active_session', result.session.id);
      localStorage.setItem('dineflow_table_number', result.table.tableNumber);
      localStorage.setItem('dineflow_session_number', result.session.sessionNumber);
      localStorage.setItem('dineflow_member_id', result.currentMember.temporaryMemberId);
      localStorage.setItem('dineflow_member_name', result.currentMember.displayName);
      localStorage.setItem('dineflow_qr_token', token);

      setJoinedSessionData(result);
      toast.success(
        `Welcome to Table ${result.table.tableNumber}!`,
        `Joined Session #${result.session.sessionNumber}`
      );
    } catch (err: any) {
      toast.error('Failed to Join', err.message);
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf9f6] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#fff4ef] border border-[#ffc9b5] text-[#d96236] flex items-center justify-center shadow-sm">
          <Loader2 className="w-6 h-6 animate-spin text-[#d96236]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#211d1a]">Verifying Table QR Token...</h3>
          <p className="text-xs text-[#7b726a]">Connecting to restaurant dining engine</p>
        </div>
      </div>
    );
  }

  if (error || !tableData) {
    return (
      <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center p-4">
        <ErrorState
          title="Invalid or Disabled QR Code"
          message={error || 'We could not identify this table QR code.'}
          onRetry={resolveToken}
        />
      </div>
    );
  }

  const { table, restaurant, activeSession, existingMembers } = tableData;

  return (
    <div className="min-h-screen bg-[#f5f1ec] text-[#211d1a] flex justify-center selection:bg-[#d96236] selection:text-white">
      {/* Mobile Shell Constraint */}
      <div className="w-full max-w-md min-h-screen bg-[#fbf9f6] border-x border-[#e9e3dc] flex flex-col shadow-xl relative overflow-hidden">
        {/* Restaurant Cover Banner */}
        <div className="relative h-52 w-full overflow-hidden bg-[#211d1a]">
          <img
            src={
              restaurant.coverImage ||
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
            }
            alt="Restaurant Cover"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#211d1a]/85 via-[#211d1a]/30 to-transparent" />

          {/* Table Badge on top right */}
          <div className="absolute top-4 right-4 z-10">
            <span className="px-3 py-1.5 rounded-full bg-white/95 text-[#211d1a] font-mono font-bold text-xs border border-[#e9e3dc] shadow-md flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
              TABLE {table.tableNumber}
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5 -mt-12 relative z-10 flex-1 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Restaurant Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-white shrink-0">
                <img
                  src={
                    restaurant.logo ||
                    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80'
                  }
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#d96236] font-bold bg-[#fff4ef] px-2 py-0.5 rounded border border-[#ffc9b5] shadow-xs">
                  {restaurant.currency} • Contemporary Bistro
                </span>
                <h1 className="text-xl font-black text-white font-serif tracking-tight truncate drop-shadow-sm mt-1">
                  {restaurant.name}
                </h1>
                <p className="text-[11px] text-[#e9e3dc] truncate">{table.section}</p>
              </div>
            </div>

            {/* If NOT yet joined session: Show Guest Name Onboarding Form */}
            <AnimatePresence mode="wait">
              {!joinedSessionData ? (
                <motion.div
                  key="onboarding-step"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-4"
                >
                  {/* Seated Diners Notice */}
                  {existingMembers.length > 0 ? (
                    <div className="p-3.5 rounded-2xl bg-[#fff4ef] border border-[#ffc9b5] text-xs space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-2 text-[#be4d27] font-bold">
                        <Users className="w-4 h-4 text-[#d96236]" />
                        <span>Seated at Table {table.tableNumber}:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {existingMembers.map((m, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-full bg-white text-[#4d443c] border border-[#e9e3dc] text-[11px] font-medium shadow-xs"
                          >
                            {m.displayName}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-[#7b726a] pt-1">
                        Join your dining companions in Session #{activeSession?.sessionNumber}!
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-white border border-[#e9e3dc] text-xs text-[#4d443c] flex items-center gap-2.5 shadow-xs">
                      <Sparkles className="w-4 h-4 text-[#d97706] shrink-0" />
                      <span>You are starting a fresh dining experience at this table.</span>
                    </div>
                  )}

                  {/* "What's your name?" Card */}
                  <div className="p-5 rounded-3xl bg-white border border-[#e9e3dc] shadow-sm space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-base font-black text-[#211d1a]">What's your name?</h2>
                      <p className="text-xs text-[#7b726a] leading-relaxed">
                        This identifies your food selections within your table's collaborative order.
                      </p>
                    </div>

                    <form onSubmit={handleJoinTable} className="space-y-4">
                      <Input
                        placeholder="e.g. Laksh, Priya, Rahul..."
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="text-base py-3"
                        autoFocus
                        required
                      />

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        isLoading={isJoining}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Join Table & Dine
                      </Button>
                    </form>
                  </div>
                </motion.div>
              ) : (
                /* Once Joined: Active Table Session Confirmation Card */
                <motion.div
                  key="joined-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="p-5 rounded-3xl bg-white border border-[#a7f3d0] shadow-md space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#ecfdf5] text-[#059669] flex items-center justify-center border border-[#a7f3d0]">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#059669] uppercase tracking-wide">
                            Connected to Table
                          </div>
                          <h3 className="text-base font-black text-[#211d1a]">
                            Session #{joinedSessionData.session.sessionNumber}
                          </h3>
                        </div>
                      </div>
                      <Badge variant="brand" size="sm" dot>
                        Active
                      </Badge>
                    </div>

                    {/* Member Roster */}
                    <div className="pt-2 border-t border-[#f5f1ec] space-y-2">
                      <div className="text-xs text-[#7b726a] font-semibold flex items-center justify-between">
                        <span>Dining Companions ({joinedSessionData.members?.length || 1})</span>
                        <span className="text-[10px] text-[#059669]">Collaborative Sync</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {joinedSessionData.members?.map((m: any, idx: number) => {
                          const isMe =
                            m.temporaryMemberId ===
                            joinedSessionData.currentMember?.temporaryMemberId;
                          return (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                                isMe
                                  ? 'bg-[#fff4ef] text-[#be4d27] border border-[#ffc9b5] font-bold shadow-xs'
                                  : 'bg-[#f5f1ec] text-[#4d443c] border border-[#e9e3dc]'
                              }`}
                            >
                              <span>{m.displayName}</span>
                              {isMe && <span className="text-[10px] opacity-80">(You)</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ready for Menu Notice */}
                    <div className="p-3 rounded-2xl bg-[#fbf9f6] border border-[#e9e3dc] text-xs text-[#4d443c]">
                      You are seated at <strong>Table {table.tableNumber}</strong>. Multiple guests can add items to this shared dining session from their own phones.
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={() => navigate('/customer')}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Browse Digital Menu
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Safety Indicator */}
          <div className="text-center pt-6 pb-2 text-[10px] text-[#7b726a] space-y-1">
            <p className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
              <span>DineFlow Smart Restaurant Session Engine • Zero App Download</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
