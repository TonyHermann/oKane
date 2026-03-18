import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <h2>¡Oops!</h2>
      <p>Parece que has aterrizado en una página que no existe.</p>
      <button
        type="button"
        onClick={() => {
          navigate("/");
        }}
      >
        Volver al <strong>Home</strong>
      </button>
    </>
  );
};
