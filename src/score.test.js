const { scoreBookmark, scoreBookmarks, rankBookmarks, DEFAULT_WEIGHTS } = require('./score');

function makeBookmark(overrides = {}) {
  return {
    id: 'b1',
    url: 'https://example.com',
    title: 'Example',
    rating: 0,
    visits: 0,
    favorite: false,
    priority: null,
    lastVisited: null,
    ...overrides,
  };
}

describe('scoreBookmark', () => {
  test('returns 0 for a blank bookmark', () => {
    expect(scoreBookmark(makeBookmark())).toBe(0);
  });

  test('favorite adds to score', () => {
    const s = scoreBookmark(makeBookmark({ favorite: true }));
    expect(s).toBeCloseTo(DEFAULT_WEIGHTS.favorite, 4);
  });

  test('high priority adds correct weight', () => {
    const s = scoreBookmark(makeBookmark({ priority: 'high' }));
    expect(s).toBeCloseTo(DEFAULT_WEIGHTS.priority, 4);
  });

  test('rating 5 adds full rating weight', () => {
    const s = scoreBookmark(makeBookmark({ rating: 5 }));
    expect(s).toBeCloseTo(DEFAULT_WEIGHTS.rating, 4);
  });

  test('recent lastVisited scores higher than old', () => {
    const recent = makeBookmark({ lastVisited: new Date().toISOString() });
    const old = makeBookmark({ lastVisited: new Date(Date.now() - 400 * 86400000).toISOString() });
    expect(scoreBookmark(recent)).toBeGreaterThan(scoreBookmark(old));
  });
});

describe('scoreBookmarks', () => {
  test('attaches _score to each bookmark', () => {
    const bms = [makeBookmark({ id: '1' }), makeBookmark({ id: '2', rating: 3 })];
    const scored = scoreBookmarks(bms);
    expect(scored[0]).toHaveProperty('_score');
    expect(scored[1]._score).toBeGreaterThan(scored[0]._score);
  });
});

describe('rankBookmarks', () => {
  test('sorts by descending score', () => {
    const bms = [
      makeBookmark({ id: 'low' }),
      makeBookmark({ id: 'high', rating: 5, favorite: true, priority: 'high' }),
    ];
    const ranked = rankBookmarks(bms);
    expect(ranked[0].id).toBe('high');
  });
});
