"use client";

import { m, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";

interface BankTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderAmount: number;
  orderId: string;
}

const BANK_DETAILS = {
  bankName: "Moniepoint MFB",
  accountName: "Lagos Liquor Nig Ltd",
  accountNumber: "4005681483",
};

export default function BankTransferModal({
  isOpen,
  onClose,
  onConfirm,
  orderAmount,
  orderId,
}: BankTransferModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <m.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-cream max-w-lg w-full max-h-[90vh] overflow-y-auto border-2 border-wine"
          >
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl sm:text-3xl font-normal text-ink uppercase">
                  Bank Transfer Details
                </h2>
                <button
                  onClick={onClose}
                  className="text-ink/60 hover:text-wine transition-colors"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-wine/5 p-4 sm:p-6 space-y-4">
                  <div>
                    <p className="text-xs uppercase text-wine/70 mb-1">Bank Name</p>
                    <p className="text-dark font-medium text-lg">{BANK_DETAILS.bankName}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-wine/70 mb-1">Account Name</p>
                    <p className="text-dark font-medium text-lg">{BANK_DETAILS.accountName}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-wine/70 mb-1">Account Number</p>
                    <p className="text-dark font-medium text-2xl tracking-wider">
                      {BANK_DETAILS.accountNumber}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-wine/10">
                    <p className="text-xs uppercase text-wine/70 mb-1">Amount to Pay</p>
                    <p className="text-wine font-semibold text-2xl">
                      ₦{orderAmount.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-wine/70 mb-1">Order Reference</p>
                    <p className="text-dark font-mono text-sm bg-cream px-3 py-2 border border-wine/20">
                      {orderId}
                    </p>
                  </div>
                </div>

                <div className="bg-gold/10 p-4 border border-gold/30">
                  <p className="text-xs text-dark">
                    <strong>Important:</strong> Please include your order reference ({orderId}) in the
                    transfer description/narration. This helps us confirm your payment faster.
                  </p>
                </div>

                <div className="space-y-3 text-sm text-ink/70">
                  <p className="font-medium text-ink">Next Steps:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Transfer the exact amount to the account details above</li>
                    <li>Include your order reference in the transfer description</li>
                    <li>Click the "Confirm Transfer" button below</li>
                    <li>Send us a WhatsApp message with payment proof</li>
                    <li>We'll confirm and process your order within 30 minutes</li>
                  </ol>
                </div>

                <button
                  onClick={onConfirm}
                  className="w-full bg-wine text-cream py-3 px-6 border-2 border-wine hover:bg-transparent hover:text-wine transition-all duration-300 uppercase font-medium"
                >
                  Confirm Transfer & Contact Us
                </button>

                <button
                  onClick={onClose}
                  className="w-full border-2 border-wine/20 text-dark py-3 px-6 hover:border-wine hover:text-wine transition-all duration-300 uppercase"
                >
                  Cancel
                </button>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
