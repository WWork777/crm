"use client";

import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import { Fragment } from "react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  icon?: React.ReactNode;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  icon,
}: CustomSelectProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full sm:w-52">
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          {/* Кнопка открытия (Dark Glass Style) */}
          <Listbox.Button className="relative w-full cursor-pointer rounded-2xl bg-[#0f172a]/50 backdrop-blur-xl border border-white/5 py-3 pl-4 pr-10 text-left transition-all hover:border-white/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/10">
            <span className="flex items-center gap-3 truncate">
              {icon && <span className="shrink-0">{icon}</span>}
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-200 truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-600">
              <ChevronDown size={14} aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {/* Выпадающий список */}
            <Listbox.Options className="absolute z-[70] mt-3 max-h-64 w-full overflow-auto rounded-[2rem] bg-[#0f172a] p-2 shadow-2xl ring-1 ring-white/10 focus:outline-none backdrop-blur-xl border border-white/5 custom-scrollbar">
              {options.map((option, idx) => (
                <Listbox.Option
                  key={idx}
                  className={({ active }) =>
                    `relative cursor-pointer select-none rounded-xl py-3 pl-10 pr-4 transition-all ${
                      active ? "bg-white/5 text-indigo-400" : "text-slate-400"
                    }`
                  }
                  value={option.value}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate text-[10px] font-black uppercase tracking-widest ${
                          selected ? "text-indigo-400" : ""
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-400">
                          <Check size={14} aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
