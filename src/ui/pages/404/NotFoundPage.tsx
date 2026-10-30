import { useNavigate } from "react-router-dom";
import notFoundImage from "../../assets/img/404.png";
import "./404.css";
import "./notfoundpage.css";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="notFound-container">
      <h2>¡Oops!</h2>
      <p>Parece que has aterrizado en una página que no existe.</p>

      <img src={notFoundImage} alt="404 Not Found" />
      <button
        type="button"
        onClick={() => {
          navigate("/");
        }}
      >
        Volver al <strong>Home</strong>
      </button>
    </div>
  );
};
