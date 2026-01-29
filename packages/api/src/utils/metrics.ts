export const getLocalDateBounds = () => ({
  todayStart: new Date(0),
  todayEnd: new Date(0),
});

export const calculateMetrics = () => ({
  heartbeats: 0,
  sessions: 0,
  flows: 0,
  codingTimeMinutes: 0,
  codingTimeSeconds: 0,
  flowTimeSeconds: 0,
  flowEfficiency: 0,
});

export const fetchTodayMetrics = () =>
  Promise.resolve({
    heartbeats: 0,
    sessions: 0,
    flows: 0,
    codingTimeMinutes: 0,
    codingTimeSeconds: 0,
    flowTimeSeconds: 0,
    flowEfficiency: 0,
  });
