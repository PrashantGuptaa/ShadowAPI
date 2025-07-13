export const clearLocalStorage = (itemsToClear = []) => {
  // Clear all items if no specific items are provided
  if (itemsToClear.length === 0) {
    localStorage.clear();
    return;
  }

  // Clear specified items
  itemsToClear.forEach((item) => {
    localStorage.removeItem(item);
  });
};
