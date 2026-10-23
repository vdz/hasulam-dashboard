import Link from 'next/link';
import { fill, text } from '@/assets/locales';
import { signOutAction } from '@/app/signin/actions';
import { TaskItem } from '@/components/TaskItem';
import styles from './MyTasks.module.css';
import type { MyTasksProps } from './types';

export function MyTasks({ viewerName, tasks }: MyTasksProps) {
  return (
    <main className={styles.page} data-testid="my-tasks">
      <header className={styles.header}>
        <div>
          <Link className={styles.navLink} href="/events" data-testid="nav-events">{text.nav.events}</Link>
          <h1 className={styles.title} data-testid="my-tasks-title">{text.myTasks.title}</h1>
          <p className={styles.greeting} data-testid="my-tasks-greeting">{fill(text.myTasks.greeting, { name: viewerName })}</p>
        </div>
        <form action={signOutAction}>
          <button className={styles.signOut} data-testid="my-tasks-sign-out" type="submit">{text.myTasks.signOut}</button>
        </form>
      </header>
      {tasks.length === 0 ? (
        <p className={styles.empty} data-testid="my-tasks-empty">{text.myTasks.empty}</p>
      ) : (
        <ul className={styles.list} data-testid="my-tasks-list">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} context={task.eventTitle} editable />
          ))}
        </ul>
      )}
    </main>
  );
}
