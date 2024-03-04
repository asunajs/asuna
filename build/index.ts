import * as swc from '@swc/core';

export async function transform(inputCode: string) {
  const code = inputCode
    .replaceAll(
      /(logger\.error\([\S ]+, )([error|err]+)(\);{1})/g,
      (_, s1, s2, s3) => `${s1}${s2}.message${s3}`
    )
    .replaceAll('await ', '')
    .replaceAll('async ', '')
    .replaceAll(/(application\/.+);\s?charset=utf-8/gi, '$1');

  return await swc.transform(code, {
    jsc: {
      parser: {
        syntax: 'typescript',
      },
      transform: {
        legacyDecorator: false,
      },
    },
    env: {
      include: [
        'transform-shorthand-properties',
        'transform-optional-chaining',
      ],
      targets: '',
      exclude: ['transform-parameters'],
    },
  });
}
