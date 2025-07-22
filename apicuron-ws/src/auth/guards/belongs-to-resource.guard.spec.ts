import { HasAResourceGuard } from './belongs-to-resource.guard';

describe('BelongsToResourceGuard', () => {
  it('should be defined', () => {
    expect(new HasAResourceGuard()).toBeDefined();
  });
});
