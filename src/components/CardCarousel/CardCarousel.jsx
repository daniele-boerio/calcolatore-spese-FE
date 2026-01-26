import CreditCard from "../CreditCard/CreditCard";
import "./CardCarousel.scss";

const CardCarousel = ({ conti }) => {
  const availableColors = [
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
            key={conto.id || index}
            name={conto.nome}
            balance={conto.saldo}
            colorClass={availableColors[index % availableColors.length]}
          />
        ))}
      </div>
    </div>
  );
};

export default CardCarousel;
