export const userStorageKey = (uid, key) =>
  `feelsafe:${encodeURIComponent(uid || "anonymous")}:${key}`;

export const readUserNumber = (uid, key, fallback = 0) => {
  const value = Number.parseInt(
    localStorage.getItem(userStorageKey(uid, key)) || "",
    10
  );

  return Number.isFinite(value) ? value : fallback;
};

export const readUserJson = (uid, key, fallback) => {
  try {
    const value = JSON.parse(
      localStorage.getItem(userStorageKey(uid, key)) || "null"
    );
    return value ?? fallback;
  } catch {
    return fallback;
  }
};
