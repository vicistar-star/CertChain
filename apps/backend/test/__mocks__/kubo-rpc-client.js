module.exports = {
  create: jest.fn(() => ({
    add: jest.fn(),
    cat: jest.fn(),
  })),
};
