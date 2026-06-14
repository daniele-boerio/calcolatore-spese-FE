import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import Button from "../../button/button";
import InputText from "../../input_text/input_text";
import Dropdown from "../../dropdown/dropdown";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { splitTransaction } from "../../../features/transactions/api_calls";
import { Transaction } from "../../../features/transactions/interfaces";
import { selectCategoriaCategorie } from "../../../features/categorie/categoria_slice";
import { selectTagTags } from "../../../features/tags/tag_slice";
import "./split_transaction_dialog.scss";
import { useI18n } from "../../../i18n/use-i18n";

interface SplitPart {
  importo: number;
  categoria_id?: string | null;
  sottocategoria_id?: string | null;
  tag_id?: string | null;
  descrizione?: string | null;
  debito_id?: number | null;
}

interface Props {
  visible: boolean;
  onHide: () => void;
  transaction?: Transaction | null;
}

export default function SplitTransactionDialog({
  visible,
  onHide,
  transaction,
}: Props) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const categorie = useAppSelector(selectCategoriaCategorie);
  const tags = useAppSelector(selectTagTags);

  const [parts, setParts] = useState<SplitPart[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && transaction) {
      // initialize with one part equal to full amount
      setParts([
        {
          importo: Number(transaction.importo) || 0,
          categoria_id: transaction.categoria_id || null,
          sottocategoria_id: transaction.sottocategoria_id || null,
          tag_id: transaction.tag_id || null,
          descrizione: transaction.descrizione || null,
          debito_id: (transaction as any).debito_id || null,
        },
      ]);
      setError(null);
    }
  }, [visible, transaction]);

  const categoriesOptions = useMemo(() => {
    return categorie || [];
  }, [categorie]);

  const tagOptions = useMemo(() => {
    return tags || [];
  }, [tags]);

  const total = parts.reduce((s, p) => s + Number(p.importo || 0), 0);

  const updatePart = (index: number, field: keyof SplitPart, value: any) => {
    const copy = [...parts];
    (copy[index] as any)[field] = value;
    setParts(copy);
  };

  const addPart = () => {
    setParts([
      ...parts,
      { importo: 0, categoria_id: null, sottocategoria_id: null, tag_id: null },
    ]);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleSplit = async () => {
    if (!transaction) return;

    const original = Number(transaction.importo || 0);
    if (Math.abs(total - original) > 0.009) {
      setError("La somma delle parti deve essere uguale all'importo originale");
      return;
    }

    try {
      await dispatch(
        splitTransaction({
          id: String(transaction.id),
          parts: parts.map((p) => ({
            importo: p.importo,
            categoria_id: p.categoria_id ?? null,
            sottocategoria_id: p.sottocategoria_id ?? null,
            tag_id: p.tag_id ?? null,
            descrizione: p.descrizione ?? null,
            debito_id: p.debito_id ?? null,
          })),
        }),
      ).unwrap();

      onHide();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  };

  return (
    <Dialog
      header={
        transaction ? t("split_transaction") || "Split" : t("split") || "Split"
      }
      visible={visible}
      onHide={onHide}
      className="dialog-custom split-dialog"
      style={{ width: "95vw", maxWidth: "45rem" }}
      footer={
        <div className="dialog-footer">
          <Button
            label={t("cancel") || "Annulla"}
            className="reset-button"
            onClick={onHide}
          />
          <Button
            className="action-button"
            label={t("split_transaction") || "Dividi"}
            onClick={handleSplit}
          />
        </div>
      }
    >
      {transaction ? (
        <div>
          <p>
            Importo originale: €{" "}
            {Number(transaction.importo).toLocaleString("it-IT", {
              minimumFractionDigits: 2,
            })}
          </p>

          {parts.map((p, idx) => (
            <div className="split-part-row" key={idx}>
              <InputText
                value={String(p.importo)}
                onChange={(e: any) =>
                  updatePart(idx, "importo", parseFloat(e.target.value || 0))
                }
                placeholder="Importo"
              />

              <Dropdown
                options={categoriesOptions}
                optionLabel="nome"
                optionValue="id"
                value={p.categoria_id || null}
                onChange={(e: any) => updatePart(idx, "categoria_id", e.value)}
                placeholder="Categoria"
                showClear
              />

              <Dropdown
                options={tagOptions}
                optionLabel="nome"
                optionValue="id"
                value={p.tag_id || null}
                onChange={(e: any) => updatePart(idx, "tag_id", e.value)}
                placeholder="Tag"
                showClear
              />

              <Button
                className="trasparent-danger-button"
                icon="pi pi-trash"
                compact
                onClick={() => removePart(idx)}
              />
            </div>
          ))}

          <div className="split-actions">
            <Button
              label="Aggiungi parte"
              className="trasparent-button"
              onClick={addPart}
            />
            <div className="split-total">
              Totale: €{" "}
              {total.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>
      ) : null}
    </Dialog>
  );
}
