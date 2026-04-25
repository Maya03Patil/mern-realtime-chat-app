import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10 bg-white/50 dark:bg-[#111b21]/80 backdrop-blur-sm">
      <div className="w-32 h-32 bg-green-50 dark:bg-[#202c33] rounded-full flex items-center justify-center mb-6 shadow-inner">
        <MessageSquare className="w-16 h-16 text-green-500 dark:text-[#00a884] opacity-80" />
      </div>
      <h1 className="text-3xl font-light text-gray-800 dark:text-[#e9edef] mb-3">ChatSphere Web</h1>
      <p className="text-gray-500 dark:text-[#8696a0] max-w-md text-[15px] leading-relaxed mb-8">
        Send and receive messages without keeping your phone online.<br/>
        Use ChatSphere on up to 4 linked devices and 1 phone at the same time.
      </p>
      
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 dark:text-[#667781] mt-auto absolute bottom-10">
        <span className="w-3 h-3 border-2 border-current rounded-full border-dashed mr-1" />
        <p>End-to-end encrypted</p>
      </div>
    </div>
  );
}
