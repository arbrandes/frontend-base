import { waitFor } from '@testing-library/react';
import {
  camelCaseObject,
  convertKeyNames,
  getQueryParameters,
  modifyObjectKeys,
  snakeCaseObject,
} from '.';

describe('modifyObjectKeys', () => {
  it('should use the provided modify function to change all keys in and object and its children', () => {
    function meowKeys(key) {
      return `${key}Meow`;
    }

    const result = modifyObjectKeys(
      {
        one: undefined,
        two: null,
        three: '',
        four: 0,
        five: NaN,
        six: [1, 2, { seven: 'woof' }],
        eight: { nine: { ten: 'bark' }, eleven: true },
      },
      meowKeys,
    );

    expect(result).toEqual({
      oneMeow: undefined,
      twoMeow: null,
      threeMeow: '',
      fourMeow: 0,
      fiveMeow: NaN,
      sixMeow: [1, 2, { sevenMeow: 'woof' }],
      eightMeow: { nineMeow: { tenMeow: 'bark' }, elevenMeow: true },
    });
  });
});

describe('camelCaseObject', () => {
  it('should make everything camelCase', () => {
    const result = camelCaseObject({
      what_now: 'brown cow',
      but_who: { says_you_people: 'okay then', but_how: { will_we_even_know: 'the song is over' } },
      'dot.dot.dot': 123,
    });

    expect(result).toEqual({
      whatNow: 'brown cow',
      butWho: { saysYouPeople: 'okay then', butHow: { willWeEvenKnow: 'the song is over' } },
      dotDotDot: 123,
    });
  });
});

describe('snakeCaseObject', () => {
  it('should make everything snake_case', () => {
    const result = snakeCaseObject({
      whatNow: 'brown cow',
      butWho: { saysYouPeople: 'okay then', butHow: { willWeEvenKnow: 'the song is over' } },
      'dot.dot.dot': 123,
    });

    expect(result).toEqual({
      what_now: 'brown cow',
      but_who: { says_you_people: 'okay then', but_how: { will_we_even_know: 'the song is over' } },
      dot_dot_dot: 123,
    });
  });
});

describe('convertKeyNames', () => {
  it('should replace the specified keynames', () => {
    const result = convertKeyNames(
      {
        one: { two: { three: 'four' } },
        five: 'six',
      },
      {
        two: 'blue',
        five: 'alive',
        seven: 'heaven',
      },
    );

    expect(result).toEqual({
      one: { blue: { three: 'four' } },
      alive: 'six',
    });
  });
});

describe('getQueryParameters', () => {
  it('should use window location by default', () => {
    expect(global.location.search).toEqual('');
    expect(getQueryParameters()).toEqual({});
  });

  it('should make an empty object with no query string', () => {
    expect(getQueryParameters('')).toEqual({});
  });

  it('should make an object with one key value pair', () => {
    expect(getQueryParameters('?foo=bar')).toEqual({
      foo: 'bar',
    });
  });

  it('should make an object with one key value pair', () => {
    expect(getQueryParameters('?foo=bar&baz=1')).toEqual({
      foo: 'bar',
      baz: '1',
    });
  });
});
