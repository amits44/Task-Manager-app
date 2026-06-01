import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth }  from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import KanbanColumn from '../components/KanbanColumn';
import TaskModal    from '../components/TaskModal';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './BoardPage.module.css';

const STAGES = ['todo', 'in_progress', 'done'];

export default function BoardPage() {
  const { user, logout } = useAuth();
  const { tasks, stats, loading, error, fetchTasks, fetchStats, createTask, updateTask, deleteTask } = useTasks();

  const [search,      setSearch]      = useState('');
  const [debouncedQ,  setDebouncedQ]  = useState('');
  const [modal,       setModal]       = useState(null); 


  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(search), 350);
    return () => clearTimeout(t);
  }, [search]);
  const isMounted = useRef(false);
  useEffect(() => {
    fetchTasks(debouncedQ ? { search: debouncedQ } : {});
  }, [debouncedQ]);

  const openCreate = useCallback((stage) => setModal({ mode: 'create', stage }), []);
  const openEdit   = useCallback((task)  => setModal({ mode: 'edit',   task  }), []);
  const closeModal = useCallback(()       => setModal(null), []);

  const handleSave = useCallback(async (payload) => {
    if (modal.mode === 'edit') {
      await updateTask(modal.task._id, payload);
    } else {
      await createTask(payload);
    }
  }, [modal, createTask, updateTask]);

  const handleDelete = useCallback(async (id, stage) => {
    await deleteTask(id, stage);
  }, [deleteTask]);

  const handleMove = useCallback(async (id, newStage) => {
    await updateTask(id, { stage: newStage });
  }, [updateTask]);

  const completionPct = stats.total > 0
    ? Math.round((stats.done / stats.total) * 100)
    : 0;

  return (
    <div className={styles.page}>
      {/* ── Sidebar / Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>✦</span>
            <span className={styles.logoText}>TaskFlow</span>
          </div>
        </div>

        {/* Stats pills */}
        <div className={styles.statsRow}>
          <div className={styles.statPill}>
            <span className={styles.statDot} style={{ background: 'var(--todo)' }} />
            <span className={styles.statNum}>{stats.todo}</span>
            <span className={styles.statLabel}>Todo</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.statDot} style={{ background: 'var(--progress)' }} />
            <span className={styles.statNum}>{stats.in_progress}</span>
            <span className={styles.statLabel}>In Progress</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.statDot} style={{ background: 'var(--done)' }} />
            <span className={styles.statNum}>{stats.done}</span>
            <span className={styles.statLabel}>Done</span>
          </div>

          {/* Progress bar */}
          {stats.total > 0 && (
            <div className={styles.progressWrap} title={`${completionPct}% complete`}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${completionPct}%` }} />
              </div>
              <span className={styles.progressLabel}>{completionPct}%</span>
            </div>
          )}
        </div>

        <div className={styles.headerRight}>
          {/* Search */}
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search tasks"
            />
            {search && (
              <button className={styles.clearSearch} onClick={() => setSearch('')}>×</button>
            )}
          </div>

          {/* New task */}
          <button className={styles.newTaskBtn} onClick={() => openCreate('todo')}>
            <span>+</span> New task
          </button>

          {/* User menu */}
          <div className={styles.userMenu}>
            <span className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</span>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name}</span>
            </div>
            <button className={styles.logoutBtn} onClick={logout} title="Sign out">
              ⎋
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Board */}
      <main className={styles.main}>
        {error && (
          <div className={styles.errorBar}>
            {error.message || error}
            <button onClick={() => fetchTasks()}>Retry</button>
          </div>
        )}

        {loading && !Object.values(tasks).flat().length ? (
          <div className={styles.centerLoader}>
            <LoadingSpinner size={36} />
            <p>Loading your board…</p>
          </div>
        ) : (
          <div className={styles.board}>
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                tasks={tasks[stage] || []}
                onAdd={openCreate}
                onEdit={openEdit}
                onDelete={handleDelete}
                onMove={handleMove}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Task Modal */}
      {modal && (
        <TaskModal
          task={modal.task}
          defaultStage={modal.stage}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
