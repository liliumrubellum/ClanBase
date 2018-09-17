import { SignedNumberPipe } from './signed-number.pipe';

describe('SignedNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new SignedNumberPipe();
    expect(pipe).toBeTruthy();
  });
});
