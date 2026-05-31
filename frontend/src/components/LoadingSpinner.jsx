import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ fullScreen = false, size = 32 }) {
  const spinner = (
    <span
      className={styles.spinner}
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );

  if (!fullScreen) return spinner;

  return (
    <div className={styles.fullScreen}>
      {spinner}
    </div>
  );
}
