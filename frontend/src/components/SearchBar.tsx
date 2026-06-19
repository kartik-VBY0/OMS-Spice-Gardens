interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder }: Props) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? 'Search...'}
      className="w-full rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm shadow-md shadow-stone-200/50 outline-none transition-all placeholder:text-stone-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
    />
  );
}
