import { InputSwitch as SwitchPrime, type InputSwitchChangeEvent } from 'primereact/inputswitch';
import './switch.scss';

export type SwitchProps = {
  className?: string;
  label?: string;
  id?: string;
  checked?: boolean;
  onChange?: (e: InputSwitchChangeEvent) => void;
  disabled?: boolean;
  hidden?: boolean;
};

export default function Switch(props: SwitchProps) {
  return (
    <div className={`div-switch ${props.className ?? ''}`}>
      {props.label && <p className="label-switch">{props.label}</p>}
      <SwitchPrime
        id={props.id}
        checked={props.checked || false}
        onChange={props.onChange}
        disabled={props.disabled}
        className={props.hidden ? 'hidden-switch' : ''}
        pt={{
          slider: {
            style: {
              backgroundColor: props.checked ? 'var(--bko-color-primary)' : 'var(--bko-color-tertiary)',
              color: 'black',
              borderRadius: '5rem',
            },
          },
        }}
      />
    </div>
  );
}
