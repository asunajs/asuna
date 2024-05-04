import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  setInterval(() => setCount((prev) => prev + 1), 1000);

  return (
    <div>
      <p>Count: {count}</p>
    </div>
  );
}
