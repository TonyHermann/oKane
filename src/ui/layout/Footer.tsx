import styles from "./Footer.module.css";

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div>
        <p>
          Developed by
          <a href="https://github.com/TonyHermann/" target="_blank" rel="noreferrer">
            @TonyHermann
          </a>
          ~竹
        </p>
      </div>
    </footer>
  );
};
