"use client";

import React from "react";
import { X, Printer, ChefHat, Clock, CheckCircle2 } from "lucide-react";
import { KitchenTicket } from "@/lib/types/restaurant";

interface KitchenTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: KitchenTicket | null;
}

export const KitchenTicketModal: React.FC<KitchenTicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  if (!isOpen || !ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-sm bg-card border border-border shadow-2xl rounded-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 text-primary">
            <ChefHat className="w-5 h-5" />
            <span className="font-bold text-sm text-foreground">
              Kitchen Order Ticket (KOT)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Slip Content (Simulates 80mm receipt) */}
        <div className="p-6 bg-white text-black font-mono text-xs space-y-4">
          <div className="text-center border-b-2 border-dashed border-gray-400 pb-3">
            <h3 className="text-base font-black tracking-wider uppercase">
              *** KITCHEN ORDER ***
            </h3>
            <p className="text-xs font-bold text-gray-700 mt-1">
              {ticket.ticketNumber}
            </p>
            <div className="flex items-center justify-between mt-2 text-[11px] text-gray-600">
              <span>Station: {ticket.station.toUpperCase()}</span>
              <span>{new Date(ticket.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold border-b border-gray-300 pb-2">
            <span className="text-sm uppercase font-black">
              {ticket.tableName}
            </span>
            <span>Guests: {ticket.guestCount} Pax</span>
          </div>

          <div className="text-[11px] text-gray-600">
            Server: <b className="text-black">{ticket.serverName}</b>
          </div>

          {/* Items Table */}
          <div className="space-y-2 border-t border-b border-gray-300 py-3">
            {ticket.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex items-start justify-between font-bold text-xs">
                  <span className="w-6 text-black">{item.quantity}x</span>
                  <span className="flex-1 text-black">{item.itemName}</span>
                  {item.course && (
                    <span className="text-[10px] uppercase text-gray-600">
                      [{item.course}]
                    </span>
                  )}
                </div>

                {item.modifiers && item.modifiers.length > 0 && (
                  <div className="pl-6 text-[10px] text-gray-700">
                    {item.modifiers.map((m, mIdx) => (
                      <div key={mIdx}>• {m.optionName}</div>
                    ))}
                  </div>
                )}

                {item.notes && (
                  <div className="pl-6 text-[10px] font-bold text-red-700">
                    ** NOTE: {item.notes} **
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center text-[10px] text-gray-500 pt-1 border-b-2 border-dashed border-gray-400 pb-3">
            Sent to Kitchen • Punch POS
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-border hover:bg-muted"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Slip
          </button>
        </div>
      </div>
    </div>
  );
};
