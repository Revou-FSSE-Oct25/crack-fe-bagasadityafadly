'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/layout/Topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { GymClass, Schedule, Trainer } from '@/types';
import { cn } from '@/lib/utils';

const difficultyColor: Record<string, string> = {
  BEGINNER:     'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED:     'bg-red-100 text-red-700',
};

type View = 'classes' | 'schedules';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

interface BookingModalProps {
  schedule: Schedule;
  onClose: () => void;
  onBooked: () => void;
}

function BookingModal({ schedule, onClose, onBooked }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleBook() {
    setLoading(true);
    setError('');
    try {
      await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          type: 'CLASS',
          scheduleId: schedule.id,
          bookingDate: schedule.startTime,
        }),
      });
      onBooked();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">{schedule.class.name}</h2>
          <p className="text-sm text-zinc-500 mt-0.5">with {schedule.trainer.name}</p>
        </div>

        <div className="bg-zinc-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Date</span>
            <span className="font-medium">{formatDate(schedule.startTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Time</span>
            <span className="font-medium">{formatTime(schedule.startTime)} – {formatTime(schedule.endTime)}</span>
          </div>
          {schedule.roomOrZone && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Room</span>
              <span className="font-medium">{schedule.roomOrZone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-zinc-500">Spots Left</span>
            <span className={cn('font-medium', schedule.spotsLeft === 0 ? 'text-red-500' : 'text-green-600')}>
              {schedule.spotsLeft} / {schedule.class.capacity}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleBook}
            disabled={loading || schedule.spotsLeft === 0}
          >
            {loading ? 'Booking…' : schedule.spotsLeft === 0 ? 'Full' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface PTBookingModalProps {
  schedule: Schedule;
  onClose: () => void;
  onBooked: () => void;
}

function PTBookingModal({ schedule, onClose, onBooked }: PTBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleBook() {
    setLoading(true);
    setError('');
    try {
      await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          type: 'PT',
          scheduleId: schedule.id,
          trainerId: schedule.trainer.id,
          bookingDate: schedule.startTime,
        }),
      });
      onBooked();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">PT Session</h2>
          <p className="text-sm text-zinc-500 mt-0.5">with {schedule.trainer.name}</p>
          {schedule.trainer.specialty && (
            <p className="text-xs text-orange-500 mt-0.5">{schedule.trainer.specialty}</p>
          )}
        </div>

        <div className="bg-zinc-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Class</span>
            <span className="font-medium">{schedule.class.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Date</span>
            <span className="font-medium">{formatDate(schedule.startTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Time</span>
            <span className="font-medium">{formatTime(schedule.startTime)} – {formatTime(schedule.endTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Spots Left</span>
            <span className={cn('font-medium', schedule.spotsLeft === 0 ? 'text-red-500' : 'text-green-600')}>
              {schedule.spotsLeft} / {schedule.class.capacity}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleBook}
            disabled={loading || schedule.spotsLeft === 0}
          >
            {loading ? 'Booking…' : schedule.spotsLeft === 0 ? 'Full' : 'Book PT Session'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ClassesPage() {
  const user = useAuthStore((s) => s.user);
  const isMember = user?.role === 'MEMBER' || user?.role === 'ADMIN';

  const [view, setView] = useState<View>('schedules');
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [bookingModal, setBookingModal] = useState<Schedule | null>(null);
  const [ptModal, setPtModal] = useState<Schedule | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [classData, scheduleData, trainerData] = await Promise.all([
        apiFetch<GymClass[]>('/classes'),
        apiFetch<Schedule[]>('/schedules'),
        apiFetch<Trainer[]>('/trainers'),
      ]);
      setClasses(classData);
      setSchedules(scheduleData);
      setTrainers(trainerData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function handleBooked() {
    setBookingModal(null);
    setPtModal(null);
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 4000);
    loadData();
  }

  const filteredSchedules = schedules.filter((s) => {
    if (selectedClass && s.class.id !== selectedClass) return false;
    if (selectedTrainer && s.trainer.id !== selectedTrainer) return false;
    return true;
  });

  return (
    <div className="flex flex-col flex-1">
      <Topbar />

      {/* Booking success toast */}
      {bookingSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
          ✓ Booking confirmed! Check My Bookings for details.
        </div>
      )}

      {/* Upgrade modal for NON_MEMBER */}
      {showUpgradeModal && (
        <UpgradeModal
          feature="group classes and PT sessions"
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      {/* Booking modals */}
      {bookingModal && (
        <BookingModal
          schedule={bookingModal}
          onClose={() => setBookingModal(null)}
          onBooked={handleBooked}
        />
      )}
      {ptModal && (
        <PTBookingModal
          schedule={ptModal}
          onClose={() => setPtModal(null)}
          onBooked={handleBooked}
        />
      )}

      <main className="flex-1 p-6 flex flex-col gap-6">
        {/* Non-member info strip — visible but non-blocking */}
        {!isMember && (
          <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium text-orange-800 text-sm">You&apos;re browsing as a non-member</p>
              <p className="text-xs text-orange-600 mt-0.5">
                You can view all classes and upcoming sessions. Tap any &ldquo;Book&rdquo; button to see upgrade options.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
              onClick={() => setShowUpgradeModal(true)}
            >
              View Plans
            </Button>
          </div>
        )}

        {/* View toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('schedules')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              view === 'schedules' ? 'bg-orange-500 text-white' : 'bg-white border text-zinc-600 hover:border-orange-300'
            )}
          >
            📅 Upcoming Sessions
          </button>
          <button
            onClick={() => setView('classes')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              view === 'classes' ? 'bg-orange-500 text-white' : 'bg-white border text-zinc-600 hover:border-orange-300'
            )}
          >
            🧘 Browse Classes
          </button>
        </div>

        {/* SCHEDULES VIEW */}
        {view === 'schedules' && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mt-2">
                <select
                  value={selectedClass ?? ''}
                  onChange={(e) => setSelectedClass(e.target.value || null)}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-orange-400"
                >
                  <option value="">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={selectedTrainer ?? ''}
                  onChange={(e) => setSelectedTrainer(e.target.value || null)}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-orange-400"
                >
                  <option value="">All Trainers</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-zinc-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredSchedules.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📅</p>
                  <p className="text-sm font-medium text-zinc-600">No upcoming sessions</p>
                  <p className="text-xs text-zinc-400 mt-1">Try clearing your filters or check back later.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredSchedules.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-4 rounded-xl border bg-white hover:shadow-sm transition-shadow gap-4 flex-wrap"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Date block */}
                        <div className="flex flex-col items-center justify-center w-12 shrink-0">
                          <span className="text-xs font-medium text-orange-500 uppercase">
                            {new Date(s.startTime).toLocaleDateString('en-GB', { weekday: 'short' })}
                          </span>
                          <span className="text-xl font-bold text-zinc-800 leading-none">
                            {new Date(s.startTime).getDate()}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {new Date(s.startTime).toLocaleDateString('en-GB', { month: 'short' })}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-zinc-900">{s.class.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[s.class.difficulty] ?? ''}`}>
                              {s.class.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {formatTime(s.startTime)} – {formatTime(s.endTime)} · with {s.trainer.name}
                            {s.roomOrZone && ` · ${s.roomOrZone}`}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                            <span>⏱ {s.class.durationMinutes}min</span>
                            {s.class.caloriesEstimate && <span>🔥 ~{s.class.caloriesEstimate}cal</span>}
                            <span className={s.spotsLeft === 0 ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}>
                              {s.spotsLeft === 0 ? 'Full' : `${s.spotsLeft} spots left`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {isMember ? (
                          <>
                            <Button
                              size="sm"
                              className="bg-orange-500 hover:bg-orange-600 text-white"
                              onClick={() => setBookingModal(s)}
                              disabled={s.spotsLeft === 0}
                            >
                              {s.spotsLeft === 0 ? 'Full' : 'Book Class'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-200 text-purple-600 hover:bg-purple-50"
                              onClick={() => setPtModal(s)}
                              disabled={s.spotsLeft === 0}
                            >
                              Book PT
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-200 text-orange-500 hover:bg-orange-50"
                            onClick={() => setShowUpgradeModal(true)}
                          >
                            🔒 Join to Book
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* CLASSES BROWSE VIEW */}
        {view === 'classes' && (
          <Card>
            <CardHeader>
              <CardTitle>Browse Classes ({classes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-zinc-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : classes.length === 0 ? (
                <p className="text-sm text-zinc-400 py-8 text-center">
                  No classes available yet. Check back soon.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {classes.map((cls) => {
                    const clsSchedules = schedules.filter((s) => s.class.id === cls.id);
                    return (
                      <div
                        key={cls.id}
                        className="flex flex-col gap-3 p-4 rounded-xl border bg-white hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-zinc-900">{cls.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[cls.difficulty] ?? ''}`}>
                            {cls.difficulty}
                          </span>
                        </div>
                        {cls.description && (
                          <p className="text-sm text-zinc-500">{cls.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <span>⏱ {cls.durationMinutes} min</span>
                          <span>👥 {cls.capacity} spots</span>
                          {cls.caloriesEstimate && <span>🔥 ~{cls.caloriesEstimate} cal</span>}
                        </div>

                        {clsSchedules.length > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Next Sessions</p>
                            {clsSchedules.slice(0, 2).map((s) => (
                              <div key={s.id} className="flex items-center justify-between text-xs">
                                <span className="text-zinc-600">
                                  {formatDate(s.startTime)} · {formatTime(s.startTime)}
                                </span>
                                {isMember ? (
                                  <button
                                    onClick={() => setBookingModal(s)}
                                    disabled={s.spotsLeft === 0}
                                    className="text-orange-500 font-medium hover:text-orange-600 disabled:text-zinc-400"
                                  >
                                    {s.spotsLeft === 0 ? 'Full' : 'Book →'}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setShowUpgradeModal(true)}
                                    className="text-orange-400 font-medium hover:text-orange-500"
                                  >
                                    🔒 Join
                                  </button>
                                )}
                              </div>
                            ))}
                            {clsSchedules.length > 2 && (
                              <button
                                onClick={() => { setView('schedules'); setSelectedClass(cls.id); }}
                                className="text-xs text-orange-500 hover:underline text-left"
                              >
                                +{clsSchedules.length - 2} more sessions →
                              </button>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-400 italic">No upcoming sessions scheduled</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Trainers section */}
        {trainers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Our Trainers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {trainers.map((t) => (
                  <div key={t.id} className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-white text-center">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 text-sm">{t.name}</p>
                      {t.specialty && <p className="text-xs text-orange-500 mt-0.5">{t.specialty}</p>}
                      {t.bio && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{t.bio}</p>}
                    </div>
                    {isMember && (
                      <button
                        onClick={() => { setView('schedules'); setSelectedTrainer(t.id); }}
                        className="text-xs text-orange-500 font-medium hover:underline"
                      >
                        View Sessions →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
