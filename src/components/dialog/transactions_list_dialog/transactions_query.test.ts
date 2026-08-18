import { describe, it, expect } from "vitest";
import { buildTransactionsQuery } from "./transactions_query";

// Il dialog delle statistiche costruiva la query a mano e si era dimenticato il
// `tag_id`: le card mostravano i totali del tag selezionato, ma cliccandole
// usciva tutta la categoria. Qui fissiamo che ogni filtro arrivi al BE.

describe("buildTransactionsQuery", () => {
  it("propaga il tag selezionato", () => {
    const query = buildTransactionsQuery(
      { categoria_id: "3", tag_id: "7" },
      1,
      10,
    );

    expect(new URLSearchParams(query).get("tag_id")).toBe("7");
  });

  it("propaga tutti i filtri della lista", () => {
    const filters = {
      categoria_id: "3",
      sottocategoria_id: "12",
      tag_id: "7",
      data_inizio: "2026-01-01",
      data_fine: "2026-01-31",
    };

    const params = new URLSearchParams(buildTransactionsQuery(filters, 2, 10));

    expect(Object.fromEntries(params)).toEqual({
      page: "2",
      size: "10",
      ...filters,
    });
  });

  it("omette i filtri non valorizzati", () => {
    const params = new URLSearchParams(
      buildTransactionsQuery({ categoria_id: "3" }, 1, 10),
    );

    expect(params.has("tag_id")).toBe(false);
    expect(params.has("sottocategoria_id")).toBe(false);
    expect([...params.keys()]).toEqual(["page", "size", "categoria_id"]);
  });
});
