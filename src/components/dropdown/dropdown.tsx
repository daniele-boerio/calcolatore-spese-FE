import { Dropdown as DropdownPrime, type DropdownChangeEvent } from 'primereact/dropdown';
import './dropdown.scss';

export type DropdownProps = {
  panelWidth?: string;
  className?: string;
  label?: string;
  id?: string;
  value: unknown;
  onChange: (e: DropdownChangeEvent) => void;
  options: unknown[];
  optionLabel?: string;
  optionValue?: string;
  placeholder: string;
  optionGroupLabel?: string;
  optionGroupTemplate?: (option: unknown) => React.ReactNode;
  optionGroupChildren?: string;
  filter?: boolean;
  disabled?: boolean;
  itemTemplate?: (option: unknown) => React.ReactNode;
  valueTemplate?: (option: unknown) => React.ReactNode;
  hidden?: boolean;
  showClear?: boolean;
};

export default function Dropdown(props: DropdownProps) {
  return (
    <div className={`div-dropdown ${props.className ?? ''}`}>
      {props.label && <p className="label-dropdown">{props.label}</p>}
      <DropdownPrime
        id={props.id}
        value={props.value}
        onChange={props.onChange}
        options={props.options}
        optionLabel={props.optionLabel}
        optionValue={props.optionValue}
        placeholder={props.placeholder}
        optionGroupLabel={props.optionGroupLabel}
        optionGroupTemplate={props.optionGroupTemplate}
        optionGroupChildren={props.optionGroupChildren}
        filter={props.filter}
        disabled={props.disabled}
        itemTemplate={props.itemTemplate}
        valueTemplate={props.valueTemplate}
        className={props.hidden ? 'hidden-dropdown' : ''}
        showClear={props.showClear}
        pt={{
          panel: {
            style: {
              width: props.panelWidth,
            },
          },
        }}
      />
    </div>
  );
}
