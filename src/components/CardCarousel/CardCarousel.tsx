import React from "react";
import CreditCard from "../CreditCard/CreditCard";
import "./CardCarousel.scss";
// Importiamo l'interfaccia Conto definita nello slice dei conti
import { Conto } from "../../features/conti/interfaces";

interface CardCarouselProps {
  conti: Conto[];
}

const CardCarousel: React.FC<CardCarouselProps> = ({ conti }) => {
  // Definiamo i colori disponibili come un array di stringhe costanti (readonly)
  const availableColors: string[] = [
    "card-blue",
    "card-red",
    "card-dark",
    "card-green",
    "card-purple",
  ];

  return (
    <div className="card-carousel-wrapper">
      <h3 className="carousel-title">Conti:</h3>
      <div className="card-carousel">
        {conti.map((conto, index) => (
          <CreditCard
            key={conto.id} // Ora TS sa che l'id esiste ed è una stringa
            name={conto.nome}
            balance={conto.saldo}
            // Usiamo il modulo per ruotare i colori se i conti sono più di 5
            colorClass={availableColors[index % availableColors.length]}
          />
        ))}
      </div>
    </div>
  );
};

export default CardCarousel;
