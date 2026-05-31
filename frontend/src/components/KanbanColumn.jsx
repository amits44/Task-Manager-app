import TaskCard from './TaskCard';
import styles from './KanbanColumn.module.css';

const STAGE_CONFIG = {
  todo:        { label: 'Todo',        color: 'var(--todo)',     dot: '#4a9eff' },
  in_progress: { label: 'In Progress', color: 'var(--progress)', dot: '#f5a623' },
  done:        { label: 'Done',        color: 'var(--done)',     dot: '#4ade80' },
};

export default function KanbanColumn({ stage, tasks, onAdd, onEdit, onDelete, onMove }) {
  const config = STAGE_CONFIG[stage];

  return (
    <div className={styles.column}>
      {/* Column header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.dot} style={{ background: config.dot }} />
          <h3 className={styles.title}>{config.label}</h3>
          <span className={styles.count}>{tasks.length}</span>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => onAdd(stage)}
          title={`Add task to ${config.label}`}
        >+</button>
      </div>

      {/* Cards */}
      <div className={styles.cards}>
        {tasks.length === 0 ? (
          <div className={styles.empty}>
            <span>No tasks yet</span>
            <button className={styles.emptyAdd} onClick={() => onAdd(stage)}>
              + Add one
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))
        )}
      </div>
    </div>
  );
}
