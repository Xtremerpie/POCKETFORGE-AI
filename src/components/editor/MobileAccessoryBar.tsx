import React from 'react';
import { Undo2, Redo2, ArrowRightToLine, ArrowLeftToLine } from 'lucide-react';

interface MobileAccessoryBarProps {
  onInsertText: (text: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onIndent?: () => void;
  onOutdent?: () => void;
}

const COMMON_SYMBOLS = [
  '{', '}', '(', ')', '[', ']', '<', '>', 
  '=', '+', '-', '*', '/', ';', ':', '\'', 
  '"', '`', '$', '_', '!', '?', '&', '|', 
  '.', ',', '=>'
];

export const MobileAccessoryBar: React.FC<MobileAccessoryBarProps> = ({
  onInsertText,
  onUndo,
  onRedo,
  onIndent,
  onOutdent,
}) => {
  return (
    <div className="bg-forge-900 border-t border-forge-750 px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto select-none no-scrollbar touch-pan-x">
      {/* Indent / Outdent Controls */}
      {onOutdent && (
        <button
          onClick={onOutdent}
          className="h-8 px-2.5 rounded-lg bg-forge-800 hover:bg-forge-750 text-forge-300 font-mono text-xs flex items-center justify-center flex-shrink-0 active:bg-electric-500 active:text-forge-950 transition-colors"
          title="Outdent"
        >
          <ArrowLeftToLine className="w-3.5 h-3.5" />
        </button>
      )}

      {onIndent && (
        <button
          onClick={onIndent}
          className="h-8 px-2.5 rounded-lg bg-forge-800 hover:bg-forge-750 text-forge-300 font-mono text-xs flex items-center justify-center flex-shrink-0 active:bg-electric-500 active:text-forge-950 transition-colors"
          title="Indent (Tab)"
        >
          <ArrowRightToLine className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Undo / Redo Controls */}
      {onUndo && (
        <button
          onClick={onUndo}
          className="h-8 px-2.5 rounded-lg bg-forge-800 hover:bg-forge-750 text-forge-300 font-mono text-xs flex items-center justify-center flex-shrink-0 active:bg-electric-500 active:text-forge-950 transition-colors"
          title="Undo"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
      )}

      {onRedo && (
        <button
          onClick={onRedo}
          className="h-8 px-2.5 rounded-lg bg-forge-800 hover:bg-forge-750 text-forge-300 font-mono text-xs flex items-center justify-center flex-shrink-0 active:bg-electric-500 active:text-forge-950 transition-colors"
          title="Redo"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="w-[1px] h-5 bg-forge-750 mx-1 flex-shrink-0" />

      {/* Quick Programming Characters */}
      {COMMON_SYMBOLS.map((sym) => (
        <button
          key={sym}
          onClick={() => onInsertText(sym)}
          className="h-8 min-w-[32px] px-2 rounded-lg bg-forge-850 hover:bg-forge-800 text-electric-400 border border-forge-800 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 active:scale-95 active:bg-electric-500 active:text-forge-950 transition-all"
        >
          {sym}
        </button>
      ))}
    </div>
  );
};
