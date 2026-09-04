import { ReactNode, useEffect, useMemo, useState } from "react";
import Sheet from "../../sheet/sheet";
import Button from "../../button/button";
import Chip from "../../chip/chip";
import Amount from "../../amount/amount";
import SegmentedControl from "../../segmented_control/segmented_control";
import PickerSheet, { PickerOption } from "../../picker_sheet/picker_sheet";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import "./transaction_dialog.scss";
import {
  createTransaction,
  updateTransaction,
} from "../../../features/transactions/api_calls";
import {
  tipoTransaction,
  Transaction,
} from "../../../features/transactions/interfaces";
import { useI18n } from "../../../i18n/use-i18n";
import Compensation from "./compensation/compensation";
import { showToast } from "../../../features/ui/ui_slice";
import { selectContiConti } from "../../../features/conti/conto_slice";
import { selectCategoriaCategorie } from "../../../features/categorie/categoria_slice";
import { selectTagTags } from "../../../features/tags/tag_slice";
import { selectLastTagId } from "../../../features/profile/profile_slice";
import { createTag } from "../../../features/tags/api_calls";
import {
  createCategoria,
  createSottoCategorie,
} from "../../../features/categorie/api_calls";
import SplitTransactionDialog from "../split_transaction_dialog/split_transaction_dialog";
import RecurrenceDialog from "../recurrence_dialog/recurrence_dialog";
import { toIsoDate } from "../../../services/dates";

interface TransactionDialogProps {
  visible: boolean;
  onHide: () => void;
  transaction?: Transaction; // Se passata, siamo in modalità EDIT
}

/** Quali campi hanno un valore da scegliere: uno alla volta, in un foglio suo. */
type PickerName =
  | "categoria"
  | "sottocategoria"
  | "conto"
  | "destinazione"
  | "tag";

// Larghezza minima del campo importo: sotto i tre caratteri il cursore
// finirebbe appiccicato al simbolo di valuta.
const MIN_AMOUNT_WIDTH = 3;

