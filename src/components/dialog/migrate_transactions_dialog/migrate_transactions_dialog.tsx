import React, { useState, useMemo, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import Button from "../../button/button";
import Dropdown from "../../dropdown/dropdown";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { selectCategoriaCategorie } from "../../../features/categorie/categoria_slice";
import { migrateTransactions } from "../../../features/categorie/api_calls";
import { useI18n } from "../../../i18n/use-i18n";
import { getTransactionsPaginated } from "../../../features/transactions/api_calls";
import "./migrate_transactions_dialog.scss";

interface MigrateTransactionsDialogProps {
  visible: boolean;
  onHide: () => void;
}

export default function MigrateTransactionsDialog({
  visible,
  onHide,
}: MigrateTransactionsDialogProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const categorie = useAppSelector(selectCategoriaCategorie);

  const [oldCategoriaId, setOldCategoriaId] = useState<string | null>(null);
  const [oldSottoCategoriaId, setOldSottoCategoriaId] = useState<string | null>(
    null,
  );
  const [newCategoriaId, setNewCategoriaId] = useState<string | null>(null);
  const [newSottoCategoriaId, setNewSottoCategoriaId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setOldCategoriaId(null);
      setOldSottoCategoriaId(null);
      setNewCategoriaId(null);
      setNewSottoCategoriaId(null);
    }
  }, [visible]);

  // Derivazione delle sottocategorie di origine
  const oldSottocategorie = useMemo(() => {
    const cat = categorie.find((c) => c.id === oldCategoriaId);
    return cat?.sottocategorie || [];
  }, [categorie, oldCategoriaId]);

  // Se cambio la categoria di origine, resetto la sottocategoria
  useEffect(() => {
    setOldSottoCategoriaId(null);
  }, [oldCategoriaId]);

  // Derivazione delle sottocategorie di destinazione
  const newSottocategorie = useMemo(() => {
    const cat = categorie.find((c) => c.id === newCategoriaId);
    return cat?.sottocategorie || [];
  }, [categorie, newCategoriaId]);

  // Se cambio la categoria di destinazione, resetto la sottocategoria
  useEffect(() => {
    setNewSottoCategoriaId(null);
  }, [newCategoriaId]);

  const handleMigrate = async () => {
    if (!oldCategoriaId || !newCategoriaId) return;

    setLoading(true);
    try {
      await dispatch(
        migrateTransactions({
          old_categoria_id: oldCategoriaId,
          old_sottocategoria_id: oldSottoCategoriaId || undefined,
          new_categoria_id: newCategoriaId,
          new_sottocategoria_id: newSottoCategoriaId || undefined,
        }),
      ).unwrap();

      // Aggiorniamo le transazioni per riflettere i cambiamenti se siamo in quella pagina
      // o comunque per tenere aggiornato lo store
      dispatch(getTransactionsPaginated({ page: 1, size: 12 }));

      onHide();
    } catch (error) {
      console.error("Errore durante la migrazione", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={t("migrate_transactions_title") || "Migra Transazioni"}
      visible={visible}
      className="dialog-custom migrate-dialog"
      style={{ width: "95vw", maxWidth: "45rem" }}
      onHide={onHide}
      blockScroll={true}
      footer={
        <div className="dialog-footer">
          <Button
            label={t("cancel")}
            className="reset-button"
            onClick={onHide}
            disabled={loading}
          />
          <Button
            className="action-button"
            label={t("save_changes") || "Salva"}
            onClick={handleMigrate}
            loading={loading}
            disabled={!oldCategoriaId || !newCategoriaId}
          />
        </div>
      }
      draggable={false}
      resizable={false}
    >
      <div className="migrate-form">
        <h3 className="section-title">Da:</h3>
        <div className="form-row">
          <div className="field">
            <Dropdown
              label={t("source_category") || "Categoria di Origine"}
              value={oldCategoriaId}
              options={categorie}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setOldCategoriaId(e.value)}
              placeholder={t("category_placeholder")}
            />
          </div>
          <div className="field">
            <Dropdown
              label={t("source_subcategory") || "Sottocategoria di Origine"}
              value={oldSottoCategoriaId}
              options={oldSottocategorie}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setOldSottoCategoriaId(e.value)}
              placeholder={t("sub_category_placeholder")}
              disabled={!oldCategoriaId}
              showClear
            />
          </div>
        </div>

        <h3 className="section-title">A:</h3>
        <div className="form-row">
          <div className="field">
            <Dropdown
              label={t("destination_category") || "Categoria di Destinazione"}
              value={newCategoriaId}
              options={categorie}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setNewCategoriaId(e.value)}
              placeholder={t("category_placeholder")}
            />
          </div>
          <div className="field">
            <Dropdown
              label={
                t("destination_subcategory") || "Sottocategoria di Destinazione"
              }
              value={newSottoCategoriaId}
              options={newSottocategorie}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setNewSottoCategoriaId(e.value)}
              placeholder={t("sub_category_placeholder")}
              disabled={!newCategoriaId}
              showClear
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
