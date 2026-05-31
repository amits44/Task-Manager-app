import { useState } from 'react';
import styles from './TaskCard.module.css';

const PRIORITY_LABELS = { low: 'Low', medium: 'Med', high: 'High' };
const STAGE_LABELS    = { todo: 'Todo', in_progress: 'In Progress', done: 'Done' };
const STAGE_ORDER     = ['todo', 'in_progress', 'done'];

const formatDate = (d) => {
  if (!d) return null;
  const date = new Date(d);
  const now  = new Date();
  const diff = (date - now) / (1000 * 60 * 60 * 24);
  const str  = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diff < 0)  return { label: str, state: 'overdue' };
  if (diff < 2)  return { label: str, state: 'soon' };
  return { label: str, state: 'normal' };
};

export default function TaskCard({ task, onEdit, onDelete, onMove }) {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [delConfirm,  setDelConfirm]  = useState(false);
  const [moving,      setMoving]      = useState(false);

  const due     = formatDate(task.dueDate);
  const stageIdx = STAGE_ORDER.indexOf(task.stage);
  const canBack  = stageIdx > 0;
  const canNext  = stageIdx < STAGE_ORDER.length - 1;

  const handleMove = async (direction) => {
    const newStage = STAGE_ORDER[stageIdx + (direction === 'next' ? 1 : -1)];
    setMoving(true);
    try { await onMove(task._id, newStage); } finally { setMoving(false); }
  };

  const handleDelete = async () => {
    if (!delConfirm) { setDelConfirm(true); return; }
    await onDelete(task._id, task.stage);
  };

  return (
    <div className={`${styles.card} ${styles[`stage_${task.stage}`]} fade-in`}>
      {/* Priority badge */}
      <div className={styles.topRow}>
        <span className={`${styles.priority} ${styles[`pri_${task.priority}`]}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        <div className={styles.actions}>
          {canBack && (
            <button
              className={styles.iconBtn}
              onClick={() => handleMove('back')}
              disabled={moving}
              title={`Move to ${STAGE_LABELS[STAGE_ORDER[stageIdx - 1]]}`}
            >←</button>
          )}
          {canNext && (
            <button
              className={`${styles.iconBtn} ${styles.iconBtnAccent}`}
              onClick={() => handleMove('next')}
              disabled={moving}
              title={`Move to ${STAGE_LABELS[STAGE_ORDER[stageIdx + 1]]}`}
            >→</button>
          )}
          <button className={styles.iconBtn} onClick={() => onEdit(task)} title="Edit">✎</button>
          <button
            className={`${styles.iconBtn} ${delConfirm ? styles.iconBtnDanger : ''}`}
            onClick={handleDelete}
            onBlur={() => setTimeout(() => setDelConfirm(false), 200)}
            title={delConfirm ? 'Click again to confirm' : 'Delete'}
          >
            {delConfirm ? '!' : '×'}
          </button>
        </div>
      </div>

      {/* Title */}
      <p className={`${styles.title} ${task.stage === 'done' ? styles.titleDone : ''}`}>
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p className={styles.desc}>{task.description}</p>
      )}

      {/* Footer */}
      {due && (
        <div className={styles.footer}>
          <span className={`${styles.due} ${styles[`due_${due.state}`]}`}>
            {due.state === 'overdue' ? '⚠ ' : '⏱ '}{due.label}
          </span>
        </div>
      )}
    </div>
  );
}
