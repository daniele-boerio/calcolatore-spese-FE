import {
  InputNumber as InputNumberPrime,
  InputNumberValueChangeEvent, // Tipo aggiornato
} from "primereact/inputnumber";
import React from "react";
import "./input_number.scss";

export type InputNumberProps = {
  id?: string;
  value?: number | null;
  onChange?: (e: InputNumberValueChangeEvent) => void; // Tipo aggiornato qui
  placeholder?: string;
  className?: string;
  label?: string;
  autoFocus?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  icon?: string;
  iconPos?: "left" | "right";
  invalid?: boolean;
  mode?: "decimal" | "currency";
  currency?: string;
  locale?: string;
  min?: number;
  max?: number;
  minFractionDigits?: number;
  maxFractionDigits?: number;
};

export default function InputNumber(props: InputNumberProps) {
  return (
    <div
      className={`div-inputnumber ${props.className ?? ""} ${props.invalid ? "p-invalid" : ""}`}
    >
      {props.label && (
        <p className={`label-inputnumber`}>
          <label htmlFor={props.id}>{props.label}</label>
        </p>
      )}

      <div className={`div-div-inputnumber`}>
        {props.icon && props.iconPos === "left" && (
          <i className={`icon-inputnumber ${props.icon ?? ""}`} />
        )}

        <InputNumberPrime
          id={props.id}
          value={props.value}
          onValueChange={props.onChange} // Punta ora al tipo corretto
          placeholder={props.placeholder || ""}
          autoFocus={props.autoFocus}
          onClick={props.onClick}
          onBlur={props.onBlur}
          onKeyDown={props.onKeyDown}
          disabled={props.disabled}
          invalid={props.invalid}
          mode={props.mode}
          currency={props.currency}
          locale={props.locale || "it-IT"}
          min={props.min}
          max={props.max}
          minFractionDigits={props.minFractionDigits}
          maxFractionDigits={props.maxFractionDigits}
          inputClassName="p-inputnumber"
        />

        {props.icon && props.iconPos === "right" && (
          <i className={`icon-inputnumber ${props.icon ?? ""}`} />
        )}
      </div>
    </div>
  );
}
