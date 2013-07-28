var allUnitTests = [];

function unitTest(scope, block) {
  allUnitTests.push({ scope: scope, block: block });
}

function runAllUnitTests() {
  function isEqual(objectA, objectB) {
    return JSON.stringify(objectA) === JSON.stringify(objectB);
  }

  function check(name, expected, got) {
    if (isEqual(expected, got)) {
      console.log('%c✔%c %s (%O)', 'color: green', 'color: inherit', name, got);
    }
    else {
      console.error('✖ %s (expected: %O) (got: %O)', name, expected, got);
    }
  }

  allUnitTests.forEach(function(test) {
    console.group('Unit test: %s', test.scope.name);
    try {
      test.block(check);
    }
    catch (error) {
      console.error('✖ %s', error.stack);
    }
    console.groupEnd();
  });
}
