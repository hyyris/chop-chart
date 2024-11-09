function pairPackings(packingEntities, assigned_target) {
  if (!packingEntities || packingEntities.length === 0) return [];
  const targetWeight = 2 * assigned_target;
  const pairs = [];
  const used = new Set();

  for (let i = 0; i < packingEntities.length; i++) {
    if (used.has(i)) continue;

    let bestPair = null;
    let bestDiff = Infinity;

    for (let j = i + 1; j < packingEntities.length; j++) {
      if (used.has(j)) continue;

      const combinedWeight = packingEntities[i].weightAfterStorage + packingEntities[j].weightAfterStorage;
      const diff = Math.abs(targetWeight - combinedWeight);

      if (diff < bestDiff) {
        bestDiff = diff;
        bestPair = j;
      }
    }

    if (bestPair !== null) {
      pairs.push([packingEntities[i], packingEntities[bestPair]]);
      used.add(i);
      used.add(bestPair);
    } else {
      pairs.push([packingEntities[i]]);
      used.add(i);
    }
  }

  return pairs;
}

export { pairPackings };