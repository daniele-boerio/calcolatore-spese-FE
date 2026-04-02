import { useState, useEffect, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { SelectButton } from "primereact/selectbutton";
import InputText from "../../input_text/input_text";
import Button from "../../button/button";
import Dropdown from "../../dropdown/dropdown";
import Switch from "../../switch/switch"; // Importato il tuo componente Switch
import { useAppDispatch, useAppSelector } from "../../../store/store";
import "./recurrence_dialog.scss";
import { tipoTransaction } from "../../../features/transactions/interfaces";
import { useI18n } from "../../../i18n/use-i18n";
import Calendar from "../../calendar/calendar";
import {
  createCategoria,
  createSottoCategorie,
} from "../../../features/categorie/api_calls";
import { createTag } from "../../../features/tags/api_calls";
import { selectContiConti } from "../../../features/conti/conto_slice";
import { selectCategoriaCategorie } from "../../../features/categorie/categoria_slice";
import { selectTagTags } from "../../../features/tags/tag_slice";
import { Recurring } from "../../../features/recurrings/interfaces";
import {
  createRecurring,
  updateRecurring,
} from "../../../features/recurrings/api_calls";

interface RecurrenceDialogProps {
  visible: boolean;
  onHide: () => void;
  recurring?: Recurring;
}

export default function RecurrenceDialog({
  visible,
  onHide,
  recurring,
}: RecurrenceDialogProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const conti = useAppSelector(selectContiConti);
  const categorie = useAppSelector(selectCategoriaCategorie);
  const tags = useAppSelector(selectTagTags);

  const [nome, setNome] = useState<string>("");
  const [tipo, setTipo] = useState<tipoTransaction>("USCITA");
  const [importo, setImporto] = useState<string>("");
  const [frequenza, setFrequenza] = useState<string>("MENSILE");
  const [prossimaEsecuzione, setProssimaEsecuzione] = useState<Date>(
    new Date(),
  );
  const [attiva, setAttiva] = useState<boolean>(true);
  const [contoId, setContoId] = useState<string | null>(null);
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [sottoCategoriaId, setSottoCategoriaId] = useState<string | null>(null);
  const [newSubCategoryName, setNewSubCategoryName] = useState<string>("");
  const [tagId, setTagId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState<string>("");

  useEffect(() => {
    if (visible) {
      if (recurring) {
        setNome(recurring.nome);
        setImporto(recurring.importo.toString());
        setTipo(recurring.tipo);
        setFrequenza(recurring.frequenza);
        setProssimaEsecuzione(new Date(recurring.prossima_esecuzione));
        setAttiva(recurring.attiva);
        setContoId(recurring.conto_id);
        setCategoriaId(recurring.categoria_id);
        setSottoCategoriaId(recurring.sottocategoria_id);
        setTagId(recurring.tag_id);
      } else {
        setNome("");
        setImporto("");
        setTipo("USCITA");
        setFrequenza("MENSILE");
        setProssimaEsecuzione(new Date());
        setAttiva(true);
        setContoId(null);
        setCategoriaId(null);
        setSottoCategoriaId(null);
        setTagId(null);
        setNewCategoryName("");
        setNewSubCategoryName("");
        setNewTagName("");
      }
    }
  }, [visible, recurring]);

  const categorieFiltrate = useMemo(() => {
    if (!categorie) return [];

    return categorie.filter((cat) => {
      if (tipo === "ENTRATA") {
        return cat.solo_entrata === true;
      }
      if (tipo === "USCITA") {
        return cat.solo_uscita === true;
      }
      return true; // Caso di fallback se tipo non è ancora definito
    });
  }, [categorie, tipo]);

  const categorieOptions = useMemo(() => {
    return [
      ...categorieFiltrate,
      {
        id: "NEW_CATEGORY",
        nome: `+ ${t("add_new_category")}`,
      },
    ];
  }, [categorieFiltrate, t]);

  const filteredSottoCategorie = useMemo(() => {
    const cat = categorie.find((c) => c.id === categoriaId);
    if (!cat || !cat.sottocategorie) return [];

    return cat.sottocategorie.filter((sub) => {
      if (tipo === "ENTRATA") return sub.solo_entrata === true;
      if (tipo === "USCITA") return sub.solo_uscita === true;
      return true;
    });
  }, [categoriaId, categorie, tipo]);

  const sottocategorieOptions = useMemo(() => {
    return [
      ...filteredSottoCategorie,
      {
        id: "NEW_SUBCATEGORY",
        nome: `+ ${t("add_new_subcategory")}`,
      },
    ];
  }, [filteredSottoCategorie, t]);

  const tagOptions = useMemo(() => {
    return [
      ...tags,
      {
        id: "NEW_TAG",
        nome: `+ ${t("add_new_tag")}`,
      },
    ];
  }, [tags, t]);

  const handleSave = async () => {
    const formattedDate = prossimaEsecuzione.toISOString().split("T")[0];
    const numericImporto = parseFloat(importo);

    let finalTagId = tagId === "NEW_TAG" ? newTagName : tagId;
    let finalCategoriaId =
      categoriaId === "NEW_CATEGORY" ? newCategoryName : categoriaId;
    let finalSottoCategoriaId =
      sottoCategoriaId === "NEW_SUBCATEGORY"
        ? newSubCategoryName
        : sottoCategoriaId;

    // --- 1. CONTROLLO E CREAZIONE TAG ---
    if (finalTagId) {
      const tagExists = tags.find(
        (t) =>
          String(t.id) === String(finalTagId) ||
          t.nome.toLowerCase() === String(finalTagId).toLowerCase(),
      );
      if (tagExists) {
        finalTagId = tagExists.id;
      } else {
        const newTag = await dispatch(
          createTag({ nome: String(finalTagId) }),
        ).unwrap();
        finalTagId = newTag.id;
      }
    }

    // --- 2. CONTROLLO E CREAZIONE CATEGORIA ---
    if (finalCategoriaId) {
      const catExists = categorie.find(
        (c) =>
          String(c.id) === String(finalCategoriaId) ||
          c.nome.toLowerCase() === String(finalCategoriaId).toLowerCase(),
      );
      if (catExists) {
        finalCategoriaId = catExists.id;
      } else {
        const newCat = await dispatch(
          createCategoria({
            nome: String(finalCategoriaId),
            solo_entrata: tipo === "ENTRATA" || tipo === "RIMBORSO",
            solo_uscita: tipo === "USCITA" || tipo === "RIMBORSO",
          }),
        ).unwrap();
        finalCategoriaId = newCat.id;
      }
    }

    // --- 3. CONTROLLO E CREAZIONE SOTTOCATEGORIA ---
    if (finalSottoCategoriaId && finalCategoriaId) {
      const parentCat = categorie.find(
        (c) => String(c.id) === String(finalCategoriaId),
      );
      const subExists = parentCat?.sottocategorie?.find(
        (s) =>
          String(s.id) === String(finalSottoCategoriaId) ||
          s.nome.toLowerCase() === String(finalSottoCategoriaId).toLowerCase(),
      );

      if (subExists) {
        finalSottoCategoriaId = subExists.id;
      } else {
        const createdSubs = await dispatch(
          createSottoCategorie({
            id: finalCategoriaId as string,
            subList: [
              {
                nome: String(finalSottoCategoriaId),
                solo_entrata: tipo === "ENTRATA" || tipo === "RIMBORSO",
                solo_uscita: tipo === "USCITA" || tipo === "RIMBORSO",
              },
            ],
          }),
        ).unwrap();
        finalSottoCategoriaId = createdSubs[0].id;
      }
    }

    // --- 4. PREPARAZIONE PAYLOAD E SALVATAGGIO ---
    const payload: any = {
      nome,
      importo: isNaN(numericImporto) ? 0 : numericImporto,
      tipo,
      frequenza,
      prossima_esecuzione: formattedDate,
      attiva,
      conto_id: contoId ?? "",
      categoria_id: finalCategoriaId,
      sottocategoria_id: finalSottoCategoriaId,
      tag_id: finalTagId,
    };

    if (recurring?.id) {
      await dispatch(updateRecurring({ id: recurring.id, ...payload }));
    } else {
      await dispatch(createRecurring(payload));
    }
    onHide();
  };

  const tipoOptions = [
    { label: t("income"), value: "ENTRATA" },
    { label: t("expenses"), value: "USCITA" },
    { label: t("compensation"), value: "RIMBORSO" },
  ];

  const frequenzaOptions = [
    { label: t("weekly"), value: "SETTIMANALE" },
    { label: t("monthly"), value: "MENSILE" },
    { label: t("yearly"), value: "ANNUALE" },
  ];

  const handleImportoChange = (val: string) => {
    let cleanedValue = val.replace(",", ".");
    if (cleanedValue === "" || /^\d*\.?\d{0,2}$/.test(cleanedValue)) {
      setImporto(cleanedValue);
    }
  };

  return (
    <Dialog
      header={recurring ? t("edit_recurring") : t("new_recurring")}
      visible={visible}
      className="dialog-custom recurrence-dialog"
      style={{ width: "95vw", maxWidth: "45rem" }}
      onHide={onHide}
      blockScroll={true}
      footer={
        <div className="dialog-footer">
          <Button
            label={t("cancel")}
            className="reset-button"
            onClick={onHide}
          />
          <Button
            className="action-button"
            label={recurring ? t("save_changes") : t("save")}
            onClick={handleSave}
            disabled={!importo || !contoId || !nome.trim()}
          />
        </div>
      }
    >
      <div className="recurrence-form">
        <div className="form-row">
          <SelectButton
            value={tipo}
            options={tipoOptions}
            onChange={(e) => setTipo(e.value || "USCITA")}
            className="type-selector"
          />
        </div>

        <div className="form-row">
          <div className="field">
            <InputText
              label={t("recurrence_name")}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={t("recurrence_name_placeholder")}
            />
          </div>
          <div className="field">
            <label className="field-label">{t("active")}</label>
            <Switch checked={attiva} onChange={(e) => setAttiva(e.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <InputText
              value={importo}
              onChange={(e) => handleImportoChange(e.target.value)}
              label={t("amount")}
              icon="pi pi-euro"
              iconPos="right"
              inputMode="decimal"
              placeholder="0.00"
            />
          </div>
          <div className="field">
            <Calendar
              label={t("next_execution")}
              value={prossimaEsecuzione}
              onChange={(e) => setProssimaEsecuzione(e.value as Date)}
              showIcon
              minDate={new Date()}
              showButtonBar
            />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <Dropdown
              label={t("frequency")}
              value={frequenza}
              options={frequenzaOptions}
              onChange={(e) => setFrequenza(e.value)}
              placeholder={t("select_frequency")}
            />
          </div>
          <div className="field">
            <Dropdown
              label={t("bank_account")}
              value={contoId}
              options={conti}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setContoId(e.value)}
              placeholder={t("bank_account_placeholder")}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <Dropdown
              label={t("category")}
              value={categoriaId}
              options={categorieOptions}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setCategoriaId(e.value)}
              placeholder={t("category_placeholder")}
            />
          </div>
          <div className="field">
            <Dropdown
              label={t("sub_category")}
              value={sottoCategoriaId}
              options={sottocategorieOptions}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setSottoCategoriaId(e.value)}
              placeholder={t("sub_category_placeholder")}
              disabled={!categoriaId}
            />
          </div>
        </div>
        {categoriaId === "NEW_CATEGORY" && (
          <div className="form-row">
            <div className="field" style={{ width: "100%" }}>
              <InputText
                label={t("new_category_name")}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={t("ex_subscriptions")}
              />
            </div>
          </div>
        )}

        {sottoCategoriaId === "NEW_SUBCATEGORY" && (
          <div className="form-row">
            <div className="field" style={{ width: "100%" }}>
              <InputText
                label={t("new_subcategory_name")}
                value={newSubCategoryName}
                onChange={(e) => setNewSubCategoryName(e.target.value)}
                placeholder={t("ex_netflix")}
              />
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="field">
            <Dropdown
              label={t("tag")}
              value={tagId}
              options={tagOptions}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setTagId(e.value)}
              placeholder={t("tag_placeholder")}
            />
          </div>
        </div>
        {tagId === "NEW_TAG" && (
          <div className="form-row">
            <div className="field" style={{ width: "100%" }}>
              <InputText
                label={t("new_tag_name")}
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder={t("ex_corsica")}
              />
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
