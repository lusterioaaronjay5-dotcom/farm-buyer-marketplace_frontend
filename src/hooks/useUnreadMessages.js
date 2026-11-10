import { useEffect, useState } from 'react';
import api from '../api';

// Ibinabalik ang kabuuang bilang ng hindi pa nababasang mensahe.
// Nagre-refresh kada 8 segundo, at nagre-refresh din kapag nagbago ang refreshKey.
export default function useUnreadMessages(refreshKey) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setCount(0);
      return undefined;
    }

    let alive = true;

    function load() {
      api
        .get('/messages/inbox')
        .then((res) => {
          const rows = res.data?.conversations ?? res.data ?? [];
          const list = Array.isArray(rows) ? rows : [];
          const total = list.reduce(
            (sum, c) => sum + Number(c.unread_count ?? c.unread ?? 0),
            0
          );
          if (alive) setCount(total);
        })
        .catch(() => {});
    }

    load();
    const timer = setInterval(load, 8000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [refreshKey]);

  return count;
}