import React from 'react';
import { PendingCommandApproval } from '../../types';
import { ShieldAlert, Check, X, Terminal, AlertTriangle } from 'lucide-react';
import { validateSafeCommand } from '../../services/security';

interface CommandApprovalModalProps {
  pendingCommand: PendingCommandApproval | null;
  onApprove: (cmd: PendingCommandApproval) => void;
  onReject: () => void;
}

export const CommandApprovalModal: React.FC<CommandApprovalModalProps> = ({
  pendingCommand,
  onApprove,
  onReject,
}) => {
  if (!pendingCommand) return null;

  const safetyCheck = validateSafeCommand(pendingCommand.command);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forge-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-forge-900 border border-forge-700 max-w-md w-full rounded-2xl p-5 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Execute Command Approval</h3>
            <p className="text-xs text-forge-400 mt-0.5">
              An AI agent or workflow requested to run a shell command on your Android phone via Termux.
            </p>
          </div>
        </div>

        {/* Reason / Source */}
        <div className="bg-forge-850 p-3 rounded-xl border border-forge-800 space-y-1.5 text-xs">
          <div className="flex justify-between text-forge-400">
            <span>Origin:</span>
            <span className="font-mono text-electric-400 capitalize">{pendingCommand.source.replace('_', ' ')}</span>
          </div>
          <div className="text-forge-300">
            <span className="text-forge-400">Purpose: </span>
            {pendingCommand.reason}
          </div>
          {pendingCommand.cwd && (
            <div className="text-forge-400 font-mono text-[11px] truncate">
              Working Dir: <span className="text-forge-200">{pendingCommand.cwd}</span>
            </div>
          )}
        </div>

        {/* The Exact Command */}
        <div>
          <label className="text-[11px] uppercase tracking-wider font-mono text-forge-400 block mb-1">
            Exact Command:
          </label>
          <div className="bg-forge-950 border border-forge-800 rounded-xl p-3 font-mono text-xs text-emerald-400 flex items-center gap-2 overflow-x-auto select-all">
            <Terminal className="w-4 h-4 text-forge-500 flex-shrink-0" />
            <code>{pendingCommand.command}</code>
          </div>
        </div>

        {/* Security Warning if pattern matched */}
        {!safetyCheck.safe && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Warning: {safetyCheck.warning}. Proceed with extreme caution.</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            onClick={onReject}
            className="flex-1 py-2.5 px-4 rounded-xl border border-forge-700 bg-forge-800 hover:bg-forge-750 text-forge-300 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Reject Command</span>
          </button>
          <button
            onClick={() => onApprove(pendingCommand)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-forge-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Approve & Execute</span>
          </button>
        </div>
      </div>
    </div>
  );
};
