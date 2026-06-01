import { useState, useEffect, useRef } from 'react';
import styles from './TaskModal.module.css';

const STAGES     = ['todo', 'in_progress', 'done'];
const STAGE_LABELS = { todo: 'Todo', in_progress: 'In Progress', done: 'Done' };
const PRIORITIES = ['low', 'medium', 'high'];

const empty = { title: '', description: '', stage: 'todo', priority: 'medium', dueDate: '' };

export default function TaskModal({ task, defaultStage, onSave, onClose }) {
  const isEdit    = Boolean(task);
  const inputRef  = useRef(null);
  const [form,    setForm]    = useState(() =>
    task
      ? { ...task, dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '' }
      : { ...empty, stage: defaultStage || 'todo' }
  );
  const [error,   setError]   = useState('');
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setError(''); setSaving(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        stage:       form.stage,
        priority:    form.priority,
        dueDate:     form.dueDate || null,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal + ' fade-in'} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2>{isEdit ? 'Edit task' : 'New task'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <label className={styles.field}>
            <span>Title <span className={styles.required}>*</span></span>
            <input
              ref={inputRef}
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="What needs to be done?"
              maxLength={200}
            />
          </label>

          <label className={styles.field}>
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Add more details (optional)"
              rows={3}
              maxLength={2000}
            />
          </label>

          {/* Stage + Priority row */}
          <div className={styles.row}>
            <label className={styles.field}>
              <span>Stage</span>
              <select value={form.stage} onChange={(e) => set('stage', e.target.value)}>
                {STAGES.map((s) => (
                  <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Priority</span>
              <select value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Due date */}
          <label className={styles.field}>
            <span>Due date</span>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />
          </label>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving
                ? <span className={styles.spinner} />
                : isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
