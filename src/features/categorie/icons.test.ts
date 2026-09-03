import { describe, it, expect } from "vitest";
import { categoryIcon } from "./icons";

describe("categoryIcon", () => {
  it("riconosce le categorie comuni dal nome", () => {
    expect(categoryIcon("Spesa")).toBe("pi pi-shopping-cart");
    expect(categoryIcon("Casa")).toBe("pi pi-home");
    expect(categoryIcon("Trasporti")).toBe("pi pi-car");
    expect(categoryIcon("Svago")).toBe("pi pi-ticket");
  });

  it("ignora maiuscole e accenti", () => {
    expect(categoryIcon("UTENZE")).toBe("pi pi-bolt");
    expect(categoryIcon("Bollètte")).toBe("pi pi-bolt");
  });

  it("riconosce anche dentro un nome più lungo", () => {
    expect(categoryIcon("Spesa settimanale")).toBe("pi pi-shopping-cart");
  });

  it("ripiega su un'icona neutra quando non sa", () => {
    expect(categoryIcon("Qualcosa di mio")).toBe("pi pi-tag");
    expect(categoryIcon(null)).toBe("pi pi-tag");
    expect(categoryIcon("")).toBe("pi pi-tag");
  });
});
