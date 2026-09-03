import { describe, it, expect } from "vitest";
import { decodeFilters, encodeFilters } from "./filters_url";
import { periodRange } from "./period";

describe("encodeFilters", () => {
  it("non scrive niente per la vista di partenza", () => {
    // Mese corrente e nessun filtro: l'URL resta pulito.
    expect(encodeFilters({ ...periodRange("month") }, "month").toString()).toBe(
      "",
    );
  });

  it("scrive il periodo ma non le date che ne derivano", () => {
    const params = encodeFilters({ ...periodRange("year") }, "year");

    expect(params.get("periodo")).toBe("year");
    // Le date di un preset si ricalcolano: fissarle renderebbe il link scaduto.
    expect(params.get("da")).toBeNull();
    expect(params.get("a")).toBeNull();
  });

  it("scrive le date solo per il periodo personalizzato", () => {
    const params = encodeFilters(
      { data_inizio: "2026-03-01", data_fine: "2026-03-15" },
      "custom",
    );

    expect(params.get("da")).toBe("2026-03-01");
    expect(params.get("a")).toBe("2026-03-15");
  });

  it("serializza liste, importi e ricerca", () => {
    const params = encodeFilters(
      {
        conto_id: ["1", "2"],
        categoria_id: ["7"],
        tag_id: ["3"],
        tipo: "USCITA",
        importo_min: 0,
        importo_max: 500,
        descrizione: "esselunga",
      },
      "month",
    );

    expect(params.get("conti")).toBe("1,2");
    expect(params.get("categorie")).toBe("7");
    expect(params.get("tag")).toBe("3");
    expect(params.get("tipo")).toBe("USCITA");
    expect(params.get("min")).toBe("0");
    expect(params.get("max")).toBe("500");
    expect(params.get("q")).toBe("esselunga");
  });
});

describe("decodeFilters", () => {
  it("parte dal mese corrente quando l'URL è vuoto", () => {
    const { period, filters } = decodeFilters(new URLSearchParams());

    expect(period).toBe("month");
    expect(filters.data_inizio).toBe(periodRange("month").data_inizio);
  });

  it("ricalcola le date del preset invece di fidarsi dell'URL", () => {
    const { filters } = decodeFilters(
      new URLSearchParams("periodo=year&da=1999-01-01"),
    );

    expect(filters.data_inizio).toBe(periodRange("year").data_inizio);
  });

  it("ricade sul mese corrente se il periodo non esiste", () => {
    expect(decodeFilters(new URLSearchParams("periodo=domani")).period).toBe(
      "month",
    );
  });

  it("legge le liste separate da virgola", () => {
    const { filters } = decodeFilters(new URLSearchParams("conti=1,2,3"));

    expect(filters.conto_id).toEqual(["1", "2", "3"]);
  });

  it("ignora liste e numeri malformati invece di filtrare a vuoto", () => {
    const { filters } = decodeFilters(new URLSearchParams("conti=,,&min=abc"));

    expect(filters.conto_id).toBeUndefined();
    expect(filters.importo_min).toBeUndefined();
  });

  it("fa il giro completo con i filtri personalizzati", () => {
    const original = {
      data_inizio: "2026-03-01",
      data_fine: "2026-03-15",
      tipo: "ENTRATA",
      conto_id: ["4"],
      importo_min: 10,
      importo_max: 90,
      descrizione: "affitto",
    };

    const { period, filters } = decodeFilters(
      encodeFilters(original, "custom"),
    );

    expect(period).toBe("custom");
    expect(filters).toMatchObject(original);
  });
});
