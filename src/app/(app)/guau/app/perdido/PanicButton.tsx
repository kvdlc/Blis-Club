"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { POSTER_FIELDS } from "@/lib/poster";

interface PanicFields {
  lost_location: string;
  lost_notes: string;
  poster_contact: string;
  poster_reward_amount: string;
}

interface Props {
  dogName: string;
  onSubmit: (fields: PanicFields) => void;
  loading: boolean;
}

export function PanicButton({ dogName, onSubmit, loading }: Props) {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<PanicFields>({
    lost_location: "",
    lost_notes: "",
    poster_contact: "",
    poster_reward_amount: "",
  });

  const handleSubmit = () => {
    onSubmit(fields);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full card-soft rounded-2xl p-5 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-red-600 dark:text-red-400 text-lg">
              Marcar como Perdido
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Generá un afiche y QR para encontrar a {dogName}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
            <span className="text-red-500 font-bold">!</span>
          </div>
        </div>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-zinc-900 rounded-t-3xl md:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                  Reportar {dogName} como perdido
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Esta información aparecerá en el afiche y en la página pública del perfil. Podrás editarla después.
            </p>

            {/* Location */}
            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {POSTER_FIELDS.lost_location.label}
                <span className="text-zinc-300 dark:text-zinc-600 ml-1">
                  ({fields.lost_location.length}/{POSTER_FIELDS.lost_location.max})
                </span>
              </label>
              <input
                type="text"
                maxLength={POSTER_FIELDS.lost_location.max}
                placeholder={POSTER_FIELDS.lost_location.placeholder}
                value={fields.lost_location}
                onChange={(e) => setFields({ ...fields, lost_location: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/40"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {POSTER_FIELDS.lost_notes.label}
                <span className="text-zinc-300 dark:text-zinc-600 ml-1">
                  ({fields.lost_notes.length}/{POSTER_FIELDS.lost_notes.max})
                </span>
              </label>
              <textarea
                rows={3}
                maxLength={POSTER_FIELDS.lost_notes.max}
                placeholder={POSTER_FIELDS.lost_notes.placeholder}
                value={fields.lost_notes}
                onChange={(e) => setFields({ ...fields, lost_notes: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/40 resize-none"
              />
            </div>

            {/* Contact */}
            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {POSTER_FIELDS.poster_contact.label}
                <span className="text-zinc-300 dark:text-zinc-600 ml-1">
                  ({fields.poster_contact.length}/{POSTER_FIELDS.poster_contact.max})
                </span>
              </label>
              <input
                type="text"
                maxLength={POSTER_FIELDS.poster_contact.max}
                placeholder={POSTER_FIELDS.poster_contact.placeholder}
                value={fields.poster_contact}
                onChange={(e) => setFields({ ...fields, poster_contact: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/40"
              />
            </div>

            {/* Reward */}
            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {POSTER_FIELDS.poster_reward_amount.label}
                <span className="text-zinc-300 dark:text-zinc-600 ml-1">
                  ({fields.poster_reward_amount.length}/{POSTER_FIELDS.poster_reward_amount.max})
                </span>
              </label>
              <input
                type="text"
                maxLength={POSTER_FIELDS.poster_reward_amount.max}
                placeholder={POSTER_FIELDS.poster_reward_amount.placeholder}
                value={fields.poster_reward_amount}
                onChange={(e) => setFields({ ...fields, poster_reward_amount: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/40"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "Guardando..." : `Reportar a ${dogName} como perdido`}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
