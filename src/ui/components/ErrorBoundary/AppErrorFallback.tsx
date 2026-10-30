export const AppErrorFallback = () => {
  const handleClick = () => {
    window.location.href = "/";
  };
  return (
    <div className="errorPage">
      <h2>Sorry. Something went wrong. </h2>
      <p>
        Try{" "}
        <button onClick={handleClick} type="button">
          refreshing.
        </button>
      </p>
    </div>
  );
};
