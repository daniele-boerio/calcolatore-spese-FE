import { describe, it, expect } from "vitest";
import { expenseRows, UNCATEGORIZED } from "./expenses";
import { MonthlyDetailCategory } from "./interfaces";
import { Categoria } from "../categorie/interfaces";

const cat = (
  categoria: string,
  totale: number,
  sottocategorie: { sottocategoria: string; totale: number }[] = [],
): MonthlyDetailCategory => ({
  categoria,
  totale,
  tipo: totale < 0 ? "USCITA" : "ENTRATA",
  sottocategorie,
});

const categoria = (
  nome: string,
  sottocategorie: string[] = [],
): Categoria =>
  ({
    id: "14",
    nome,
    sottocategorie: sottocategorie.map((sub, index) => ({
      id: String(100 + index),
      nome: sub,
    })),
  }) as Categoria;

// Il payload del mese com'è senza filtro: "Casa" ha sottocategorie, le altre
// no, e quelle mandano una riga "Uncategorized" a testa.
const mesePieno = [
  cat("Casa", -404.42, [
    { sottocategoria: "Affitto", totale: -380 },
    { sottocategoria: "Gas", totale: -23 },
    { sottocategoria: "Pulizia", totale: -1.42 },
  ]),
  cat("Spesa", -55, [{ sottocategoria: UNCATEGORIZED, totale: -55 }]),
  cat("Svago", -15, [{ sottocategoria: UNCATEGORIZED, totale: -15 }]),
  cat("Auto", -7.99, [{ sottocategoria: UNCATEGORIZED, totale: -7.99 }]),
  cat("Stipendio", 1200, [{ sottocategoria: UNCATEGORIZED, totale: 1200 }]),
];

describe("expenseRows", () => {
  it("senza categoria elenca le categorie, dalla più cara", () => {
    const rows = expenseRows(mesePieno, null);

    expect(rows.map((row) => row.nome)).toEqual([
      "Casa",
      "Spesa",
      "Svago",
      "Auto",
    ]);
    // Le entrate non sono uscite, e il segno se ne va.
    expect(rows[0].totale).toBe(404.42);
  });

  it("con una categoria scende alle sue sottocategorie, con l'id per filtrare", () => {
    const rows = expenseRows(
      mesePieno,
      categoria("Casa", ["Affitto", "Gas", "Pulizia"]),
    );

    expect(rows).toEqual([
      { nome: "Affitto", totale: 380, sottocategoriaId: "100" },
      { nome: "Gas", totale: 23, sottocategoriaId: "101" },
      { nome: "Pulizia", totale: 1.42, sottocategoriaId: "102" },
    ]);
  });

  it("non mescola le sottocategorie delle altre categorie", () => {
    // Il caso che si vedeva a schermo: payload di tutto il mese (quello di un
    // attimo prima, o di un'altra schermata) e una categoria già scelta. Le
    // righe "Uncategorized" delle altre categorie non c'entrano niente.
    const rows = expenseRows(mesePieno, categoria("Casa", ["Affitto"]));

    expect(rows.filter((row) => row.nome === UNCATEGORIZED)).toEqual([]);
    expect(rows).toHaveLength(3);
  });

  it("non mostra niente finché il payload non parla della categoria scelta", () => {
    expect(expenseRows(mesePieno, categoria("Viaggi", ["Hotel"]))).toEqual([]);
  });

  it("lascia senza id le uscite che una sottocategoria non ce l'hanno", () => {
    const rows = expenseRows(
      [
        cat("Casa", -100, [
          { sottocategoria: "Affitto", totale: -80 },
          { sottocategoria: UNCATEGORIZED, totale: -20 },
        ]),
      ],
      categoria("Casa", ["Affitto"]),
    );

    expect(rows[1]).toEqual({
      nome: UNCATEGORIZED,
      totale: 20,
      sottocategoriaId: null,
    });
  });
});
