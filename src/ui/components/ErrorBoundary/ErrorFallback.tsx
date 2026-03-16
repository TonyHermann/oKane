import type { FallbackProps } from "./ErrorBoundary.types";

export const ErrorFallback = ({ error, resetError }: FallbackProps) => {
  const { message } = error;
  return (
    <div className="errorPage">
      <h2>Sorry. Something went wrong. </h2>
      <p>
        Try{" "}
        <button onClick={resetError} type="button">
          refreshing.
        </button>
      </p>
      <p>{message}</p>
    </div>
  );
};
