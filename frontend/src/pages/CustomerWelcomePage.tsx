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

      // Store temporary member identity in localStorage
      localStorage.setItem(`dineflow_temp_member_${token}`, result.currentMember.temporaryMemberId);
      localStorage.setItem(`dineflow_name_${token}`, result.currentMember.displayName);
      localStorage.setItem(`dineflow_active_session`, result.session.id);

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
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Verifying Table QR Token...</h3>
          <p className="text-xs text-stone-400">Connecting to restaurant dining engine</p>
        </div>
      </div>
    );
  }

  if (error || !tableData) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-stone-950 text-stone-100 flex justify-center selection:bg-orange-500 selection:text-white">
      {/* Mobile Shell Constraint */}
      <div className="w-full max-w-md min-h-screen bg-[#0c0a09] border-x border-stone-800/80 flex flex-col shadow-2xl relative overflow-hidden">
        {/* Restaurant Cover Banner */}
        <div className="relative h-52 w-full overflow-hidden">
          <img
            src={
              restaurant.coverImage ||
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
            }
            alt="Restaurant Cover"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/50 to-transparent" />

          {/* Table Badge on top right */}
          <div className="absolute top-4 right-4 z-10">
            <span className="px-3 py-1.5 rounded-full bg-stone-900/90 text-white font-mono font-bold text-xs border border-orange-500/40 shadow-lg flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              TABLE {table.tableNumber}
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5 -mt-12 relative z-10 flex-1 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Restaurant Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-stone-800 shadow-xl ring-2 ring-orange-500/20 bg-stone-900 shrink-0">
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
                <span className="text-[10px] uppercase font-mono tracking-widest text-orange-400 font-bold">
                  {restaurant.currency} • Contemporary Bistro
                </span>
                <h1 className="text-xl font-black text-white font-serif tracking-tight truncate">
                  {restaurant.name}
                </h1>
                <p className="text-[11px] text-stone-400 truncate">{table.section}</p>
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
                    <div className="p-3.5 rounded-2xl bg-orange-950/20 border border-orange-500/30 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-orange-300 font-bold">
                        <Users className="w-4 h-4 text-orange-400" />
                        <span>Seated at Table {table.tableNumber}:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {existingMembers.map((m, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-full bg-stone-900 text-stone-200 border border-stone-700 text-[11px] font-medium"
                          >
                            {m.displayName}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-stone-400 pt-1">
                        Join your dining companions in Session #{activeSession?.sessionNumber}!
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 text-xs text-stone-300 flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>You are starting a fresh dining experience at this table.</span>
                    </div>
                  )}

                  {/* "What's your name?" Card */}
                  <div className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-base font-black text-white">What's your name?</h2>
                      <p className="text-xs text-stone-400 leading-relaxed">
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
                  <div className="p-5 rounded-3xl bg-gradient-to-b from-stone-900 to-stone-950 border border-emerald-500/40 shadow-glow-green space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                            Connected to Table
                          </div>
                          <h3 className="text-base font-black text-white">
                            Session #{joinedSessionData.session.sessionNumber}
                          </h3>
                        </div>
                      </div>
                      <Badge variant="brand" size="sm" dot>
                        Active
                      </Badge>
                    </div>

                    {/* Member Roster */}
                    <div className="pt-2 border-t border-stone-800/80 space-y-2">
                      <div className="text-xs text-stone-400 font-semibold flex items-center justify-between">
                        <span>Dining Companions ({joinedSessionData.members?.length || 1})</span>
                        <span className="text-[10px] text-emerald-400">Collaborative Sync</span>
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
                                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-950'
                                  : 'bg-stone-800 text-stone-200 border border-stone-700'
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
                    <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 text-xs text-stone-300">
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
          <div className="text-center pt-6 pb-2 text-[10px] text-stone-500 space-y-1">
            <p className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>DineFlow Smart Restaurant Session Engine • Zero App Download</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
