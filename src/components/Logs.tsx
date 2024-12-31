"use client";

import classNames from "classnames";
import React, { type FC, useEffect, useState } from "react";

type TLogRecord = {
  id: string;
  timestamp: string;
  body: string;
  severity_text: string;
  severity_number: number;
};

export const Logs: FC = ({}) => {
  const [logs, setLogs] = useState<TLogRecord[]>([]);
  useEffect(() => {
    fetch("/api/logs", {
      headers: {
        "Content-Type": "text/event-stream",
      },
    }).then(async (res) => {
      const reader = res.body?.pipeThrough(new TextDecoderStream()).getReader();

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            console.log("closing connection");
            break;
          }

          if (value) {
            setLogs((state) => [...state, JSON.parse(value)]);
          }
        }
      }
    });
  }, []);

  return (
    <div className="flex flex-col gap-0 divide-y border border-neutral-800 px-2 rounded-lg max-h-[calc(100vh-6rem)] overflow-x-auto bg-neutral-900">
      {logs.length ? (
        logs
          .slice()
          .reverse()
          .map((log) => (
            <div
              key={log?.id}
              className="grid grid-cols-12 py-1.5 border-neutral-800 items-center"
            >
              <span className="col-span-4 flex gap-2 items-center">
                <LogSeverity severity_number={log?.severity_number} />
                <span className="text-xs font-mono tracking-wide">
                  {log?.timestamp}
                </span>
              </span>
              <span className="col-span-2 text-xs font-mono tracking-widest">
                {log?.severity_text}
              </span>
              <span className="col-span-5 text-xs font-mono tracking-wide">
                {log?.body}
              </span>
            </div>
          ))
      ) : (
        <span className="flex items-center my-1.5 gap-2">
          <LogSeverity severity_number={0} />
          <span className="text-xs font-mono tracking-wide">
            Waiting on logs...
          </span>
        </span>
      )}
    </div>
  );
};

const LogSeverity: FC<{ severity_number: number }> = ({ severity_number }) => {
  function inRange(min: number, max: number): boolean {
    return severity_number >= min && severity_number <= max;
  }

  return (
    <span
      className={classNames("block h-6 w-0.5", {
        "bg-green-400 animate-pulse": inRange(0, 0),
        "bg-orange-300": inRange(1, 4),
        "bg-indigo-300": inRange(5, 8),
        "bg-indigo-600": inRange(9, 12),
        "bg-yellow-400": inRange(13, 16),
        "bg-red-500": inRange(17, 20),
        "bg-red-900": inRange(21, 24),
      })}
    />
  );
};
