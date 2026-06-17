"use client";

import { Children, useState } from "react";

/** Abas simples. Cada filho (na ordem) é o conteúdo de uma aba. */
export function Tabs({
  tabs,
  children,
}: {
  tabs: string[];
  children: React.ReactNode;
}) {
  const panels = Children.toArray(children);
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-navy-100 print:hidden">
        {tabs.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setActive(i)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition ${
              active === i
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-navy-500 hover:text-navy-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {panels.map((p, i) => (
        <div key={i} className={i === active ? "" : "hidden print:block"}>
          {p}
        </div>
      ))}
    </div>
  );
}