const parseAmount = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function TransactionDialog({
  visible,
  onHide,
  transaction,
}: TransactionDialogProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Dati da store
  const conti = useAppSelector(selectContiConti);
  const categorie = useAppSelector(selectCategoriaCategorie);
  const tags = useAppSelector(selectTagTags);
  const lastTagId = useAppSelector(selectLastTagId);

  // Stati del form
  const [tipo, setTipo] = useState<tipoTransaction>("USCITA");
  const [importo, setImporto] = useState<string>("");
  const [data, setData] = useState<Date | null>(new Date());
  const [descrizione, setDescrizione] = useState("");
  const [contoId, setContoId] = useState<string | null>(null);
  const [contoDestinazioneId, setContoDestinazioneId] = useState<string | null>(
    null,
  );
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [sottoCategoriaId, setSottoCategoriaId] = useState<string | null>(null);
  const [newSubCategoryName, setNewSubCategoryName] = useState<string>("");
  const [tagId, setTagId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState<string>("");
  const [from_data, setFromData] = useState<Date | null>(null);
  const [to_data, setToData] = useState<Date | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const [picker, setPicker] = useState<PickerName | null>(null);
  const [isSplitDialogVisible, setIsSplitDialogVisible] =
    useState<boolean>(false);
  const [isRecurrenceVisible, setIsRecurrenceVisible] =
    useState<boolean>(false);
  // Transazione su cui agisce lo split: quella esistente (modifica) o quella
  // appena creata (creazione + dividi).
  const [splitTarget, setSplitTarget] = useState<Transaction | null>(null);

  // Effetto per il popolamento (Edit) o reset (Create)
  useEffect(() => {
    if (visible) {
      if (transaction) {
        // Modalità UPDATE
        setTipo(transaction.tipo);
        setImporto(transaction.importo.toString());
        setData(new Date(transaction.data));
        setDescrizione(transaction.descrizione || "");
        setContoId(transaction.conto_id);
        setContoDestinazioneId(transaction.conto_destinazione_id ?? null);
        setCategoriaId(transaction.categoria_id);
        setSottoCategoriaId(transaction.sottocategoria_id);
        setTagId(transaction.tag_id);
        setTransactionId(transaction.parent_transaction_id);
      } else {
        // Modalità CREATE (Reset)
        setTipo("USCITA");
        setImporto("");
        setData(new Date());
        setDescrizione("");
        setCategoriaId(null);
        setSottoCategoriaId(null);
        setContoDestinazioneId(null);
        setFromData(null);
        setToData(null);
        setTransactionId(null);
        setNewCategoryName("");
        setNewSubCategoryName("");
        setNewTagName("");

        const defaultConto = conti.find((c) => c.default === true);
        setContoId(defaultConto ? defaultConto.id : null);
      }
    }
  }, [visible, transaction, conti]);

  // Precompilazione del tag all'apertura del form di creazione, con l'ultimo
  // tag usato (ricordato sull'account). Volutamente in un effetto separato da
  // quello di reset: `tags` e `lastTagId` cambiano quando le liste si
  // ricaricano, e nelle dipendenze del reset ripulirebbero il form mentre
  // l'utente lo sta compilando.
  //
  // Il default si risolve *attraverso* la lista tag invece di usarlo così com'è:
  // serve il valore con lo stesso tipo delle opzioni e scarta da solo un tag
  // nel frattempo cancellato.
  useEffect(() => {
    if (!visible || transaction) return;

    const rememberedTag = tags.find(
      (tag) => String(tag.id) === String(lastTagId),
    );
    setTagId(rememberedTag ? rememberedTag.id : null);
  }, [visible, transaction]); // eslint-disable-line react-hooks/exhaustive-deps

  // Costruisce il payload risolvendo (e creando se serve) tag/categoria/sottocategoria.
  // Estratto da handleSave per poterlo riusare anche nel flusso "crea e dividi".
  const preparePayload = async () => {
    const formattedDate = data ? toIsoDate(data) : "";

    const numericImporto = parseFloat(importo || "");

    // I selettori scrivono qui un id oppure — per una voce nuova — il nome
    // digitato: la creazione vera avviene solo ora, al salvataggio.
    let finalTagId = tagId === "NEW_TAG" ? newTagName : tagId;
    let finalCategoriaId =
      categoriaId === "NEW_CATEGORY" ? newCategoryName : categoriaId;
    let finalSottoCategoriaId =
      sottoCategoriaId === "NEW_SUBCATEGORY"
        ? newSubCategoryName
        : sottoCategoriaId;

    // --- 1. CONTROLLO E CREAZIONE TAG ---
    if (finalTagId) {
      // Cerchiamo se il valore corrisponde a un ID o a un nome esistente (case-insensitive)
      const tagExists = tags.find(
        (tag) =>
          String(tag.id) === String(finalTagId) ||
          tag.nome.toLowerCase() === String(finalTagId).toLowerCase(),
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
        (categoria) =>
          String(categoria.id) === String(finalCategoriaId) ||
          categoria.nome.toLowerCase() === String(finalCategoriaId).toLowerCase(),
      );

      if (catExists) {
        finalCategoriaId = catExists.id;
      } else {
        // La categoria non esiste, la creiamo in base al "tipo" attuale
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
      // Cerchiamo la madre (appena creata o esistente) per vedere le sue sub
      const parentCat = categorie.find(
        (categoria) => String(categoria.id) === String(finalCategoriaId),
      );
      const subExists = parentCat?.sottocategorie?.find(
        (sub) =>
          String(sub.id) === String(finalSottoCategoriaId) ||
          sub.nome.toLowerCase() === String(finalSottoCategoriaId).toLowerCase(),
      );

      if (subExists) {
        finalSottoCategoriaId = subExists.id;
      } else {
        const createdSubs = await dispatch(
          createSottoCategorie({
            id: finalCategoriaId as string, // ID della madre appena risolto
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

    const isRicarica = tipo === "RICARICA";
    const isAccantonamento = tipo === "ACCANTONAMENTO";
    // Sia giroconto che accantonamento possono avere un conto destinazione
    const hasDestination = isRicarica || isAccantonamento;

    // --- 4. PREPARAZIONE DEL PAYLOAD FINALE ---
    return {
      importo: isNaN(numericImporto) ? 0 : numericImporto,
      tipo,
      data: formattedDate,
      descrizione,
      conto_id: contoId as string,
      // Giroconto: destinazione obbligatoria. Accantonamento: destinazione
      // opzionale (salvadanaio) ma con categoria/tag come una normale transazione.
      conto_destinazione_id: hasDestination ? contoDestinazioneId : null,
      categoria_id: isRicarica ? null : (finalCategoriaId as string | null),
      sottocategoria_id: isRicarica
        ? null
        : (finalSottoCategoriaId as string | null),
      tag_id: isRicarica ? null : (finalTagId as string | null),
      parent_transaction_id: isRicarica ? null : transactionId,
    };
  };

  const handleSave = async () => {
    const payload = await preparePayload();

    if (transaction?.id) {
      await dispatch(updateTransaction({ id: transaction.id, ...payload }));
    } else {
      await dispatch(createTransaction(payload));
    }

    dispatch(showToast({ variant: "success", title: t("tx_saved") }));
    onHide();
  };

  // Apre lo split. In modifica divide la transazione esistente; in creazione la
  // crea prima (per ottenerne l'id) e poi apre subito lo split sulla nuova.
  const handleOpenSplit = async () => {
    if (transaction?.id) {
      setSplitTarget(transaction);
      setIsSplitDialogVisible(true);
      return;
    }

    if (!(importo && contoId && data)) return;

    try {
      const payload = await preparePayload();
      const created = await dispatch(createTransaction(payload)).unwrap();
      setSplitTarget(created);
      setIsSplitDialogVisible(true);
    } catch {
      // Gli errori sono gestiti dal middleware
    }
  };

  // Il conto che l'app ha aperto da sé non si sceglie: è il posto dove
  // finisce una transazione quando l'utente non ha voluto dire da dove esce.
  const contiScegliibili = useMemo(
    () => conti.filter((conto) => !conto.virtuale),
    [conti],
  );

  // Conti selezionabili come destinazione: tutti tranne la sorgente
  const contiDestinazione = useMemo(
    () =>
      contiScegliibili.filter((conto) => String(conto.id) !== String(contoId)),
    [contiScegliibili, contoId],
  );

  const handleImportoChange = (val: string) => {
    const cleanedValue = val.replace(",", ".");
    if (cleanedValue === "" || /^\d*\.?\d{0,2}$/.test(cleanedValue)) {
      setImporto(cleanedValue);
    }
  };

  // Categorie e sottocategorie ammesse dal tipo scelto: una categoria di sole
  // uscite non ha senso su un'entrata.
  const categorieFiltrate = useMemo(
    () =>
      categorie.filter((categoria) => {
        if (tipo === "ENTRATA") return categoria.solo_entrata === true;
        if (tipo === "USCITA") return categoria.solo_uscita === true;
        return true;
      }),
    [categorie, tipo],
  );

  const sottocategorieFiltrate = useMemo(() => {
    const cat = categorie.find(
      (categoria) => String(categoria.id) === String(categoriaId),
    );

    return (cat?.sottocategorie ?? []).filter((sub) => {
      if (tipo === "ENTRATA") return sub.solo_entrata === true;
      if (tipo === "USCITA") return sub.solo_uscita === true;
      return true;
    });
  }, [categoriaId, categorie, tipo]);

  const tutteLeSottocategorie = useMemo(
    () => categorie.flatMap((categoria) => categoria.sottocategorie ?? []),
    [categorie],
  );

  const asOptions = (list: { id: string; nome: string }[]): PickerOption[] =>
    list.map((item) => ({ id: item.id, label: item.nome }));

  // Il valore scelto può essere un id o il nome di una voce ancora da creare:
  // quando non corrisponde a niente in lista, è già l'etichetta da mostrare.
  const labelOf = (
    list: { id: string; nome: string }[],
    value: string | null,
  ) =>
    value
      ? (list.find((item) => String(item.id) === String(value))?.nome ?? value)
      : undefined;

  const sourceConto = conti.find(
    (conto) => String(conto.id) === String(contoId),
  );

  // Un movimento sul conto invisibile si legge come "senza conto": mostrarne
  // il nome vorrebbe dire spiegare all'utente un conto che non ha creato.
  const sourceLabel = sourceConto?.virtuale ? undefined : sourceConto?.nome;

  // Effetto della transazione sul conto di partenza: un'entrata lo alza, tutto
  // il resto (uscita, accantonamento, giro in uscita) lo abbassa.
  const balanceAfter = sourceConto
    ? Number(sourceConto.saldo) +
      (tipo === "ENTRATA" || tipo === "RIMBORSO" ? 1 : -1) *
        parseAmount(importo)
    : null;

  const isRicarica = tipo === "RICARICA";

  const canSave =
    tipo === "RIMBORSO"
      ? Boolean(importo && contoId && data && transactionId)
      : isRicarica
        ? Boolean(
            importo &&
              contoId &&
              contoDestinazioneId &&
              String(contoId) !== String(contoDestinazioneId) &&
              data,
          )
        : Boolean(importo && contoId && data);

  const canSplit = Boolean(transaction) || Boolean(importo && contoId && data);
  const canRepeat = tipo === "USCITA" || tipo === "ENTRATA";

  return (
    <>
      <Sheet
        open={visible}
        onClose={onHide}
        title={transaction ? t("edit_transaction") : t("new_transaction")}
        className="tx-sheet"
        footer={
          <Button block disabled={!canSave} onClick={handleSave}>
            {transaction ? t("save_changes") : t("tx_save")}
          </Button>
        }
      >
        <SegmentedControl
          ariaLabel={t("select_type")}
          value={tipo}
          options={[
            { value: "USCITA", label: t("tx_type_expense") },
            { value: "ENTRATA", label: t("tx_type_income") },
            { value: "RICARICA", label: t("tx_type_transfer") },
            { value: "RIMBORSO", label: t("tx_type_refund") },
            { value: "ACCANTONAMENTO", label: t("tx_type_saving") },
          ]}
          onChange={setTipo}
        />

        {tipo === "RIMBORSO" ? (
          // Il rimborso si aggancia a una spesa esistente: ha un percorso suo,
          // ancora nella veste vecchia.
          <Compensation
            importo={importo}
            setImporto={setImporto}
            data={data}
            setData={setData}
            descrizione={descrizione}
            setDescrizione={setDescrizione}
            contoId={contoId}
            setContoId={setContoId}
            categoriaId={categoriaId}
            setCategoriaId={setCategoriaId}
            sottoCategoriaId={sottoCategoriaId}
            setSottoCategoriaId={setSottoCategoriaId}
            tagId={tagId}
            setTagId={setTagId}
            newTagName={newTagName}
            setNewTagName={setNewTagName}
            from_data={from_data}
            setFromData={setFromData}
            to_data={to_data}
            setToData={setToData}
            transactionId={transactionId}
            setTransactionId={setTransactionId}
          />
        ) : (
          <>
            <div className="tx-sheet__hero">
              <div className="tx-sheet__amount">
                <input
                  value={importo}
                  onChange={(event) => handleImportoChange(event.target.value)}
                  inputMode="decimal"
                  placeholder="0"
                  aria-label={t("amount")}
                  style={{
                    width: `${Math.max(importo.length, MIN_AMOUNT_WIDTH)}ch`,
                  }}
                />
                <span className="tx-sheet__currency">€</span>
              </div>

              {sourceConto && balanceAfter !== null && (
                <span className="tx-sheet__hint">
                  {`${sourceLabel ? `${sourceLabel} · ` : ""}${t("tx_balance_after")}: `}
                  <Amount value={balanceAfter} />
                </span>
              )}
            </div>

            <div className="tx-sheet__fields">
              {!isRicarica && (
                <PickerRow
                  icon="pi pi-tag"
                  label={t("category")}
                  value={labelOf(categorie, categoriaId)}
                  placeholder={t("category_placeholder")}
                  onClick={() => setPicker("categoria")}
                />
              )}

              {!isRicarica && categoriaId && (
                <PickerRow
                  icon="pi pi-hashtag"
                  label={t("sub_category")}
                  value={labelOf(tutteLeSottocategorie, sottoCategoriaId)}
                  placeholder={t("sub_category_placeholder")}
                  onClick={() => setPicker("sottocategoria")}
                />
              )}

              <PickerRow
                icon="pi pi-wallet"
                label={isRicarica ? t("source_account") : t("account_type_bank")}
                value={sourceLabel}
                placeholder={t("bank_account_placeholder")}
                onClick={() => setPicker("conto")}
              />

              {(isRicarica || tipo === "ACCANTONAMENTO") && (
                <PickerRow
                  icon="pi pi-arrow-right-arrow-left"
                  label={
                    isRicarica
                      ? t("destination_account")
                      : t("set_aside_destination")
                  }
                  value={labelOf(conti, contoDestinazioneId)}
                  placeholder={t("destination_account_placeholder")}
                  onClick={() => setPicker("destinazione")}
                />
              )}

              <div className="tx-sheet__pair">
                <div className="tx-sheet__compact">
                  <i className="pi pi-calendar" aria-hidden="true" />
                  <span className="tx-sheet__compact-text">
                    <span className="tx-sheet__label">{t("date")}</span>
                    <input
                      type="date"
                      value={data ? toIsoDate(data) : ""}
                      aria-label={t("date")}
                      onChange={(event) => {
                        const [year, month, day] = event.target.value
                          .split("-")
                          .map(Number);

                        setData(
                          year ? new Date(year, month - 1, day) : null,
                        );
                      }}
                    />
                  </span>
                </div>

                {!isRicarica && (
                  <button
                    type="button"
                    className="tx-sheet__compact"
                    onClick={() => setPicker("tag")}
                  >
                    <i className="pi pi-hashtag" aria-hidden="true" />
                    <span className="tx-sheet__compact-text">
                      <span className="tx-sheet__label">{t("tag")}</span>
                      <span className="tx-sheet__value">
                        {labelOf(tags, tagId) ?? t("tx_none")}
                      </span>
                    </span>
                  </button>
                )}
              </div>

              <div className="tx-sheet__compact tx-sheet__compact--wide">
                <i className="pi pi-align-left" aria-hidden="true" />
                <input
                  value={descrizione}
                  placeholder={t("tx_description_optional")}
                  aria-label={t("description")}
                  onChange={(event) => setDescrizione(event.target.value)}
                />
              </div>
            </div>

          </>
        )}

        <div className="tx-sheet__chips">
          {canRepeat && (
            <Chip
              variant="solid"
              icon="pi pi-refresh"
              label={t("tx_make_recurring")}
              onClick={() => setIsRecurrenceVisible(true)}
            />
          )}

          <Chip
            variant="solid"
            icon="pi pi-clone"
            label={t("split_transaction")}
            onClick={canSplit ? handleOpenSplit : undefined}
            className={canSplit ? undefined : "chip--disabled"}
          />
        </div>
      </Sheet>

      <PickerSheet
        open={picker === "categoria"}
        onClose={() => setPicker(null)}
        title={t("category")}
        options={asOptions(categorieFiltrate)}
        value={categoriaId}
        clearLabel={t("tx_none")}
        createLabel={t("add_new_category")}
        onSelect={(value) => {
          setCategoriaId(value);
          // La sottocategoria appartiene alla categoria: cambiandola resta
          // orfana, e il payload la manderebbe sotto la madre sbagliata.
          setSottoCategoriaId(null);
        }}
      />

      <PickerSheet
        open={picker === "sottocategoria"}
        onClose={() => setPicker(null)}
        title={t("sub_category")}
        options={asOptions(sottocategorieFiltrate)}
        value={sottoCategoriaId}
        clearLabel={t("tx_none")}
        createLabel={t("add_new_subcategory")}
        onSelect={setSottoCategoriaId}
      />

      <PickerSheet
        open={picker === "conto"}
        onClose={() => setPicker(null)}
        title={isRicarica ? t("source_account") : t("account_type_bank")}
        options={asOptions(contiScegliibili)}
        value={contoId}
        onSelect={setContoId}
      />

      <PickerSheet
        open={picker === "destinazione"}
        onClose={() => setPicker(null)}
        title={
          isRicarica ? t("destination_account") : t("set_aside_destination")
        }
        options={asOptions(contiDestinazione)}
        value={contoDestinazioneId}
        clearLabel={isRicarica ? undefined : t("tx_none")}
        onSelect={setContoDestinazioneId}
      />

      <PickerSheet
        open={picker === "tag"}
        onClose={() => setPicker(null)}
        title={t("tag")}
        options={asOptions(tags)}
        value={tagId}
        clearLabel={t("tx_none")}
        createLabel={t("add_new_tag")}
        onSelect={setTagId}
      />

      <SplitTransactionDialog
        visible={isSplitDialogVisible}
        onHide={() => {
          setIsSplitDialogVisible(false);
          // In creazione (crea + dividi) la transazione è già stata salvata:
          // chiudiamo anche il foglio principale al termine dello split.
          if (!transaction) {
            setSplitTarget(null);
            onHide();
          }
        }}
        transaction={splitTarget}
      />

      <RecurrenceDialog
        visible={isRecurrenceVisible}
        onHide={() => setIsRecurrenceVisible(false)}
        defaults={{
          nome: descrizione || labelOf(categorie, categoriaId) || "",
          importo,
          tipo: tipo === "ENTRATA" ? "ENTRATA" : "USCITA",
          conto_id: contoId,
          categoria_id: categoriaId,
          sottocategoria_id: sottoCategoriaId,
          tag_id: tagId,
          prossima_esecuzione: data,
        }}
      />
    </>
  );
}

type PickerRowProps = {
  icon: string;
  label: string;
  value?: ReactNode;
  placeholder: string;
  onClick: () => void;
};

/** Riga-campo: mostra la scelta fatta, il tocco apre il foglio che la cambia. */
function PickerRow({
  icon,
  label,
  value,
  placeholder,
  onClick,
}: PickerRowProps) {
  return (
    <button type="button" className="tx-sheet__row" onClick={onClick}>
      <span className="tx-sheet__icon" aria-hidden="true">
        <i className={icon} />
      </span>

      <span className="tx-sheet__row-text">
        <span className="tx-sheet__label">{label}</span>
        <span
          className={`tx-sheet__value${value ? "" : " tx-sheet__value--empty"}`}
        >
          {value ?? placeholder}
        </span>
      </span>

      <i className="pi pi-chevron-right tx-sheet__chevron" aria-hidden="true" />
    </button>
  );
}
