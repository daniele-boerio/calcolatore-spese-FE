import type { IOption } from '@/types/option.ts';
import clsx from 'clsx';
import './chip-singleselect.scss';

interface IChipSingleselectProps {
  options: IOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function ChipSingleselect({ options, value, onChange }: IChipSingleselectProps) {
  const handleClick = (id: string) => {
    onChange(id);
  };
  return (
    <div className="chip-singleselect">
      {options.map((option) => {
        const isChecked = value === option.id;
        return (
          <span
            key={option.id}
            className={clsx('tag-item text-12', isChecked && 'active')}
            onClick={() => handleClick(option.id)}
          >
            <div className={clsx('circle', isChecked && 'checked')} />
            {option.value}
          </span>
        );
      })}
    </div>
  );
}
