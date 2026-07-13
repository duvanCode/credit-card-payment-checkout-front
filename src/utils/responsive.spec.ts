describe('responsive', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('calcula escalas basado en dimensiones', () => {
    jest.doMock('react-native', () => ({
      Dimensions: {
        get: () => ({ width: 375, height: 667 }),
      },
    }));

    jest.isolateModules(() => {
      const responsive = require('./responsive');
      expect(responsive.scale(10)).toBe(10);
      expect(responsive.verticalScale(10)).toBe(10);
      expect(responsive.moderateScale(10)).toBe(10);
      expect(responsive.screen.width).toBe(375);
    });
  });
});
